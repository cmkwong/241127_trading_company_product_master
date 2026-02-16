import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { apiCreate } from '../utils/crud';

const DEFAULT_TOKEN_ENDPOINT = 'http://localhost:3001/api/v1/auth/getToken';

const AuthContext = createContext(null);

export const AuthContext_Provider = ({
  children,
  tokenEndpoint,
  tokenRequestBody,
}) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use the provided endpoint or fall back to the default
  const resolvedEndpoint = tokenEndpoint || DEFAULT_TOKEN_ENDPOINT;

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

        const response = await apiCreate(resolvedEndpoint, body);
        const resolvedToken =
          typeof response === 'string' ? response : response?.token;

        if (!resolvedToken) {
          throw new Error('Token endpoint responded without a token value.');
        }

        setToken(resolvedToken);
        return resolvedToken;
      } catch (err) {
        setToken(null);
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [resolvedEndpoint, tokenRequestBody],
  );

  const clearToken = useCallback(() => {
    setToken(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      token,
      isLoading,
      error,
      refreshToken: fetchToken,
      clearToken,
    }),
    [token, isLoading, error, fetchToken, clearToken],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

AuthContext_Provider.propTypes = {
  children: PropTypes.node.isRequired,
  tokenEndpoint: PropTypes.string,
  tokenRequestBody: PropTypes.shape({
    username: PropTypes.string,
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
