import { supabase } from '@/lib/supabase';

type GoogleAccessTokenResponse = {
  accessToken: string;
  expiresIn: number;
};

type CachedAccessToken = {
  accessToken: string;
  expiryDate: number;
};

let _cachedToken: CachedAccessToken | null = null;
let _fetchPromise: Promise<CachedAccessToken> | null = null;

export const getValidAccessToken = async (): Promise<CachedAccessToken> => {
  // 1. Return cached token if it is still valid
  if (_cachedToken) {
    const isExpired = Date.now() + 600_000 > _cachedToken.expiryDate;

    if (!isExpired) {
      return _cachedToken;
    }
  }

  // 2. If another request is already fetching a token,
  // wait for that request instead of making another one.
  if (_fetchPromise) {
    return _fetchPromise;
  }

  // 3. Fetch a fresh token from the Edge Function
  _fetchPromise = supabase.functions
    .invoke<GoogleAccessTokenResponse>('google-access-token')
    .then(({ data, error }) => {
      if (error) {
        throw error;
      }

      if (!data?.accessToken || data.expiresIn == null) {
        throw new Error('Google access token was not returned by the Edge Function');
      }

      const token: CachedAccessToken = {
        accessToken: data.accessToken,
        expiryDate: Date.now() + data.expiresIn * 1000,
      };

      _cachedToken = token;

      return token;
    })
    .finally(() => {
      _fetchPromise = null;
    });

  return _fetchPromise;
};
