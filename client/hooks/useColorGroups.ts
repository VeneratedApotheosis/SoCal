import { useAuthContext } from '@/components/contexts/auth-context';
import { COLOR_GROUPS_STORAGE_KEY, DEFAULT_COLORS } from '@/utility/constants';
import { calendarGroup, colorCache } from '@/utility/types';
import { useCallback, useEffect, useState } from 'react';
import { fetchColorGroups, saveColorPalette, saveGroups } from '../services/api';
import { storage } from '../services/storage';
import { useAuth } from './useAuth';

export function useColorGroups() {
  const [paletteData, setPaletteData] = useState<colorCache[]>([
    {
      paletteId: 0,
      name: 'Default Palette',
      palette: DEFAULT_COLORS,
      colorMap: {},
    } as colorCache,
  ]);
  const [groupsData, setGroupsData] = useState<calendarGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start true to block early overwrites
  const [error, setError] = useState<string | null>(null);
  const { validJwt } = useAuthContext();
  const { getValidJwt } = useAuth();

  // ─── Load Data ───────────────────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true;
    const loadFromStorage = async () => {
      try {
        const saved = await storage.get(COLOR_GROUPS_STORAGE_KEY);
        if (saved && isMounted) {
          if (saved.palette) setPaletteData(saved.palette);
          if (saved.groups) setGroupsData(saved.groups);
        }
      } catch (e) {
        console.error('Failed to load color groups from storage', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadFromStorage();
    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Fetch Data from Backend ───────────────────────────────────────────────────────────

  const refreshColorGroups = useCallback(async () => {
    const jwtToken = await getValidJwt();
    if (!jwtToken || !validJwt) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchColorGroups(jwtToken);
      if (data.error) throw new Error(data.error);
      if (data.palette) setPaletteData(data.palette);
      if (data.groups) setGroupsData(data.groups);

      await storage.save(COLOR_GROUPS_STORAGE_KEY, { palette: data.palette ?? paletteData, groups: data.groups ?? groupsData });
    } catch (err: any) {
      console.error('Fetch color groups error:', err);
      setError(err.message || 'Failed to fetch color groups');
    } finally {
      setIsLoading(false);
    }
  }, [validJwt]);

  useEffect(() => {
    if (validJwt) refreshColorGroups();
  }, [validJwt, refreshColorGroups]);

  // ─── Save Data To local Storage and Backend ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (isLoading) return;
    const saveData = async () => {
      console.log('[SAVE LOCALLY AND POST] Saving color palette data');
      const payload = { palette: paletteData, groups: groupsData };
      await storage.save(COLOR_GROUPS_STORAGE_KEY, payload);

      // Sync to backend
      const jwtToken = await getValidJwt();
      if (!jwtToken || !validJwt) return;

      if (validJwt) {
        await saveColorPalette(jwtToken, paletteData).catch((err) => console.error('Failed to update backend colors palette:', err));
      }
    };
    saveData();
  }, [paletteData]);

  useEffect(() => {
    if (isLoading) return;
    const saveData = async () => {
      console.log('[SAVE LOCALLY AND POST] Saving group data');
      const payload = { palette: paletteData, groups: groupsData };
      await storage.save(COLOR_GROUPS_STORAGE_KEY, payload);

      // Sync to backend
      const jwtToken = await getValidJwt();
      if (!jwtToken || !validJwt) return;

      if (validJwt && groupsData && groupsData.length > 0) {
        await saveGroups(jwtToken, groupsData).catch((err) => console.error('Failed to update backend groups:', err));
      }
    };
    saveData();
  }, [groupsData]);

  return { paletteData, groupsData, isLoading, setPaletteData, setGroupsData, error, refreshColorGroups };
}
