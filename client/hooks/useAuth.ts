import { useAuthContext } from '@/components/contexts/auth-context';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { jwtToken, loginWithCode } = useAuthContext();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: Platform.select({
        ios: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
        default: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      })!,
      scopes: [
        'openid',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      responseType: 'code',
      usePKCE: true,
      extraParams: { access_type: 'offline', prompt: 'consent' },
      redirectUri: AuthSession.makeRedirectUri(),
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    },
  );

  useEffect(() => {
    if (response?.type === 'success' && request?.codeVerifier) {
      setIsLoading(true);
      setError(null);
      try{
      loginWithCode(response.params.code, request.codeVerifier, request.redirectUri)
      } catch{
        setError('Login failed');
      } finally{
        setIsLoading(false);
      }
        
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Authentication error');
    }
  }, [response, request, loginWithCode]);

  return { jwtToken, isLoading, error, promptAsync };
};