// tokenUtils.ts
import { fetchFamilyAccessTokens } from '@/services/api';
import { storage } from '@/services/storage';

// Global in-memory cache variable
let _cachedTokens: any = null;
let _currentJwtToken: string | null = null;
let _fetchPromise: Promise<any> | null = null;

/**
 * Clears all access tokens from memory and disk.
 * Useful for explicit logouts.
 */
export const clearAccessTokens = () => {
  _cachedTokens = null;
  _currentJwtToken = null;
  _fetchPromise = null;
  storage.remove('access_tokens').catch((err) => console.error('Failed to clear access tokens from storage:', err));
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

  // 1. Check ultra-fast in-memory cache first
  if (_cachedTokens?.parent) {
    const isExpired = Date.now() + 600000 > +_cachedTokens.parent.expiryDate;
    if (!isExpired) return _cachedTokens;
  }
  //prevents multiple network fetches in short span
  if (_fetchPromise) return _fetchPromise;

  const stored = await storage.get('access_tokens');

  if (stored && stored.jwtToken === jwtToken && stored.tokens?.parent) {
    const isExpired = Date.now() + 600000 > +stored.tokens.parent.expiryDate;
    if (true) {
      _cachedTokens = stored.tokens; // Populate memory cache for future calls
      return _cachedTokens;
    }
  }

  console.log('Fetching fresh access tokens from backend...');

  // 6. Token is dead/missing -> Fetch fresh tokens over network
  // We wrap this in a promise so concurrent calls can await the exact same network request
  _fetchPromise = fetchFamilyAccessTokens(jwtToken)
    .then((data) => {
      // Instantly update the in-memory cache
      _cachedTokens = data;
      _currentJwtToken = jwtToken;

      // Persist to disk in the background, saving the jwtToken ALONGSIDE the data
      // so we can verify ownership upon the next app reboot
      storage.save('access_tokens', { jwtToken, tokens: data }).catch((err) => {
        console.error('Failed to background-persist access tokens:', err);
      });

      return data;
    })
    .finally(() => {
      // Clear the lock once the fetch completes (success or failure)
      _fetchPromise = null;
    });

  return _fetchPromise;
};
