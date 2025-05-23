import { BASE_URL, TOKEN_KEY_NAME } from "@/constants";
import { tokenCache } from "@/utils/cache";
import {
  AuthError,
  AuthRequestConfig,
  DiscoveryDocument,
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as jose from "jose";
import * as React from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  provider?: string;
  exp?: number;
  cookieExpiration?: number;
};

const AuthContext = React.createContext({
  user: null as AuthUser | null,
  signIn: () => {},
  signOut: () => {},
  fetchWithAuth: async (url: string, options?: RequestInit) =>
    Promise.resolve(new Response()),
  isLoading: false,
  error: null as AuthError | null,
});

const config: AuthRequestConfig = {
  clientId: "google",
  scopes: ["openid", "profile", "email"],
  redirectUri: makeRedirectUri(),
};

const discovery: DiscoveryDocument = {
  authorizationEndpoint: `${BASE_URL}/api/auth/authorize`,
  tokenEndpoint: `${BASE_URL}/api/auth/token`,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<AuthError | null>(null);
  const [request, response, promptAsync] = useAuthRequest(config, discovery);

  React.useEffect(() => {
    handleResponse();
  }, [response]);

  const handleResponse = async () => {
    const isWeb = Platform.OS === "web";

    if (response?.type === "success") {
      try {
        setIsLoading(true);

        const { code } = response.params;

        const tokenResponse = await exchangeCodeAsync(
          {
            code: code,
            extraParams: {
              platform: Platform.OS,
            },
            clientId: "google",
            redirectUri: makeRedirectUri(),
          },
          discovery
        );

        console.log("token response", tokenResponse);

        if (isWeb) {
          const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
            method: "GET",
            credentials: "include",
          });

          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            setUser(sessionData as AuthUser);
          }
        } else {
          const accessToken = tokenResponse.accessToken;

          setAccessToken(accessToken);

          // save to local storage
          tokenCache?.saveToken(TOKEN_KEY_NAME, accessToken);

          console.log(accessToken);

          //get user info
          const decoded = jose.decodeJwt(accessToken);
          setUser(decoded as AuthUser);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    } else if (response?.type === "error") {
      setError(response.error as AuthError);
    }
  };

  const signIn = async () => {
    try {
      if (!request) {
        console.log("no request");
        return;
      }

      await promptAsync();
    } catch (e) {
      console.log(e);
    }
  };
  const signOut = async () => {};

  const fetchWithAuth = async (url: string, options?: RequestInit) => {};

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        fetchWithAuth,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
