# SoCal (Social Calendar / Shared Calendar)

SoCal is a full-stack calendar display and management mobile application tailored for coordinate scheduling, easy calendar sharing, and visual scheduling clarity. It integrates deeply with the **Google Calendar API** while incorporating its own relational backend to support family-level calendar synchronization, easy permissions management, and profile organization.

---

## 🚀 Key Features

### 📅 Advanced Visual Calendar Displays
- **Multi-View Engine:** Seamless support for Day, 2-Day, 3-Day, and full Month views (`MonthContainer`, `MultiDayContainer`).
- **Hour Guide & Time Indicator:** A high-precision daily scheduler timeline featuring drag-and-drop tracks and a real-time current position indicator.
- **Dynamic Scroll & Zoom:** Supports bi-directional infinite scrolling and pinch-to-zoom for scaling the density of schedule layouts.
- **Visual Color Controls:** Custom default or custom calendar color overriding with high performance color caching.

### 👥 Family Sharing & Relations Management
- **Hierarchical Profiles:** Classifies accounts into custom family trees (e.g., Parent/Children) via internal relations mapping.
- **Instant Invitation Engine:** Facilitates inviting and managing active connections via simple email-based handshake tables (`invitations` schema).
- **Google ACL (Access Control List) Syncing:** Directly wraps Google Calendar API permissions allowing users to easily share, update, or revoke access to calendars (Reader vs. Writer roles) and subscribe/unsubscribe immediately.

### 🔐 Secure Session Management
- **Google OAuth 2.0 Integration:** Authentication is handled by verifying Google ID tokens on the server, generating JWT-based session tokens for subsequent client requests.
- **Incremental API Token Provisioning:** Rather than querying Google persistently or exposing long-lived refresh credentials to the mobile environment, the backend dynamically fetches and caches access tokens using stored refresh tokens.

---

## 🏗️ Architecture & Stack

The repository is divided into two decoupled workspaces:

```
Calendar_App/
├── client/          # Expo / React Native Frontend
└── server/          # Node.js / Express Backend
```

### 1. Backend (`/server`)
A modular Node.js API service managing authentication, credentials, and relationship storage.
- **Framework:** Express.js
- **Database:** SQLite (powered by `better-sqlite3` inside `data/appDb.db`)
- **Key Files & Roles:**
  - `app.js`: Houses the API endpoints. Manages Google OAuth token exchanges (`/api/google-exchange`), active permissions toggling (`/api/share-calendar`, `/api/unshare-calendar`, `/api/unsuscribe-calendar`), and token generation/refresh logic. Features a smart in-memory access token cache (`accessTokenCache`) to speed up performance.
  - `db.js`: Handles database connectivity and prepares the SQL schemas:
    - `userInfo`: Stores registered users' basic profile metadata and secure Google refresh tokens.
    - `userChildren`: Maps Parent-Child associations.
    - `invitations`: Stores pending/accepted relationship connections.

### 2. Frontend (`/client`)
A cross-platform native application built with TypeScript, Expo, and React Native.
- **Framework:** Expo SDK 54 with `expo-router` for file-based React Navigation drawers.
- **Key Modules & Layers:**
  - `app/`: Houses the main app entrypoints (`_layout.tsx` configuration and `index.tsx` routing based on auth state).
  - `components/`: Contains modular UI containers:
    - `contexts/`: React Context Providers for global state synchronization (`AuthProvider`, `EventsProvider`, `DateProvider`, `UIProvider`).
    - `custom-drawer/`: The sidebar containing draggable list containers to reorganize and toggle active calendars.
    - `monthContainer/` & `multiDayContainer/`: The core calendar rendering engines with high performance and smooth gesture handling.
    - `eventDetailsContainer/`: Interactive bottom sheet overlay modals for editing, viewing, or deleting google events.
  - `hooks/`: Clean custom hooks encapsulating separate business concerns:
    - `useCalendar.ts`: Implements range-based boundary checks and triggers incremental fetch operations to prevent loading redundant event items on horizontal scrolling.
    - `useCalendarList.ts`: Queries visible calendar categories.
    - `useCalendarWrite.ts`: Manages mutations (create, edit, delete) and syncs changes to Google's servers.
    - `useTheme.ts` & `useColorCache.ts`: Direct dynamic style rendering.
  - `services/`: Low-level network utilities:
    - `api.ts`: Combines internal backend client calls (`bReq`) and direct Google v3 API queries (`gReq`).
    - `storage.ts`: Handles cross-platform encrypted key/value state persistence (native vs. web).

---

## 🔄 Integration Workflow (How It Works)

1. **Authentication:** The mobile client signs in via Google OAuth. The code is passed to `/api/google-exchange`, where the server fetches long-lived refresh tokens, saves the user profile in `appDb.db`, and returns a JWT session token to the client.
2. **Access Token Handshake:** When the client starts loading calendar intervals, it queries `/api/get-family-access-tokens` with its JWT. The backend grabs the saved refresh token, obtains a fresh short-lived Google Access Token, caches it, and shares it back.
3. **Fetching & Syncing:** The client executes direct batch calls to the `googleapis.com/calendar/v3` endpoint using the access token, mapping all events securely across the day/month components.
4. **Permissions & Shares:** When a user shares a calendar with a family member via the app, the backend translates this action into a Google ACL API call, making sure permissions are synced on Google's side while managing invitation metadata locally.
