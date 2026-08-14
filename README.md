## Alumni Tracking Network

This project is currently in development.
The intended client is the USJ-R School of Engineering and Architecture.

From the project brief:
  "Create an online directory for graduates with profiles, job updates, and event RSVPs, using a database for connections, achievements, and donations. Add search by graduation year or industry, plus messaging for networking. It practices many-to-many relationships and data privacy controls."

The following features have been identified based off the project brief:
* Online directory with filters for graduation year and industry.
* Login/Profile with features for career networking, achievements, and donations.
* Event RSVPs
* Messaging capabilities (achieved through the Bulletin system.)
* Dashboard to create a portal for aforementioned features.

## Vercel Migration & Full-Stack Architecture

To prepare for production deployment on **Vercel**, the application was migrated from a mock `json-server` setup to a robust, serverless-ready full-stack architecture:
* **Serverless Express Backend**: The backend API has been consolidated into an Express application (`api/index.js`) that is served via Vercel Serverless Functions.
* **Prisma ORM & SQLite**: Swapped out the raw JSON file storage for a relational database powered by **Prisma** and **SQLite** (using `@prisma/adapter-better-sqlite3`).
* **Compatibility Engine**: A custom query parser (`api/queryParser.js`) is implemented to translate legacy frontend `json-server` URL query structures (e.g. `_sort`, `_page`, `_limit`, key-value filters) directly into Prisma query inputs, preserving existing frontend integrations.
* **Deployment Config**: `vercel.json` routes all `/api/*` requests to the serverless Express function and maps all fallback routes to the React SPA `index.html`.

---

## Running the Code Locally

### 1) Prerequisites
* **Node.js**: Install Node.js (v18+ recommended) from [nodejs.org](https://nodejs.org/). Verify with `node -v` and `npm -v`.
* **pnpm**: Install pnpm globally using `npm install -g pnpm`. Verify with `pnpm -v`.
* **Git**: Install Git from [git-scm.com](https://git-scm.com/).

### 2) Installation & Setup
1. Clone the repository and navigate into it:
   ```bash
   git clone joepatricio/sd3-alumni
   cd sd3-alumni
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
4. Seed the SQLite database using legacy mock data:
   ```bash
   pnpm seed
   ```
   *Note: This command runs the script in `prisma/seed.ts`, parsing `db.json` and populating `dev.db` with relational entries.*

### 3) Running the Application
To run the full stack locally, you need to start two servers:
1. **Start Backend Server**:
   ```bash
   pnpm server
   ```
   This runs the serverless Express + Prisma API backend on port `3000`.
2. **Start Frontend Server**:
   ```bash
   pnpm dev
   ```
   This launches the Vite development server on port `5173`.

Access the application at [http://localhost:5173](http://localhost:5173). The frontend automatically routes API calls to the local backend as defined in `.env.development`.

---

## Project Structure

* `api/`: The serverless Express backend.
  * `index.js`: Express entry point, handling routing, custom endpoints (auth, image upload, connection updates, event conclude watchdog), and Prisma connection.
  * `queryParser.js`: Parses URL search query strings to construct Prisma filters, sorting rules, and pagination.
* `prisma/`: Prisma database layer.
  * `schema.prisma`: Defines the SQLite database tables, schema models, and relationships.
  * `seed.ts`: Script to populate SQLite database tables from the legacy `db.json` file.
* `src/`: React SPA source code.
  * `@pages` contains the pages.
  * `@components` contains the components.
  * `@components/ui` contains reusable Shadcn UI components.
* `vercel.json`: Configures the serverless rewrites and SPA fallback routing for Vercel.

---

## Summary of Dependencies

### Backend
* **Express & CORS**: Server router and cross-origin setup.
* **Prisma ORM**: Relational database operations client.
* **@prisma/adapter-better-sqlite3 & better-sqlite3**: Driver adapter enabling SQLite queries in a Serverless-compatible mode.
* **bcryptjs & jsonwebtoken**: JWT authentication and secure password hashing.
* **cookie-parser & multer**: Middleware for reading cookies and uploading user images.

### Frontend
* **Vite & React**: Fast SPA framework runtime.
* **TailwindCSS**: CSS design system.
* **Shadcn UI & Radix UI**: Accessible primitives and styling component library.
* **Framer Motion**: Smooth micro-animations and page transitions.
* **Lucide Icons**: Consistent vector icons.
* **Zod**: Form scheme validation.
* **Sonner**: Action feedback toast notifications.
* **Recharts & Leaflet**: Analytical charting and geographical mapping components.
