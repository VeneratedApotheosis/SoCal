import { convertToGoogleEvent } from '@/utility/eventUtils';
import { EventObj, accessRole } from '@/utility/types';

const req = async (url: string, method: string = 'GET', token?: string, body?: any) => {
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      const serverError = new Error(`API Error: ${errorText}`);
      (serverError as any).status = res.status; // Attach the HTTP code (e.g., 500)
      throw serverError;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : res;
  } catch (err: any) {
    if (err.status) throw err;

    //Catch no Internet connection Errors
    const networkError = new Error('No internet connection available.');
    (networkError as any).status = 'OFFLINE';
    throw networkError;
  }
};

const bReq = (path: string, method: string, t?: string, b?: any) =>
  req(`${process.env.EXPO_PUBLIC_BACKEND_LINK!}/api${path}`, method, t, b);

const gReq = (path: string, method: string, t: string, b?: any) => req(`https://www.googleapis.com/calendar/v3${path}`, method, t, b);

// ─── Backend Fetches ───────────────────────────────────────────────────────────

export const fetchJwtToken = (code: string, codeVerifier?: string, redirectUri?: string) =>
  bReq('/google-exchange', 'POST', undefined, { code, ...(codeVerifier && { codeVerifier }), ...(redirectUri && { redirectUri }) });

export const fetchFamilyProfiles = (t: string) => bReq('/get-family-profiles', 'POST', t);

export const fetchFamilyAccessTokens = (t: string) => bReq('/get-family-access-tokens', 'POST', t);

export const fetchPlacesAutocomplete = (t: string, input: string) =>
  bReq(`/places/autocomplete?input=${encodeURIComponent(input)}`, 'GET', t);

export const fetchPlacesDetails = (t: string, placeId: string) => bReq(`/places/details?placeId=${placeId}`, 'GET', t);

export const postUpdateToken = (userId: string, provider_referesh_token: string) => {
  bReq('/update-token', 'POST', undefined, {
    userId: userId,
    refreshToken: provider_referesh_token,
  });
};

export const deleteAccount = async (t: string, userId: string) => {
  return bReq('/delete-account', 'delete', t, {
    userId: userId,
  });
};

// ─── Google API Event, Calendar, Sharing Setting Fetches ───────────────────────────────────────────────────────────

