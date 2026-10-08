import { useAuthContext } from '@/components/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { deleteAccount } from '@/services/api';
import { DEMO_JWT } from '@/utility/constants';
import { useCallback, useState } from 'react';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setValidJwt, demo, setIsDemo } = useAuthContext();

  const handleLogout = useCallback(async () => {
    if (demo) {
      setValidJwt(false);
      setIsDemo(false);
      return;
    }
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error logging out:', error.message);
    }
    if (setValidJwt) setValidJwt(false);
    //await storage.clearAll();
  }, [setValidJwt, setIsDemo, demo]);

  const getValidJwt = useCallback(async (): Promise<string | null> => {
    if (demo) return DEMO_JWT;
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }
    return session.access_token;
  }, [demo]);

  const promptAsync = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Supabase uses a space-separated string for scopes
          scopes:
            'openid https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Supabase automatically uses your site URL, but you can force it here:
          redirectTo: window.location.origin + window.location.pathname,
        },
      });

      if (error) throw error;

      // Note: Code execution stops here on Web because the browser redirects to Google
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = useCallback(async () => {
    if (demo) return;
    setIsDeleting(true);
    setError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('No active session found. Cannot delete account.');
      }

      const jwtToken = session.access_token;
      const userId = session.user.id;

      const response = await deleteAccount(jwtToken, userId);
      if (response?.error) {
        throw new Error(response.error);
      }

      await handleLogout();
    } catch (err: any) {
      console.error('Backend Account Deletion Error:', err);
      setError(err.message || 'An error occurred while deleting the account.');
    } finally {
      setIsDeleting(false);
    }
  }, [handleLogout, demo]);

  return { getValidJwt, isLoading, error, promptAsync, handleLogout, handleDeleteAccount, isDeleting };
};
