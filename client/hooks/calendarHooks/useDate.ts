import { useCallback, useEffect, useState } from "react";

//ONLY IN MONTH CONTAINER
export function useDate(defaultStart: number, defaultEnd: number) {
  const [days, setDays] = useState<{date: Date}[]>([]);

  const updateDays = useCallback((newStart?: number, newEnd?: number) => {
    const start = newStart !== undefined ? newStart : defaultStart;
    const end = newEnd !== undefined ? newEnd : defaultEnd;

    const newDays : {date: Date}[] = [];
    for (let i = start; i < end; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      newDays.push({ date });
    }
    setDays(newDays);

  }, [defaultStart, defaultEnd]);

  // Automatically fetch when the token changes
  useEffect(() => {
    updateDays();
  }, [updateDays]);

  return { days, refetch: updateDays };
}