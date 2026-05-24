// useCalendarWrite.ts
import { getValidAccessToken } from "@/utility/tokenUtils";
import { EventObj } from "@/utility/types";
import { useState } from "react";
import { addEventToGoogleCalendar, deleteEventToGoogleCalendar, editEventToGoogleCalendar } from "../services/api";

export function useCalendarWrite(jwtToken: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeMutation = async (apiFunc: Function, event: EventObj) => {
    if (!jwtToken) throw new Error("No token");
    setLoading(true); setError(null);
    try {
      const { parent: { accessToken } } = await getValidAccessToken(jwtToken);
      return await apiFunc(accessToken, event);
    } catch (err: any) {
      setError(err.message); throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createEvent: (e: EventObj) => executeMutation(addEventToGoogleCalendar, e),
    editEvent: (e: EventObj) => executeMutation(editEventToGoogleCalendar, e),
    deleteEvent: (e: EventObj) => executeMutation(deleteEventToGoogleCalendar, e),
    loading, error
  };
}