import { storage } from '@/services/storage';
import { HIDDEN_CALENDAR_KEY } from '@/utility/constants';
import { calendarObj } from '@/utility/types';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const useHiddenCalendar = (calendarObjs: calendarObj[] | null, setCalendarObjs: Dispatch<SetStateAction<calendarObj[]>>) => {
  const [hiddenCalendars, setHiddenCalendars] = useState<string[]>([]);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // Helper accepts the target array explicitly
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

        // Pass savedCaches directly so it updates synchronously
        processHiddenCalendars(savedCaches);
      } catch (e) {
        console.error('Failed to load storage', e);
      } finally {
        setIsStorageLoaded(true);
      }
    };

    loadFromStorage();
  }, []);

  // ─── 2. Save to storage ────────────────────────────────────────────────────
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

  // ─── Toggle Function ────────────────────────────────────────────────────────
  const toggleCalendar = (id: string) => {
    setHiddenCalendars((prev) => {
      const nextHidden = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];

      // Synchronously update calendarObjs using the updated array
      processHiddenCalendars(nextHidden);

      return nextHidden;
    });
  };

  return {
    hiddenCalendars,
    isStorageLoaded,
    toggleCalendar,
  };
};
