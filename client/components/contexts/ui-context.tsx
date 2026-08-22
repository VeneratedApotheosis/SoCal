import { useColorCache } from '@/hooks/useColorCache';
import { useTheme } from '@/hooks/useTheme';
import { DEFAULT_TRANSPARENCY } from '@/utility/constants';
import { colorCache } from '@/utility/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useCalendarObjects } from './calendar-obj-context';

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
  sideBar: {
    isSidebarExpanded: boolean;
    setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    isSidebarLoading: boolean;
    setSidebarLoading: React.Dispatch<React.SetStateAction<boolean>>;
  };
  isSidebarExpanded: boolean;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  transparentOpacity: number;
  setTransparencyOpacity: React.Dispatch<React.SetStateAction<number>>;
  multiDayInHeader: boolean;
  setMultiDayInHeader: React.Dispatch<React.SetStateAction<boolean>>;
  visibleSettings: Set<string>;
  setVisibleSettings: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const UIContext = createContext<UIContextType>({} as UIContextType);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [isLoginVisible, setLoginVisible] = useState(false);
  const { calendarObjs } = useCalendarObjects();
  const colorCache = useColorCache(calendarObjs);
  const theme = useTheme();

  const [isSidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [isSidebarLoading, setSidebarLoading] = useState<boolean>(true);
  const [transparentOpacity, setTransparencyOpacity] = useState<number>(DEFAULT_TRANSPARENCY);
  const [multiDayInHeader, setMultiDayInHeader] = useState<boolean>(true);
  const [visibleSettings, setVisibleSettings] = useState<Set<string>>(new Set());

  // ─── Now ───────────────────────────────────────────────────────────

  const [now, setNow] = useState(new Date());
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
        isSidebarExpanded,
        setSidebarExpanded,
        sideBar: {
          isSidebarExpanded,
          setSidebarExpanded,
          isSidebarLoading,
          setSidebarLoading,
        },
        transparentOpacity,
        setTransparencyOpacity,
        multiDayInHeader,
        setMultiDayInHeader,
        visibleSettings,
        setVisibleSettings,
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
