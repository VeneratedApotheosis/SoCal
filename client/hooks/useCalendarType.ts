import { storage } from '@/services/storage';
import { CALENDAR_TYPE_KEY } from '@/utility/constants';
import { CalendarView } from '@/utility/types';
import { useEffect, useState } from 'react';

export const useCalendarType = (isWeb: boolean) => {
  const [calendarType, setCalendarType] = useState<CalendarView>({ type: 'D', dayNum: isWeb ? 7 : 3, weekNum: 4 });
  const [isStorageLoaded, setIsStorageLoaded] = useState<boolean>(false);

  // ─── Load From Storage ───────────────────────────────────────────────────
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const savedCalendarType = await storage.get(CALENDAR_TYPE_KEY);
        if (savedCalendarType) {
          setCalendarType(savedCalendarType);
        }
      } catch (error) {
        console.error('Failed to load calendar type from storage:', error);
      } finally {
        setIsStorageLoaded(true);
      }
    };

    loadFromStorage();
  }, []);

  // ─── Save To Storage ─────────────────────────────────────────────────────
  useEffect(() => {
    // Guard clause: Prevent overriding existing storage with default values on mount
    if (!isStorageLoaded) return;

    const saveToStorage = async () => {
      try {
        await storage.save(CALENDAR_TYPE_KEY, calendarType);
      } catch (error) {
        console.error('Failed to save calendar type to storage:', error);
      }
    };

    saveToStorage();
  }, [calendarType, isStorageLoaded]);

  return { calendarType, setCalendarType, isStorageLoaded };
};
