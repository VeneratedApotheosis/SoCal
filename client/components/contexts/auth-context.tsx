import { useProfiles } from '@/hooks/useProfile';
import { fetchJwtToken } from '@/services/api';
import { storage } from '@/services/storage';
import { CalendarView, FamilyProfileObjs, JwtTokenObj } from '@/utility/types';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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
  const [calendarType, setCalendarType] = useState<CalendarView>('3');
  const [isHydrated, setIsHydrated] = useState(false);

  // Initial Hydration
  useEffect(() => {
    Promise.all([
      storage.getSecure('jwt_token').then((t) => t && setJwtToken(t)),
      storage.get('calendar_type').then((c) => c && setCalendarType(c as CalendarView)),
    ]).finally(() => setIsHydrated(true));
  }, []);

  const loginWithCode = async (code: string, codeVerifier?: string, redirectUri?: string) => {
    const newJwtToken = await fetchJwtToken(code, codeVerifier, redirectUri);
    await storage.clearAll();
    await storage.saveSecure('jwt_token', newJwtToken);
    setJwtToken(newJwtToken as JwtTokenObj);
    return newJwtToken as JwtTokenObj;
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
