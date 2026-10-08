// useEventColors.ts (or wherever you keep your hooks)
import { useColorCacheContext } from '@/components/contexts/color-cache-context';
import { useUIContext } from '@/components/contexts/ui-context';
import { lightenColor } from '@/utility/eventColorUtil';
import { useMemo } from 'react';

export const useEventColors = (calendarId: string, newEvent: boolean = false) => {
  const { theme } = useUIContext();
  const { colorCache } = useColorCacheContext();
  const isDark = theme.isDark;

  return useMemo(() => {
    const baseColor = colorCache.getCalendarColor(calendarId);

    const rawColor = lightenColor(baseColor, 'raw', isDark);
    const borderColor = lightenColor(rawColor, 'border', isDark);
    const textColor = lightenColor(rawColor, 'text', isDark);

    return { rawColor, borderColor, textColor };
  }, [calendarId, colorCache.allCaches, colorCache.activeCacheId, isDark]);
};
