import { fetchCalendarList, getCalendarSharingSettings } from '@/services/api';
import { getValidAccessToken } from '@/utility/tokenUtils';
import { calendarObj, sharedObj } from '@/utility/types';
import { useCallback, useEffect, useState } from 'react';

// 1. Abstracted synchronous formatter
const formatCalendar = (cal: any): calendarObj => ({
  calendarName: cal.summary,
  calendarId: cal.id,
  calendarDefaultColor: cal.backgroundColor || '#4285F4',
  owner: cal.accessRole === 'owner',
  shown: { displayed: true, suppressed: false },
  visibility: 'default',
  accessRole: cal.accessRole,
});

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

export function useCalendarList(jwtToken: string | null) {
  const [calendarObjs, setCalendarObjs] = useState<calendarObj[]>([]);
  const [sharedObjs, setSharedObjs] = useState<sharedObj[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserEvents = useCallback(async (jwtToken: string | null) => {
    if (!jwtToken) {
      console.log('clearing calendar object data');
      setCalendarObjs([]);
      setSharedObjs([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    console.log('fetching calendar objects');

    try {
      const tokens = await getValidAccessToken(jwtToken);
      const accessToken = tokens.parent.accessToken;
      const { items: parentCalendars = [] } = await fetchCalendarList(accessToken);

      // Map synchronously without mutation
      const parentCalendarObjs = parentCalendars.map(formatCalendar);

      // Map async requests and filter nulls, preserving index order natively
      const sharedPromises = parentCalendars.map((cal: any) => fetchSharingSettings(cal, accessToken));
      const resolvedShared = await Promise.all(sharedPromises);
      const allSharedObjs = resolvedShared.filter((obj): obj is sharedObj => obj !== null);

      setCalendarObjs(parentCalendarObjs);
      setSharedObjs(allSharedObjs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserEvents(jwtToken);
  }, [fetchUserEvents, jwtToken]);

  //const [reference, setReference] = useState<calendarObj[]>(referenceCalendarObjects);;

  return { calendarObjs, setCalendarObjs, sharedObjs, isLoading, error, refetch: fetchUserEvents };
}
