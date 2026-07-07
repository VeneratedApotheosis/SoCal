import { useAuthContext } from '@/components/contexts/auth-context';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { jwtToken, loginWithCode } = useAuthContext();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID || '',
      scopes: [
        'openid',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      responseType: 'code',
      usePKCE: true,
      extraParams: { access_type: 'offline', prompt: 'consent' },
      redirectUri: window.location.origin + window.location.pathname,
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
      try {
        loginWithCode(response.params.code, request.codeVerifier, request.redirectUri);
      } catch {
        setError('Login failed');
      } finally {
        setIsLoading(false);
      }
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Authentication error');
    }
  }, [response, request, loginWithCode]);

  return { jwtToken, isLoading, error, promptAsync };
};
