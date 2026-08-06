// calendar-events-context.tsx
import { useCalendarGroup } from '@/hooks/useCalendarGroup';
import { calendarGroup, calendarObj } from '@/utility/types';
import { createContext, ReactNode, useContext } from 'react';
import { useCalendarObjects } from './calendar-obj-context';
import { useProfileContext } from './profile-context';

export interface GroupsContextType {
  calendarGroups: {
    groupedCalendars: calendarGroup[];
    updateSingleGroup: (groupId: string, newCalendars: calendarObj[]) => void;
    updateMultipleGroups: (updates: calendarGroup[]) => void;
    addGroup: (groupName: string | null) => void;
    renameGroup: (groupOldName: string, groupNewName: string) => void;
    deleteGroup: (groupName: string) => void;
    moveGroup: (groupName: string, direction: 'up' | 'down') => void;
  };
}

export const GroupsContext = createContext<GroupsContextType>({} as GroupsContextType);

export const GroupsProvider = ({ children }: { children: ReactNode }) => {
  const { calendarObjs } = useCalendarObjects();
  const { familyProfiles } = useProfileContext();
  const calendarGroups = useCalendarGroup(calendarObjs, familyProfiles && familyProfiles.parent ? familyProfiles.parent.id : null);

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

export function useCalendarGroupsContext() {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error('useCalendarGroups must be within DateProvider');
  return ctx;
}
