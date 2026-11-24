import { useCalendarType } from '@/hooks/useCalendarType';
import { supabase } from '@/lib/supabase';
import { CalendarView } from '@/utility/types';
import { setGoogleTokenSession } from '@/utility/tokenUtils';
import type { Session } from '@supabase/supabase-js';
import { createContext, Fragment, ReactNode, useContext, useEffect, useState } from 'react';
import { useScreenSize } from './screen-size-context';

export interface AuthContextType {
  session: Session | null;
  validJwt: boolean;
  isStorageLoaded: boolean;
  calendarType: CalendarView;
  setCalendarType: React.Dispatch<React.SetStateAction<CalendarView>>;
  demo: boolean;
  setIsDemo: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [demo, setIsDemo] = useState(false);
  const { isWeb } = useScreenSize();
  const { calendarType, setCalendarType } = useCalendarType(!!isWeb);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setGoogleTokenSession(nextSession);
      setSession(nextSession);
      if (event === 'SIGNED_IN') setIsDemo(false);
      setIsStorageLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Account-scoped providers discard their state and pending results on identity changes.
  const accountKey = demo ? 'demo' : session?.user.id ?? 'signed-out';
  return (
    <AuthContext.Provider
      value={{ session, validJwt: demo || !!session, isStorageLoaded, calendarType, setCalendarType, demo, setIsDemo }}
    >
      <Fragment key={accountKey}>{children}</Fragment>
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
