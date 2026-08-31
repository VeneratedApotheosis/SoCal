// calendar-events-context.tsx
import { useCalendarGroup } from '@/hooks/useCalendarGroup';
import { useColorGroups } from '@/hooks/useColorGroups';
import { calendarGroup, calendarObj, colorCache } from '@/utility/types';
import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';
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
  hiddenCalendarGroups: string[];
  hideGroup: (id: string) => void;
  showGroup: (id: string) => void;
  colorGroups: {
    paletteData: colorCache[];
    groupsData: calendarGroup[];
    isLoading: boolean;
    setPaletteData: React.Dispatch<React.SetStateAction<colorCache[]>>;
    setGroupsData: React.Dispatch<React.SetStateAction<calendarGroup[]>>;
  };
}

export const GroupsContext = createContext<GroupsContextType>({} as GroupsContextType);

export const GroupsProvider = ({ children }: { children: ReactNode }) => {
  const colorGroups = useColorGroups();
  const { calendarObjs, hiddenCalendarHook } = useCalendarObjects();
  const { familyProfiles } = useProfileContext();
  const calendarGroups = useCalendarGroup(calendarObjs, familyProfiles && familyProfiles.parent ? familyProfiles.parent.id : null);

  // ─── hiddenCalendarGroups Functions ───────────────────────────────────────────────────────────

  const hiddenCalendarGroups = useMemo(() => {
    const hiddenSet = new Set(hiddenCalendarHook.hiddenCalendars);

    return calendarGroups.groupedCalendars.reduce<string[]>((hiddenGroupIds, group) => {
      const areAllHidden = group.calendars.length > 0 && group.calendars.every((calendarObj) => hiddenSet.has(calendarObj.calendarId));

      if (areAllHidden) {
        hiddenGroupIds.push(group.id);
      }

      return hiddenGroupIds;
    }, []);
  }, [hiddenCalendarHook.hiddenCalendars, calendarGroups.groupedCalendars]);

  const hideGroup = useCallback(
    (id: string) => {
      const groupToHide = calendarGroups.groupedCalendars.find((group) => group.id === id);

      if (groupToHide) {
        groupToHide.calendars.forEach((c) => {
          hiddenCalendarHook.hideCalendar(c.calendarId);
        });
      }
    },
    // 3. Cleaned up dependency array
    [calendarGroups.groupedCalendars, hiddenCalendarHook],
  );

  const showGroup = useCallback(
    (id: string) => {
      const foundGroup = calendarGroups.groupedCalendars.find((group) => group.id === id);

      if (foundGroup) {
        foundGroup.calendars.forEach((c) => {
          hiddenCalendarHook.showCalendar(c.calendarId);
        });
      }
    },
    // 3. Cleaned up dependency array
    [calendarGroups.groupedCalendars, hiddenCalendarHook],
  );

  return (
    <GroupsContext.Provider
      value={{
        calendarGroups,
        hiddenCalendarGroups,
        hideGroup,
        showGroup,
        colorGroups,
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
