import { useAuthContext } from '@/components/contexts/auth-context';
import { fetchGivenEvent } from '@/services/api';
import { processEvent } from '@/utility/eventUtils';
import { getValidAccessToken } from '@/utility/tokenUtils';
import { EventObj } from '@/utility/types';
import { useCallback, useMemo } from 'react';

export function useRecurringSeries(timeZone: string) {
  const { session, demo } = useAuthContext();
  const userId = session?.user.id;
  const cache = useMemo(() => ({
    userId,
    timeZone,
    entries: new Map<string, Promise<EventObj>>(),
  }), [userId, timeZone]);

  const loadRecurringMaster = useCallback((event: EventObj) => {
    const { calendarId, recurringEventId } = event;
    if (!cache.userId || demo || !calendarId || !recurringEventId) {
      return Promise.reject(new Error('Recurring series is unavailable.'));
    }

    const key = JSON.stringify([calendarId, recurringEventId]);
    const existing = cache.entries.get(key);
    if (existing) return existing;

    const request = getValidAccessToken(cache.userId)
      .then(({ accessToken }) => fetchGivenEvent(accessToken, { calendarId, id: recurringEventId }))
      .then((raw) => {
        const master = processEvent(raw, event.organizer, calendarId, cache.timeZone);
        if (!master?.recurrence?.length) throw new Error('Recurring series has no recurrence rules.');
        return master;
      })
      .catch((error) => {
        if (cache.entries.get(key) === request) cache.entries.delete(key);
        throw error;
      });

    cache.entries.set(key, request);
    return request;
  }, [cache, demo]);

  const invalidateRecurringMaster = useCallback((calendarId: string, masterId: string) => {
    cache.entries.delete(JSON.stringify([calendarId, masterId]));
  }, [cache]);

  return { loadRecurringMaster, invalidateRecurringMaster };
}
