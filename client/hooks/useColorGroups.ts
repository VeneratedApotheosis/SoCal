import { useAuthContext } from '@/components/contexts/auth-context';
import { useProfileContext } from '@/components/contexts/profile-context';
import { DEFAULT_COLORS } from '@/utility/constants';
import { demoCalendarGroups, demoHiddenCalendars } from '@/utility/demoData';
import { CalendarPreferences, readCalendarPreferences, writeCalendarPreferences } from '@/utility/supabaseFunctions';
import { calendarGroup, colorCache } from '@/utility/types';
import { useCallback, useEffect, useRef, useState } from 'react';

const defaultPalette: colorCache[] = [{ paletteId: 0, name: 'Default Palette', palette: DEFAULT_COLORS, colorMap: {} }];

export function useCalendarPreferences() {
  const { session, demo } = useAuthContext();
  const userId = session?.user.id;
  const { familyProfiles } = useProfileContext();
  const googleId = familyProfiles?.parent.id || undefined;
  const [paletteData, setPaletteData] = useState(defaultPalette);
  const [groupsData, setGroupsData] = useState<calendarGroup[]>([]);
  const [hiddenCalendarsData, setHiddenCalendarsData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(!!userId || demo);
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseline = useRef<CalendarPreferences | null>(null);
  const rowExists = useRef(false);
  const writes = useRef(Promise.resolve());
  const request = useRef(0);
  const mounted = useRef(false);

  const refreshColorGroups = useCallback(async () => {
    if (demo) {
      setGroupsData(demoCalendarGroups);
      setHiddenCalendarsData(demoHiddenCalendars);
      setHasLoadedPreferences(true);
      setIsLoading(false);
      return;
    }
    if (!userId) return;

    const id = ++request.current;
    setIsLoading(true);
    setHasLoadedPreferences(false);
    setError(null);
    try {
      await writes.current;
      if (id !== request.current) return;
      const row = await readCalendarPreferences(userId);
      if (id !== request.current) return;
      const loaded = {
        palette: row?.palette?.length ? row.palette : defaultPalette,
        groups: row?.groups ?? [],
        hiddenCalendars: row?.hiddenCalendars ?? [],
      };
      rowExists.current = !!row;
      baseline.current = loaded;
      setPaletteData(loaded.palette);
      setGroupsData(loaded.groups);
      setHiddenCalendarsData(loaded.hiddenCalendars);
      setHasLoadedPreferences(true);
    } catch (error) {
      if (id === request.current) setError((error as Error).message || 'Failed to load calendar preferences');
    } finally {
      if (id === request.current) setIsLoading(false);
    }
  }, [demo, userId]);

  useEffect(() => {
    mounted.current = true;
    void refreshColorGroups();
    return () => {
      mounted.current = false;
      request.current++;
    };
  }, [refreshColorGroups]);

  useEffect(() => {
    if (!userId || demo || isLoading || !hasLoadedPreferences) return;

    const id = request.current;
    writes.current = writes.current.then(async () => {
      const saved = baseline.current;
      if (!mounted.current || !saved) return;
      const changes: Partial<CalendarPreferences> = {};
      if (!areColorCachesEqual(saved.palette, paletteData)) changes.palette = paletteData;
      if (!areCalendarGroupsEqual(saved.groups, groupsData)) changes.groups = groupsData;
      if (!areStringArraysEqual(saved.hiddenCalendars, hiddenCalendarsData)) changes.hiddenCalendars = hiddenCalendarsData;
      if (!Object.keys(changes).length) return;

      try {
        await writeCalendarPreferences(userId, changes, rowExists.current, googleId);
        baseline.current = { ...saved, ...changes };
        rowExists.current = true;
        if (id === request.current) setError(null);
      } catch (error) {
        if (id === request.current) setError((error as Error).message || 'Failed to save calendar preferences');
      }
    });
  }, [demo, userId, googleId, isLoading, hasLoadedPreferences, paletteData, groupsData, hiddenCalendarsData]);

  return {
    paletteData, groupsData, hiddenCalendarsData, isLoading, hasLoadedPreferences,
    setPaletteData, setGroupsData, setHiddenCalendarsData, error, refreshColorGroups,
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
        calendar.isActive === otherCalendar.isActive &&
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
