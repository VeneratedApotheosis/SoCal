import { useColorGroupsContext } from '@/components/contexts/color-groups-sync-context';
import { findClosestColor } from '@/utility/colorCacheUtil';
import { calendarObj, colorCache } from '@/utility/types';
import { useCallback, useEffect, useState } from 'react';

export const useColorCache = (calendarObjs: calendarObj[] | null) => {
  const { paletteData: allCaches, isLoading: isStorageLoaded, setPaletteData: setAllCaches } = useColorGroupsContext();
  const [activeCacheId, setActiveCacheId] = useState<number>(0);

  // ─── Helper Functions ───────────────────────────────────────────────────────────

  //totally change color palette
  const changePalette = useCallback(
    (newPaletteId: number, newPaletteName: string, newColors: string[]) => {
      const newColorMap: Record<string, string> = {};

      calendarObjs?.forEach((cal) => {
        newColorMap[cal.calendarId] = findClosestColor(cal.calendarDefaultColor, newColors);
      });
      setAllCaches((prev) => {
        // Check if this palette ID already exists in our storage
        const exists = prev.find((c) => c.paletteId === newPaletteId);

        // If in storage, update existing colorMap
        if (exists) {
          return prev.map((c) => (c.paletteId === newPaletteId ? { ...c, palette: newColors, colorMap: newColorMap } : c));
        }

        // Otherwise, add a brand new colorCache object to the array
        return [
          ...prev,
          {
            paletteId: newPaletteId,
            name: newPaletteName,
            palette: newColors,
            colorMap: newColorMap,
          } as colorCache,
        ];
      });

      //Update active cache ID
      setActiveCacheId(newPaletteId);
    },
    [activeCacheId, calendarObjs, allCaches, setAllCaches],
  );

  //update a color palette
  const syncCacheToPalette = useCallback(
    (updatedPalette: string[]) => {
      setAllCaches((prev) =>
        prev.map((cache) => {
          if (cache.paletteId !== activeCacheId) return cache;

          const nextMap = { ...cache.colorMap };

          Object.keys(nextMap).forEach((calId) => {
            const currentColor = nextMap[calId];

            // If the color assigned to this calendar isn't in the new palette anymore...
            if (!updatedPalette.includes(currentColor)) {
              console.log(calId);
              const cal = calendarObjs?.find((c) => c.calendarId === calId);
              // ...recalculate the closest match from the updated palette
              nextMap[calId] = findClosestColor(cal?.calendarDefaultColor || '#000000', updatedPalette);
            }
          });
          return { ...cache, palette: updatedPalette, colorMap: nextMap };
        }),
      );
    },
    [activeCacheId, calendarObjs, allCaches, setAllCaches],
  );

  //update color of specific calendar
  const setManualCalendarColor = useCallback(
    (calendarId: string, hexColor: string) => {
      setAllCaches((prev) =>
        prev.map((cache) => {
          // Manual override theme the user is currently updating
          if (cache.paletteId === activeCacheId) {
            return {
              ...cache,
              colorMap: {
                ...cache.colorMap,
                [calendarId]: hexColor, //update key, value pair
              },
            };
          }
          return cache;
        }),
      );
    },
    [activeCacheId, calendarObjs, allCaches, setAllCaches],
  );

  //get the color of a calendar
  const getCalendarColor = useCallback(
    (calendarId: string, calendar?: calendarObj): string => {
      const activeCache = allCaches.find((c) => c.paletteId === activeCacheId);
      const customColor = activeCache?.colorMap[calendarId];
      if (customColor) return customColor;
      if (calendar) return calendar.calendarDefaultColor;
      return '#00ffff';
    },
    [activeCacheId, calendarObjs, allCaches, setAllCaches],
  );

  // -------------------------------------------
  // Update Function
  // -------------------------------------------
  useEffect(() => {
    if (!calendarObjs?.length) return;

    setAllCaches((prevCaches) => {
      return prevCaches.map((cache) => {
        //ignore other caches
        if (cache.paletteId !== activeCacheId) return cache;

        const existingIds = Object.keys(cache.colorMap);
        const missingCalendars = calendarObjs.filter((cal) => !existingIds.includes(cal.calendarId));

        // If no new calendars are found, return the cache as-is (prevents re-renders)
        if (missingCalendars.length === 0) return cache;

        // Create a copy of the map and add the missing ones
        const nextMap = { ...cache.colorMap };

        missingCalendars.forEach((newCal) => {
          nextMap[newCal.calendarId] = findClosestColor(newCal.calendarDefaultColor, cache.palette);
        });

        return { ...cache, colorMap: nextMap };
      });
    });
  }, [calendarObjs, activeCacheId, isStorageLoaded, setAllCaches]);

  return {
    allCaches,
    activeCacheId,
    isStorageLoaded,
    changePalette,
    syncCacheToPalette,
    setManualCalendarColor,
    getCalendarColor,
  };
};
