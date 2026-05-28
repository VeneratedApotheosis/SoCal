// tokenUtils.ts
import { fetchFamilyAccessTokens } from "@/services/api";
import { storage } from "@/services/storage";

// Global in-memory cache variable
let _cachedTokens: any = null;

export const getValidAccessToken = async (jwtToken: string) => {
  if (!jwtToken) throw new Error("No JWT Token");

  // 1. Check ultra-fast in-memory cache first
  if (_cachedTokens?.parent) {
    const isExpired = (Date.now() + 600000) > +_cachedTokens.parent.expiryDate;
    if (!isExpired) return _cachedTokens;
  }

  // 2. Cache missed or expired in-memory? Check async disk storage
  if (!_cachedTokens) {
    const stored = await storage.get("access_tokens");
    if (stored?.parent) {
      const isExpired = (Date.now() + 600000) > +stored.parent.expiryDate;
      if (!isExpired) {
        _cachedTokens = stored; // Populate memory cache for future calls
        return stored;
      }
    }
  }

  // 3. Token is entirely dead/missing -> Fetch fresh tokens over network
  const data = await fetchFamilyAccessTokens(jwtToken);
  
  // Instantly update the in-memory cache so subsequent layout elements have access
  _cachedTokens = data; 

  // 4. Persist to disk in the background. DO NOT await it.
  // This allows the function to return immediately so your calendar fetch can start.
  storage.save("access_tokens", data).catch((err) => {
    console.error("Failed to background-persist access tokens:", err);
  });

  return data;
};