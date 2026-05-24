// tokenUtils.ts
import { fetchFamilyAccessTokens } from "@/services/api";
import { storage } from "@/services/storage";

export const getValidAccessToken = async (jwtToken: string) => {
  if (!jwtToken) throw new Error("No JWT Token");
  const stored = await storage.get("access_tokens");
  
  if (stored?.parent) {
    const isExpired = (Date.now() + 600000) > +stored.parent.expiryDate;
    if (!isExpired) return stored;
  }

  const data = await fetchFamilyAccessTokens(jwtToken);
  await storage.save("access_tokens", data);
  return data;
};