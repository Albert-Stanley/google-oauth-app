import { tokenCache } from "@/utils/cache";
import { BASE_URL, TOKEN_KEY_NAME } from "@/utils/constants";
import {
  AuthError,
  AuthRequestConfig,
  DiscoveryDocument,
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
  const isWeb = Platform.OS === "web";

  React.useEffect(() => {
    handleResponse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  React.useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      try {
        if (isWeb) {
          const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
            method: "GET",
            credentials: "include", // This includes cookies in the request
          });

          if (sessionResponse.ok) {
            const userData = await sessionResponse.json();
            setUser(userData as AuthUser);
          }
        } else {
          //mobile
          const storedAccessToken = await tokenCache?.getToken(TOKEN_KEY_NAME);

          if (storedAccessToken) {
            try {
              const decoded = jose.decodeJwt(storedAccessToken);
              const exp = (decoded as any).exp;
              const now = Math.floor(Date.now() / 1000);

              if (exp && exp > now) {
                console.log("Access token is still valid, using it");
                setAccessToken(storedAccessToken);
                setUser(decoded as AuthUser);
              } else {
                setUser(null);
                tokenCache?.deleteToken(TOKEN_KEY_NAME);
              }
            } catch (e) {
              console.log(e);
            }
          } else {
            console.log("User is not authenticated");
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, [isWeb]);

  const handleResponse = async () => {
    // This function is called when Google redirects back to our app
    // The response contains the authorization code that we'll exchange for tokens
    if (response?.type === "success") {
      try {
        setIsLoading(true);
        // Extract the authorization code from the response
        // This code is what we'll exchange for access and refresh tokens
        const { code } = response.params;

        // Create form data to send to our token endpoint
        // We include both the code and platform information
        // The platform info helps our server handle web vs native differently
        const formData = new FormData();
        formData.append("code", code);

        // Add platform information for the backend to handle appropriately
        if (isWeb) {
          formData.append("platform", "web");
        }

        console.log("request", request);

        // Get the code verifier from the request object
        // This is the same verifier that was used to generate the code challenge
        if (request?.codeVerifier) {
          formData.append("code_verifier", request.codeVerifier);
        } else {
          console.warn("No code verifier found in request object");
        }

        // Send the authorization code to our token endpoint
        // The server will exchange this code with Google for access and refresh tokens
        // For web: credentials are included to handle cookies
        // For native: we'll receive the tokens directly in the response
        const tokenResponse = await fetch(`${BASE_URL}/api/auth/token`, {
          method: "POST",
          body: formData,
          credentials: isWeb ? "include" : "same-origin", // Include cookies for web
        });

        if (isWeb) {
          // For web: The server sets the tokens in HTTP-only cookies
          // We just need to get the user data from the response
          const userData = await tokenResponse.json();
          if (userData.success) {
            // Fetch the session to get user data
            // This ensures we have the most up-to-date user information
            console.log("user data was received", userData);

            const sessionResponse = await fetch(
              `${BASE_URL}/api/auth/session`,
              {
                method: "GET",
                credentials: "include",
              }
            );

            if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json();
              setUser(sessionData as AuthUser);
            } else {
              console.error("Failed to fetch session.");
            }
          } else {
            console.error("Token exchange failed for web:", userData);
          }
        } else {
          const token = await tokenResponse.json();
          const accessToken = token.accessToken;

          if (!accessToken) {
            console.log("No access token received");
            return;
          }
          setAccessToken(accessToken);

          // save to local storage
          tokenCache?.saveToken(TOKEN_KEY_NAME, accessToken);

          console.log(accessToken);

          //get user info
          const decoded = jose.decodeJwt(accessToken);
          setUser(decoded as AuthUser);

          console.log("decoded", decoded);
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
