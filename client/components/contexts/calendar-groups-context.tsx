// calendar-events-context.tsx
import { useCalendarGroup } from '@/hooks/useCalendarGroup';
import { calendarGroup, calendarObj } from '@/utility/types';
import { createContext, ReactNode, useContext } from 'react';
import { useCalendarObjects } from './calendar-obj-context';

export interface GroupsContextType {
  calendarGroups: {
    groupedCalendars: calendarGroup[];
    updateSingleGroup: (groupId: string, newCalendars: calendarObj[]) => void;
    updateMultipleGroups: (updates: calendarGroup[]) => void;
    addGroup: (groupName: string | null) => void;
    renameGroup: (groupOldName: string, groupNewName: string) => void;
    deleteGroup: (groupName: string) => void;
  };
}

export const GroupsContext = createContext<GroupsContextType>({} as GroupsContextType);

export const GroupsProvider = ({ children }: { children: ReactNode }) => {
  const { calendarObjs } = useCalendarObjects();
  const calendarGroups = useCalendarGroup(calendarObjs);

  return (
    <GroupsContext.Provider
      value={{
        calendarGroups,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
};

export function useCalendarGroups() {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error('useCalendarGroups must be within DateProvider');
  return ctx;
}