export const fetchGivenCalendarRange = async (t: string, calId = 'primary', timeMin?: string, timeMax?: string, timeZone?: string) => {
  let events: any[] = [],
    pageToken: string | undefined;
  do {
    const p = new URLSearchParams({
      showDeleted: 'false',
      singleEvents: 'true',
      orderBy: 'startTime',
      ...(timeMin && { timeMin }),
      ...(timeMax && { timeMax }),
      ...(timeZone && { timeZone }),
      ...(pageToken && { pageToken }),
    });
    const data = await gReq(`/calendars/${encodeURIComponent(calId)}/events?${p}`, 'GET', t);
    if (data.items) events.push(...data.items);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return events;
};

export const fetchMultiGivenCalendarRange = async (t: string, calId = 'primary', timeMin?: string, timeMax?: string, timeZone?: string) => {
  let events: any[] = [],
    pageToken: string | undefined;
  do {
    const p = new URLSearchParams({
      showDeleted: 'false',
      singleEvents: 'false',
      ...(timeMin && { timeMin }),
      ...(timeMax && { timeMax }),
      ...(timeZone && { timeZone }),
      ...(pageToken && { pageToken }),
    });
    const data = await gReq(`/calendars/${encodeURIComponent(calId)}/events?${p}`, 'GET', t);
    if (data.items) events.push(...data.items);
    pageToken = data.nextPageToken;
  } while (pageToken);
  return events;
};

export const fetchCalendarList = (t: string) => gReq('/users/me/calendarList', 'GET', t);

export const getCalendarSharingSettings = (calId: string, t: string) => gReq(`/calendars/${calId}/acl`, 'GET', t);

// ─── Google API Specific Event Fetches ───────────────────────────────────────────────────────────

export const fetchGivenEvent = (t: string, e: EventObj) => {
  if (!e.id) throw new Error('Event ID is required to fetch an event.');
  if (!e.calendarId) throw new Error('Calendar ID is required to edit an event.');
  return gReq(`/calendars/${encodeURIComponent(e.calendarId)}/events/${encodeURIComponent(e.id)}`, 'GET', t);
};

export interface InstanceOptions {
  timeMin?: string; // RFC3339 timestamp
  timeMax?: string; // RFC3339 timestamp
  maxResults?: number;
  originalStart?: string;
}

export const getEventInstancesFromGoogleCalendar = (t: string, e: EventObj, options?: InstanceOptions) => {
  if (!e.id) throw new Error('Event ID is required to fetch instances.');
  if (!e.calendarId) throw new Error('Calendar ID is required to edit an event.');
  const targetCalendarId = e.calendarId;

  let endpoint = `/calendars/${encodeURIComponent(targetCalendarId)}/events/${encodeURIComponent(e.id)}/instances`;

  // Append optional query parameters to narrow down the instances fetched
  if (options) {
    const queryParams = [];
    if (options.timeMin) queryParams.push(`timeMin=${encodeURIComponent(options.timeMin)}`);
    if (options.timeMax) queryParams.push(`timeMax=${encodeURIComponent(options.timeMax)}`);
    if (options.maxResults) queryParams.push(`maxResults=${options.maxResults}`);
    if (options.originalStart) queryParams.push(`originalStart=${encodeURIComponent(options.originalStart)}`);

    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join('&')}`;
    }
  }

  return gReq(endpoint, 'GET', t);
};

// ─── Google API Mutate Event Functions ───────────────────────────────────────────────────────────

export const addEventToGoogleCalendar = (t: string, e: EventObj) => {
  const targetCalendarId = e.calendarId || 'primary';
  return gReq(`/calendars/${encodeURIComponent(targetCalendarId)}/events`, 'POST', t, convertToGoogleEvent(e));
};

export const editEventToGoogleCalendar = (t: string, e: EventObj) => {
  if (!e.id) throw new Error('Event ID is required to edit an event.');
  if (!e.calendarId) throw new Error('Calendar ID is required to edit an event.');
  return gReq(`/calendars/${encodeURIComponent(e.calendarId)}/events/${encodeURIComponent(e.id)}`, 'PATCH', t, convertToGoogleEvent(e));
};

export const deleteEventToGoogleCalendar = (t: string, e: EventObj) => {
  if (!e.id) throw new Error('Event ID is required to delete an event.');
  if (!e.calendarId) throw new Error('Calendar ID is required to delete an event.');
  return gReq(`/calendars/${encodeURIComponent(e.calendarId)}/events/${encodeURIComponent(e.id)}`, 'DELETE', t);
};

export const patchEventRecurrenceInGoogleCalendar = (t: string, e: EventObj) => {
  const targetId = e.recurringEventId || e.id;
  if (!targetId) throw new Error('Event ID is required to patch an event.');
  if (!e.calendarId) throw new Error('Calendar ID is required to patch an event.');
  if (!e.recurrence) throw new Error('Event Recurrence is required to patch an event.');
  const body = { recurrence: e.recurrence };
  return gReq(`/calendars/${encodeURIComponent(e.calendarId)}/events/${encodeURIComponent(targetId)}`, 'PATCH', t, body);
};

// ─── Backend API Sharing Functions ───────────────────────────────────────────────────────────

export const shareCalendar = (calId: string, email: string, t: string, r: accessRole) =>
  bReq('/share-calendar', 'post', t, {
    calId: calId,
    email: email,
    role: r,
  });

export const unshareCalendar = (calId: string, email: string, t: string) =>
  bReq('/unshare-calendar', 'delete', t, {
    calId: calId,
    email: email,
  });

export const unsuscribeCalendar = (calId: string, t: string) =>
  bReq('/unsuscribe-calendar', 'delete', t, {
    calId: calId,
  });
