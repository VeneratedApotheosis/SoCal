import { useAuthContext } from '@/components/contexts/auth-context';
import { DEMO_JWT } from '@/utility/constants';
import { demoProfile } from '@/utility/demoData';
import { FamilyProfileObjs } from '@/utility/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchFamilyProfiles } from '../services/api';
import { useAuth } from './useAuth';

export function useProfiles() {
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfileObjs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getValidJwt } = useAuth();
  const { validJwt } = useAuthContext();

  // ─── Fetch from Backend ───────────────────────────────────────────────────────────

  const fetchProfiles = useCallback(async () => {
    const jwtToken = await getValidJwt();
    if (!jwtToken) return;
    if (jwtToken == DEMO_JWT) {
      setFamilyProfiles({ parent: demoProfile, children: [] });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      //Fetch from Backend
      const data = await fetchFamilyProfiles(jwtToken);
      if (data.error) {
        console.error('Backend Profile Fetch Error:', data?.error);
        setError(data?.error || 'big error in profiles');
        return;
      }

      //Update State
      setFamilyProfiles(data);
    } catch (err: any) {
      console.error('Backend Profile Fetch Error:', err);
      setError(err.message || 'big error in profiles');
    } finally {
      setIsLoading(false);
    }
  }, [setFamilyProfiles]);

  // Automatically fetch when the token changes
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles, validJwt]);

  const value = useMemo(
    () => ({
      familyProfiles,
      isLoading,
      error,
      refetch: fetchProfiles,
    }),
    [familyProfiles, isLoading, error, fetchProfiles],
  );

  return value;
}
