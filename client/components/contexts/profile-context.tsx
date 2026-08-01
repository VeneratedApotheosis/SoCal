import { useProfiles } from '@/hooks/useProfile';
import { FamilyProfileObjs } from '@/utility/types';
import { createContext, ReactNode, useContext } from 'react';

export interface ProfileContextType {
  familyProfiles: FamilyProfileObjs | null;
}

export const ProfileContext = createContext<ProfileContextType>({} as ProfileContextType);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { familyProfiles } = useProfiles();

  return (
    <ProfileContext.Provider
      value={{
        familyProfiles,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Renamed slightly to differentiate from the flow-specific hooks
export const useProfileContext = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within an ProfileProvider');
  }
  return context;
};
