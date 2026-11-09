import { useCallback, useEffect, useRef, useState } from 'react';
import { apiPost } from '../utils/crud';
import { useAuthContext } from './AuthContext';
import {
  COMPANY_API_BASE,
  extractFirstCompany,
  normalizeCompanyListResponse,
} from '../components/panels/Companys/utils/companyPayload';

// Module-level cache so Sales and Purchase panels share a single request and a
// single resolved company record for the current session.
let cachedProfile = null;
let cachedToken = null;
let inFlightPromise = null;

/**
 * Fetch the first company (with its `company_address` rows) from the server.
 * Returns `null` when the table is empty or the request fails.
 */
export const fetchCompanyProfile = async (token) => {
  if (!token) {
    return null;
  }

  if (cachedProfile && cachedToken === token) {
    return cachedProfile;
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      const response = await apiPost(
        `${COMPANY_API_BASE}/data/list`,
        { includeBase64: false, compress: false },
        { token },
      );

      const normalized = normalizeCompanyListResponse(response);
      const company = extractFirstCompany(normalized);

      cachedProfile = company || null;
      cachedToken = token;
      return cachedProfile;
    } catch (error) {
      console.error('Failed to load company profile:', error);
      return null;
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
};

/**
 * React hook returning the server company profile plus a manual refresh.
 */
export const useCompanyProfile = () => {
  const { token } = useAuthContext();
  const [companyProfile, setCompanyProfile] = useState(cachedProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshCompanyProfile = useCallback(
    async ({ force = false } = {}) => {
      if (force) {
        cachedProfile = null;
        cachedToken = null;
        inFlightPromise = null;
      }

      setIsLoading(true);
      setError(null);
      try {
        const profile = await fetchCompanyProfile(token);
        if (mountedRef.current) {
          setCompanyProfile(profile);
        }
        return profile;
      } catch (err) {
        if (mountedRef.current) {
          setError(err?.message || 'Failed to load company profile');
        }
        return null;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [token],
  );

  useEffect(() => {
    refreshCompanyProfile();
  }, [refreshCompanyProfile]);

  return {
    companyProfile,
    isCompanyProfileLoading: isLoading,
    companyProfileError: error,
    refreshCompanyProfile,
  };
};
