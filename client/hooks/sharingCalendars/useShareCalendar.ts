import { useCallback, useState } from 'react';
// Replace this with the actual path to your api file
import { shareCalendar } from '@/services/api';
import { accessRole } from '@/utility/types';

export const useShareCalendar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const share = useCallback(async (
    calId: string,
    email: string,
    token: string,
    role: accessRole
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await shareCalendar(calId, email, token, role);
      setIsLoading(false);
      return { success: true, data: response };
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : "Failed to share calendar";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { share, isLoading, error, clearError };
};