# Alumni Tracking Network (`sd3-alumni`)

From the project brief:
> *"Create an online directory for graduates with profiles, job updates, and event RSVPs, using a database for connections, achievements, and donations. Add search by graduation year or industry, plus messaging for networking. It practices many-to-many relationships and data privacy controls."*

### Core Features
* **Online Directory**: Search and filter alumni by graduation year, degree program, company, and location.
* **Profile & Career Networking**: Profiles showcasing bio, career trajectory, achievements, mutual connections, and donation badges.
* **Event RSVPs & Management**: Event calendar, RSVP status tracking (Going, Maybe, Not Going), guest list modals with strict authentication privacy controls.
* **Community Bulletin**: School announcements, news, and alumni messaging boards with categories and moderation workflows.
* **Admin Dashboard**: Content moderation for bulletins and events, user role management (Pending, Regular, Suspended, Admin), donation ledger, and RSVP engagement analytics.

### ✨ Extended Features
* **AI Content Moderation**: Automated bulletin classification and user auto-approval watchdog powered by **Cloudflare Clef AI**.
* **Payment Processing**: Full donation checkout flow and webhook reconciliation using **PayMongo**.
* **Dynamic Marquee Hero**: Hardware-adaptive, multi-row photo marquee showcasing alumni gallery albums with device capability throttling and smooth fade-in transitions.

---

## Full-Stack Architecture & Deployment

The application is built on a full-stack architecture tailored for production deployment on a VPS:
* **Unified Express Backend**: The backend API has been consolidated into an Express application ([`api/index.js`](api/index.js)). In production, this single server serves both API endpoints under `/api/*` and compiled React static assets (`dist/`) on the root path `/`.
* **Prisma ORM & SQLite**: Relational database operations run through Prisma using `@prisma/adapter-better-sqlite3` and `better-sqlite3` against a local SQLite file (`dev.db`).
* **REST Query Engine**: A custom query parser ([`api/queryParser.js`](api/queryParser.js)) supports filtering, relational operators (`_where`, `$in`, `$contains`, `$gt`, `$lte`), sorting, and pagination.
* **PM2 Process Management**: Production deployments utilize PM2 to daemonize the server with automated restarts and log management. See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step VPS provisioning and Nginx configuration.

---

## Running the Code Locally

### 1) Prerequisites
* **Node.js**: v18+ recommended (`node -v`).
* **pnpm**: `npm install -g pnpm` (`pnpm -v`).
* **Python 3.10+**: Required for test and data maintenance scripts.

### 2) Environment Setup
Create a `.env` file in the project root (or verify `.env.development`). 

> [!CAUTION]
> **Crucial Local Dev Rule**: If you do **NOT** have Cloudflare AI credentials configured, you **MUST** set `CLASSIFIER_INTERVAL_MINUTES=0` or `-1` in your `.env`. Otherwise, the server startup guard will crash immediately with a fatal error!

Example `.env` configuration for local development:
```env
# Database & Network
DATABASE_URL="file:./dev.db"
API_PORT=3000
PROXY_PORT=5173
JWT_SECRET="local_development_secret_key"

# Background Classifier & Auto-Registration Watchdog
# Set to 0 or -1 to disable Cloudflare requirement during local dev
CLASSIFIER_INTERVAL_MINUTES=0

# Cloudflare AI (Required only if CLASSIFIER_INTERVAL_MINUTES > 0)
CLOUDFLARE_API_TOKEN=""
CLOUDFLARE_ACCOUNT_ID=""

# PayMongo Payments (Test keys)
PAYMONGO_PUBLIC_KEY="pk_test_..."
PAYMONGO_SECRET_KEY="sk_test_..."
PAYMONGO_WEBHOOK="whsk_..."

# Client API Configuration
VITE_API_BASE_URL="/api/"
VITE_DEBUG_MODE=true
```

### 3) Installation & Database Initialization
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Generate the Prisma Client:
   ```bash
   pnpm prisma:generate
   ```
3. Seed the SQLite database with baseline relational data:
   ```bash
   pnpm prisma:seed
   ```
   *(Note: Do **not** run `pnpm seed`; the command is `pnpm prisma:seed` which executes [`prisma/seed.ts`](prisma/seed.ts).)*

### 4) Starting the Servers
Local development requires running both the backend API and frontend Vite server:
1. **Backend Server** (runs on port `3000` with hot-reloading):
   ```bash
   pnpm server
   ```
2. **Frontend Dev Server** (runs Vite on port `5173`):
   ```bash
   pnpm dev
   ```
