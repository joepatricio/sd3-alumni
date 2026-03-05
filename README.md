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
    * Age verification for data privacy controls (see Messaging). 
    * Dashboard to create a portal for aforementioned features.
  
  ## Running the code

  Run `pnpm i` to install the dependencies.

  Run `pnpm dev` to start the development server.

  This will expose port 5173 to the network. You can access the site at `localhost:5173`.

  ## Project structure

  * `@/app/pages` contains the pages.
  * `@/app/components` contains the components.
  * `@/app/data` contains the mock data.
  * `@/lib` contains the utilities.
  * `@/app/assets` contains the static files.

  Routes are implemented using React Router. Router logic is placed on App.tsx. This is a good place to start when reading the code.
  
  ## Summary of dependencies

  * Next.js
  * TailwindCSS
  * TypeScript
  * React and friends (Mostly using Hook Form/Query/Router)
  * Shadcn UI for components
  * Zod for validation
  * Sonner for notifications

  ## Notes

  This project follows a top-down model of development. In essence, we focus on the UI until the client is happy with the design. Backend specifications will be developed based on the needs of the UI.

  Uses mock data for now (check @/data/mockData.ts/.)
  CRUD operations will not be implemented until DB development.
  Therefore:
    * Login/Profile button in Topbar is a placeholder for now. 
    * Login can be accessed via Hero button or URL hacking. 
		localhost:5173/login
    * Register and Profile can be accessed from Login or URL hacking. 
		localhost:5173/register
		localhost:5173/profile  
    * Login does not check against mock data. Any valid Login form will redirect to Profile.
	* Admin can only be accessed by URL hacking
		localhost:5173/admin
    * Other stuff like Events, Bulletin, and Connections will not be implemented until DB development.
  
  ## TODO before client approval

  * Admin Login
  * Everything in Admin
  * UX stuff (scroll to top, secure routing, toasts everywhere, blablabla.)
  * Look for solutions to LocationPicker for AddEventModal.
  * Refactor code for better readability and maintainability.

  ## TODO after client approval

  * Implement DB development with CRUD.
  * Implement secure routing. Clean up App.tsx with extracted routes.
  * Implement CDN for images. Unsure whether cloud or self-hosted.
