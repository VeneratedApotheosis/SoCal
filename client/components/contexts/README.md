# Global Contexts

This directory contains React Context providers that manage global state throughout the SoCal Calendar application. These contexts are composed together in `app/_layout.tsx` and provide shared state, authentication, calendar data, and UI preferences to all components.

---

## Context Dependency Graph

The contexts are nested in a specific order in `_layout.tsx`. Understanding this hierarchy is important:

```
ScreenSizeProvider (root - no dependencies)
└── AuthProvider
    └── ProfileProvider
        └── CalendarPreferencesProvider
            └── DateProvider
                └── CalendarObjectsProvider
                    └── HiddenCalendarsProvider
                        └── TimeZoneProvider
                            └── EventsProvider
                                └── GroupsProvider
                                    └── RangeProvider
                                        └── ColorCacheProvider
                                            └── UIProvider
                                                └── HourHeightProvider
```

---

## Context Reference

### 1. `screen-size-context.tsx`

**Purpose:** Provides responsive screen dimension information for layout calculations.

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `width` | `number` | Current screen width |
| `height` | `number` | Current screen height |
| `isLandscape` | `boolean` | Whether device is in landscape mode |
| `isWeb` | `number` | `1` if web and width >= 600px, else `0` |
| `fixedSidebar` | `number` | `1` if web and width >= 1200px, else `0` |
| `headerHeight` | `number` | Header height (80px for web, 60px for mobile) |

