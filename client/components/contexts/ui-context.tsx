import { useColorCache } from '@/hooks/useColorCache';
import { useTheme } from '@/hooks/useTheme';
import { colorCache } from '@/utility/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { EventsContext } from './calendar-events-context';

interface UIContextType {
  now: Date;
  isLoginVisible: boolean;
  setLoginVisible: (visible: boolean) => void;
  colorCache: {
    allCaches: colorCache[];
    activeCacheId: number;
    isStorageLoaded: boolean;
    changePalette: (newPaletteId: number, newPaletteName: string, newColors: string[]) => void;
    syncCacheToPalette: (updatedPalette: string[]) => void;
    setManualCalendarColor: (calendarId: string, hexColor: string) => void;
    getCalendarColor: (calendarId: string) => string;
  };
  theme: {
    themeMode: string;
    isDark: boolean;
    setThemeMode: React.Dispatch<React.SetStateAction<string>>;
  };
}

export const UIContext = createContext<UIContextType>({} as UIContextType);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isLoginVisible, setLoginVisible] = useState(false);
  const { calendarObjs } = useContext(EventsContext);
  const [now, setNow] = useState(new Date());
  const colorCache = useColorCache(calendarObjs);
  const theme = useTheme();

  // -------------------------------------------
  // Now
  // -------------------------------------------
  //update "now"
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <UIContext.Provider
      value={{
        now,
        isLoginVisible,
        setLoginVisible,
        colorCache,
        theme,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export function useUIContext() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useCalendarIndex must be within DateProvider');
  return ctx;
}
