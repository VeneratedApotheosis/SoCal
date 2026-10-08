import { useColorCache } from '@/hooks/useColorCache';
import { calendarObj, colorCache } from '@/utility/types';
import { createContext, ReactNode, useContext } from 'react';
import { useCalendarObjects } from './calendar-obj-context';

interface ColorCacheContextType {
  colorCache: {
    allCaches: colorCache[];
    activeCacheId: number;
    changePalette: (newPaletteId: number, newPaletteName: string, newColors: string[]) => void;
    syncCacheToPalette: (updatedPalette: string[]) => void;
    setManualCalendarColor: (calendarId: string, hexColor: string) => void;
    getCalendarColor: (calendarId: string, calendar?: calendarObj) => string;
  };
}

export const ColorCacheContext = createContext<ColorCacheContextType>({} as ColorCacheContextType);

export const ColorCacheProvider = ({ children }: { children: ReactNode }) => {
  const { calendarObjs } = useCalendarObjects();
  const colorCache = useColorCache(calendarObjs);

  return (
    <ColorCacheContext.Provider
      value={{
        colorCache,
      }}
    >
      {children}
    </ColorCacheContext.Provider>
  );
};

export function useColorCacheContext() {
  const ctx = useContext(ColorCacheContext);
  if (!ctx) throw new Error('useColorCacheContext must be within ColorCacheProvider');
  return ctx;
}
