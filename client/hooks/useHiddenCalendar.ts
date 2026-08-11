import { storage } from '@/services/storage';
import { HIDDEN_CALENDAR_KEY } from '@/utility/constants';
import { calendarObj } from '@/utility/types';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const useHiddenCalendar = (setCalendarObjs: Dispatch<SetStateAction<calendarObj[]>>) => {
  const [hiddenCalendars, setHiddenCalendars] = useState<string[]>([]);
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

  // ─── Storage Load ───────────────────────────────────────────────────────────
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const savedCaches = (await storage.get(HIDDEN_CALENDAR_KEY)) ?? [];
        setHiddenCalendars(savedCaches);
        processHiddenCalendars(savedCaches);
      } catch (e) {
        console.error('Failed to load storage', e);
      } finally {
        setIsStorageLoaded(true);
      }
    };

    loadFromStorage();
  }, []);

  // ─── Storage Svae ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isStorageLoaded) return;

    const saveToStorage = async () => {
      try {
        await storage.save(HIDDEN_CALENDAR_KEY, hiddenCalendars);
      } catch (e) {
        console.error('Failed to save color cache to storage', e);
      }
    };

    saveToStorage();
  }, [hiddenCalendars, isStorageLoaded]);

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
