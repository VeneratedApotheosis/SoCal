//useAuth android 
import { AuthContext } from "@/components/contexts/auth-context";
import { GoogleSignin, isCancelledResponse, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useContext, useState } from "react";

// 1. Configure Google Sign-In outside the hook so it initializes once.
// We only need the Calendar scope here because email/profile/openid are included by default.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID, // MUST be the Web Client ID
  iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
  scopes: [
    "openid",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ],
  offlineAccess: true, // This tells Google to return a "serverAuthCode"
  forceCodeForRefreshToken: true, // BRO PLEASE RETURN THE REFRESH TOKEN
});

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { jwtToken, loginWithCode } = useContext(AuthContext);

  // 2. promptAsync replaces the AuthSession hook and useEffect combination
  const promptAsync = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Ensure the Android device has Google Play Services available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Trigger the native Android bottom-sheet login
      const response = await GoogleSignin.signIn();

      // Handle the V13+ response object format
      if (isSuccessResponse(response)) {
        // serverAuthCode is the exact equivalent of the 'code' you were getting from AuthSession
        const code = response.data.serverAuthCode; 

        if (code) {
          // Native OAuth does not use PKCE (codeVerifier) or redirectUris. 
          // We pass null/empty strings to satisfy your current Context Provider's TypeScript signature.
          await loginWithCode(code, '', '');
        } else {
          setError("Did not receive serverAuthCode from Google.");
        }
      } else if (isCancelledResponse(response)) {
        setError("Login was cancelled by the user.");
      }
    } catch (err: any) {
      console.error("Native Login Error:", err);
      setError(err.message || "An unknown error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  // We no longer return 'request' as the native flow doesn't use an AuthRequest object
  return { jwtToken, isLoading, error, promptAsync };
};
