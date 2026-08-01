import { useAuthContext } from '@/components/contexts/auth-context';
import { PROFILE_STORAGE_KEY } from '@/utility/constants';
import { FamilyProfileObjs } from '@/utility/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchFamilyProfiles } from '../services/api';
import { storage } from '../services/storage';
import { useAuth } from './useAuth';

export function useProfiles() {
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfileObjs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getValidJwt } = useAuth();
  const { validJwt } = useAuthContext();

  // -------------------------------------------
  // Storage Functions
  // -------------------------------------------

  useEffect(() => {
    const loadFromStorage = async () => {
      setIsLoading(true);
      try {
        const savedProfile = await storage.get(PROFILE_STORAGE_KEY);
        if (savedProfile) setFamilyProfiles(savedProfile);
        else {
          setFamilyProfiles(null);
        }
      } catch (e) {
        console.error('Failed to load family profile from storage', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromStorage();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const saveToStorage = async () => {
      try {
        await storage.save(PROFILE_STORAGE_KEY, familyProfiles);
      } catch (e) {
        console.error('failed to save family profile to storage', e);
      }
    };

    saveToStorage();
  }, [familyProfiles]);

  // -------------------------------------------
  // Fetch from backend
  // -------------------------------------------

  const fetchProfiles = useCallback(async () => {
    const jwtToken = await getValidJwt();
    if (!jwtToken) return;

    setIsLoading(true);
    setError(null);

    try {
      //Fetch from Backend
      const data = await fetchFamilyProfiles(jwtToken);

      //check if data is ok
      if (data.error) {
        console.error('Backend Profile Fetch Error:', data?.error);
        setError(data?.error || 'big error in profiles');
        return;
      }

      //Update State & Local Storage
      setFamilyProfiles(data);
      await storage.save('profiles', data);
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
