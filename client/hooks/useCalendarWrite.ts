// useCalendarWrite.ts
import { getValidAccessToken } from '@/utility/tokenUtils';
import { EventObj } from '@/utility/types';
import { useState } from 'react';
import {
  addEventToGoogleCalendar,
  deleteEventToGoogleCalendar,
  editEventToGoogleCalendar,
  patchEventRecurrenceInGoogleCalendar,
} from '../services/api';
import { useAuth } from './useAuth';

export function useCalendarWrite() {
  const [isWriting, setLoading] = useState(false);
  const [writeError, setError] = useState<string | null>(null);
  const { getValidJwt } = useAuth();

  const executeMutation = async (apiFunc: Function, event: EventObj) => {
    const jwtToken = await getValidJwt();
    if (!jwtToken) throw new Error('useCalendarWrite; No token');
    setLoading(true);
    setError(null);
    try {
      const {
        parent: { accessToken },
      } = await getValidAccessToken(jwtToken);
      return await apiFunc(accessToken, event);
    } catch (err: any) {
      setError(err.message);
      console.error('Execute Mutation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    apiCreateEvent: (e: EventObj) => executeMutation(addEventToGoogleCalendar, e),
    apiEditEvent: (e: EventObj) => executeMutation(editEventToGoogleCalendar, e),
    apiDeleteEvent: (e: EventObj) => executeMutation(deleteEventToGoogleCalendar, e),
    apiPatchRecurrenceEvent: (e: EventObj) => executeMutation(patchEventRecurrenceInGoogleCalendar, e),
    isWriting,
    writeError,
  };
}
