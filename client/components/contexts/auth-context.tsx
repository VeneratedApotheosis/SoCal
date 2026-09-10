import { useCalendarType } from '@/hooks/useCalendarType';
import { CalendarView, JwtTokenObj } from '@/utility/types';
import { createContext, ReactNode, useContext, useState } from 'react';
import { useScreenSize } from './screen-size-context';

export interface AuthContextType {
  jwtToken: JwtTokenObj | null;
  setJwtToken: (jwtToken: JwtTokenObj | null) => void;

  validJwt: boolean;
  setValidJwt: React.Dispatch<React.SetStateAction<boolean>>;

  calendarType: CalendarView;
  setCalendarType: React.Dispatch<React.SetStateAction<CalendarView>>;

  demo: boolean;
  setIsDemo: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [jwtToken, setJwtToken] = useState<JwtTokenObj | null>(null);
  const [validJwt, setValidJwt] = useState<boolean>(false);
  const [demo, setIsDemo] = useState<boolean>(false);

  //PROFILE HOOK
  const { isWeb } = useScreenSize();
  const { calendarType, setCalendarType } = useCalendarType(!!isWeb);

  return (
    <AuthContext.Provider
      value={{
        jwtToken,
        setJwtToken,
        validJwt,
        setValidJwt,
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
