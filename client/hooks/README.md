# React Native & Web Custom Hooks Architecture & Synchronizations

This documentation serves as a comprehensive developer guide to the custom React/React Native hooks in the `client/hooks` directory. It maps out locally stored values, API routes accessed, state transition triggers, and sync timings.

---

## Hook Directory Structure

The custom hooks are organized into categories across the root folder and three specialized subdirectories:

```text
client/hooks/
├── APIFetchingHooks/
│   ├── useCalendar.ts         # Handles complex multi-calendar event range loading & pagination
│   └── useCalendarList.ts     # Fetches overall calendar metadata and sharing rules (ACL settings)
├── calendarHooks/
│   ├── useCalendarRange.ts    # [EMPTY - 0 bytes] Placeholder or inactive file
│   ├── useDate.ts             # Tracks selected date list offsets in Month view
│   ├── useEventGrouping.ts    # Partitions events into all-day/timed buckets and calculates rendering layouts
│   └── usePinchZoom.ts        # Controls grid height and zoom scaling for day/week scheduler views
├── sharingCalendars/
│   ├── useShareCalendar.ts    # Shares an owned calendar with another user (manipulates ACL)
│   ├── useUnshareCalendar.ts  # Unshares a calendar with an external email
│   └── useUnsuscribeCalendar.ts # Unsubscribes current user from a shared calendar (named useUnshareCalendar inside)
├── useAuth.native.ts          # [TODO Placeholder] Native environment auth entrypoint
├── useAuth.ts                 # Main authentication flow, Google sign-in redirect, and session subscription
├── useCalendarGroup.ts        # Syncs and updates custom user-defined folders/groups of calendars
├── useCalendarType.ts         # Selects and persists calendar view layout configuration
├── useCalendarWrite.ts        # Underlying executor for write operations against the Google Calendar API
├── useColorCache.ts           # Automatically groups default colors or overrides custom hex selections
├── useColorGroups.ts          # Coordinates database-backed settings for custom groups and color palettes
├── useEventColor.ts           # Dynamically calculates high-contrast borders/text/background combinations
├── useHiddenCalendar.ts       # Tracks and filters calendar IDs selected as invisible
├── useMutateEvent.ts          # Coordinates CRUD mutations and updates family calendar state
├── useProfile.ts              # Syncs and caches family profile structures
├── useTheme.ts                # Controls visual dark/light system configurations
├── useTimeZone.ts             # Resolves device-specific localized time zones
└── useVisibleSettings.ts      # Preserves UI flags or setting items toggle sets
```

---

## 1. Local Storage Directory

The client uses a custom `storage` abstraction (typically backed by `AsyncStorage` or MMKV) to read and persist application state across sessions.

| Storage Key | Constant Name | Value Type | Reader Hook(s) | Writer Hook(s) | Store / Fetch / Post Timings & Triggers |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `'calendar'` | *(Literal)* | `FamilyCalendarState` | `useCalendar.ts` | None | **Fetched**: Once on mount to populate the calendar UI instantly with cached events.<br>**Stored**: *Note: Event mutations modify React state but do not sync back to this key. Currently read-only caching.* |
| `'calendar_type'` | `CALENDAR_TYPE_KEY` | `CalendarView` | `useCalendarType.ts` | `useCalendarType.ts` | **Fetched**: Once on mount to restore user's preferred layout (Day, Week, Month).<br>**Stored**: Triggered instantly whenever `calendarType` state is changed. |
| `'color_groups'` | `COLOR_GROUPS_STORAGE_KEY` | `{ palette, groups }` | `useColorGroups.ts` | `useColorGroups.ts` | **Fetched**: Once on mount as fallback. Overridden by database queries.<br>**Stored**: Auto-saved on `paletteData` or `groupsData` state changes. Syncs to cloud if JWT is valid. |
| `'hidden_calendars'` | `HIDDEN_CALENDAR_KEY` | `string[]` | `useHiddenCalendar.ts` | `useHiddenCalendar.ts` | **Fetched**: On mount. Immediately updates visibility flags on loaded calendars.<br>**Stored**: Triggered instantly when user toggles visibility for a calendar ID. |
| `'family_profile'` | `PROFILE_STORAGE_KEY` | `FamilyProfileObjs` | `useProfiles.ts` | `useProfiles.ts` | **Fetched**: On mount to allow quick profile lookups.<br>**Stored**: Triggered automatically on `familyProfiles` React state changes. |
| `'theme'` | `THEME_STORAGE_KEY` | `string` | `useTheme.ts` | `useTheme.ts` | **Fetched**: On mount.<br>**Stored**: Triggered instantly whenever `themeMode` is modified manually. |
| `'timeZone'` | `TIME_ZONE_KEY` | `string` | `useTimeZone.ts` | `useTimeZone.ts` | **Fetched**: On mount to recover preferred timezone.<br>**Stored**: Triggered when system or manual timezone defaults change. |
| `'visibleSettings'` | `VISIBLE_SETTINGS_KEY` | `string[]` | `useVisibleSettings.ts` | `useVisibleSettings.ts` | **Fetched**: On mount.<br>**Stored**: Triggered when user checks/unchecks options inside setting modules. |

