import { useAuthContext } from '@/components/contexts/auth-context';
import { useCalendarPreferencesContext } from '@/components/contexts/calendar-preferences-context';
import { calendarGroup, calendarObj } from '@/utility/types';
import { useCallback, useMemo } from 'react';

export const useCalendarGroup = (calendarObjs: calendarObj[] | null, userId: string | null) => {
  const { groupsData: groupedCalendars, hasLoadedPreferences, setGroupsData } = useCalendarPreferencesContext();
  const { demo } = useAuthContext();

  const canEdit = !!userId && !!calendarObjs && hasLoadedPreferences;
  const reconcileGroups = useCallback((groups: calendarGroup[]) => {
    if (demo || !userId || !calendarObjs) return groups;

    const byId = new Map(calendarObjs.map((cal) => [cal.calendarId, cal]));
    const updated = groups.map((group) => {
      if (group.userId !== userId) return group;
      return {
        ...group,
        calendars: group.calendars.map((cal) => {
          const current = byId.get(cal.calendarId);
          byId.delete(cal.calendarId);
          return current ? { ...current, isActive: true } : { ...cal, isActive: false };
        }),
      };
    });
    for (const cal of byId.values()) {
      const id = cal.owner ? 'owner' : 'other';
      const group = updated.find((entry) => entry.id === id && entry.userId === userId);
      if (group) group.calendars.push({ ...cal, isActive: true });
      else updated.push({ id, userId, calendars: [{ ...cal, isActive: true }] });
    }
    return updated;
  }, [demo, userId, calendarObjs]);

  const currentUserGroups = useMemo(() => {
    if (demo) return groupedCalendars;
    if (!canEdit) return [];
    return reconcileGroups(groupedCalendars)
      .filter((group) => group.userId === userId)
      .map((group) => ({ ...group, calendars: group.calendars.filter((cal) => cal.isActive) }));
  }, [groupedCalendars, userId, reconcileGroups, canEdit, demo]);

  const setGroupedCalendars = (update: (groups: calendarGroup[]) => calendarGroup[]) => {
    if (canEdit) setGroupsData((previous) => update(reconcileGroups(previous)));
  };

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

    const containsGroupName = currentUserGroups.find((g) => g.id === name);
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
      return [...newGroups]; //
    });
  };

  return {
    groupedCalendars: currentUserGroups,
    canEdit,
    updateSingleGroup,
    updateMultipleGroups,
    addGroup,
    renameGroup,
    deleteGroup,
    moveGroup,
  };
};
