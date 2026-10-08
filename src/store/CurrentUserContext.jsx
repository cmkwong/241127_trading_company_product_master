import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useAuthContext } from './AuthContext';
import { fetchSelfUser } from '../components/homepage/utils/homeApi';

const CurrentUserContext = createContext(null);

const buildDisplayName = (user) => {
  const first = String(user?.first_name ?? '').trim();
  const last = String(user?.last_name ?? '').trim();
  if (first || last) return `${first} ${last}`.trim();

  return String(user?.display_name ?? '').trim();
};

const buildInitials = (user, displayName) => {
  const first = String(user?.first_name ?? '').trim();
  const last = String(user?.last_name ?? '').trim();

  if (first || last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  if (!displayName) return '';
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
};

export const CurrentUserContext_Provider = ({ children }) => {
  const { token, email: authEmail } = useAuthContext();
  const [selfUser, setSelfUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setSelfUser(null);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    fetchSelfUser(token)
      .then((user) => {
        if (!cancelled) setSelfUser(user);
      })
      .catch(() => {
        // A failed self fetch (e.g. network hiccup) should not break the page;
        // the UI falls back to its placeholders.
        if (!cancelled) setSelfUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const contextValue = useMemo(() => {
    const displayName = buildDisplayName(selfUser);
    const email = String(selfUser?.email ?? authEmail ?? '').trim();
    return {
      selfUser,
      displayName,
      email,
      initials: buildInitials(selfUser, displayName),
      isLoading,
    };
  }, [selfUser, authEmail, isLoading]);

  return (
    <CurrentUserContext.Provider value={contextValue}>
      {children}
    </CurrentUserContext.Provider>
  );
};

CurrentUserContext_Provider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error(
      'useCurrentUser must be used within a CurrentUserContext_Provider',
    );
  }
  return context;
};
