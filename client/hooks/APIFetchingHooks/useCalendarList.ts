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

// 2. Abstracted async fetcher
const fetchSharingSettings = async (cal: any, token: string): Promise<sharedObj | null> => {
  if (cal.accessRole !== 'owner') return null;

  const res = await getCalendarSharingSettings(cal.id, token);
  return {
    id: cal.id,
    name: cal.summary,
    sharedIds:
      res.items?.map((i: any) => ({
        id: i.id.replace(/^(user:|group:|domain:|default:)/, ''),
        accessRole: i.role,
      })) || [],
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

const areSharedIdsEqual = (
  a: {
    id: string;
    accessRole: string;
  }[],
  b: {
    id: string;
    accessRole: string;
  }[],
) => {
  if (a.length !== b.length) return false;

  return a.every((cal, i) => {
    const other = b[i];

    return cal.id === other.id && cal.id === other.id && cal.accessRole === other.accessRole;
  });
};

//compare array of calendar objects
const areSharedCalendarObjsEqual = (a: sharedObj[], b: sharedObj[]): boolean => {
  if (a.length !== b.length) return false;

  return a.every((cal, i) => {
    const other = b[i];

    return cal.id === other.id && cal.name === other.name && areSharedIdsEqual(cal.sharedIds, other.sharedIds);
  });
};

export function useCalendarList() {
  const { session, demo } = useAuthContext();
  const userId = session?.user.id;
  const [calendarObjs, setCalendarObjs] = useState<calendarObj[]>([]);
  const [sharedObjs, setSharedObjs] = useState<sharedObj[]>([]);
  const [isLoading, setIsLoading] = useState(!!userId || demo);
  const [hasLoadedList, setHasLoadedList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const refetch = useCallback(async () => {
    if (demo) {
      setCalendarObjs(demoCalendarObjs);
      setSharedObjs(sharedCalendars);
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

      const owners = items.filter((cal) => cal.accessRole === 'owner');
      const sharing = await Promise.allSettled(owners.map((cal) => fetchSharingSettings(cal, accessToken)));
      if (id !== request.current) return;

      setSharedObjs((prev) => {
        const existing = new Map(prev.map((cal) => [cal.id, cal]));
        const next = sharing.flatMap((result, index) => {
          const details = result.status === 'fulfilled' ? result.value : existing.get(owners[index].id);
          return details ? [details] : [];
        });
        return areSharedCalendarObjsEqual(prev, next) ? prev : next;
      });
      if (sharing.some((result) => result.status === 'rejected')) setError('Some calendar sharing settings could not be loaded');
    } catch (error) {
      if (id === request.current) setError((error as Error).message || 'Failed to load calendar list');
    } finally {
      if (id === request.current) setIsLoading(false);
    }
  }, [demo, userId]);

  useEffect(() => {
    void refetch();
    return () => { request.current++; };
  }, [refetch]);

  return { calendarObjs, setCalendarObjs, sharedObjs, isLoading, hasLoadedList, error, refetch };
}
