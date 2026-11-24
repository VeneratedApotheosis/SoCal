import { useAuthContext } from '@/components/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { demoProfile } from '@/utility/demoData';
import { FamilyProfileObjs } from '@/utility/types';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useProfiles() {
  const { session, demo } = useAuthContext();
  const user = session?.user;
  const userId = user?.id;
  const [profile, setProfile] = useState<FamilyProfileObjs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const refetch = useCallback(async () => {
    if (!userId || demo) return;
    const id = ++request.current;
    setError(null);

    try {
      const { data, error } = await supabase.from('user_info')
        .select('google_id, email, name, picture').eq('id', userId).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Profile is not available yet');
      if (id === request.current) {
        setProfile({ parent: { id: data.google_id, name: data.name, email: data.email, picture: data.picture }, children: [] });
      }
    } catch (error) {
      if (id === request.current) setError((error as Error).message || 'Failed to load profile');
    }
  }, [userId, demo]);

  useEffect(() => {
    void refetch();
    return () => { request.current++; };
  }, [refetch]);

  const googleIdentity = user?.identities?.find((identity) => identity.provider === 'google');
  const googleId = googleIdentity?.identity_data?.sub;
  const fallback = user ? {
    parent: {
      id: typeof googleId === 'string' ? googleId : '',
      name: user.user_metadata.full_name ?? user.user_metadata.name ?? '',
      email: user.email ?? '',
      picture: user.user_metadata.avatar_url ?? user.user_metadata.picture ?? '',
    },
    children: [],
  } : null;

  const resolved = profile && fallback ? {
    parent: {
      id: profile.parent.id || fallback.parent.id,
      name: profile.parent.name || fallback.parent.name,
      email: profile.parent.email || fallback.parent.email,
      picture: profile.parent.picture || fallback.parent.picture,
    },
    children: profile.children,
  } : profile ?? fallback;

  return { familyProfiles: demo ? { parent: demoProfile, children: [] } : resolved, error, refetch };
}
