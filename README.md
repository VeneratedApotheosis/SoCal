# SoCal

SoCal brings your group's Google Calendars into one unified view. Keep track of what your friends are up to, and easily manage who has access to your time.

---
<img align="right" width="450" src="/README_Imgs/edited/Web_3_Week_View_Edited.png" alt="Example Image">

## Features

### Customizable Visual Calendar Displays
- **Multi-View Engine:** Scrollable multi-day and multi-week views with mutable number of days/weeks shown.
- **Web and Mobile View** Support for both web and mobile view modes, as well as light and dark mode.
- **Dynamic Scroll & Zoom:** Supports bi-directional infinite scrolling with lazy loading to prevent latency.

### Multi-Calendar Management
- **Group Calenedars:** Group Calendars together to easily manage shared calendars.
- **Visibility Toggles:** Hide, isolate, or make transparent calendars or groups to focus on specific calendars with just a few clicks
- **Sharing Controls:** See who can see what calendars and share your calendars with othesrs right in the app.

### Sync with Google Calendar
- **Google OAuth 2.0 Integration:** Authentication is handled by google, no need to transfer your events and calendars.
- **Google Calendar API:** All events are managed by google, SoCal just makes it better.

---

<img align="right" width="450" src="/README_Imgs/edited/Web_Settings_Edited.png" alt="Example Image">

## Architecture & Stack

The repository is divided into two decoupled workspaces:

```
Calendar_App/
├── client/          # Expo / React Native Frontend
└── server/          # Node.js / Express Backend
```

### 1. Backend (`/server`)
A modular Node.js API service managing authentication, credentials, and relationship storage.
- **Framework:** Express.js
- **Database:** PostgreSQL (hosted on Supabase)
- **Key Files & Roles:**
  - `app.js`: Houses the API endpoints. 
    - Uses Supabase to validate JWTs (`authenticate` middleware) and securely manages Google OAuth token exchanges
    - Google Calendar Integration: Provides generalized proxy methods (`googleFetch`) for interacting with the Google Calendar API. Handles permissions and active subscriptions (`/api/share-calendar`, `/api/unshare-calendar`, `/api/unsuscribe-calendar`).
    - Google Places Proxy: Secures Google Maps API keys by proxying frontend location requests through the backend (`/api/places/autocomplete`, `/api/places/details`).
    - User & Family Management: Endpoints to fetch family profiles and access tokens, update Google refresh tokens, and a secure account deletion flow that removes data from both the database and Supabase Auth (`supabaseAdmin`).
  - `db.js`: Handles database connectivity and prepares the SQL schemas:
    - `userInfo`: Stores registered users' basic profile metadata and secure Google refresh tokens.

    
<img align="right" width="300" src="/README_Imgs/edited/Mobile_Drawer_Edited.png" alt="Example Image">

### 2. Frontend (`/client`)
A cross-platform native application built with TypeScript, Expo, and React Native.
- **Key Modules & Layers:**
  - `app/`: Houses the main app entrypoints (`_layout.tsx` configuration and `index.tsx` routing based on auth state).
  - `components/`: Contains modular UI containers:
    - `contexts/`: React Context Providers for global state synchronization (`AuthProvider`, `EventsProvider`, `ScreenSizeProvider`, `UIProvider`).
    - `custom-drawer/`: The sidebar containing draggable list containers to reorganize and toggle active calendars.
    - `monthContainer/` & `multiDayContainer/`: The core calendar rendering with shopify Flashlist and smooth gesture handling.
    - `eventDetailsContainer/`: Interactive modals for editing, viewing, or deleting google events.
  - `hooks/`: Custom hooks encapsulating separate business concerns:
    - `useCalendar.ts`: Implements range-based boundary checks and triggers incremental fetch operations to prevent loading redundant event items on horizontal scrolling.
    - `useCalendarList.ts`: Fetches users calendars.
    - `useCalendarWrite.ts`: Manages mutations (create, edit, delete) and syncs changes to Google's servers.
    - `useTheme.ts` & `useColorCache.ts`: Direct dynamic style rendering.
  - `services/`: Low-level network utilities:
    - `api.ts`: Combines internal backend client calls (`bReq`) and direct Google v3 API queries (`gReq`).
    - `storage.ts`: Handles cross-platform encrypted key/value state persistence (native vs. web).

### 3. TODO:
 - TouchScreen Vertical Scroll
 - BUG FIX: Smth wrong with dragging the calendars in the sidebar
 - Setting to add a weekly space btwn months in weekly View
 - Create Logo
 - Update All-Day to have last day INCLUSIVE
 - Font Size Settings
 - Add UI feedback to hover, press, and selected buttons
 - Consider checking if calendarList is properly being refreshed //Done
 - FIXED: sharing doesnt work
 - Save Additional User Data in db instead of saving locally //Done
 - Save Separate State for Weekly and Daily Count //Done
 - Finish Weekly View //Potentially Done