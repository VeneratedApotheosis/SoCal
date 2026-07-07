// useEventColors.ts (or wherever you keep your hooks)
import { useUIContext } from '@/components/contexts/ui-context';
import { lightenColor } from '@/utility/eventColorUtil';
import { useMemo } from 'react';

export const useEventColors = (calendarId: string) => {
  const { colorCache, theme } = useUIContext();
  const isDark = theme.isDark;

  return useMemo(() => {
    const baseColor = colorCache.getCalendarColor(calendarId);

    const rawColor = lightenColor(baseColor, 'raw', isDark);
    const borderColor = lightenColor(rawColor, 'border', isDark);
    const textColor = lightenColor(rawColor, 'text', isDark);

    return { rawColor, borderColor, textColor };
  }, [calendarId, colorCache.allCaches, colorCache.activeCacheId, isDark]);
};
