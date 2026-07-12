import { useProfiles } from '@/hooks/useProfile';
import { fetchJwtToken } from '@/services/api';
import { storage } from '@/services/storage';
import { CalendarView, FamilyProfileObjs, JwtTokenObj } from '@/utility/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useScreenSize } from './screen-size-context';

export interface AuthContextType {
  jwtToken: JwtTokenObj | null;
  setJwtToken: (jwtToken: JwtTokenObj | null) => void;

  calendarType: CalendarView;
  setCalendarType: (calendarType: CalendarView) => void;

  familyProfiles: FamilyProfileObjs | null;

  loginWithCode: (code: string, codeVerifier?: string, redirectUri?: string) => Promise<JwtTokenObj | undefined>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<JwtTokenObj | null>(null);
  const sessionTokenString = jwtToken?.sessionToken ?? null;

  //PROFILE HOOK
  const { familyProfiles } = useProfiles(sessionTokenString);
  const { isWeb } = useScreenSize();
  const [calendarType, setCalendarType] = useState<CalendarView>({ type: 'D', num: isWeb ? 7 : 3 });

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

  const loginWithCode = async (code: string, codeVerifier?: string, redirectUri?: string) => {
    try {
      const newJwtToken = await fetchJwtToken(code, codeVerifier, redirectUri);
      await storage.clearAll();
      await storage.saveSecure('jwt_token', newJwtToken);
      setJwtToken(newJwtToken as JwtTokenObj);
      return newJwtToken as JwtTokenObj;
    } catch (err) {
      console.error('loginWithCode failed:', err);
    }
  };

  const logout = async () => {
    await storage.clearAll();
    setJwtToken(null);
  };

  if (!isHydrated) return null;

  return (
    <AuthContext.Provider
      value={{
        jwtToken,
        setJwtToken,
        calendarType,
        setCalendarType,
        familyProfiles,
        loginWithCode,
        logout,
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
