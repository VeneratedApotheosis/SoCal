import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

type GoogleAccessTokenResponse = { accessToken: string; expiresIn: number };
type CachedAccessToken = { accessToken: string; expiryDate: number };

let tokenSession: {
  userId: string;
  sessionToken: string;
  refreshToken?: string;
  registration?: Promise<void>;
  registered?: boolean;
  cached?: CachedAccessToken;
  pending?: Promise<CachedAccessToken>;
} | null = null;

export function setGoogleTokenSession(session: Session | null) {
  if (!session) {
    tokenSession = null;
    return;
  }

  const { user, access_token: sessionToken, provider_refresh_token: refreshToken } = session;
  if (tokenSession?.userId !== user.id || (refreshToken && refreshToken !== tokenSession.refreshToken)) {
    tokenSession = { userId: user.id, sessionToken, refreshToken: refreshToken ?? undefined };
    // Start registration outside the Supabase auth callback, even if no calendars are requested yet.
    void registerGoogleRefreshToken(tokenSession).catch(console.error);
  } else {
    tokenSession.sessionToken = sessionToken;
  }
}

function registerGoogleRefreshToken(session: NonNullable<typeof tokenSession>): Promise<void> {
  if (!session.refreshToken || session.registered) return Promise.resolve();
  session.registration ??= new Promise<void>((resolve) => setTimeout(resolve, 0))
    .then(async () => {
      if (session !== tokenSession) throw new Error('Google Calendar session changed');
      const { error } = await supabase.functions.invoke('update-google-token', {
        body: { refreshToken: session.refreshToken },
        headers: { Authorization: `Bearer ${session.sessionToken}` },
      });
      if (error) throw error;
      session.registered = true;
    })
    .finally(() => { session.registration = undefined; });
  return session.registration;
}

export async function getValidAccessToken(userId?: string): Promise<CachedAccessToken> {
  const session = tokenSession;
  if (!session || (userId && session.userId !== userId)) throw new Error('No active Google Calendar session');

  if (session.cached && Date.now() + 600_000 <= session.cached.expiryDate) return session.cached;

  session.pending ??= (async () => {
    await registerGoogleRefreshToken(session);
    if (session !== tokenSession) throw new Error('Google Calendar session changed');

    const { data, error } = await supabase.functions.invoke<GoogleAccessTokenResponse>('google-access-token', {
      headers: { Authorization: `Bearer ${session.sessionToken}` },
    });
    if (error) throw error;
    if (session !== tokenSession) throw new Error('Google Calendar session changed');
    if (!data?.accessToken || data.expiresIn == null) throw new Error('Google access token was not returned by the Edge Function');

    const token = { accessToken: data.accessToken, expiryDate: Date.now() + data.expiresIn * 1000 };
    session.cached = token;
    return token;
  })().finally(() => { session.pending = undefined; });

  return session.pending;
}
