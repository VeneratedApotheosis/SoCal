import { useColorGroupsContext } from '@/components/contexts/color-groups-sync-context';
import { storage } from '@/services/storage';
import { calendarGroup, calendarObj } from '@/utility/types';
import { useEffect, useMemo, useState } from 'react';

export const useCalendarGroup = (calendarObjs: calendarObj[] | null, userId: string | null) => {
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const { groupsData: groupedCalendars, isLoading, setGroupsData: setGroupedCalendars } = useColorGroupsContext();

  const currentUserGroups = useMemo(() => {
    if (!userId) return [];

    return groupedCalendars
      .filter((g) => g.userId === userId)
      .map((g) => ({
        ...g,
        calendars: g.calendars.filter((c) => c.isActive === true),
      }));
  }, [groupedCalendars, userId]);

  // ─── Update Function ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isStorageLoaded || !calendarObjs || !userId) return;
    console.log(groupedCalendars);

    setGroupedCalendars((prevGroups) => {
      const userGroups = prevGroups.filter((g) => g.userId === userId);

      const latestCalsMap = new Map(calendarObjs.map((c) => [c.calendarId, c]));

      //update groups, marking missing calendars as inactive
      const updatedUserGroups = userGroups.map((group) => ({
        ...group,
        calendars: group.calendars.map((c) => {
          if (latestCalsMap.has(c.calendarId)) {
            return { ...latestCalsMap.get(c.calendarId)!, isActive: true };
          }
          return { ...c, isActive: false };
        }),
      }));

      const alreadyGroupedIds = new Set(updatedUserGroups.flatMap((g) => g.calendars.map((c) => c.calendarId)));

      //add new calendars
      const newCalendars = calendarObjs.filter((cal) => !alreadyGroupedIds.has(cal.calendarId));
      newCalendars.forEach((cal) => {
        const type = cal.owner ? 'owner' : 'other';
        let group = updatedUserGroups.find((g) => g.id === type);

        if (!group) {
          group = { id: type, userId, calendars: [] };
          updatedUserGroups.push(group);
        }

        group.calendars.push({ ...cal, isActive: true });
      });

      const sortedUserGroups = [...updatedUserGroups];

      // Merge the active user's groups back with the rest of the users
      return [...sortedUserGroups];
    });
  }, [calendarObjs, userId, isStorageLoaded, groupedCalendars, setGroupedCalendars]);

  // ─── Helper Functions ───────────────────────────────────────────────────────────

  const updateSingleGroup = (groupId: string, newCalendars: calendarObj[]) => {
    if (!userId) return;

    setGroupedCalendars((prev) =>
      prev.map((group) =>
        group.id === groupId && group.userId === userId
          ? {
              ...group,
              // Convert all raw calendarObjs into GroupedCalendarObjs
              calendars: newCalendars.map((c) => ({ ...c, isActive: true })),
            }
          : group,
      ),
    );
  };

  const updateMultipleGroups = (updates: calendarGroup[]) => {
    if (!userId) return;

    setGroupedCalendars((prev) => {
      const updatesMap = new Map(updates.map((u) => [u.id, u.calendars]));

      return prev.map((group) =>
        group.userId === userId && updatesMap.has(group.id) ? { ...group, calendars: updatesMap.get(group.id)! } : group,
      );
    });
  };

  const addGroup = (groupName: string | null) => {
    if (!userId) return;
    const name = groupName ?? 'Group';

    const containsGroupName = groupedCalendars.find((g) => g.id === name);
    if (containsGroupName) {
      addGroup(name + ' (1)');
      return;
    }

    setGroupedCalendars((prev) => {
      return [
        ...prev,
        {
          id: name,
          userId: userId,
          calendars: [],
        },
      ];
    });
  };

  const renameGroup = (groupOldName: string, groupNewName: string) => {
    if (!userId) return;
    setGroupedCalendars((prev) =>
      prev.map((cal) => {
        return cal.id === groupOldName && cal.userId === userId ? { ...cal, id: groupNewName } : cal;
      }),
    );
  };

  const deleteGroup = (groupName: string) => {
    if (!userId) return;
    setGroupedCalendars((prev) => {
      const userGroups = prev.filter((g) => g.userId === userId);
      const otherGroups = prev.filter((g) => g.userId !== userId);

      const groupToDelete = userGroups.find((g) => g.id === groupName);
      if (!groupToDelete) return prev;

      const updatedUserGroups = userGroups.filter((g) => g.id !== groupName);

      groupToDelete.calendars.forEach((cal) => {
        const targetGroupId = cal.owner ? 'owner' : 'other';
        const targetGroupIndex = updatedUserGroups.findIndex((g) => g.id === targetGroupId);

        if (targetGroupIndex !== -1) {
          updatedUserGroups[targetGroupIndex] = {
            ...updatedUserGroups[targetGroupIndex],
            calendars: [...updatedUserGroups[targetGroupIndex].calendars, cal],
          };
        } else {
          updatedUserGroups.push({ id: targetGroupId, userId, calendars: [cal] });
        }
      });

      return [...otherGroups, ...updatedUserGroups];
    });
  };

  const moveGroup = (groupName: string, direction: 'up' | 'down') => {
    if (!userId) {
      return;
    }
    setGroupedCalendars((prev) => {
      const index = prev.findIndex((cal) => cal.id === groupName);
      if (index === -1) {
        return prev;
      }
      if (index === 0 && direction === 'up') {
        return prev;
      }
      if (index === prev.length - 1 && direction === 'down') {
        return prev;
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const newGroups = [...prev];

      const temp = newGroups[index];
      newGroups[index] = newGroups[targetIndex];
      newGroups[targetIndex] = temp;
      console.log(index, targetIndex);
      return [...newGroups]; //
    });
  };

  return {
    groupedCalendars: currentUserGroups,
    updateSingleGroup,
    updateMultipleGroups,
    addGroup,
    renameGroup,
    deleteGroup,
    moveGroup,
  };
};
