import { useCalendarPreferencesContext } from '@/components/contexts/calendar-preferences-context';
import { calendarObj } from '@/utility/types';
import { Dispatch, SetStateAction, useState } from 'react';

export const useHiddenCalendar = (setCalendarObjs: Dispatch<SetStateAction<calendarObj[]>>) => {
  const { hiddenCalendarsData: hiddenCalendars, setHiddenCalendarsData: setHiddenCalendars } = useCalendarPreferencesContext();
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  //Update calendarObjs in sync with hidden calendars without double re-render
  //use WITH setHiddenCalendars
  const processHiddenCalendars = (targetHidden: string[]) => {
    setCalendarObjs((prev) =>
      prev.map((c) => ({
        ...c,
        shown: {
          ...c.shown,
          displayed: !targetHidden.includes(c.calendarId),
        },
      })),
    );
  };

  // ─── Helper Functions ────────────────────────────────────────────────────────
  const toggleCalendar = (id: string) => {
    setHiddenCalendars((prev) => {
      const nextHidden = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      processHiddenCalendars(nextHidden);

      return nextHidden;
    });
  };

  const hideCalendar = (id: string) => {
    setHiddenCalendars((prev) => {
      const nextHidden = prev.includes(id) ? prev : [...prev, id];
      processHiddenCalendars(nextHidden);

      return nextHidden;
    });
  };

  const showCalendar = (id: string) => {
    setHiddenCalendars((prev) => {
      const nextHidden = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev];
      processHiddenCalendars(nextHidden);

      return nextHidden;
    });
  };

  return {
    hiddenCalendars,
    isStorageLoaded,
    toggleCalendar,
    hideCalendar,
    showCalendar,
  };
};