**Hooks Used:** None (uses React Native's `useWindowDimensions`)

**Context Dependencies:** None (root context)

**Export Hook:** `useScreenSize()`

---

### 2. `auth-context.tsx`

**Purpose:** Manages user authentication state, JWT tokens, demo mode, and calendar view type. Handles Supabase auth events and Google OAuth token refresh.

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `jwtToken` | `JwtTokenObj \| null` | Current JWT token object |
| `setJwtToken` | `function` | Setter for JWT token |
| `validJwt` | `boolean` | Whether user has valid authentication |
| `setValidJwt` | `function` | Setter for valid JWT status |
| `isStorageLoaded` | `boolean` | Whether auth state has been loaded from storage |
| `calendarType` | `CalendarView` | Current calendar view type ('D' for day, 'W' for week) |
| `setCalendarType` | `function` | Setter for calendar view type |
| `demo` | `boolean` | Whether app is in demo mode |
| `setIsDemo` | `function` | Setter for demo mode |

**Hooks Used:**
- `useValidJwt` from `@/hooks/useValidJwt` - Persists login state to storage
- `useCalendarType` from `@/hooks/useCalendarType` - Persists calendar view preferences

**Context Dependencies:**
- `ScreenSizeContext` - Uses `isWeb` to determine default calendar view

**Export Hook:** `useAuthContext()`

---

### 3. `profile-context.tsx`

**Purpose:** Fetches and provides user profile information from Supabase.

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `familyProfiles` | `FamilyProfileObjs \| null` | User profile data (id, email, name, picture) and family members |

**Hooks Used:**
- `useProfiles` from `@/hooks/useProfile` - Fetches profile data from Supabase

**Context Dependencies:**
- `AuthContext` - Indirectly via `useProfiles` hook which depends on `validJwt`

**Export Hook:** `useProfileContext()`

---

### 4. `calendar-preferences-context.tsx`

**Purpose:** Manages calendar color palette preferences, group configurations, and hidden calendar settings from backend.

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `paletteData` | `colorCache[]` | Array of color palette configurations |
| `groupsData` | `calendarGroup[]` | Calendar grouping configurations |
| `hiddenCalendarsData` | `string[]` | List of hidden calendar IDs |
| `isLoading` | `boolean` | Loading state for preferences |
| `setPaletteData` | `function` | Setter for palette data |
| `setGroupsData` | `function` | Setter for groups data |
| `setHiddenCalendarsData` | `function` | Setter for hidden calendars |
| `error` | `string \| null` | Error message if fetch fails |
| `refreshColorGroups` | `function` | Refetch preferences from backend |

**Hooks Used:**
- `useCalendarPreferences` from `@/hooks/useColorGroups` - Fetches preferences from backend

**Context Dependencies:** None directly in the context file

**Export Hook:** `useCalendarPreferencesContext()`

---

### 5. `calendar-index-context.tsx`

**Purpose:** Tracks the current selected date and displayed month/year for calendar navigation.

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `curDate` | `Date` | Currently selected date |
| `setCurDate` | `function` | Setter for current date |
| `currentMonthText` | `string` | Display text for current month (e.g., "January") |
| `setCurrentMonthText` | `function` | Setter for month text |
| `currentYear` | `number` | Current year being displayed |
| `setCurrentYear` | `function` | Setter for current year |

**Hooks Used:** None (uses React's `useState` only)

**Context Dependencies:** None

**Export Hook:** `useCalendarIndex()`

---

### 6. `calendar-obj-context.tsx`

**Purpose:** Manages calendar object metadata, shared calendars, and visibility states (isolate/transparent modes).

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `calendarObjs` | `calendarObj[] \| null` | List of all calendar objects with metadata |
| `setCalendarObjs` | `function` | Setter for calendar objects |
| `refetchCalendarList` | `function` | Refetch calendar list from API |
| `isLoading` | `boolean` | Loading state |
| `sharedCalendars` | `sharedObj[]` | Calendars shared with the user |
| `calViewMode` | `'default' \| 'isolate' \| 'transparent'` | Current view mode |
| `setCalViewMode` | `function` | Setter for view mode |
| `toggleTransparent` | `function` | Toggle transparent mode for a calendar |
| `toggleIsolate` | `function` | Toggle isolate mode for a calendar |
| `resetViewMode` | `function` | Reset all calendars to default view |
| `suppressOther` | `boolean` | Whether non-owned calendars are suppressed |
| `setSuppressOther` | `function` | Setter for suppress mode |
| `toggleSuppress` | `function` | Toggle suppression of non-owned calendars |

**Hooks Used:**
- `useCalendarList` from `@/hooks/APIFetchingHooks/useCalendarList` - Fetches calendar list from Google API

**Context Dependencies:**
- `ProfileContext` - Uses `familyProfiles` to filter shared calendars by owner email

**Export Hook:** `useCalendarObjects()`

---

### 7. `hidden-calendars-context.tsx`

**Purpose:** Manages which calendars are hidden from the calendar view.

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `hiddenCalendarHook.hiddenCalendars` | `string[]` | Array of hidden calendar IDs |
| `hiddenCalendarHook.toggleCalendar` | `function` | Toggle visibility of a calendar |
| `hiddenCalendarHook.hideCalendar` | `function` | Hide a specific calendar |
| `hiddenCalendarHook.showCalendar` | `function` | Show a specific calendar |

**Hooks Used:**
- `useHiddenCalendar` from `@/hooks/useHiddenCalendar` - Manages hidden calendar state

**Context Dependencies:**
- `CalendarObjectsContext` - Uses `setCalendarObjs` to update calendar shown states

**Export Hook:** `useHiddenCalendarsContext()`

---

### 8. `time-zone-context.tsx`

**Purpose:** Manages the user's selected timezone for date/time calculations.

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `timeZone` | `string` | Current timezone (e.g., "America/Los_Angeles") |
| `setTimeZone` | `function` | Setter for timezone |
| `isStorageLoaded` | `boolean` | Whether timezone has been loaded from storage |

**Hooks Used:**
- `useTimeZone` from `@/hooks/useTimeZone` - Persists timezone to storage, detects device timezone

**Context Dependencies:** None

**Export Hook:** `useTimeZoneContext()`

---

### 9. `calendar-events-context.tsx`

**Purpose:** Core context for calendar events - fetches, filters, and mutates events. Handles pagination for loading more dates.

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `allEvents` | `EventObj[]` | All visible events after filtering |
| `isLoading` | `boolean` | Loading state for events |
| `error` | `string \| null` | Error message if fetch fails |
| `mutateEvent` | `object` | Event mutation methods (see below) |
| `isWriting` | `boolean` | Whether a write operation is in progress |
| `writeError` | `string \| null` | Error from write operations |
| `fetchForward` | `function` | Load more future events |
| `fetchBackward` | `function` | Load more past events |
| `reloadCalendar` | `function` | Refresh all events |
| `uniqueCalendars` | `CalendarData[]` | Unique calendar data from events |
| `setUniqueCalendars` | `function` | Setter for unique calendars |

**`mutateEvent` Methods:**
- `deleteSingleEvent(event)` - Delete a single event
- `createEvent(event)` - Create a new event
- `editEvent(event)` - Edit an existing event
- `editAllRecurringEvents(event)` - Edit all instances of recurring event
- `deleteAllRecurringEvents(event)` - Delete all instances of recurring event
- `deleteThisAndFollowingEvents(event)` - Delete this and future recurring instances
- `editThisAndFollowingEvents(event)` - Edit this and future recurring instances

**Hooks Used:**
- `useCalendar` from `@/hooks/APIFetchingHooks/useCalendar` - Fetches events from Google Calendar API
- `useCalendarWrite` from `@/hooks/useCalendarWrite` - Handles write operation state
- `useMutateEvent` from `@/hooks/useMutateEvent` - Event CRUD operations

**Context Dependencies:**
- `AuthContext` - Uses `calendarType` to determine fetch range
- `CalendarObjectsContext` - Uses `calendarObjs`, `calViewMode`, `suppressOther`
- `HiddenCalendarsContext` - Uses `hiddenCalendarHook` to filter visible events
- `TimeZoneContext` - Uses `timeZone` for event time calculations

**Export Hook:** `useCalendarEvents()`

---

### 10. `calendar-groups-context.tsx`

**Purpose:** Manages calendar grouping - allows users to organize calendars into custom groups.

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `calendarGroups` | `object` | Group management (see below) |
| `hiddenCalendarGroups` | `string[]` | IDs of fully hidden groups |
| `hideGroup` | `function` | Hide all calendars in a group |
| `showGroup` | `function` | Show all calendars in a group |

**`calendarGroups` Object:**
- `groupedCalendars` - Array of calendar groups
- `updateSingleGroup(groupId, newCalendars)` - Update calendars in a group
- `updateMultipleGroups(updates)` - Batch update multiple groups
- `addGroup(groupName)` - Create a new group
- `renameGroup(oldName, newName)` - Rename a group
- `deleteGroup(groupName)` - Delete a group
- `moveGroup(groupName, direction)` - Reorder groups

**Hooks Used:**
- `useCalendarGroup` from `@/hooks/useCalendarGroup` - Group CRUD operations

**Context Dependencies:**
- `CalendarObjectsContext` - Uses `calendarObjs` for group management
- `HiddenCalendarsContext` - Uses `hiddenCalendarHook` to determine group visibility
- `ProfileContext` - Uses `familyProfiles` for group association

**Export Hook:** `useCalendarGroupsContext()`

---

### 11. `calendar-range-context.tsx`

**Purpose:** Provides pre-calculated date ranges for calendar rendering (daily and weekly views).

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `days` | `{ date: Date }[]` | Array of days for the calendar range |
| `pastDaysCount` | `number` | Number of past days in the range |
| `sundays` | `{ date: Date }[]` | Array of Sundays for week view navigation |

**Hooks Used:** None (uses date-fns utilities: `addDays`, `subDays`, `startOfDay`, `startOfWeek`)

**Context Dependencies:** None (uses constants `PAST_BUFFER` and `FUTURE_BUFFER`)

**Export Hook:** `useCalendarRange()`

---

### 12. `color-cache-context.tsx`

**Purpose:** Manages color assignments for calendars with support for multiple color palettes.

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `colorCache.allCaches` | `colorCache[]` | All available color palettes |
| `colorCache.activeCacheId` | `number` | ID of the currently active palette |
| `colorCache.changePalette` | `function` | Switch to a different color palette |
| `colorCache.syncCacheToPalette` | `function` | Sync current cache to palette |
| `colorCache.setManualCalendarColor` | `function` | Override a calendar's color manually |
| `colorCache.getCalendarColor` | `function` | Get the color for a specific calendar |

**Hooks Used:**
- `useColorCache` from `@/hooks/useColorCache` - Color cache management logic

**Context Dependencies:**
- `CalendarObjectsContext` - Uses `calendarObjs` to map colors to calendars

**Export Hook:** `useColorCacheContext()`

---

### 13. `ui-context.tsx`

**Purpose:** Manages UI state including theme, sidebar, login modal, and display preferences.

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `now` | `Date` | Current time, updated every minute |
| `isLoginVisible` | `boolean` | Whether login modal is shown |
| `setLoginVisible` | `function` | Setter for login modal |
| `theme` | `object` | Theme configuration (see below) |
| `sideBar` | `object` | Sidebar state (see below) |
| `isSidebarExpanded` | `boolean` | Sidebar expansion state |
| `setSidebarExpanded` | `function` | Setter for sidebar state |
| `transparentOpacity` | `number` | Opacity for transparent calendar events |
| `setTransparencyOpacity` | `function` | Setter for transparency |
| `multiDayInHeader` | `boolean` | Show multi-day events in header |
| `setMultiDayInHeader` | `function` | Setter for multi-day display |
| `visibleSettings` | `Set<string>` | Currently visible settings sections |
| `setVisibleSettings` | `function` | Setter for visible settings |

**`theme` Object:**
- `themeMode` - Current theme mode ('light', 'dark', 'auto')
- `isDark` - Whether dark mode is active
- `setThemeMode` - Setter for theme mode

**`sideBar` Object:**
- `isSidebarExpanded` - Sidebar expansion state
- `setSidebarExpanded` - Setter for sidebar state
- `isSidebarLoading` - Sidebar loading state
- `setSidebarLoading` - Setter for loading state

**Hooks Used:**
- `useTheme` from `@/hooks/useTheme` - Theme persistence and system theme detection
- `useVisibleSettings` from `@/hooks/useVisibleSettings` - Settings visibility persistence

**Context Dependencies:** None

**Export Hook:** `useUIContext()`

---

### 14. `hour-height-context.tsx`

**Purpose:** Manages the hour height for the calendar day view, enabling zoom functionality.

**Values:**
| Value | Type | Description |
|-------|------|-------------|
| `hourHeight` | `number` | Current height of one hour in pixels |
| `setHourHeight` | `function` | Setter for hour height (zoom control) |
| `minHeight` | `number` | Minimum hour height based on screen size |

**Hooks Used:** None (calculations only)

**Context Dependencies:**
- `ScreenSizeContext` - Uses `height`, `isWeb`, `headerHeight` for min height calculation

**Export Hook:** `useHourHeightContext()`

---

## Usage Example

```tsx
import { useCalendarEvents } from '@/components/contexts/calendar-events-context';
import { useUIContext } from '@/components/contexts/ui-context';

function MyComponent() {
  const { allEvents, isLoading, mutateEvent } = useCalendarEvents();
  const { theme } = useUIContext();

  // Use context values...
}
```

---

## Adding a New Context

1. Create a new file in this directory following the naming convention: `*-context.tsx`
2. Define the context type interface
3. Create the context with `createContext`
4. Create the provider component
5. Create and export a custom hook for consuming the context
6. Add the provider to `app/_layout.tsx` in the appropriate position based on dependencies
7. Update this README with documentation

---

### Simplified Dependency Graph

```
ScreenSizeContext ─────┬──► AuthContext ──► ProfileContext ──► CalendarObjectsContext ─┬──► HiddenCalendarsContext
                       │                                                               │
                       │                                                               └──► ColorCacheContext
                       │
                       └──► HourHeightContext


CalendarObjectsContext ──┬
                         │
HiddenCalendarsContext ──┼──► CalendarEventsContext
                         │
TimeZoneContext ─────────┤
                         │
AuthContext ─────────────┘


CalendarObjectsContext ──┬
                         │
HiddenCalendarsContext ──┼──► CalendarGroupsContext
                         │
ProfileContext ──────────┘

Independent:
CalendarIndexContext 
CalendarRangeContext
CalendarPreferencesContext
UIContext
```

### Reverse Dependencies ("What uses this context?")

| Context | Used By |
|---------|----------|
| `ScreenSizeContext` | AuthContext, HourHeightContext |
| `AuthContext` | ProfileContext, CalendarEventsContext |
| `ProfileContext` | CalendarObjectsContext, CalendarGroupsContext |
| `CalendarObjectsContext` | HiddenCalendarsContext, ColorCacheContext, CalendarEventsContext, CalendarGroupsContext |
| `HiddenCalendarsContext` | CalendarEventsContext, CalendarGroupsContext |
| `TimeZoneContext` | CalendarEventsContext |
| `CalendarIndexContext` | *(none - leaf context)* |
| `CalendarRangeContext` | *(none - leaf context)* |
| `CalendarPreferencesContext` | *(none - leaf context)* |
| `UIContext` | *(none - leaf context)* |
| `HourHeightContext` | *(none - leaf context)* |
| `ColorCacheContext` | *(none - leaf context)* |
| `CalendarEventsContext` | *(none - leaf context)* |
| `CalendarGroupsContext` | *(none - leaf context)* |

---

## Component Usage by Context

This section lists which components in `@client/components/` consume each context.

### `useScreenSize()` — ScreenSizeContext

```
app/
└── index.tsx

components/
├── calendarHeader/
│   └── calendar-header.tsx
├── custom-drawer/
│   ├── drawer-container.tsx
│   ├── drawer-calendar/
│   │   ├── drawer-calendar-individual.tsx
│   │   └── drawer-calendar-settings-modal.tsx
│   └── drawer-folder/
│       ├── drawer-folder-individual.tsx
│       └── drawer-folder-settings-modal.tsx
├── multiDayContainer/
│   ├── multi-day-container.tsx
│   ├── day-container.tsx
│   └── date-header.tsx
├── monthContainer/
│   ├── month-container.tsx
│   └── day-container.tsx
├── settingsContainer/
│   ├── settings-modal.tsx
│   ├── sharedCalendars/
│   │   └── shared-calendar-individual.tsx
│   └── suscribedCalendars/
│       └── suscribed-calendar-individual.tsx
└── eventDetailsContainer/
    └── calendar-obj-view.tsx
```

---

### `useAuthContext()` — AuthContext

```
app/
└── index.tsx

components/
├── calendarHeader/
│   ├── calendar-header.tsx
│   └── calendar-type.tsx
├── custom-drawer/
│   └── drawer-container.tsx
└── settingsContainer/
    └── login-container.tsx

hooks/
└── useProfile.ts (indirect usage)
```

---

### `useProfileContext()` — ProfileContext

```
components/
├── custom-drawer/
│   └── drawer-container.tsx
├── settingsContainer/
│   └── login-container.tsx
└── eventDetailsContainer/
    └── calendar-obj-view.tsx
```

---

### `useCalendarPreferencesContext()` — CalendarPreferencesContext

```
(Data flows through other contexts - no direct component usage)
```

---

### `useCalendarIndex()` — CalendarIndexContext

```
components/
├── calendarHeader/
│   └── calendar-header.tsx
├── multiDayContainer/
│   └── multi-day-container.tsx
└── monthContainer/
    ├── month-container.tsx
    └── day-container.tsx
```

---

### `useCalendarObjects()` — CalendarObjectsContext

```
components/
├── custom-drawer/
│   ├── drawer-container.tsx
│   ├── drawer-draggable-calendar.tsx
│   └── drawer-calendar/
│       └── drawer-calendar-settings-modal.tsx
├── multiDayContainer/
│   ├── event-container.tsx
│   ├── allday-chip.tsx
│   └── loading-icon.tsx
├── monthContainer/
│   └── all-day-events.tsx
├── settingsContainer/
│   ├── sharedCalendars/
│   │   └── shared-calendars.tsx
│   ├── suscribedCalendars/
│   │   └── suscribed-calendars.tsx
│   └── calendarSettings/
│       └── multi-day-event-toggle.tsx
└── eventDetailsContainer/
    ├── expanded-view.tsx
    └── calendar-obj-view.tsx
```

---

### `useHiddenCalendarsContext()` — HiddenCalendarsContext

```
components/
└── custom-drawer/
    ├── drawer-container.tsx
    └── drawer-calendar/
        └── drawer-calendar-individual.tsx
```

---

### `useTimeZoneContext()` — TimeZoneContext

```
components/
├── multiDayContainer/
│   ├── multi-day-container.tsx
│   ├── day-container.tsx
│   └── time-indicator.tsx
├── monthContainer/
│   ├── month-container.tsx
│   └── day-container.tsx
└── settingsContainer/
    └── calendarSettings/
        └── set-time-zone.tsx
```

---

### `useCalendarEvents()` — EventsContext

```
app/
└── index.tsx

components/
├── multiDayContainer/
│   ├── multi-day-container.tsx
│   └── loading-icon.tsx
├── monthContainer/
│   └── month-container.tsx
└── eventDetailsContainer/
    └── expanded-view.tsx
```

---

### `useCalendarGroupsContext()` — GroupsContext

```
components/
└── custom-drawer/
    ├── drawer-container.tsx
    └── drawer-folder/
        └── drawer-folder-settings-modal.tsx
```

---

### `useCalendarRange()` — RangeContext

```
components/
├── multiDayContainer/
│   └── multi-day-container.tsx
└── monthContainer/
    └── month-container.tsx
```

---

### `useColorCacheContext()` — ColorCacheContext

```
components/
├── custom-drawer/
│   └── drawer-calendar/
│       └── drawer-calendar-individual.tsx
├── settingsContainer/
│   ├── appearance-container.tsx
│   └── appearance/
│       └── appearance-color-palette.tsx
└── eventDetailsContainer/
    └── calendar-obj-view.tsx

hooks/
└── useEventColor.ts (used by event-container.tsx, allday-chip.tsx, all-day-events.tsx)
```

---

### `useUIContext()` — UIContext *(Most widely used)*

```
app/
└── index.tsx

components/
├── calendarHeader/
│   ├── calendar-header.tsx
│   └── calendar-type.tsx
├── custom-drawer/
│   ├── drawer-container.tsx
│   ├── drawer-web.tsx
│   ├── drawer-draggable-calendar.tsx
│   ├── drawer-calendar/
│   │   ├── drawer-calendar-individual.tsx
│   │   └── drawer-calendar-settings-modal.tsx
│   └── drawer-folder/
│       ├── drawer-folder-individual.tsx
│       └── drawer-folder-settings-modal.tsx
├── multiDayContainer/
│   ├── multi-day-container.tsx
│   ├── day-container.tsx
│   ├── event-container.tsx
│   ├── allday-chip.tsx
│   ├── date-header.tsx
│   ├── hour-guide.tsx
│   ├── loading-icon.tsx
│   └── time-indicator.tsx
├── monthContainer/
│   ├── month-container.tsx
│   ├── day-container.tsx
│   └── all-day-events.tsx
├── settingsContainer/
│   ├── settings-modal.tsx
│   ├── web-settings-portal.tsx
│   ├── appearance-container.tsx
│   ├── calendar-settings-container.tsx
│   ├── login-container.tsx
│   ├── sharedCalendars/
│   │   ├── shared-calendars.tsx
│   │   └── shared-calendar-individual.tsx
│   ├── suscribedCalendars/
│   │   ├── suscribed-calendars.tsx
│   │   └── suscribed-calendar-individual.tsx
│   ├── appearance/
│   │   ├── appearance-color-palette.tsx
│   │   ├── appearance-hour-height.tsx
│   │   ├── appearance-transparency-slider.tsx
│   │   └── appearance-theme.tsx
│   └── calendarSettings/
│       ├── set-time-zone.tsx
│       ├── multi-day-event-toggle.tsx
│       └── sidebar-settings-toggle.tsx
└── eventDetailsContainer/
    ├── event-details.tsx
    ├── web-event-details.tsx
    ├── expanded-view.tsx
    └── calendar-obj-view.tsx

hooks/
└── useEventColor.ts
```

---

### `useHourHeightContext()` — HourHeightContext

```
components/
├── multiDayContainer/
│   └── multi-day-container.tsx
└── settingsContainer/
    └── appearance/
        └── appearance-hour-height.tsx
```

---

## Component Usage Summary

| Context | # Components | Most Used In |
|---------|--------------|---------------|
| `UIContext` | **35+** | Everywhere (theme, sidebar, settings) |
| `ScreenSizeContext` | 15 | Layout components |
| `CalendarObjectsContext` | 12 | Drawer, event display, settings |
| `TimeZoneContext` | 6 | Calendar containers |
| `AuthContext` | 5 | Header, drawer, login |
| `CalendarIndex` | 4 | Header, calendar containers |
| `ProfileContext` | 3 | Drawer, login, event details |
| `ColorCacheContext` | 4 | Drawer, settings, event colors |
| `CalendarEventsContext` | 4 | Index, calendar containers |
| `HiddenCalendarsContext` | 2 | Drawer |
| `CalendarGroupsContext` | 2 | Drawer |
| `CalendarRangeContext` | 2 | Calendar containers |
| `HourHeightContext` | 2 | Multi-day container, settings |
| `CalendarPreferencesContext` | 0 | (indirect via other contexts) |
