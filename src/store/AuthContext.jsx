import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { apiPost } from '../utils/crud';

const DEFAULT_TOKEN_ENDPOINT =
  'http://localhost:3001/api/v1/trade_business/panel/auth/getToken';
const DEFAULT_EMAIL_TOKEN_ENDPOINT =
  'http://localhost:3001/api/v1/trade_business/panel/auth/getTokenWithEmail';

const TOKEN_STORAGE_KEY = 'trade_business_token';
const ROLE_STORAGE_KEY = 'trade_business_role';

const readStoredToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const readStoredRole = () => {
  try {
    return window.localStorage.getItem(ROLE_STORAGE_KEY);
  } catch {
    return null;
  }
};

const AuthContext = createContext(null);

export const AuthContext_Provider = ({
  children,
  tokenEndpoint,
  emailTokenEndpoint,
  tokenRequestBody,
}) => {
  const [token, setToken] = useState(readStoredToken);
  const [role, setRole] = useState(readStoredRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use the provided endpoint or fall back to the default
  const resolvedEndpoint = tokenEndpoint || DEFAULT_TOKEN_ENDPOINT;
  const resolvedEmailEndpoint =
    emailTokenEndpoint || DEFAULT_EMAIL_TOKEN_ENDPOINT;

  // We no longer automatically construct a request body from environment variables.
  // The only way to get a token is by passing credentials manually to fetchToken.
  const fetchToken = useCallback(
    async (manualCredentials = null) => {
      setIsLoading(true);
      setError(null);

      try {
        // Use manual credentials if provided, otherwise check if initial props were passed
        const body = manualCredentials || tokenRequestBody;

        if (!body) {
          throw new Error('Authentication credentials are required.');
        }

        const response = await apiPost(resolvedEndpoint, body);
        const resolvedToken =
          typeof response === 'string' ? response : response?.token;
        const resolvedRole =
          typeof response === 'object' && response !== null
            ? response.role
            : null;

        if (!resolvedToken) {
          throw new Error('Token endpoint responded without a token value.');
        }

        try {
          window.localStorage.setItem(TOKEN_STORAGE_KEY, resolvedToken);
          if (resolvedRole) {
            window.localStorage.setItem(ROLE_STORAGE_KEY, resolvedRole);
          }
        } catch {
          // Ignore storage failures (e.g. private browsing / quota).
        }

        setToken(resolvedToken);
        setRole(resolvedRole);
        return resolvedToken;
      } catch (err) {
        try {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
          window.localStorage.removeItem(ROLE_STORAGE_KEY);
        } catch {
          // Ignore storage failures.
        }

        setToken(null);
        setRole(null);
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [resolvedEndpoint, tokenRequestBody],
  );

  // Exchange a Firebase email-link (passwordless) ID token for the app's own
  // JWT. If the account is brand new the backend answers NAMES_REQUIRED, in
  // which case we return that sentinel so the caller can prompt for names.
  const loginWithIdToken = useCallback(
    async (idToken, firstName = null, lastName = null) => {
      setIsLoading(true);
      setError(null);

      try {
        const body = { idToken };
        if (firstName != null && String(firstName).trim() !== '') {
          body.first_name = String(firstName).trim();
        }
        if (lastName != null && String(lastName).trim() !== '') {
          body.last_name = String(lastName).trim();
        }

        let response;
        try {
          response = await apiPost(resolvedEmailEndpoint, body);
        } catch (err) {
          if (/NAMES_REQUIRED/i.test(String(err?.message || ''))) {
            return 'NAMES_REQUIRED';
          }
          throw err;
        }

        const resolvedToken =
          typeof response === 'string' ? response : response?.token;
        const resolvedRole =
          typeof response === 'object' && response !== null
            ? response.role
            : null;

        if (!resolvedToken) {
          throw new Error('Token endpoint responded without a token value.');
        }

        try {
          window.localStorage.setItem(TOKEN_STORAGE_KEY, resolvedToken);
          if (resolvedRole) {
            window.localStorage.setItem(ROLE_STORAGE_KEY, resolvedRole);
          }
        } catch {
          // Ignore storage failures.
        }

        setToken(resolvedToken);
        setRole(resolvedRole);
        return resolvedToken;
      } catch (err) {
        try {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
          window.localStorage.removeItem(ROLE_STORAGE_KEY);
        } catch {
          // Ignore storage failures.
        }

        setToken(null);
        setRole(null);
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [resolvedEmailEndpoint],
  );

  const clearToken = useCallback(() => {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(ROLE_STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }

    setToken(null);
    setRole(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      token,
      role,
      isLoading,
      error,
      refreshToken: fetchToken,
      loginWithIdToken,
      clearToken,
    }),
    [token, role, isLoading, error, fetchToken, loginWithIdToken, clearToken],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

AuthContext_Provider.propTypes = {
  children: PropTypes.node.isRequired,
  tokenEndpoint: PropTypes.string,
  emailTokenEndpoint: PropTypes.string,
  tokenRequestBody: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
    payload: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuthContext must be used within an AuthContext_Provider',
    );
  }
  return context;
};
