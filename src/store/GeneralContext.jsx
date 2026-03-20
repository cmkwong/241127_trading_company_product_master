import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { apiGet } from '../utils/crud';
import { useAuthContext } from './AuthContext';

export const GeneralContext = createContext();

export const GeneralContext_Provider = ({ children }) => {
  const { token } = useAuthContext();
  const [fileMappings, setFileMappings] = useState({});
  const [isFileMappingsLoading, setIsFileMappingsLoading] = useState(false);
  const [fileMappingsError, setFileMappingsError] = useState(null);

  const fetchFileMappings = useCallback(async () => {
    if (!token) {
      setFileMappings({});
      setFileMappingsError(null);
      return {};
    }

    setIsFileMappingsLoading(true);
    setFileMappingsError(null);

    try {
      const response = await apiGet(
        'http://localhost:3001/api/v1/general/trade-business/defaults/data/file-mappings',
        { token },
      );

      const mappings = response?.data?.mappings;
      const normalized =
        mappings && typeof mappings === 'object' ? mappings : {};

      setFileMappings(normalized);
      return normalized;
    } catch (error) {
      console.error('Failed to fetch trade business file mappings:', error);
      setFileMappingsError(error);
      setFileMappings({});
      return {};
    } finally {
      setIsFileMappingsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFileMappings();
  }, [fetchFileMappings]);

  const getFileMapping = useCallback(
    (tableName) => {
      if (!tableName || typeof tableName !== 'string') {
        return null;
      }
      return fileMappings[tableName] || null;
    },
    [fileMappings],
  );

  const getBase64ConfigByPrefix = useCallback(
    (prefix) => {
      if (!prefix || typeof prefix !== 'string') {
        return {};
      }

      return Object.entries(fileMappings).reduce((acc, [tableName, config]) => {
        if (tableName.startsWith(prefix) && config) {
          acc[tableName] = config;
        }
        return acc;
      }, {});
    },
    [fileMappings],
  );

  const getBase64ConfigForTables = useCallback(
    (tableNames = []) => {
      if (!Array.isArray(tableNames)) {
        return {};
      }

      return tableNames.reduce((acc, tableName) => {
        if (fileMappings[tableName]) {
          acc[tableName] = fileMappings[tableName];
        }
        return acc;
      }, {});
    },
    [fileMappings],
  );

  return (
    <GeneralContext.Provider
      value={{
        fileMappings,
        isFileMappingsLoading,
        fileMappingsError,
        fetchFileMappings,
        getFileMapping,
        getBase64ConfigByPrefix,
        getBase64ConfigForTables,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export const useGeneralContext = () => {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error(
      'useGeneralContext must be used within a GeneralContext_Provider',
    );
  }
  return context;
};