Access the application at [http://localhost:5173](http://localhost:5173).

---

## 🎡 Marquee Hero Architecture & Asset Pipeline Walkthrough

The landing page hero features an animated, multi-row photo marquee showcasing alumni life. Its implementation involves multiple layers across the database, asset filesystem, REST API, and client rendering.

```
┌─────────────────────────────────┐
│ Database: HeroGallery (Prisma)  │
│  - albumId                      │
│  - blacklist ("none" | "lowres")│
│  - sourceUrl (FB Album URL)     │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐       ┌───────────────────────────────────┐
│ Backend API: GET /api/hero/images│ <---- │ Assets: /images/albums/page_P_A/  │
│  - Samples up to 30 images      │       │  - 270+ ingested scraped albums   │
│  - Filters out blacklisted items│       │  - Static Express route /images   │
└──────────────┬──────────────────┘       └───────────────────────────────────┘
               │ JSON payload
               ▼
┌────────────────────────────────────────────────────────┐
│ Frontend: CuratedHero.tsx                              │
│  - Fetches /api/hero/images with fallback array        │
└──────────────┬─────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ Hardware Hook: src/lib/device.ts                       │
│  - Inspects deviceMemory, CPU cores, touch, reduce-mot │
└──────────────┬─────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ View Component: src/components/hero-3.tsx & hero-aura  │
│  - 2 alternating marquee rows (left/right)             │
│  - Progressive image fade-in (no pop-in)               │
│  - Hover-pause & external album link pill              │
│  - Auto-throttled animation speed on low-end hardware  │
└────────────────────────────────────────────────────────┘
```

### 0. How to Get Albums
Helper sciprts were developed to automate downloading and sorting albums online. Refer to `curate_photos.py` and `filter_gallery.py` in the `/scripts` directory. The automation for album sorting requires Cloudflare credentials which will be read from the .env file. On the other hand, it is also possible to upload original material directly to the deployment environment via `rsync` or `scp`.

### 1. Asset Storage & Ingestion
* **Location**: Curated alumni albums are stored in `/images/albums/` organized by scraping page and album ID (e.g. `images/albums/page_1_album_7/img_7_*.jpg`).
* **Serving**: The Express backend serves these directly via:
  ```js
  app.use('/images', express.static(path.join(PROJECT_ROOT, 'images')));
  ```

### 2. Database Model (`HeroGallery`)
In [`prisma/schema.prisma`](prisma/schema.prisma):
```prisma
model HeroGallery {
  id        String   @id @default(uuid())
  albumId   String   @unique
  blacklist String   @default("none") // "empty", "lowres", "portrait", "pubmat", "none"
  sourceUrl String?  // External Facebook album URL
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3. API Sampling Endpoint (`GET /api/hero/images`)
* Handler in [`api/index.js`](api/index.js):
  1. Reads all `HeroGallery` records where `blacklist == 'none'`.
  2. Resolves corresponding image files on disk from `images/albums/<albumId>/`.
  3. Randomly samples up to 30 unique images across albums to keep the homepage dynamic on each refresh.
  4. Returns image URLs along with each album's `sourceUrl`.

### 4. Hardware-Adaptive Animation Hook (`src/lib/device.ts`)
To prevent mobile devices and low-spec laptops from stuttering or freezing under heavy CSS/canvas transforms, [`src/lib/device.ts`](src/lib/device.ts) dynamically computes:
* `isMobile`: Checks screen width and mobile user-agent strings.
* `isTouch`: Checks `navigator.maxTouchPoints > 0`.
* `isLowEndDevice`: Evaluates `navigator.deviceMemory <= 4` or `navigator.hardwareConcurrency <= 4`.
* `prefersReducedMotion`: Honors operating system accessibility settings.

### 5. Presentation Layer (`hero-3.tsx`)
* **Two Alternating Marquee Tracks**: Row 1 scrolls left; Row 2 scrolls right.
* **Hover to Pause**: Hovering anywhere over the marquee smoothly pauses animation so users can view pictures.
* **Album Link Pill**: Hovering directly over an image displays a pill linking to the original Facebook album (`sourceUrl`).
* **Fade-In Loading State**: Each image card tracks `onLoad`. Images remain transparent until fully decoded, fading in smoothly via CSS transitions to prevent visual layout shifts.
* **Network Timeout Resiliency**: In commit `74ec995`, image load handlers were equipped with timeout fallbacks to ensure marquee animations activate even over high-latency networks.

### 6. How to Manage Marquee Albums
* **To blacklist an album from the marquee**:
  Update its record in `HeroGallery`:
  ```sql
  UPDATE HeroGallery SET blacklist = 'lowres' WHERE albumId = 'page_1_album_5';
  ```
* **To add a new album**:
  1. Place image files in `images/albums/<new_album_id>/`.
  2. Insert a record into `HeroGallery`:
     ```sql
     INSERT INTO HeroGallery (id, albumId, blacklist, sourceUrl, createdAt, updatedAt)
     VALUES ('...', '<new_album_id>', 'none', 'https://...', datetime('now'), datetime('now'));
     ```
  3. Restart or sample immediately via `GET /api/hero/images`.

---

## 🛠️ Maintenance & Diagnostic Scripts Reference

The `script/` folder contains automated test harnesses, scanners, and migration utilities. It's relatively unorganized and occasionally references depreciated systems. A list of the more recent scripts developed are provided:

| Script | Purpose | Usage |
| :--- | :--- | :--- |
| [`script/scan_orphaned_images.py`](script/scan_orphaned_images.py) | Scans all database tables, compares referenced paths against files in `uploads/`, and purges dead unreferenced images. | `python script/scan_orphaned_images.py` |
| [`script/happy_path_demo_v2.py`](script/happy_path_demo_v2.py) | Complete Playwright/Python E2E test suite covering registration, profile edits, event RSVPs, donations, and admin flows. | `python script/happy_path_demo_v2.py --url http://localhost:5173` or `--live` |
| [`script/clean_happy_path.py`](script/clean_happy_path.py) | Automated cleanup script resetting mock user entries, test events, and registrations. | `python script/clean_happy_path.py` |
| [`script/clean_happy_path.sql`](script/clean_happy_path.sql) | SQL script executing atomic transaction deletions to purge test fixtures. | `sqlite3 dev.db < script/clean_happy_path.sql` |
| [`script/fix_event_responses.sql`](script/fix_event_responses.sql) | Rebuilds SQLite B-tree indices on `Event` and `UserRsvp` to repair corruption. | `sqlite3 dev.db < script/fix_event_responses.sql` |
| [`script/migrate-gallery.ts`](script/migrate-gallery.ts) | Migrates gallery albums and blacklist data into `HeroGallery`. | `npx tsx script/migrate-gallery.ts` |
| [`script/test_event_bulletin_status.py`](script/test_event_bulletin_status.py) | Tests event and bulletin status transitions and administrative review comments. | `python script/test_event_bulletin_status.py` |

---

## Project Structure Overview

```
sd3-alumni/
├── api/                        # Express backend server
│   ├── index.js                # Server entrypoint, custom routes, background watchdog
│   ├── queryParser.js          # REST query parameter translator for Prisma
│   └── queryParser.test.js     # Query parser unit test suite
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma           # Prisma schema definition
│   └── seed.ts                 # Database seeding script (pnpm prisma:seed)
├── src/                        # React Frontend SPA
│   ├── app/
│   │   ├── components/         # Shared & feature components (admin & user)
│   │   ├── pages/              # Route views (Home, Profile, Events, Directory, Admin)
│   │   └── views/              # Core API clients (api.ts, auth.ts, psgc.ts)
│   ├── components/             # Visual hero and animation primitives (hero-3.tsx, hero-aura)
│   └── lib/                    # Helpers and hooks (device.ts, utils.ts)
├── images/                     # Static assets and curated albums
│   └── albums/                 # Scraped gallery albums for Marquee Hero
├── uploads/                    # Dynamic user-uploaded assets (avatars, attachments)
├── script/                     # Automated testing, diagnostic, and maintenance scripts
├── DEPLOYMENT.md               # VPS deployment and PM2 process guide
├── TODO.md                     # Roadmap, nice-to-have features, and technical debt
└── GIT_COMMITS_SUMMARY.md      # Comprehensive commit history from late Oct to Nov 9, 2026
```

---

## Summary of Core Dependencies

### Backend
* **Express & CORS**: HTTP server and middleware.
* **Prisma ORM & @prisma/adapter-better-sqlite3**: Relational data modeling and SQLite connection.
* **bcryptjs & jsonwebtoken**: Password hashing and JWT generation.
* **cookie-parser & multer**: HTTP cookie handling and file uploads.
* **sharp**: Image processing and WebP conversion.
* **PayMongo**: Payment gateway integration.
* **Cloudflare Workers AI**: Content classification via REST API.

### Frontend
* **Vite & React 19**: Frontend compilation and component runtime.
* **TailwindCSS v4**: Utility-first styles.
* **Shadcn UI & Radix UI Primitives**: Accessible UI components (dialogs, dropdowns, forms).
* **Framer Motion / Motion**: Animation orchestrator.
* **Lucide Icons**: UI vector iconography.
* **Sonner**: Toast notification system.
* **Recharts**: Engagement and RSVP metrics charts.
* **Zod & React Hook Form**: Typed schema validation and form handling.
