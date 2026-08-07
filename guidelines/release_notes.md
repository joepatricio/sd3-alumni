# SD3-Alumni Project Release Notes

Based on the project charter and development roadmap, the progress of the SD3-Alumni tracking network is tracked across the following release milestones. 

## 25% Release Notes (Foundation, Navigation & Directory)

| NEW FEATURES | Test | Expected Result |
| :--- | :--- | :--- |
| **Project Structure & Routing** | 1. Click all navigation links in the dashboard.<br>2. Attempt to navigate to a non-existent URL. | 1. Pages load correctly without 404 errors.<br>2. A proper 404 Not Found page is shown. |
| **Basic Login/Auth Layout** | 1. Enter correct placeholder credentials.<br>2. Enter incorrect placeholder credentials. | 1. User is redirected to the dashboard upon successful auth.<br>2. Error message displayed, login fails. |
| **Online Alumni Directory** | 1. View the alumni directory page.<br>2. Apply 'Graduation Year' filter.<br>3. Apply 'Industry' filter. | 1. List of profiles displays correctly.<br>2. List updates to show only alumni from that year.<br>3. List updates to show only alumni in that industry. |

## 50% Release Notes (Bulletin & Events CRUD)

| NEW FEATURES | Test | Expected Result |
| :--- | :--- | :--- |
| **Bulletin Submissions** | 1. Submit a text-only bulletin post.<br>2. Submit a post with an image attachment. | 1. Post appears dynamically on the feed.<br>2. Image uploads and displays correctly with the post. |
| **Bulletin Management** | 1. Edit the content of an existing post.<br>2. Delete one of your own posts. | 1. Edited text is saved and visible.<br>2. Post is removed entirely from the database and feed. |
| **Event Creation** | 1. Create an event with valid dates and description.<br>2. Attempt to create an event in the past. | 1. Event is added to the upcoming events list.<br>2. Validation error prevents creation. |
| **Event Modification** | 1. Change the time/location of an event.<br>2. Delete an event. | 1. Changes reflect dynamically on the events page.<br>2. Event is fully removed from the platform. |
| **Dynamic RSVPs and Likes** | 1. Click RSVP on an event.<br>2. Un-RSVP to an event.<br>3. Click 'Like' on a bulletin post. | 1. RSVP counter increments, button state changes.<br>2. RSVP counter decrements, button reverts.<br>3. Like counter increments instantly. |

## 75% Release Notes (User Profile System)

| NEW FEATURES | Test | Expected Result |
| :--- | :--- | :--- |
| **Profile Customization** | 1. Edit bio text and save.<br>2. Update contact info.<br>3. Attempt to save with invalid data format (e.g., bad email). | 1. Updated bio appears.<br>2. New contact info is saved.<br>3. Form validation blocks save and shows error. |
| **Achievements Showcase** | 1. Add a new achievement.<br>2. Edit an existing achievement.<br>3. Delete an achievement. | 1. Achievement appears on the profile.<br>2. Changes reflect immediately.<br>3. Achievement is removed from the profile. |
| **Connections Network** | 1. Send a connection request to a user.<br>2. Accept a pending connection request.<br>3. Decline a request. | 1. Request is sent and shows as pending.<br>2. Both users appear in each other's connection lists.<br>3. Request is removed, connection not formed. |
| **Privacy Controls** | 1. Set profile to "Private".<br>2. Set profile to "Public". | 1. Non-connected users cannot view sensitive data.<br>2. All logged-in users can view full profile details. |

## 90% Release Notes (Admin Dashboard)

| NEW FEATURES | Test | Expected Result |
| :--- | :--- | :--- |
| **Admin Authentication** | 1. Log in with an admin account.<br>2. Access Admin route with a regular user account. | 1. Admin Dashboard is accessible.<br>2. Access denied, user redirected to standard dashboard. |
| **User Management Tab** | 1. Suspend a user account.<br>2. Reset a user's password. | 1. Target user cannot log in and gets suspended notice.<br>2. User can successfully log in with the new password. |
| **Directory Management Tab** | 1. Manually add a new alumni record.<br>2. Edit an existing alumni's graduation year.<br>3. Remove an alumni record. | 1. Record instantly appears in public directory.<br>2. Directory reflects updated year.<br>3. Profile is completely wiped from the directory. |
| **Content Moderation Tab** | 1. Delete a flagged bulletin post from admin view.<br>2. Delete an inappropriate event. | 1. Post is removed from the user-facing feed.<br>2. Event is removed globally. |

## 100% Release Notes (Polish & Optional Features)

| NEW FEATURES | Test | Expected Result |
| :--- | :--- | :--- |
| **UI/UX Polish & Microinteractions** | 1. Test mobile responsiveness.<br>2. Hover over interactive elements. | Smooth hover effects trigger, toasts appear for actions, and mobile view is seamless. |
| **Pagination & State Persistence** | 1. Scroll through >100 directory items.<br>2. Set directory filters and refresh. | Pagination loads items efficiently; filters persist via session or URL parameters. |
| **Notifications & Emails** | Trigger an event that sends an email/notification. | User receives notification/email appropriately. |
| **Account Security & Preferences** | 1. Log in with encrypted session.<br>2. Attempt to deactivate account. | Login securely authenticates; account is deactivated and user is logged out on request. |
| **Unified Social Links** | Check navigation bars and footer for social media links. | Social media icons are unified (Lucide) and consistently direct the user. |
| **Profile Pictures in Feeds** | View the Bulletin feed and Event feed. | Feeds show profile pictures of authors, and clicking them routes to their profile. |
| **Rate-Limiting & Security** | Rapidly submit POST requests. | Server rate-limits and timeouts prevent spam/abuse. |