---

## 2. API Routes & Endpoint Matrix

The hooks execute network requests through functions imported from `@/services/api` or via custom Supabase listener client configurations:

| API Route / Action | HTTP Method | Service / API Function | Trigger Hook(s) | When & Why Triggered (Action Trigger) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/token` | **POST** | `postUpdateToken` | `useAuth.ts` | Fired automatically when a user logs in (`SIGNED_IN` or `INITIAL_SESSION` event is fired by Supabase listener) and Google returns a fresh `provider_refresh_token`. Retries up to 5 times (2s delay) to allow DB row setup. |
| `/api/delete-account` | **DELETE** | `deleteAccount` | `useAuth.ts` | Fired manually when user clicks "Delete Account" button and confirms. Unsubscribes auth listeners and clears all local storage. |
| `/api/family-profiles` | **GET** | `fetchFamilyProfiles` | `useProfiles.ts` | Fired on mount, and automatically whenever `validJwt` changes, or manually via `refetch()`. |
| `/api/calendar-list` | **GET** | `fetchCalendarList` | `useCalendar.ts`<br>`useCalendarList.ts` | Fired on mount, when JWT session changes, or on manual refetch to obtain overall list of calendars that the active user can access. |
| `/api/sharing-settings` | **GET** | `getCalendarSharingSettings` | `useCalendarList.ts` | Triggered side-by-side with calendar metadata fetch for all calendars where `accessRole === 'owner'`. Determines access permissions. |
| `/api/color-groups` | **GET** | `fetchColorGroups` | `useColorGroups.ts` | Fired automatically on mount once JWT is verified. |
| `/api/color-groups/palette` | **POST** | `saveColorPalette` | `useColorGroups.ts` | Fired automatically in a `useEffect` whenever `paletteData` state changes. |
| `/api/color-groups/groups` | **POST** | `saveGroups` | `useColorGroups.ts` | Fired automatically in a `useEffect` whenever `groupsData` state changes. |
| `/api/calendar/events` | **GET** | `fetchGivenCalendarRange` | `useCalendar.ts` | Triggered automatically on mount or timezone change, or manually inside paging workflows to pull standard event listings for a date boundaries block. |
| `/api/calendar/multi-events` | **GET** | `fetchMultiGivenCalendarRange` | `useCalendar.ts` | Triggered concurrently with `fetchGivenCalendarRange` to locate recurring sequence instances. |
| `/api/calendar/event` | **POST** | `addEventToGoogleCalendar` | `useCalendarWrite.ts`<br>`useMutateEvent.ts` | Triggered manually when the user saves a newly composed event. |
| `/api/calendar/event` | **PATCH** | `editEventToGoogleCalendar` | `useCalendarWrite.ts`<br>`useMutateEvent.ts` | Triggered manually when editing single events or editing all events in a recurring series. |
| `/api/calendar/event` | **DELETE** | `deleteEventToGoogleCalendar` | `useCalendarWrite.ts`<br>`useMutateEvent.ts` | Triggered manually when deleting event(s) in single/recurring instances. |
| `/api/calendar/event/recurrence`| **PATCH** | `patchEventRecurrenceInGoogleCalendar`| `useCalendarWrite.ts`<br>`useMutateEvent.ts` | Triggered when altering a future sequence subset (e.g., "this and following events"). |
| `/api/calendar/event/instances` | **GET** | `getEventInstancesFromGoogleCalendar` | `useMutateEvent.ts` | Triggered inside creation flow if a new event is saved with custom recurrences, to fetch Google's computed instances for the active viewport dates. |
| `/api/places/autocomplete` | **GET** | `fetchPlacesAutocomplete` | `usePlacesAutocomplete.ts` | Triggered as user types inside location autocomplete inputs (whenever text length $\ge$ 3 characters). |
| `/api/places/details` | **GET** | `fetchPlacesDetails` | `usePlacesAutocomplete.ts` | Triggered immediately when selecting an autocomplete search recommendation. |
| `/api/calendar/share` | **POST** | `shareCalendar` | `useShareCalendar.ts` | Fired manually when user submits a sharing request with a partner's email address and select role. |
| `/api/calendar/unshare` | **DELETE** | `unshareCalendar` | `useUnshareCalendar.ts`<br>`useUnsuscribeCalendar.ts` | Fired manually when user stops sharing a specific calendar. |
| `/api/calendar/unsubscribe` | **DELETE** | `unsuscribeCalendar` | `useUnsuscribeCalendar.ts` | Fired manually to unsubscribe the current user from an external calendar. |


---

## 3. Hook Reference Catalog

### Core Auth & Identity
*   **`useAuth`** (Web: `useAuth.ts`, Native: `useAuth.native.ts`):
    *   **Contexts Accessed**: `useAuthContext()`
    *   **State / Refs**: `isLoading` (boolean), `isDeleting` (boolean), `error` (string \| null), `hasProcessedToken` (useRef)
    *   **Actions Returned**: `getValidJwt`, `promptAsync`, `handleLogout`, `handleDeleteAccount`
    *   **Network Operations**: Handles Google OAuth login redirection; listens to Supabase auth state change to sync tokens and trigger account deletion.
*   **`useProfiles`** (`useProfile.ts`):
    *   **Contexts Accessed**: `useAuthContext()`
    *   **State / Refs**: `familyProfiles` (FamilyProfileObjs \| null), `isLoading` (boolean), `error` (string \| null)
    *   **Actions Returned**: `refetch()` (calls `fetchProfiles`)
    *   **Network Operations**: Calls `fetchFamilyProfiles` automatically when JWT session initializes/updates.

### Calendar Data Syncing (APIFetchingHooks)
*   **`useCalendar`** (`APIFetchingHooks/useCalendar.ts`):
    *   **State / Refs**: `calendars` (FamilyCalendarState \| null), `uniqueCalendars` (CalendarData[]), `isLoading` (boolean), `error` (string \| null), `localTimeZone` (string \| null)
    *   **Actions Returned**: `clearCalendarEvents`, `refetch()` (calls `fetchUserEvents`)
    *   **Network Operations**: Orchestrates raw Google Calendar fetches. Performs high-performance event de-duplication using Hash Map mappings upon incremental range loading.
*   **`useCalendarList`** (`APIFetchingHooks/useCalendarList.ts`):
    *   **Contexts Accessed**: `useAuthContext()`
    *   **State / Refs**: `calendarObjs` (calendarObj[]), `sharedObjs` (sharedObj[]), `isLoading` (boolean), `error` (string \| null)
    *   **Actions Returned**: `refetch()` (calls `fetchUserEvents`)
    *   **Network Operations**: Calls `fetchCalendarList` and `getCalendarSharingSettings` concurrently using `Promise.all` to compile calendar lists and sharing options.

### Grouping, Colors & Customization
*   **`useCalendarGroup`** (`useCalendarGroup.ts`):
    *   **Contexts Accessed**: `useColorGroupsContext()`
    *   **State / Refs**: Derived `currentUserGroups` (useMemo filter)
    *   **Actions Returned**: `updateSingleGroup`, `updateMultipleGroups`, `addGroup`, `renameGroup`, `deleteGroup`, `moveGroup`
    *   **Operations**: Locally restructures calendar categorizations inside color groups. Automatically marks missing/unsubscribed calendars as inactive.
*   **`useColorGroups`** (`useColorGroups.ts`):
    *   **Contexts Accessed**: `useAuthContext()`
    *   **State / Refs**: `paletteData` (colorCache[]), `groupsData` (calendarGroup[]), `localLoading` (boolean), `isLoading` (boolean), `error` (string \| null)
    *   **Actions Returned**: `refreshColorGroups`
    *   **Network Operations**: Pulls/Saves palette definitions and groups layout from the custom database whenever states mutate locally.
*   **`useColorCache`** (`useColorCache.ts`):
    *   **Contexts Accessed**: `useColorGroupsContext()`
    *   **State / Refs**: `activeCacheId` (number)
    *   **Actions Returned**: `changePalette`, `syncCacheToPalette`, `setManualCalendarColor`, `getCalendarColor`
    *   **Operations**: Translates default Google colors to nearest matches inside the active custom palette. Restores customized hex overrides.
*   **`useEventColors`** (`useEventColor.ts`):
    *   **Contexts Accessed**: `useUIContext()`
    *   **Operations**: Derived values mapping. Computes lighter backgrounds, darker text, and highlight borders for calendar bubbles depending on system dark/light modes.
*   **`useHiddenCalendar`** (`useHiddenCalendar.ts`):
    *   **State / Refs**: `hiddenCalendars` (string[]), `isStorageLoaded` (boolean)
    *   **Actions Returned**: `toggleCalendar`, `hideCalendar`, `showCalendar`
    *   **Operations**: Controls calendar filtering. Syncs toggle actions to local storage and updates `shown` states instantly.

### Write Operations & Mutations
*   **`useCalendarWrite`** (`useCalendarWrite.ts`):
    *   **State / Refs**: `isWriting` (boolean), `writeError` (string \| null)
    *   **Actions Returned**: `apiCreateEvent`, `apiEditEvent`, `apiDeleteEvent`, `apiPatchRecurrenceEvent`
    *   **Operations**: Underlying API runner that intercepts requests, acquires Google Access Tokens, and triggers standard Google Calendar REST commands.
*   **`useMutateEvent`** (`useMutateEvent.ts`):
    *   **Contexts Accessed**: `useTimeZoneContext()`
    *   **State / Refs**: None (Coordinates parent states via dispatch references)
    *   **Actions Returned**: `createEvent`, `editEvent`, `editAllRecurringEvents`, `deleteSingleEvent`, `deleteAllRecurringEvents`, `deleteThisAndFollowingEvents`, `editThisAndFollowingEvents`
    *   **Operations**: High-fidelity event scheduler manager. Updates state Optimistically, handles instance deletion tracking, and calculates RRule parameter injections (e.g. `UNTIL` or `COUNT` reduction) for future recurrent updates.
### Sharing Workflows
*   **`useShareCalendar`** (`sharingCalendars/useShareCalendar.ts`):
    *   **State / Refs**: `isLoading` (boolean), `error` (string \| null)
    *   **Actions Returned**: `share`, `clearError`
    *   **Network Operations**: Calls `shareCalendar` to grant another user access to a calendar.
*   **`useUnshareCalendar`** (`sharingCalendars/useUnshareCalendar.ts`):
    *   **State / Refs**: `isLoading` (boolean), `error` (string \| null)
    *   **Actions Returned**: `unshare`, `clearError`
    *   **Network Operations**: Calls `unshareCalendar` to revoke sharing access.
*   **`useUnsuscribeCalendar`** (`sharingCalendars/useUnsuscribeCalendar.ts`):
    *   **State / Refs**: `isLoading` (boolean), `error` (string \| null)
    *   **Actions Returned**: `unshare` (note the naming collision)
    *   **Network Operations**: Calls `unsuscribeCalendar` to remove the current user's subscription to a calendar.

---

## 4. Notable Findings & Codebase Anomalies

Developers maintaining this directory should keep the following design anomalies and requirements in mind:

1.  **Named Export Collision / Mismatch**:
    *   **File**: `client/hooks/sharingCalendars/useUnsuscribeCalendar.ts`
    *   **Quirk**: The exported function is named `useUnshareCalendar` instead of matching its filename. This conflicts directly with its sibling file `client/hooks/sharingCalendars/useUnshareCalendar.ts`. When importing, double-check that you are importing from the correct file path.
2.  **Platform Discrepancies**:
    *   **File**: `client/hooks/useAuth.native.ts`
    *   **Quirk**: Currently exists only as a dummy file containing a `//TODO: MAKE THIS LIKE WORK` comment. The actual authentication logic (Supabase Google Sign-In redirect and token synchronization) is exclusively implemented inside `client/hooks/useAuth.ts` for web targets.
3.  **Empty Files**:
    *   **File**: `client/hooks/calendarHooks/useCalendarRange.ts`
    *   **Quirk**: Contains `0 bytes` and has no active functions. Safe to prune if no longer required.
4.  **One-way local cache on Calendar Events**:
    *   **File**: `APIFetchingHooks/useCalendar.ts`
    *   **Quirk**: On startup, cached calendars and events are loaded via `storage.get('calendar')` to speed up display rendering. However, the hook never writes newly fetched or mutated calendar states back into storage. This means startup caching is static/read-only.


