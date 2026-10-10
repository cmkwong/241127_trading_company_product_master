import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useAuthContext } from './AuthContext';
import {
  getEntityRecord,
  setEntityRecord,
} from './GeneralContext';
import { fetchSelfUser } from '../components/homepage/utils/homeApi';
import { processChangesWithBase64 } from '../utils/objectUrlUtils';
import {
  createSelfRfq as apiCreateSelfRfq,
  deleteSelfRfq as apiDeleteSelfRfq,
  updateSelfProfile,
  updateSelfRfq as apiUpdateSelfRfq,
} from '../components/homepage/LoginUsers/utils/accountApi';

const UserAccountContext = createContext(null);

const SELF_EDITABLE_FIELDS = [
  'first_name',
  'last_name',
  'display_name',
  'company_name',
  'website',
  'country_calling_code',
  'phone_number',
  'icon_name',
];

// Maps the `icon_url` blob (freshly picked) to the server's base64 upload field.
// Mirrors the products icon mapping ({ url, base64 }) shape.
const USER_FILE_MAPPINGS = {
  users: { url: 'icon_url', base64: 'base64_image' },
};

export const UserAccountContext_Provider = ({ children }) => {
  const { token } = useAuthContext();

  const [selfUser, setSelfUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const reload = useCallback(async () => {
    if (!token) return null;
    const user = await fetchSelfUser(token);
    if (user) {
      setSelfUser(user);
      setEntityRecord('user', user);
    }
    return user;
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setSelfUser(null);
      setEntityRecord('user', {});
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setLoadError(null);
    fetchSelfUser(token)
      .then((user) => {
        if (cancelled) return;
        const record = user || {};
        setSelfUser(record);
        setEntityRecord('user', record);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSave = useCallback(async () => {
    if (!token) return false;

    const record = getEntityRecord('user');
    if (!record || !record.id) {
      setSaveError('No profile loaded to save.');
      return false;
    }

    const patch = { id: record.id };
    for (const field of SELF_EDITABLE_FIELDS) {
      if (record[field] !== undefined) patch[field] = record[field];
    }
    if (Array.isArray(record.user_addresses)) {
      patch.user_addresses = record.user_addresses;
    }
    if (Array.isArray(record.user_payment_methods)) {
      patch.user_payment_methods = record.user_payment_methods;
    }

    // A freshly picked icon is held as a blob object URL; convert it to a
    // base64 data URI for upload. Unchanged icons carry a stored `/public/...`
    // path and are simply not sent.
    if (
      typeof record.icon_url === 'string' &&
      record.icon_url.startsWith('blob:')
    ) {
      patch.icon_url = record.icon_url;
    }

    let payload = [patch];
    try {
      const processed = await processChangesWithBase64(
        { users: [patch] },
        USER_FILE_MAPPINGS,
      );
      if (Array.isArray(processed?.users)) payload = processed.users;
    } catch {
      // Fall back to the unprocessed patch (no base64 conversion) on failure.
      payload = [patch];
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await updateSelfProfile(token, payload);
      await reload();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return true;
    } catch (error) {
      setSaveError(error?.message || 'Failed to save your changes.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [token, reload]);

  const createRfq = useCallback(
    async (rfq) => {
      const result = await apiCreateSelfRfq(token, [rfq]);
      await reload();
      return result;
    },
    [token, reload],
  );

  const updateRfq = useCallback(
    async (rfq) => {
      const result = await apiUpdateSelfRfq(token, [rfq]);
      await reload();
      return result;
    },
    [token, reload],
  );

  const deleteRfq = useCallback(
    async (id) => {
      await apiDeleteSelfRfq(token, id);
      await reload();
    },
    [token, reload],
  );

  const userRfqs = useMemo(
    () => (Array.isArray(selfUser?.user_rfqs) ? selfUser.user_rfqs : []),
    [selfUser],
  );

  const contextValue = useMemo(
    () => ({
      selfUser,
      userRfqs,
      isLoading,
      loadError,
      isSaving,
      saveSuccess,
      saveError,
      handleSave,
      createRfq,
      updateRfq,
      deleteRfq,
      reload,
    }),
    [
      selfUser,
      userRfqs,
      isLoading,
      loadError,
      isSaving,
      saveSuccess,
      saveError,
      handleSave,
      createRfq,
      updateRfq,
      deleteRfq,
      reload,
    ],
  );

  return (
    <UserAccountContext.Provider value={contextValue}>
      {children}
    </UserAccountContext.Provider>
  );
};

UserAccountContext_Provider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUserAccount = () => {
  const context = useContext(UserAccountContext);
  if (!context) {
    throw new Error(
      'useUserAccount must be used within a UserAccountContext_Provider',
    );
  }
  return context;
};

export { UserAccountContext };
