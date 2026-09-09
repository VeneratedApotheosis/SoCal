import { fetchFamilyAccessTokens } from '@/services/api';

// Global in-memory cache variable
let _cachedTokens: any = null;
let _currentJwtToken: string | null = null;
let _fetchPromise: Promise<any> | null = null;

/**
 * Clears all access tokens from memory.
 */
export const clearAccessTokens = () => {
  _cachedTokens = null;
  _currentJwtToken = null;
  _fetchPromise = null;
};

export const getValidAccessToken = async (jwtToken: string) => {
  if (!jwtToken) {
    clearAccessTokens();
    throw new Error('No JWT Token provided. Cleared cache.');
  }

  if (_currentJwtToken !== jwtToken) {
    _cachedTokens = null;
    _currentJwtToken = jwtToken;
  }

  // 1. Check in-memory cache
  if (_cachedTokens?.parent) {
    const isExpired = Date.now() + 600000 > +_cachedTokens.parent.expiryDate;
    if (!isExpired) return _cachedTokens;
  }

  // 2. Return active fetch promise to prevent duplicate concurrent network requests
  if (_fetchPromise) return _fetchPromise;

  // 3. Fetch fresh tokens over network
  _fetchPromise = fetchFamilyAccessTokens(jwtToken)
    .then((data) => {
      _cachedTokens = data;
      _currentJwtToken = jwtToken;
      return data;
    })
    .finally(() => {
      _fetchPromise = null;
    });

  return _fetchPromise;
};
