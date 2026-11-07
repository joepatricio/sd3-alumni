import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '../prisma/generated/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || './dev.db',
});
const prisma = new PrismaClient({ adapter });

const PAGE_SOURCES: Record<string, string> = {
  page_1: 'https://www.facebook.com/usjr.ec/photos_albums',
  page_2: 'https://www.facebook.com/USJREMS/photos_albums',
  page_3: 'https://www.facebook.com/psimusjr/photos_albums',
  page_4: 'https://www.facebook.com/piceusjrchptr/photos_albums',
  page_5: 'https://www.facebook.com/iiee.org/photos_albums',
  page_6: 'https://www.facebook.com/usjr.iecep/photos_albums',
  page_7: 'https://www.facebook.com/usjrcomes/photos_albums',
  page_8: 'https://www.facebook.com/usjrIEJOINTS/photos_albums',
};

const STATIC_IMAGE_FILES = [
  'alumni-logo.jpg',
  'avr.jpeg',
  'bulletin-careers.jpg',
  'bulletin-donations.jpg',
  'bulletin-image.jpg',
  'bulletin-success.jpg',
  'capybara.jpg',
  'cubes.png',
  'donate-hero.avif',
  'engineer.png',
  'events-conference.jpeg',
  'events-image.jpg',
  'events-networking.jpg',
  'events-reunion.jpg',
  'events-sports.jpg',
  'events-virtual.jpg',
  'events-workshop.jpg',
  'main-hero.jpg',
  'profile-image.jpg',
];

async function main() {
  console.log('Starting migration to /images and HeroGallery setup...');

  const imagesDir = path.resolve('images');
  const albumsDir = path.resolve('images', 'albums');
  const uploadsDir = path.resolve('uploads');
  const galleryDir = path.resolve('gallery');

  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
  if (!fs.existsSync(albumsDir)) fs.mkdirSync(albumsDir, { recursive: true });

  // 1. Copy non-uploaded static images from uploads/ to images/
  console.log('\n--- Step 1: Copying static site assets from /uploads to /images ---');
  for (const file of STATIC_IMAGE_FILES) {
    const src = path.join(uploadsDir, file);
    const dest = path.join(imagesDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied static asset: ${file}`);
    } else {
      console.warn(`Static asset not found in uploads: ${file}`);
    }
  }

  // 2. Ingest albums from gallery/page_1..8
  console.log('\n--- Step 2: Ingesting gallery albums into /images/albums and HeroGallery ---');
  let totalAlbumsCopied = 0;
  let totalImagesCopied = 0;

  for (let p = 1; p <= 8; p++) {
    const pageName = `page_${p}`;
    const pageDirPath = path.join(galleryDir, pageName);
    if (!fs.existsSync(pageDirPath)) continue;

    // Read BLACKLIST.csv if exists
    const blacklistMap = new Map<string, string>();
    const blacklistPath = path.join(pageDirPath, 'BLACKLIST.csv');
    if (fs.existsSync(blacklistPath)) {
      const lines = fs.readFileSync(blacklistPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('album,')) continue;
        const [albumKey, tag] = trimmed.split(',').map((s) => s.trim());
        if (albumKey && tag) {
          blacklistMap.set(albumKey, tag);
        }
      }
    }

    const items = fs.readdirSync(pageDirPath, { withFileTypes: true });
    for (const item of items) {
      if (!item.isDirectory() || !item.name.startsWith('album_')) continue;

      const albumFolderNum = item.name.replace('album_', '');
      const qualifiedAlbumId = `${pageName}_${item.name}`; // e.g. page_1_album_1
      const sourceAlbumPath = path.join(pageDirPath, item.name);
      const targetAlbumPath = path.join(albumsDir, qualifiedAlbumId);

      if (!fs.existsSync(targetAlbumPath)) {
        fs.mkdirSync(targetAlbumPath, { recursive: true });
      }

      // Copy images
      const albumFiles = fs.readdirSync(sourceAlbumPath);
      let copiedForThisAlbum = 0;
      for (const f of albumFiles) {
        if (/\.(jpg|jpeg|png|webp|avif)$/i.test(f)) {
          const srcFile = path.join(sourceAlbumPath, f);
          const destFile = path.join(targetAlbumPath, f);
          fs.copyFileSync(srcFile, destFile);
          copiedForThisAlbum++;
          totalImagesCopied++;
        }
      }

      // Determine blacklist tag
      let blacklistTag = 'none';
      if (blacklistMap.has(albumFolderNum)) {
        blacklistTag = blacklistMap.get(albumFolderNum)!;
      } else if (copiedForThisAlbum === 0) {
        blacklistTag = 'empty';
      }

      const sourceUrl = PAGE_SOURCES[pageName] || null;

      await prisma.heroGallery.upsert({
        where: { albumId: qualifiedAlbumId },
        create: {
          albumId: qualifiedAlbumId,
          blacklist: blacklistTag,
          sourceUrl,
        },
        update: {
          blacklist: blacklistTag,
          sourceUrl,
        },
      });

      totalAlbumsCopied++;
    }
  }

  console.log(`Ingested ${totalAlbumsCopied} albums and ${totalImagesCopied} images.`);

  // 3. Update existing profiles in database
  console.log('\n--- Step 3: Updating database profiles referencing /uploads ---');
  // Revert any upload-* that might have been changed
  const uploadProfiles = await prisma.profile.findMany({
    where: {
      profileImage: {
        contains: '/images/upload-',
      },
    },
  });
  for (const prof of uploadProfiles) {
    if (!prof.profileImage) continue;
    const reverted = prof.profileImage.replace('/images/upload-', '/uploads/upload-');
    await prisma.profile.update({
      where: { userId: prof.userId },
      data: { profileImage: reverted },
    });
    console.log(`Reverted user upload ${prof.userName} (${prof.userId}) -> ${reverted}`);
  }

  const profiles = await prisma.profile.findMany({
    where: {
      profileImage: {
        contains: '/uploads/',
      },
    },
  });

  console.log(`Found ${profiles.length} profiles with /uploads/ image.`);
  for (const prof of profiles) {
    if (!prof.profileImage) continue;
    // Do NOT touch user uploads
    if (prof.profileImage.includes('/uploads/upload-')) continue;
    const newImage = prof.profileImage.replace('/uploads/', '/images/');
    await prisma.profile.update({
      where: { userId: prof.userId },
      data: { profileImage: newImage },
    });
    console.log(`Updated profile ${prof.userName} (${prof.userId}) -> ${newImage}`);
  }

  // 4. Update db.json
  console.log('\n--- Step 4: Updating db.json for seed consistency ---');
  const dbJsonPath = path.resolve('db.json');
  if (fs.existsSync(dbJsonPath)) {
    let dbContent = fs.readFileSync(dbJsonPath, 'utf8');
    const updatedDbContent = dbContent
      .replaceAll('http://localhost:3000/profile-image.jpg', '/images/profile-image.jpg')
      .replaceAll('http://localhost:3000/engineer.png', '/images/engineer.png')
      .replaceAll('/uploads/engineer.png', '/images/engineer.png')
      .replaceAll('/uploads/profile-image.jpg', '/images/profile-image.jpg');

    if (updatedDbContent !== dbContent) {
      fs.writeFileSync(dbJsonPath, updatedDbContent, 'utf8');
      console.log('db.json updated.');
    } else {
      console.log('db.json already up-to-date.');
    }
  }

  console.log('\nMigration completed successfully!');
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
