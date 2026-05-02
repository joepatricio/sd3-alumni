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
  * Age verification for data privacy controls. 
  * Dashboard to create a portal for aforementioned features.
  
  ## Running the code

  1) Install Node.js `https://nodejs.org/`. Verify installation with `node -v` and `npm -v`.

  2) Install pnpm `npm install -g pnpm`. Verify installation with `pnpm -v`.

  3) Install git `https://git-scm.com/`

  4) Clone this repositry. `git clone joepatricio/sd3-alumni` then `cd sd3-alumni`

  5) Run `pnpm i` to install the dependencies.

  6) Run `npx json-server .\db.json` to start the REST API server.

  7) Run `node server.js` to start the Express upload server.

  8) Run `pnpm dev` to start the development server.

  This will expose port 5173 to the network by default. This can be changed to run on localhost only by removing the `--host` option in `package.json`. 
  In both cases, the website can be accessed at `localhost:5173`.

  ## Project structure

  * `@pages` contains the pages.
  * `@components` contains the components.
  * `@components/ui` contains third-party UI components.
  * `@styles/tailwind.css` contains the TailwindCSS configuration, including brand colors. Also see `Design.md` for more information.

  App.tsx is a good place to start when reading the code. Routes are defined in AppRoutes.tsx. From there, pick your favorite webpage and look for its corresponding files in `@pages` and `@components` to learn the code behind it. `@components/ui` can be ignored for the most part, and they "just work."
  
  ## Summary of dependencies

  * Next.js
  * TailwindCSS
  * TypeScript
  * React
  * Shadcn UI for components
  * Zod for form validation
  * Sonner for notifications
  * json-server for REST API https://github.com/typicode/json-server
  * Express and Multer to handle file uploads