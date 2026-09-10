import { useAuthContext } from '@/components/contexts/auth-context';
import { DEFAULT_COLORS, DEMO_JWT } from '@/utility/constants';
import { demoCalendarGroups, demoHiddenCalendars } from '@/utility/demoData';
import { calendarGroup, colorCache } from '@/utility/types';
import { useCallback, useEffect, useState } from 'react';
import { fetchColorGroups, saveColorPalette, saveGroups, saveHiddenCalendars } from '../services/api';
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
  const [error, setError] = useState<string | null>(null);
  const { validJwt } = useAuthContext();
  const { getValidJwt } = useAuth();

  // ─── Fetch Data from Backend ───────────────────────────────────────────────────────────

  const refreshColorGroups = useCallback(async () => {
    const jwtToken = await getValidJwt();
    if (!jwtToken || !validJwt) return;
    if (jwtToken == DEMO_JWT) {
      setGroupsData(demoCalendarGroups);
      setHiddenCalendarsData(demoHiddenCalendars);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchColorGroups(jwtToken);
      if (data.error) throw new Error(data.error);
      if (data.palette) setPaletteData(data.palette);
      if (data.groups) setGroupsData(data.groups);
      if (data.hiddenCalendars) setHiddenCalendarsData(data.hiddenCalendars);
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
    if (isLoading) return;
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
    if (isLoading) return;
    const saveData = async () => {
      console.log('[POST] Saving group data');

      const jwtToken = await getValidJwt();
      if (!jwtToken || !validJwt || jwtToken == DEMO_JWT) return;

      if (validJwt && groupsData && groupsData.length > 0) {
        await saveGroups(jwtToken, groupsData).catch((err) => console.error('Failed to update backend groups:', err));
      }
    };
    saveData();
  }, [groupsData]);

  useEffect(() => {
    if (isLoading) return;
    const saveData = async () => {
      console.log('[POST] Saving hidden calendar data');

      const jwtToken = await getValidJwt();
      if (!jwtToken || !validJwt || jwtToken == DEMO_JWT) return;

      if (validJwt && hiddenCalendarsData && hiddenCalendarsData.length > 0) {
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
