import { useAuthContext } from '@/components/contexts/auth-context';
import { DEFAULT_COLORS } from '@/utility/constants';
import { calendarGroup, colorCache } from '@/utility/types';
import { useCallback, useEffect, useState } from 'react';
import { fetchColorGroups, saveColorPalette, saveGroups } from '../services/api';
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
  const [localLoading, setLocalLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start true to block early overwrites
  const [error, setError] = useState<string | null>(null);
  const { validJwt } = useAuthContext();
  const { getValidJwt } = useAuth();

  // ─── Fetch Data from Backend ───────────────────────────────────────────────────────────

  const refreshColorGroups = useCallback(async () => {
    const jwtToken = await getValidJwt();
    if (!jwtToken || !validJwt || localLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchColorGroups(jwtToken);
      if (data.error) throw new Error(data.error);
      if (data.palette) setPaletteData(data.palette);
      if (data.groups) setGroupsData(data.groups);
    } catch (err: any) {
      console.error('Fetch color groups error:', err);
      setError(err.message || 'Failed to fetch color groups');
    } finally {
      setIsLoading(false);
    }
  }, [validJwt]);

  useEffect(() => {
    if (validJwt) refreshColorGroups();
  }, [validJwt, refreshColorGroups, localLoading]);

  // ─── Save Data To Backend ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (isLoading || localLoading) return;
    const saveData = async () => {
      console.log('[POST] Saving color palette data');

      const jwtToken = await getValidJwt();
      if (!jwtToken || !validJwt) return;

      if (validJwt) {
        await saveColorPalette(jwtToken, paletteData).catch((err) => console.error('Failed to update backend colors palette:', err));
      }
    };
    saveData();
  }, [paletteData]);

  useEffect(() => {
    if (isLoading || localLoading) return;
    const saveData = async () => {
      console.log('[POST] Saving group data');

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
