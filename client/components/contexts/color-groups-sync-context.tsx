// calendar-events-context.tsx
import { useColorGroups } from '@/hooks/useColorGroups';
import { calendarGroup, colorCache } from '@/utility/types';
import { createContext, ReactNode, useContext } from 'react';

export interface ColorGroupsContextType {
  paletteData: colorCache[];
  groupsData: calendarGroup[];
  isLoading: boolean;
  setPaletteData: React.Dispatch<React.SetStateAction<colorCache[]>>;
  setGroupsData: React.Dispatch<React.SetStateAction<calendarGroup[]>>;
  error: string | null;
  refreshColorGroups: () => Promise<void>;
}

export const ColorGroupsContext = createContext<ColorGroupsContextType>({} as ColorGroupsContextType);

export const ColorGroupsProvider = ({ children }: { children: ReactNode }) => {
  const { paletteData, groupsData, isLoading, setPaletteData, setGroupsData, error, refreshColorGroups } = useColorGroups();

  return (
    <ColorGroupsContext.Provider value={{ paletteData, groupsData, isLoading, setPaletteData, setGroupsData, error, refreshColorGroups }}>
      {children}
    </ColorGroupsContext.Provider>
  );
};

export function useColorGroupsContext() {
  const ctx = useContext(ColorGroupsContext);
  if (!ctx) throw new Error('useColorGroupsContext must be within ColorGroupsProvider');
  return ctx;
}
