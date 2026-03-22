import fs from 'fs';
const files = ['src/assets/mockData.tsx', 'src/app/pages/admin/AdminEvents.tsx', 'src/app/pages/admin/AdminBulletins.tsx', 'src/app/components/user/EventsFeed.tsx', 'src/app/components/user/BulletinFeed.tsx', 'src/app/components/admin/AdminContentTable.tsx', 'src/app/components/user/CreateEventModal.tsx', 'src/app/components/user/CreateBulletinModal.tsx'];
const map = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', all: 'All' };
files.forEach(f => {
  try {
    if (!fs.existsSync(f)) return console.warn('File not found:', f);
    const content = fs.readFileSync(f, 'utf8');
    fs.writeFileSync(f + '.bak', content);
    let newContent = content;
    Object.keys(map).forEach(key => {
      const regex = new RegExp(`['\"]${key}['\"]`, 'g');
      newContent = newContent.replace(regex, `\"${map[key]}\"`);
    });
    fs.writeFileSync(f, newContent);
    console.log('Processed:', f);
  } catch (e) { console.error('Error processing', f, ':', e.message); }
});