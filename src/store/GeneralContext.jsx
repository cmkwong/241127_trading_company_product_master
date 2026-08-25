import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { apiGet } from '../utils/crud';
import { upsertNestedData } from '../utils/crudObj';
import { validateNestedDataObject } from '../utils/contextDataUtils';
import { useAuthContext } from './AuthContext';

// ---------------------------------------------------------------------------
// Generic entity record store.
//
// Each "entity" (e.g. 'products', 'supplier', 'customer') is the currently
// edited record held in module scope. Components subscribe to a single entity
// slice via useSyncExternalStore so editing one field only re-renders the
// components that select that slice — instead of every context consumer.
// ---------------------------------------------------------------------------

const entityRecords = new Map();
const entityListeners = new Map();
const EMPTY_RECORD = Object.freeze({});
const EMPTY_ROWS = Object.freeze([]);

const getEntityListeners = (entityKey) => {
  let listeners = entityListeners.get(entityKey);
  if (!listeners) {
    listeners = new Set();
    entityListeners.set(entityKey, listeners);
  }
  return listeners;
};

export const getEntityRecord = (entityKey) =>
  entityRecords.get(entityKey) ?? EMPTY_RECORD;

export const setEntityRecord = (entityKey, valueOrUpdater) => {
  const prev = entityRecords.get(entityKey);
  const next =
    typeof valueOrUpdater === 'function'
      ? valueOrUpdater(prev)
      : valueOrUpdater;
  if (Object.is(next, prev)) return;
  entityRecords.set(entityKey, next);
  getEntityListeners(entityKey).forEach((listener) => listener());
};

export const subscribeEntityRecord = (entityKey, listener) => {
  const listeners = getEntityListeners(entityKey);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const upsertEntityData = (entityKey, nestedData) => {
  if (
    !validateNestedDataObject(
      nestedData,
      'upsertEntityData requires an object argument',
    )
  ) {
    return;
  }

  setEntityRecord(entityKey, (prev) =>
    upsertNestedData(prev ?? EMPTY_RECORD, nestedData),
  );
};

export function useEntitySelector(entityKey, selector) {
  return useSyncExternalStore(
    (listener) => subscribeEntityRecord(entityKey, listener),
    () => selector(getEntityRecord(entityKey)),
    () => selector(getEntityRecord(entityKey)),
  );
}

export const useEntityField = (entityKey, fieldName) =>
  useEntitySelector(entityKey, (record) => record?.[fieldName]);

export const useEntityRows = (entityKey, tableName) =>
  useEntitySelector(entityKey, (record) => {
    const rows = record?.[tableName];
    return Array.isArray(rows) ? rows : EMPTY_ROWS;
  });

export const GeneralContext = createContext();

const FILE_MAPPINGS_STORAGE_KEY = 'trade_business_file_mappings';
const FILE_MAPPINGS_FETCHED_AT_KEY = 'trade_business_file_mappings_fetched_at';
const FILE_MAPPINGS_STALE_MS = 5 * 60 * 1000;

const readStoredFileMappings = () => {
  try {
    const raw = window.localStorage.getItem(FILE_MAPPINGS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const readFileMappingsFetchedAt = () => {
  try {
    const raw = window.localStorage.getItem(FILE_MAPPINGS_FETCHED_AT_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
};

const persistFileMappingsFetchedAt = (timestamp) => {
  try {
    window.localStorage.setItem(
      FILE_MAPPINGS_FETCHED_AT_KEY,
      String(timestamp),
    );
  } catch {
    // Ignore storage failures.
  }
};

const persistFileMappings = (mappings) => {
  try {
    if (!mappings || typeof mappings !== 'object') {
      window.localStorage.removeItem(FILE_MAPPINGS_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      FILE_MAPPINGS_STORAGE_KEY,
      JSON.stringify(mappings),
    );
  } catch {
    // Ignore storage failures (e.g. quota exceeded / private browsing).
  }
};

export const GeneralContext_Provider = ({ children }) => {
  const { token } = useAuthContext();
  const [fileMappings, setFileMappings] = useState(readStoredFileMappings);
  const [isFileMappingsLoading, setIsFileMappingsLoading] = useState(false);
  const [fileMappingsError, setFileMappingsError] = useState(null);

  const fetchFileMappings = useCallback(async () => {
    if (!token) {
      setFileMappings({});
      setFileMappingsError(null);
      persistFileMappings({});
      persistFileMappingsFetchedAt(0);
      return {};
    }

    const cachedMappings = readStoredFileMappings();
    const fetchedAt = readFileMappingsFetchedAt();
    const cachedIsFresh =
      Object.keys(cachedMappings).length > 0 &&
      Date.now() - fetchedAt < FILE_MAPPINGS_STALE_MS;

    if (cachedIsFresh) {
      setFileMappings(cachedMappings);
      return cachedMappings;
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
      persistFileMappings(normalized);
      persistFileMappingsFetchedAt(Date.now());
      return normalized;
    } catch (error) {
      console.error('Failed to fetch trade business file mappings:', error);
      setFileMappingsError(error);
      setFileMappings({});
      persistFileMappings({});
      persistFileMappingsFetchedAt(0);
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

  const resolveAuthoritativeEntityAfterSave = useCallback(
    async ({
      refreshList,
      targetId,
      fallbackEntity = null,
      idSelector = (row) => row?.id,
    } = {}) => {
      if (typeof refreshList !== 'function') {
        return fallbackEntity;
      }

      const normalizedTargetId = String(targetId || '').trim();
      if (!normalizedTargetId) {
        return fallbackEntity;
      }

      const refreshedRows = await refreshList();
      if (!Array.isArray(refreshedRows) || refreshedRows.length === 0) {
        return fallbackEntity;
      }

      const authoritativeRow = refreshedRows.find(
        (row) => String(idSelector(row) || '').trim() === normalizedTargetId,
      );

      return authoritativeRow || fallbackEntity;
    },
    [],
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
        resolveAuthoritativeEntityAfterSave,
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
