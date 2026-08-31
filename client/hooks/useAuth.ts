import { useAuthContext } from '@/components/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { deleteAccount, postUpdateToken } from '@/services/api';
import { storage } from '@/services/storage';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const { setValidJwt } = useAuthContext();

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const hasProcessedToken = useRef(false);

  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error logging out:', error.message);
    }
    if (setValidJwt) setValidJwt(false);
    await storage.clearAll();
  }, [setValidJwt]);

  const getValidJwt = useCallback(async (): Promise<string | null> => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }
    return session.access_token;
  }, []);

  useEffect(() => {
    // Initial load check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidJwt(true);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setIsLoading(false);

        if (session) {
          setValidJwt(true);

          // Only update the backend if Google gave us a new refresh token
          if (session.provider_refresh_token && !hasProcessedToken.current) {
            hasProcessedToken.current = true;

            const attemptTokenSave = async () => {
              let success = false;
              let attempts = 0;
              const maxAttempts = 5; // Try up to 5 times (10 seconds total)

              while (!success && attempts < maxAttempts) {
                attempts++;
                try {
                  if (!session.provider_refresh_token) throw Error('Invalid session provider refresh token');
                  await postUpdateToken(session.user.id, session.provider_refresh_token);
                  console.log('[POST] Token saved successfully. Attempts:', attempts);
                  success = true;
                } catch (err) {
                  console.warn(`[POST] Attempt ${attempts} failed. Row not ready yet.`);
                  if (attempts < maxAttempts) {
                    await delay(2000); // Wait 2 seconds before trying again
                  } else {
                    console.error('[POST] Gave up trying to save token after 5 attempts.');
                  }
                }
              }
            };
            attemptTokenSave();
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        setValidJwt(false);
      }

      // Note: Supabase also emits a 'TOKEN_REFRESHED' event,
      // but because we are fetching on-demand now, we don't need to manually catch it.
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [setValidJwt]);

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
  }, [handleLogout]);

  return { getValidJwt, isLoading, error, promptAsync, handleLogout, handleDeleteAccount, isDeleting };
};
