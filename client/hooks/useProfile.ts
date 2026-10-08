import { useAuthContext } from '@/components/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { DEMO_JWT } from '@/utility/constants';
import { demoProfile } from '@/utility/demoData';
import { FamilyProfileObjs } from '@/utility/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
      const { data, error } = await supabase.from('user_info').select('id, google_id, email, name, picture').single();
      if (error) {
        console.error('Backend Profile Fetch Error:', error);
        setError(JSON.stringify(error) || 'big error in profiles');
        return;
      }

      //Update State
      setFamilyProfiles({
        parent: {
          id: data.google_id,
          email: data.email,
          name: data.name,
          picture: data.picture,
        },
        children: [],
      });
    } catch (err: any) {
      console.error('Backend Profile Fetch Error:', err);
      setError(err.message || 'big error in profiles');
    } finally {
      setIsLoading(false);
    }
  }, [setFamilyProfiles, getValidJwt, supabase]);

  // Automatically fetch when the token changes
  useEffect(() => {
    if (validJwt) fetchProfiles();
  }, [validJwt]);

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
