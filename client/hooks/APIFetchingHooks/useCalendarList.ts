import { useAuthContext } from '@/components/contexts/auth-context';
import { fetchCalendarList, getCalendarSharingSettings } from '@/services/api';
import { demoCalendarObjs, sharedCalendars } from '@/utility/demoData';
import { getValidAccessToken } from '@/utility/tokenUtils';
import { calendarObj, sharedObj } from '@/utility/types';
import { useCallback, useEffect, useRef, useState } from 'react';

// 1. Abstracted synchronous formatter
const formatCalendar = (cal: any): calendarObj => {
  let owner = cal.dataOwner || cal.organizer?.email;

  if (!owner && cal.id?.includes('@') && !cal.id.endsWith('@group.calendar.google.com')) {
    owner = cal.id;
  }

  if (!owner) {
    owner = 'Other';
  }

  return {
    calendarName: cal.summary,
    calendarId: cal.id,
    calendarDefaultColor: cal.backgroundColor || '#4285F4',
    owner: cal.accessRole === 'owner',
    dataOwner: owner,
    shown: { displayed: true, suppressed: false },
    visibility: 'default',
    accessRole: cal.accessRole,
  };
};

//compare array of calendar objects
const areCalendarObjsEqual = (a: calendarObj[], b: calendarObj[]): boolean => {
  if (a.length !== b.length) return false;

  return a.every((cal, i) => {
    const other = b[i];

    return (
      cal.calendarName === other.calendarName &&
      cal.calendarId === other.calendarId &&
      cal.calendarDefaultColor === other.calendarDefaultColor &&
      cal.owner === other.owner &&
      cal.dataOwner === other.dataOwner &&
      cal.shown.displayed === other.shown.displayed &&
      cal.shown.suppressed === other.shown.suppressed &&
      cal.visibility === other.visibility &&
      cal.accessRole === other.accessRole
    );
  });
};

export function useCalendarList() {
  const { session, demo } = useAuthContext();
  const userId = session?.user.id;
  const [calendarObjs, setCalendarObjs] = useState<calendarObj[]>([]);
  const [permissions, setPermissions] = useState<Record<string, {
    sharedIds?: sharedObj['sharedIds'];
    status: 'loading' | 'loaded' | 'error';
  }>>({});
  const sharingRequests = useRef(new Map<string, Promise<void>>());
  const ownedIds = JSON.stringify(calendarObjs.filter((cal) => cal.owner).map((cal) => cal.calendarId).sort());
  const [isLoading, setIsLoading] = useState(!!userId || demo);
  const [hasLoadedList, setHasLoadedList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const refetch = useCallback(async () => {
    if (demo) {
      setCalendarObjs(demoCalendarObjs);
      setHasLoadedList(true);
      setIsLoading(false);
      return;
    }
    if (!userId) return;

    const id = ++request.current;
    setIsLoading(true);
    setError(null);
    try {
      const { accessToken } = await getValidAccessToken(userId);
      const { items } = await fetchCalendarList(accessToken);
      if (id !== request.current) return;

      const calendars = items.map(formatCalendar);
      setCalendarObjs((prev) => {
        const existing = new Map(prev.map((cal) => [cal.calendarId, cal]));
        const next = calendars.map((cal) => {
          const previous = existing.get(cal.calendarId);
          return previous ? { ...cal, shown: previous.shown, visibility: previous.visibility } : cal;
        });
        return areCalendarObjsEqual(prev, next) ? prev : next;
      });
      setHasLoadedList(true);
      setIsLoading(false);
    } catch (error) {
      if (id === request.current) setError((error as Error).message || 'Failed to load calendar list');
    } finally {
      if (id === request.current) setIsLoading(false);
    }
  }, [demo, userId]);

  useEffect(() => {
    void refetch();
    const pendingSharing = sharingRequests.current;
    return () => { request.current++; pendingSharing.clear(); };
  }, [refetch]);

  const refreshSharingSettings = useCallback((calendarId: string, force = true) => {
    if (!userId || demo || !(JSON.parse(ownedIds) as string[]).includes(calendarId)) return;
    const pending = sharingRequests.current;
    const existing = pending.get(calendarId);
    if (existing && !force) return existing;

    setPermissions((prev) => ({ ...prev, [calendarId]: { ...prev[calendarId], status: 'loading' } }));
    const next = getValidAccessToken(userId)
      .then(({ accessToken }) => getCalendarSharingSettings(calendarId, accessToken))
      .then(({ items }) => {
        if (pending.get(calendarId) !== next) return;
        const sharedIds = (items ?? []).map((rule: { id: string; role: string }) => ({
          id: rule.id.replace(/^(user:|group:|domain:|default:)/, ''),
          accessRole: rule.role,
        }));
        setPermissions((prev) => ({ ...prev, [calendarId]: { sharedIds, status: 'loaded' } }));
      })
      .catch(() => {
        if (pending.get(calendarId) !== next) return;
        setPermissions((prev) => ({ ...prev, [calendarId]: { ...prev[calendarId], status: 'error' } }));
      })
      .finally(() => {
        if (pending.get(calendarId) === next) pending.delete(calendarId);
      });
    pending.set(calendarId, next);
    return next;
  }, [demo, ownedIds, userId]);

  const loadSharingSettings = useCallback(async () => {
    const ids = JSON.parse(ownedIds) as string[];
    await Promise.all(ids.map((id) => refreshSharingSettings(id, false)));
  }, [ownedIds, refreshSharingSettings]);

  const owners = calendarObjs.filter((cal) => cal.owner);
  const sharedObjs = demo ? sharedCalendars : owners.flatMap((cal) => {
    const sharedIds = permissions[cal.calendarId]?.sharedIds;
    return sharedIds ? [{ id: cal.calendarId, name: cal.calendarName, sharedIds }] : [];
  });
  const isSharingLoading = owners.some((cal) => permissions[cal.calendarId]?.status === 'loading');
  const hasSharingError = owners.some((cal) => permissions[cal.calendarId]?.status === 'error');

  return {
    calendarObjs, setCalendarObjs, sharedObjs, isLoading, hasLoadedList, error, refetch,
    loadSharingSettings, refreshSharingSettings, isSharingLoading, hasSharingError,
  };
}
