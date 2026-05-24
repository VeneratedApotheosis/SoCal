import { unshareCalendar, unsuscribeCalendar } from '@/services/api';
import { useCallback, useState } from 'react';

export const useUnshareCalendar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unshare = useCallback(async (
    calId: string,
    token: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await unsuscribeCalendar(calId, token);
      setIsLoading(false);
      return { success: true, data: response };
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : "Failed to unshare calendar";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { unshare, isLoading, error, clearError };
};