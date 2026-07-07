import { storage } from '@/services/storage';
import { TIME_ZONE_KEY } from '@/utility/constants';
import * as Localization from 'expo-localization';
import { useEffect, useState } from 'react';

/**
 * Safely resolves the device's timezone across iOS, Android, and Web/Node builders.
 */
const getFallbackTimeZone = (): string => {
  try {
    // 1. Try reading the primary preferred calendar timezone via Expo
    const nativeTimeZone = Localization.getCalendars()?.[0]?.timeZone;
    if (nativeTimeZone) return nativeTimeZone;

    // 2. Fall back to standard browser API if running on live web
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    }

    return 'UTC';
  } catch (error) {
    console.warn('Failed to detect device timezone, defaulting to UTC', error);
    return 'UTC';
  }
};

export const useTimeZone = () => {
  // Initialize state using the robust helper immediately on mount
  const [timeZone, setTimeZone] = useState<string>(getFallbackTimeZone);
  const [isStorageLoaded, setIsStorageLoaded] = useState<boolean>(false);

  // ─── Load From Storage ───────────────────────────────────────────────────
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const savedTimeZone = await storage.get(TIME_ZONE_KEY);
        if (savedTimeZone) {
          setTimeZone(savedTimeZone);
        }
      } catch (error) {
        console.error('Failed to load time zone from storage:', error);
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
        await storage.save(TIME_ZONE_KEY, timeZone);
      } catch (error) {
        console.error('Failed to save time zone to storage:', error);
      }
    };

    saveToStorage();
  }, [timeZone, isStorageLoaded]);

  return {
    timeZone,
    setTimeZone,
    isStorageLoaded,
  };
};
