  ## Alumni Tracking Network

  This project is currently in development.
  The intended client is the USJ-R Alumni Association.

  From the project brief:
    "Create an online directory for graduates with profiles, job updates, and event RSVPs, using a database for connections, achievements, and donations. Add search by graduation year or industry, plus messaging for networking. It practices many-to-many relationships and data privacy controls."

  The following features have been identified based off the project brief:
  * Online directory with filters for graduation year and industry.
  * Login/Profile with features for career networking, achievements, and donations.
  * Event RSVPs
  * Messaging capabilities (achieved through the Bulletin system.)
  * Age verification for data privacy controls. 
  * Dashboard to create a portal for aforementioned features.
  
  ## Running the code

  1) Install Node.js `https://nodejs.org/`. Verify installation with `node -v` and `npm -v`.

  2) Install pnpm `npm install -g pnpm`. Verify installation with `pnpm -v`.

  3) Install git `https://git-scm.com/`

  4) Clone this repositry. `git clone joepatricio/sd3-alumni` then `cd sd3-alumni`

  5) Run `pnpm i` to install the dependencies.

  6) Run `pnpm dev` to start the development server.

  This will expose port 5173 to the network by default. This can be changed to run on localhost only removing the `--host` option in `package.json`. 
  In both cases, the website can be accessed at `localhost:5173`.

  ## Project structure

  * `@/app/pages` contains the pages.
  * `@/app/components` contains the components.
  * `@/app/components/ui` contains third-party UI components.
  * `@/app/assets` contains the static files, including mock data.

  App.tsx is a good place to start when reading the code. Routes are defined in AppRoutes.tsx. From there, pick your favorite webpage and look for its corresponding files in `@/app/pages` and `@/app/components` to learn the code behind it. `@/app/components/ui` can be ignored for the most part, and they "just work."
  
  ## Summary of dependencies

  * Next.js
  * TailwindCSS
  * TypeScript
  * React
  * Shadcn UI for components
  * Zod for form validation
  * Sonner for notifications

  ## Notes

  This project follows a top-down model of development. In essence, we focus on the UI until the client is happy with the design. Backend specifications will be developed based on the needs of the UI.

  Uses mock data for now (check `@assets/mockData.ts/`).
  CRUD operations will not be implemented until DB development, therefore:
  * Login/Profile button in Topbar is a placeholder for now.
  * Login can be accessed via Hero button or URL hacking. `localhost:5173/login`
  * Register and Profile can be accessed from Login or URL hacking. `localhost:5173/register localhost:5173/profile`  
  * Login does not check against mock data. Any valid Login form will redirect to Profile.
  * Admin can only be accessed by URL hacking. `localhost:5173/admin`
  * Other stuff like Events, Bulletin, and Connections will not be fully implemented until DB development.

  ## TODO before client approval

  * ADMIN: Generate report.
  * ADMIN: Approved bulletins/events should be editable from this webpage. Logic for bulletin-modal and event-modal may be reused here, but strict dataflow should be observed. 
  * ADMIN: Custom ordering for Status column sort.
  * USER: Mock UI for Event, Donation
  * USER: Guest / User logic (e.g. switch UI elements for guest vs user)
    * Switch to Guest/User/Admin modes in Topbar
    * Notifications
    * Anonymous vs linked donations
    * RSVP only for logged-in users
  * UX stuff (Mobile testing, happy pathing, toasts everywhere)
  * Refactor code for better readability and maintainability. Should be done last to avoid breaking stuff and make it easier to prototype

  ## TODO after client approval
  * Redesign Profile pages to be API-friendly
  * Rich-text formatting support for Bulletin and Events? :(
  * Look into TanStack Query, SQLite
  * Implement DB development with CRUD.
  * Implement secure routing.
  * Implement CDN for images. Unsure whether cloud or self-hosted.
  * Event RSVP system
  * Donation system
