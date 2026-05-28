import { storage } from "@/services/storage";
import { CALENDAR_GROUPS_KEY } from "@/utility/constants";
import { calendarGroup, calendarObj } from "@/utility/types";
import { useEffect, useState } from "react";

export const useCalendarGroup = (calendarObjs: calendarObj[] | null) => {
  const [groupedCalendars, setGroupedCalendars] = useState<calendarGroup[]>([]);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // -------------------------------------------
  // Storage Functions
  // -------------------------------------------
  
  // Load Color Cache from storage
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const savedCalendarGroups = await storage.get(CALENDAR_GROUPS_KEY);

        if (savedCalendarGroups) setGroupedCalendars(savedCalendarGroups);

      } catch (e) {
        console.error("Failed to load color cache from storage", e);
      } finally {
        setIsStorageLoaded(true);
      }
    };

    loadFromStorage();
  }, []);

  //save to storage
  useEffect(() => {
    if (!isStorageLoaded) return;

    const saveToStorage = async () => {
      try {
        await storage.save(CALENDAR_GROUPS_KEY, groupedCalendars);
      } catch (e) {
        console.error("Failed to save color cache to storage", e);
      }
    };

    saveToStorage();
  }, [groupedCalendars]);
  
  // -------------------------------------------
  // Update Function
  // -------------------------------------------
  useEffect(() => {
  if (!calendarObjs) return;

  setGroupedCalendars((prevGroups) => {
    const latestCalsMap = new Map(calendarObjs.map((c) => [c.calendarId, c]));

    const updatedGroups = prevGroups.map((group) => ({
      ...group,
      calendars: group.calendars
        .filter((c) => latestCalsMap.has(c.calendarId))
        .map((c) => latestCalsMap.get(c.calendarId)!),
    }));

    // 3. Track which calendar IDs are already placed inside ANY group
    const alreadyGroupedIds = new Set(
      updatedGroups.flatMap((g) => g.calendars.map((c) => c.calendarId))
    );

    // 4. Filter calendarObjs to find only the truly NEW calendars
    const newCalendars = calendarObjs.filter((cal) => !alreadyGroupedIds.has(cal.calendarId));

    // 5. Automatically sort only the NEW calendars into 'owner' or 'other'
    newCalendars.forEach((cal) => {
      const type = cal.owner ? 'owner' : 'other';
      let group = updatedGroups.find((g) => g.id === type);

      if (!group) {
        group = { id: type, calendars: [] };
        updatedGroups.push(group);
      }

      group.calendars.push(cal);
    });

    return updatedGroups;
  });
}, [calendarObjs]);

  // -------------------------------------------
  // Helper Functions
  // -------------------------------------------
  
  const updateSingleGroup = (groupId: string, newCalendars: calendarObj[]) => {
    setGroupedCalendars((prev) => prev.map((group) => (group.id === groupId ? { ...group, calendars: newCalendars } : group)));
  };

  const updateMultipleGroups = (updates: calendarGroup[]) => {
    setGroupedCalendars((prev) => {
      const updatesMap = new Map(updates.map((u) => [u.id, u.calendars]));

      return prev.map((group) => (updatesMap.has(group.id) ? { ...group, calendars: updatesMap.get(group.id)! } : group));
    });
  };

  const addGroup = (groupName: string | null) => {
    let name : string = "";
    if (groupName === null) {
      name = "Group";
    }  else {
      name = groupName;
    }
    const containsGroupName = groupedCalendars.find((g) => g.id === name)
    if (containsGroupName) {
      addGroup(name + " (1)");
    }

    setGroupedCalendars((prev) => {
      return [
        ...prev,
        {
          id: name,
          calendars: [],
        } as calendarGroup,
      ];
    });
  };

  const renameGroup = (groupOldName: string, groupNewName: string) => {
    setGroupedCalendars((prev) => 
      prev.map((cal) => {return cal.id === groupOldName ? {id: groupNewName, calendars: cal.calendars} as calendarGroup : cal as calendarGroup}
      )
    );
  }

  const deleteGroup = (groupName: string) => {
    setGroupedCalendars((prev) => {
      const groupToDelete = prev.find((g) => g.id === groupName);
      if (!groupToDelete) return prev;

      const updatedGroups = prev.filter((g) => g.id !== groupName);

      groupToDelete.calendars.forEach((cal) => {
      const targetGroupId = cal.owner ? 'owner' : 'other';
      
      // Look for the target group in our newly filtered array
      const targetGroupIndex = updatedGroups.findIndex((g) => g.id === targetGroupId);

      if (targetGroupIndex !== -1) {
        // If the group exists, immutably add the calendar to its array
        updatedGroups[targetGroupIndex] = {
          ...updatedGroups[targetGroupIndex],
          calendars: [...updatedGroups[targetGroupIndex].calendars, cal],
        };
      } else {
        // If the group doesn't exist, create it and start its array with this calendar
        updatedGroups.push({ id: targetGroupId, calendars: [cal] });
      }
    });
    
    return updatedGroups;
    });
  };

  return {
    groupedCalendars,
    updateSingleGroup,
    updateMultipleGroups,
    addGroup,
    renameGroup,
    deleteGroup,

  }

}