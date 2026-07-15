import { useTimeZoneContext } from '@/components/contexts/time-zone-context';
import { getEventInstancesFromGoogleCalendar } from '@/services/api';
import { processEvent } from '@/utility/eventUtils';
import { getValidAccessToken } from '@/utility/tokenUtils';
import { CalendarData, EventObj, FamilyCalendarState } from '@/utility/types';
import { RRule, rrulestr } from 'rrule';
import { useCalendarWrite } from './useCalendarWrite';

export const useMutateEvent = (
  sessionTokenString: string | null,
  uniqueCalendars: CalendarData[],
  setCalendars: React.Dispatch<React.SetStateAction<FamilyCalendarState | null>>,
  setUniqueCalendars: React.Dispatch<React.SetStateAction<CalendarData[]>>,
  fetchStart: number,
  fetchEnd: number,
) => {
  const { apiEditEvent, apiCreateEvent, apiDeleteEvent, apiPatchRecurrenceEvent, isWriting, writeError } =
    useCalendarWrite(sessionTokenString);
  const { timeZone } = useTimeZoneContext();

  const createEvent = async (event: EventObj) => {
    const rawResponse = await apiCreateEvent(event);

    const googleOwnerEmail = rawResponse?.organizer?.email || rawResponse?.creator?.email;
    const targetCalendarId = event.calendarId || googleOwnerEmail;

    const baseNewEventObj = processEvent(rawResponse, event.organizer, targetCalendarId, timeZone);
    if (!baseNewEventObj) return null;
    const newEventObjs: EventObj[] = [];

    if (baseNewEventObj?.recurrence && baseNewEventObj.recurrence.length > 0) {
      try {
        if (!sessionTokenString) throw new Error('useMutateEvent, createEvent error: No token');
        const {
          parent: { accessToken },
        } = await getValidAccessToken(sessionTokenString);

        // Calculate timeMin and timeMax
        const today = new Date();
        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        const timeMin = new Date(today.getTime() + fetchStart * MS_PER_DAY).toISOString();
        const timeMax = new Date(today.getTime() + fetchEnd * MS_PER_DAY).toISOString();

        const instancesResponse = await getEventInstancesFromGoogleCalendar(
          accessToken,
          { id: rawResponse.id, calendarId: targetCalendarId } as EventObj,
          { timeMin, timeMax },
        );

        // Process each instance returned by Google
        if (instancesResponse && instancesResponse.items) {
          instancesResponse.items.forEach((instanceRaw: any) => {
            const processedInstance = processEvent(instanceRaw, event.organizer, targetCalendarId, timeZone);
            if (processedInstance) {
              newEventObjs.push(processedInstance);
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch recurring instances from Google, falling back to base event:', error);
        newEventObjs.push(baseNewEventObj);
      }
    } else {
      // Single-day event
      newEventObjs.push(baseNewEventObj);
    }

    // add events to family calendar data
    if (newEventObjs.length > 0) {
      setCalendars((prev) => {
        if (!prev) return prev;

        const updatedParent = prev.parent.map((cal) => {
          const isMatch = cal.id === targetCalendarId;
          return isMatch ? { ...cal, events: [...cal.events, ...newEventObjs] } : cal;
        });

        return { ...prev, parent: updatedParent };
      });
    }
    if (baseNewEventObj) {
      setUniqueCalendars((prev) => {
        if (!prev) return prev;

        const updatedCalendars = prev.map((cal) => {
          const isMatch = cal.id === targetCalendarId;
          return isMatch ? { ...cal, events: [...cal.events, baseNewEventObj] } : cal;
        });

        return updatedCalendars;
      });
    }

    return baseNewEventObj;
  };

  const deleteSingleEvent = async (event: EventObj) => {
    if (!event || !event.id) {
      console.warn('Event Deletion aborted: Event object is missing a valid ID.');
      return;
    }

    try {
      const rawResponse = await apiDeleteEvent(event);

      const targetCalendarId = event.calendarId || rawResponse?.organizer?.email || rawResponse?.creator?.email;
      if (!targetCalendarId) {
        console.warn('Local state update aborted: Could not determine targetCalendarId.');
        return;
      }

      setCalendars((prev) => {
        if (!prev) return prev;

        const updatedParent = prev.parent.map((cal) =>
          cal.id === targetCalendarId ? { ...cal, events: cal.events.filter((e) => e.id !== event.id) } : cal,
        );

        return { ...prev, parent: updatedParent };
      });
    } catch (error) {
      console.error('Exception thrown while trying to delete event:', error);
      // TODO: Show user a toast/alert that the network request failed
    }
  };

  const deleteAllRecurringEvents = async (event: EventObj) => {
    if (!event || !event.id) {
      console.warn('Event Deletion aborted: Event object is missing a valid ID.');
      return;
    }

    const masterId = event.recurringEventId || event.id;

    try {
      // Deleting the master event deletes the whole recurrence
      const rawResponse = await apiDeleteEvent({ ...event, id: masterId });

      if (rawResponse?.error) {
        console.error('Google API rejected the delete request:', rawResponse.error);
        // TODO: Show user a toast/alert
        return;
      }

      const targetCalendarId = event.calendarId || rawResponse?.organizer?.email || rawResponse?.creator?.email;
      if (!targetCalendarId) {
        console.warn('Local state update aborted: Could not determine targetCalendarId.');
        return;
      }

      setCalendars((prev) => {
        if (!prev) return prev;

        const updatedParent = prev.parent.map((cal) =>
          cal.id === targetCalendarId
            ? {
                ...cal,
                events: cal.events.filter((e) => e.id !== masterId && e.recurringEventId !== masterId),
              }
            : cal,
        );

        return { ...prev, parent: updatedParent };
      });
    } catch (error) {
      console.error('Exception thrown while trying to delete recurring series:', error);
      // TODO: Show user a toast/alert
    }
  };

  const deleteThisAndFollowingEvents = async (event: EventObj) => {
    if (!event || !event.id) {
      console.warn('Event Deletion aborted: Event object is missing a valid ID.');
      return;
    }

    // If it's not a recurring event, just fall back to standard deletion
    if (!event.recurringEventId) {
      return deleteSingleEvent(event);
    }

    const masterId = event.recurringEventId;

    try {
      const processedEvent = truncateRecurrenceAndSave(event);
      const rawResponse = await apiPatchRecurrenceEvent(processedEvent);

      if (rawResponse?.error) {
        console.error('Google API rejected the truncate request:', rawResponse.error);
        // TODO: Show user a toast/alert
        return;
      }

      const targetCalendarId = event.calendarId || rawResponse?.organizer?.email || rawResponse?.creator?.email;
      if (!targetCalendarId) {
        console.warn('Local state update aborted: Could not determine targetCalendarId.');
        return;
      }
      const updatedMasterObj = processEvent(rawResponse, event.organizer, targetCalendarId, timeZone);

      setCalendars((prev) => {
        if (!prev) return prev;

        // Get the timestamp of the event being "deleted"
        const targetStartTime = new Date(event.startDate).getTime();

        const updatedParent = prev.parent.map((cal) =>
          cal.id === targetCalendarId
            ? {
                ...cal,
                events: cal.events.filter((e) => {
                  if (e.recurringEventId !== masterId && e.id !== masterId) return true;

                  const eStartTime = new Date(e.startDate).getTime();
                  return eStartTime < targetStartTime;
                }),
              }
            : cal,
        );

        return { ...prev, parent: updatedParent };
      });

      if (updatedMasterObj) {
        setUniqueCalendars((prev) => {
          if (!prev) return prev;

          return prev.map((cal) => {
            if (cal.id !== targetCalendarId) return cal;

            return {
              ...cal,
              events: cal.events.map((e) => (e.id === masterId ? updatedMasterObj : e)),
            };
          });
        });
      }
    } catch (error) {
      console.error('Exception thrown while trying to delete future events:', error);
      // TODO: Show user a toast/alert
    }
  };

  const editEvent = async (event: EventObj) => {
    const rawResponse = await apiEditEvent(event);

    const googleOwnerEmail = rawResponse?.organizer?.email || rawResponse?.creator?.email;
    const targetCalendarId = event.calendarId || googleOwnerEmail;

    const updatedEventObj = processEvent(rawResponse, event.organizer, targetCalendarId, timeZone);

    if (updatedEventObj) {
      setCalendars((prev) => {
        if (!prev) return prev;

        const updatedParent = prev.parent.map((cal) =>
          cal.id === targetCalendarId ? { ...cal, events: cal.events.map((e) => (e.id === event.id ? updatedEventObj : e)) } : cal,
        );

        return { ...prev, parent: updatedParent };
      });
    }

    return updatedEventObj;
  };

  const editAllRecurringEvents = async (event: EventObj) => {
    if (!event || !event.id) {
      console.warn('Event Editing aborted: Event object is missing a valid ID.');
      return;
    }

    try {
      const masterId = event.recurringEventId || event.id;
      const rawResponse = await apiEditEvent({ ...event, id: masterId });
      if (rawResponse?.error) {
        console.error('Google API rejected the delete request:', rawResponse.error);
        // TODO: Show user a toast/alert that the deletion failed
        return;
      }

      const googleOwnerEmail = rawResponse?.organizer?.email || rawResponse?.creator?.email;
      const targetCalendarId = event.calendarId || googleOwnerEmail;

      const updatedMasterEventObj = processEvent(rawResponse, event.organizer, targetCalendarId, timeZone);

      if (updatedMasterEventObj) {
        setCalendars((prev) => {
          if (!prev) return prev;

          const updatedParent = prev.parent.map((cal) => {
            if (cal.id !== targetCalendarId) return cal;

            return {
              ...cal,
              events: cal.events.map((e) => {
                const isMasterOrInstance = e.id === masterId || e.recurringEventId === masterId;

                if (isMasterOrInstance) {
                  if (e.id === masterId) return updatedMasterEventObj;

                  return {
                    ...e,
                    ...updatedMasterEventObj,
                    id: e.id,
                    startDate: e.startDate,
                    endDate: e.endDate,
                    recurringEventId: masterId,
                  };
                }

                return e;
              }),
            };
          });

          return { ...prev, parent: updatedParent };
        });
      }

      return updatedMasterEventObj;
    } catch (error) {
      console.error('Exception thrown while trying to delete event:', error);
      // TODO: Show user a toast/alert that the network request failed
    }
  };

  const editThisAndFollowingEvents = async (event: EventObj) => {
    if (!event || !event.id) {
      console.warn('Event Edit aborted: Event object is missing a valid ID.');
      return;
    }
    if (!event.recurringEventId) return editEvent(event);

    const masterId = event.recurringEventId;

    const targetCalendar = uniqueCalendars.find((cal) => cal.id === event.calendarId);
    const originalMaster = targetCalendar?.events.find((e) => e.id === masterId);

    if (!originalMaster || !originalMaster.recurrence) {
      console.warn('Event Edit aborted: Could not find original master event or its recurrence rule.');
      return;
    }

    // RECALCULATE RECURRENCE (Handle COUNT reduction)
    const recalculatedRecurrence = originalMaster.recurrence.map((ruleStr) => {
      if (!ruleStr.startsWith('RRULE:')) return ruleStr;

      const parsedRule = rrulestr(ruleStr);
      const { byhour, byminute, bysecond, ...options } = parsedRule.options;

      if (options.count) {
        const pastEventsRule = new RRule({
          ...options,
          dtstart: new Date(originalMaster.startDate),
        });

        // Calculate new # of occurences
        const pastCount = pastEventsRule.between(new Date(originalMaster.startDate), new Date(event.startDate), false).length;

        options.count = Math.max(1, options.count - pastCount - 1);
      }

      const newRule = new RRule(options);
      let newRuleStr = newRule.toString().replace(/DTSTART:[^\n]+\n/, '');

      return newRuleStr.startsWith('RRULE:') ? newRuleStr : `RRULE:${newRuleStr}`;
    });

    const newMasterPayload = {
      ...event,
      recurrence: recalculatedRecurrence,
    };

    try {
      // Truncate Old Recursion
      await deleteThisAndFollowingEvents(event);

      // Create new Recursion
      const newMasterObj = await createEvent(newMasterPayload);

      return newMasterObj;
    } catch (error) {
      console.error('Exception thrown while trying to edit future events:', error);
    }
  };

  return {
    createEvent,
    editEvent,
    editAllRecurringEvents,
    deleteSingleEvent,
    deleteAllRecurringEvents,
    deleteThisAndFollowingEvents,
    editThisAndFollowingEvents,
  };
};

export const truncateRecurrenceAndSave = (instanceEvent: EventObj) => {
  if (!instanceEvent.recurringEventId) throw new Error('Event is not part of a recurring series.');

  if (!instanceEvent.recurrence || instanceEvent.recurrence.length === 0) {
    throw new Error('Recurrence array is missing from the event object.');
  }

  // 2. Calculate the new UNTIL parameter (day before current date)
  let untilStr = '';
  const isAllDay = instanceEvent.allDay;

  if (isAllDay) {
    // All-day events require a date-only UNTIL format: YYYYMMDD
    const d = new Date(instanceEvent.startDate);
    d.setDate(d.getDate() - 1);
    untilStr = d.toISOString().split('T')[0].replace(/-/g, '');
  } else {
    // Timed events require a UTC datetime UNTIL format: YYYYMMDDTHHMMSSZ
    const d = new Date(instanceEvent.startDate);
    d.setSeconds(d.getSeconds() - 1);
    untilStr = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  // 3. Inject the UNTIL parameter into the RRULE string
  const updatedRecurrence = instanceEvent.recurrence.map((ruleString: string) => {
    if (ruleString.startsWith('RRULE:')) {
      let newRule = ruleString;

      // Remove existing COUNT or UNTIL to prevent conflicts
      newRule = newRule.replace(/;?COUNT=\d+/, '');
      newRule = newRule.replace(/;?UNTIL=[0-9A-Z]+/, '');

      return `${newRule};UNTIL=${untilStr}`;
    }
    return ruleString;
  });

  instanceEvent.recurrence = updatedRecurrence;

  // 4. Send the PATCH request to update the master event
  return instanceEvent;
};
