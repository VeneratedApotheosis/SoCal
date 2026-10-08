import { useCalendarType } from '@/hooks/useCalendarType';
import { useValidJwt } from '@/hooks/useValidJwt';
import { supabase } from '@/lib/supabase';
import { CalendarView, JwtTokenObj } from '@/utility/types';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useScreenSize } from './screen-size-context';

export interface AuthContextType {
  jwtToken: JwtTokenObj | null;
  setJwtToken: (jwtToken: JwtTokenObj | null) => void;

  validJwt: boolean;
  setValidJwt: React.Dispatch<React.SetStateAction<boolean>>;
  isStorageLoaded: boolean;

  calendarType: CalendarView;
  setCalendarType: React.Dispatch<React.SetStateAction<CalendarView>>;

  demo: boolean;
  setIsDemo: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<JwtTokenObj | null>(null);
  const [demo, setIsDemo] = useState<boolean>(false);
  const { validJwt, setValidJwt, isStorageLoaded } = useValidJwt();

  //PROFILE HOOK
  const { isWeb } = useScreenSize();
  const { calendarType, setCalendarType } = useCalendarType(!!isWeb);

  // ─── Update Token in DB ───────────────────────────────────────────────────────────

  const processedRefreshToken = useRef<string | null>(null);
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      if (session) setValidJwt(true);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH EVENT]', event);

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setValidJwt(!!session);

        if (session?.provider_refresh_token) {
          const refreshToken = session.provider_refresh_token;

          if (refreshToken !== processedRefreshToken.current) {
            processedRefreshToken.current = refreshToken;

            console.log('[AUTH] Saving new Google refresh token');

            const { error } = await supabase.functions.invoke('update-google-token', {
              body: {
                refreshToken,
              },
            });

            if (error) {
              console.error('[AUTH] Failed to save Google token:', error);
            }
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        setValidJwt(false);
        processedRefreshToken.current = null;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setValidJwt]);

  return (
    <AuthContext.Provider
      value={{
        jwtToken,
        setJwtToken,
        validJwt,
        setValidJwt,
        isStorageLoaded,
        calendarType,
        setCalendarType,
        demo,
        setIsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Renamed slightly to differentiate from the flow-specific hooks
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
