import { useAuthContext } from '@/components/contexts/auth-context';
import { DEFAULT_COLORS, DEMO_JWT } from '@/utility/constants';
import { demoCalendarGroups, demoHiddenCalendars } from '@/utility/demoData';
import { getUserCalendarGroups, getUserColorPalette, getUserHiddenCalendars } from '@/utility/supabaseFunctions';
import { calendarGroup, colorCache } from '@/utility/types';
import { useCallback, useEffect, useState } from 'react';
import { saveColorPalette, saveGroups, saveHiddenCalendars } from '../services/api';
import { useAuth } from './useAuth';

export function useCalendarPreferences() {
  const [paletteData, setPaletteData] = useState<colorCache[]>([
    {
      paletteId: 0,
      name: 'Default Palette',
      palette: DEFAULT_COLORS,
      colorMap: {},
    } as colorCache,
  ]);
  const [groupsData, setGroupsData] = useState<calendarGroup[]>([]);
  const [hiddenCalendarsData, setHiddenCalendarsData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start true to block early overwrites
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { validJwt } = useAuthContext();
  const { getValidJwt } = useAuth();

  // ─── Fetch Data from Backend ───────────────────────────────────────────────────────────

  const refreshColorGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setHasLoadedPreferences(false);
    try {
      console.log('[FETCH] Calendar Preferences');
      const jwtToken = await getValidJwt();
      if (!jwtToken || !validJwt) return;
      if (jwtToken == DEMO_JWT) {
        setGroupsData(demoCalendarGroups);
        setHiddenCalendarsData(demoHiddenCalendars);
        setHasLoadedPreferences(true);
        return;
      }

      const groupData = await getUserCalendarGroups(jwtToken);
      const colorPaletteData = await getUserColorPalette(jwtToken);
      const hiddenCalendarData = await getUserHiddenCalendars(jwtToken);

      if (!groupData || !colorPaletteData || !hiddenCalendarData) {
        throw new Error('Incomplete calendar preferences response');
      }

      setGroupsData((prev) => (areCalendarGroupsEqual(prev, groupData.groups) ? prev : groupData.groups));
      setPaletteData((prev) => (areColorCachesEqual(prev, colorPaletteData.palette) ? prev : colorPaletteData.palette));
      setHiddenCalendarsData((prev) =>
        areStringArraysEqual(prev, hiddenCalendarData.hiddenCalendars) ? prev : hiddenCalendarData.hiddenCalendars,
      );

      setHasLoadedPreferences(true);
    } catch (err: any) {
      console.error('Fetch calendar preferences error:', err);
      setError(err.message || 'Failed to fetch calendar preferences groups');
    } finally {
      setIsLoading(false);
    }
  }, [validJwt, demoCalendarGroups]);

  useEffect(() => {
    if (validJwt) refreshColorGroups();
  }, [validJwt, refreshColorGroups]);

  // ─── Save Data To Backend ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (isLoading || !hasLoadedPreferences) return;
    const saveData = async () => {
      console.log('[POST] Saving color palette data');

      const jwtToken = await getValidJwt();
      if (!jwtToken || !validJwt || jwtToken == DEMO_JWT) return;

      if (validJwt) {
        await saveColorPalette(jwtToken, paletteData).catch((err) => console.error('Failed to update backend colors palette:', err));
      }
    };
    saveData();
  }, [paletteData]);

  useEffect(() => {
    if (isLoading || !hasLoadedPreferences) return;
    const saveData = async () => {
      console.log('[POST] Saving group data');

      const jwtToken = await getValidJwt();
      if (!jwtToken || !validJwt || jwtToken == DEMO_JWT) return;

      if (validJwt && groupsData) {
        await saveGroups(jwtToken, groupsData).catch((err) => console.error('Failed to update backend groups:', err));
      }
    };
    saveData();
  }, [groupsData]);

  useEffect(() => {
    if (isLoading || !hasLoadedPreferences) return;
    const saveData = async () => {
      console.log('[POST] Saving hidden calendar data');

      const jwtToken = await getValidJwt();
      if (!jwtToken || !validJwt || jwtToken == DEMO_JWT) return;

      if (validJwt && hiddenCalendarsData) {
        await saveHiddenCalendars(jwtToken, hiddenCalendarsData).catch((err) =>
          console.error('Failed to update backend hidden calendars:', err),
        );
      }
    };
    saveData();
  }, [hiddenCalendarsData]);

  return {
    paletteData,
    groupsData,
    hiddenCalendarsData,
    isLoading,
    setPaletteData,
    setGroupsData,
    setHiddenCalendarsData,
    error,
    refreshColorGroups,
  };
}

export const areStringArraysEqual = (a: string[], b: string[]): boolean => {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  return a.every((value, i) => value === b[i]);
};

export const areColorCachesEqual = (a: colorCache[], b: colorCache[]): boolean => {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  return a.every((cache, i) => {
    const other = b[i];

    if (cache.paletteId !== other.paletteId || cache.name !== other.name) {
      return false;
    }

    if (!areStringArraysEqual(cache.palette, other.palette)) {
      return false;
    }

    const keysA = Object.keys(cache.colorMap);
    const keysB = Object.keys(other.colorMap);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => cache.colorMap[key] === other.colorMap[key]);
  });
};

export const areCalendarGroupsEqual = (a: calendarGroup[], b: calendarGroup[]): boolean => {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  return a.every((group, i) => {
    const other = b[i];

    if (group.id !== other.id || group.userId !== other.userId) {
      return false;
    }

    // Assuming GroupedCalendarObj is an object type
    if (group.calendars.length !== other.calendars.length) {
      return false;
    }

    return group.calendars.every((calendar, j) => {
      const otherCalendar = other.calendars[j];

      return (
        calendar.calendarId === otherCalendar.calendarId &&
        calendar.calendarName === otherCalendar.calendarName &&
        calendar.calendarDefaultColor === otherCalendar.calendarDefaultColor &&
        calendar.owner === otherCalendar.owner &&
        calendar.dataOwner === otherCalendar.dataOwner &&
        calendar.accessRole === otherCalendar.accessRole &&
        calendar.visibility === otherCalendar.visibility &&
        calendar.shown.displayed === otherCalendar.shown.displayed &&
        calendar.shown.suppressed === otherCalendar.shown.suppressed
      );
    });
  });
};
