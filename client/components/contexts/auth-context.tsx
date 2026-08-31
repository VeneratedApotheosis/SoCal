import { useCalendarType } from '@/hooks/useCalendarType';
import { storage } from '@/services/storage';
import { CalendarView, JwtTokenObj } from '@/utility/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useScreenSize } from './screen-size-context';

export interface AuthContextType {
  jwtToken: JwtTokenObj | null;
  setJwtToken: (jwtToken: JwtTokenObj | null) => void;

  validJwt: boolean;
  setValidJwt: React.Dispatch<React.SetStateAction<boolean>>;

  calendarType: CalendarView;
  setCalendarType: React.Dispatch<React.SetStateAction<CalendarView>>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<JwtTokenObj | null>(null);
  const [validJwt, setValidJwt] = useState<boolean>(false);

  //PROFILE HOOK
  const { isWeb } = useScreenSize();
  const { calendarType, setCalendarType } = useCalendarType(!!isWeb);

  const [isHydrated, setIsHydrated] = useState(false);

  // Initial Hydration
  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const [tokenResult, calendarResult] = await Promise.all([storage.getSecure('jwt_token'), storage.get('calendar_type')]);

        if (tokenResult) setJwtToken(tokenResult as JwtTokenObj);
        if (calendarResult) setCalendarType(calendarResult as CalendarView);
      } catch (err) {
        console.error('AuthProvider Hydration Error:', err);
      } finally {
        setIsHydrated(true);
      }
    };

    hydrateAuth();
  }, []);

  if (!isHydrated) return null;

  return (
    <AuthContext.Provider
      value={{
        jwtToken,
        setJwtToken,
        validJwt,
        setValidJwt,
        calendarType,
        setCalendarType,
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
