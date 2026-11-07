import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  normalizeStructuredTableResponse,
  buildNestedChangedData,
  cleanupNestedInternalFlags,
  canProceedAndDiscardUnsavedChanges,
  getEffectiveComparisonKeys,
  mergeEntityIntoStateList,
  ensureContextAvailable,
} from '../utils/contextDataUtils';
import { apiGet, apiPatch, apiDelete, apiPost } from '../utils/crud';
import { useAuthContext } from './AuthContext';
import { readJson, writeJson } from '../utils/TanStackUtils/listCache';
import { getEntityRecord, setEntityRecord } from './GeneralContext';
import { v4 as uuidv4 } from 'uuid';

// Catalog-scoped shims over the generic entity store (key 'catalogs').
const getPageData = () => getEntityRecord('catalogs');
const setPageData = (valueOrUpdater) =>
  setEntityRecord('catalogs', valueOrUpdater);

export const CatalogContext = createContext();

const CATALOGS_LIST_STORAGE_KEY = 'trade_business_catalogs_list';
const API_BASE =
  'http://localhost:3001/api/v1/trade_business/panel/catalogs/data';

const readStoredCatalogs = () =>
  readJson(CATALOGS_LIST_STORAGE_KEY, { catalogs: [] });

const persistCatalogs = (state) =>
  writeJson(CATALOGS_LIST_STORAGE_KEY, { catalogs: state?.catalogs ?? [] });

const LIST_CATALOG_FIELDS = [
  'id',
  'catalog_name',
  'display_header',
  'created_at',
  'updated_at',
];

/**
 * Deep-clone a catalog draft for duplication: regenerate every `id` (root and
 * nested rows/attribute-displays) and drop server-managed/internal keys.
 */
const cloneCatalogForDuplication = (source) => {
  const clean = cleanupNestedInternalFlags(source || {});
  const idMap = new Map();

  const collectIds = (value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item?._delete) return;
        collectIds(item);
      });
      return;
    }
    if (!value || typeof value !== 'object') return;

    const id = String(value.id || '').trim();
    if (id && !idMap.has(id)) idMap.set(id, uuidv4());

    Object.values(value).forEach(collectIds);
  };

  const cloneValue = (value) => {
    if (Array.isArray(value)) {
      return value
        .filter((item) => !item?._delete)
        .map((item) => cloneValue(item));
    }
    if (!value || typeof value !== 'object') return value;

    return Object.entries(value).reduce((copy, [key, nestedValue]) => {
      if (
        key === '_delete' ||
        key === '_objUrl' ||
        key === '_base64_changed' ||
        key === 'created_at' ||
        key === 'updated_at'
      ) {
        return copy;
      }

      if (key === 'id') {
        const replacementId = idMap.get(String(nestedValue || '').trim());
        if (replacementId) copy.id = replacementId;
        return copy;
      }

      if (key.endsWith('_id')) {
        const replacementId = idMap.get(String(nestedValue || '').trim());
        if (replacementId) copy[key] = replacementId;
        return copy;
      }

      copy[key] = cloneValue(nestedValue);
      return copy;
    }, {});
  };

  collectIds(clean);
  return cloneValue(clean);
};

export const CatalogContext_Provider = ({ children, initialData = {} }) => {
  const { token } = useAuthContext();
  const [originalPageData, setOriginalPageData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [catalogs, setCatalogs] = useState(readStoredCatalogs);
  const [selectedCatalogId, setSelectedCatalogId] = useState(null);
  const [isCatalogsLoading, setIsCatalogsLoading] = useState(false);
  const [comparisonKeys, setComparisonKeys] = useState([]);
  const hasInitialFetchRef = useRef(false);

  useEffect(() => {
    if (!getPageData()?.id && initialData?.id) {
      setPageData(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doFetchCatalogs = useCallback(async () => {
    if (!token) {
      setCatalogs({ catalogs: [] });
      return;
    }

    setIsCatalogsLoading(true);
    try {
      const response = await apiPost(
        `${API_BASE}/list`,
        {
          includeBase64: false,
          fields: {
            catalogs: LIST_CATALOG_FIELDS,
          },
        },
        { token },
      );

      const rawData = normalizeStructuredTableResponse(response, 'catalogs');
      setCatalogs(rawData || { catalogs: [] });
      persistCatalogs(rawData || { catalogs: [] });
    } catch (error) {
      console.error('Failed to fetch catalogs:', error);
    } finally {
      setIsCatalogsLoading(false);
    }
  }, [token]);

  const doFetchComparisonKeys = useCallback(async () => {
    if (!token) {
      setComparisonKeys([]);
      return;
    }

    try {
      const response = await apiGet(`${API_BASE}/comparison-keys`, { token });
      const keys = response?.data?.firstLevelKeys;
      setComparisonKeys(Array.isArray(keys) ? keys : []);
    } catch (error) {
      console.error('Failed to fetch catalog comparison keys:', error);
      setComparisonKeys([]);
    }
  }, [token]);

  const refreshCatalogList = useCallback(async () => {
    await doFetchCatalogs();
    await doFetchComparisonKeys();
  }, [doFetchCatalogs, doFetchComparisonKeys]);

  useEffect(() => {
    if (!token) {
      setCatalogs({ catalogs: [] });
      setPageData({});
      setSelectedCatalogId(null);
      hasInitialFetchRef.current = false;
      return;
    }

    if (!hasInitialFetchRef.current) {
      doFetchCatalogs();
      doFetchComparisonKeys();
      hasInitialFetchRef.current = true;
    }
  }, [token, doFetchCatalogs, doFetchComparisonKeys]);

  const effectiveComparisonKeys = useCallback(
    () =>
      getEffectiveComparisonKeys({ comparisonKeys, pageData: getPageData() }),
    [comparisonKeys],
  );

  // The catalog tables no longer carry any server `fileConfig` (per-row images
  // now come from `products.icon_url`), so there is no base64 handling here.
  const getChangedData = useCallback(() => {
    return buildNestedChangedData({
      pageData: getPageData(),
      originalPageData,
      comparisonKeys: effectiveComparisonKeys(),
      rootTableName: 'catalogs',
      base64Config: {},
      replaceTables: [],
    });
  }, [originalPageData, effectiveComparisonKeys]);

  const isDataUnchanged = useCallback(
    () => getChangedData() === null,
    [getChangedData],
  );

  const discardCurrentCatalogUnsavedChanges = useCallback(() => {
    const current = getPageData();
    if (
      originalPageData &&
      String(originalPageData?.id || '').trim() ===
        String(current?.id || '').trim()
    ) {
      setPageData(JSON.parse(JSON.stringify(originalPageData)));
      return;
    }
    setPageData({});
  }, [originalPageData]);

  const getCatalogSaveDryRunData = useCallback(async () => {
    const changesResult = getChangedData();
    const current = getPageData();
    const preview = {
      endpoint: `${API_BASE}/ids`,
      method: 'PATCH + DELETE',
      create: {},
      update: {},
      delete: {},
    };

    if (!changesResult) {
      return { ...preview, message: 'No changes detected' };
    }

    const isRootCreate =
      !originalPageData || originalPageData.id !== current.id;

    if (changesResult?.changes) {
      const { changes } = changesResult;
      preview.payload = { data: changes };
      if (changes.catalogs) {
        if (isRootCreate) {
          preview.create.catalogs = changes.catalogs;
        } else {
          preview.update.catalogs = changes.catalogs;
        }
      }
    }

    if (changesResult?.deletions) {
      preview.delete = changesResult.deletions;
    }

    return preview;
  }, [getChangedData, originalPageData]);

  const getCatalogData = useCallback(
    (id) => {
      const current = getPageData();
      const canSwitch = canProceedAndDiscardUnsavedChanges({
        hasRecordId: !!current.id,
        isDataUnchanged: isDataUnchanged(),
        onDiscard: discardCurrentCatalogUnsavedChanges,
      });

      if (!canSwitch) return false;

      setSelectedCatalogId(id);

      (async () => {
        setIsCatalogsLoading(true);
        try {
          const response = await apiPost(
            `${API_BASE}/get/ids`,
            { data: { catalogs: [{ id }] } },
            { token },
          );

          const rawData = normalizeStructuredTableResponse(response, 'catalogs');
          const catalog = rawData?.catalogs?.[0] || null;
          if (catalog) {
            setPageData(catalog);
            setOriginalPageData(JSON.parse(JSON.stringify(catalog)));
          } else {
            console.error('getCatalogData: no catalog returned for id', id);
          }
        } catch (error) {
          console.error('Failed to fetch catalog by id:', error);
        } finally {
          setIsCatalogsLoading(false);
        }
      })();

      return true;
    },
    [isDataUnchanged, token, discardCurrentCatalogUnsavedChanges],
  );

  const getAllCatalogs = useCallback(() => catalogs.catalogs || [], [catalogs]);



  const handleCatalogSave = useCallback(
    async (externalSaveCallback = null) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const current = getPageData();
        const changesResult = getChangedData();

        if (changesResult) {
          const { changes, deletions } = changesResult;

          if (deletions) {
            await apiDelete(`${API_BASE}/ids`, {
              token,
              body: { data: deletions },
            });
          }

          if (changes) {
            await apiPatch(
              `${API_BASE}/ids`,
              { data: changes },
              { token },
            );
          }
        }

        if (typeof externalSaveCallback === 'function') {
          await externalSaveCallback(current);
        }

        if (current.id) {
          // Re-fetch the persisted catalog so any server-managed values replace
          // the local draft. On failure, fall back to the cleaned local draft.
          let authoritative = null;
          try {
            const response = await apiPost(
              `${API_BASE}/get/ids`,
              { data: { catalogs: [{ id: current.id }] } },
              { token },
            );
            const rawData = normalizeStructuredTableResponse(
              response,
              'catalogs',
            );
            authoritative = rawData?.catalogs?.[0] || null;
          } catch (refetchErr) {
            console.warn('Failed to re-fetch catalog after save:', refetchErr);
          }

          const cleanedPageData = cleanupNestedInternalFlags(current);
          const savedCatalogData = JSON.parse(
            JSON.stringify(authoritative || cleanedPageData),
          );

          setPageData(savedCatalogData);
          setOriginalPageData(JSON.parse(JSON.stringify(savedCatalogData)));

          setCatalogs((prevState) => {
            const nextState = mergeEntityIntoStateList({
              prevState,
              listKey: 'catalogs',
              entity: savedCatalogData,
            });
            persistCatalogs(nextState);
            return nextState;
          });
        }

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        return true;
      } catch (error) {
        console.error('Error saving catalog:', error);
        setSaveError(error.message || 'Failed to save data');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [getChangedData, token],
  );

  const deleteCatalogById = useCallback(
    async (id) => {
      const catalogId = String(id || '').trim();
      if (!catalogId) throw new Error('Catalog ID is required for deletion');

      await apiDelete(`${API_BASE}/ids`, {
        token,
        body: { data: { catalogs: [{ id: catalogId }] } },
      });

      setCatalogs((prevState) => {
        const nextState = {
          ...prevState,
          catalogs: (prevState?.catalogs || []).filter(
            (item) => String(item?.id || '').trim() !== catalogId,
          ),
        };
        persistCatalogs(nextState);
        return nextState;
      });

      setSelectedCatalogId((prevId) =>
        String(prevId || '').trim() === catalogId ? null : prevId,
      );

      if (String(getPageData()?.id || '').trim() === catalogId) {
        setPageData({});
        setOriginalPageData({});
      }

      return true;
    },
    [token],
  );

  const createNewCatalog = useCallback(() => {
    const current = getPageData();
    const canCreate = canProceedAndDiscardUnsavedChanges({
      hasRecordId: !!current.id,
      isDataUnchanged: isDataUnchanged(),
      onDiscard: discardCurrentCatalogUnsavedChanges,
    });

    if (!canCreate) return false;

    const newCatalogId = uuidv4();
    setSelectedCatalogId(newCatalogId);
    setPageData({ id: newCatalogId });
    return true;
  }, [isDataUnchanged, discardCurrentCatalogUnsavedChanges]);

  const duplicateSelectedCatalog = useCallback(() => {
    const current = getPageData();
    if (!String(current?.id || '').trim()) {
      throw new Error('No catalog selected to duplicate.');
    }

    const duplicated = cloneCatalogForDuplication(current);
    const duplicatedId = String(duplicated?.id || '').trim();
    if (!duplicatedId) {
      throw new Error('Failed to create a duplicate catalog draft.');
    }

    setPageData(duplicated);
    setOriginalPageData({});
    setSelectedCatalogId(duplicatedId);
    setSaveError(null);

    return duplicated;
  }, []);

  const value = useMemo(
    () => ({
      catalogs,
      selectedCatalogId,
      getCatalogData,
      getAllCatalogs,
      refreshCatalogList,
      handleCatalogSave,
      createNewCatalog,
      duplicateSelectedCatalog,
      deleteCatalogById,
      isSaving,
      saveSuccess,
      saveError,
      isCatalogsLoading,
      isDataUnchanged,
      getChangedData,
      getCatalogSaveDryRunData,
    }),
    [
      catalogs,
      selectedCatalogId,
      getCatalogData,
      getAllCatalogs,
      refreshCatalogList,
      handleCatalogSave,
      createNewCatalog,
      duplicateSelectedCatalog,
      deleteCatalogById,
      isSaving,
      saveSuccess,
      saveError,
      isCatalogsLoading,
      isDataUnchanged,
      getChangedData,
      getCatalogSaveDryRunData,
    ],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
};

export const useCatalogContext = () => {
  const context = useContext(CatalogContext);
  return ensureContextAvailable(
    context,
    'useCatalogContext',
    'CatalogContext_Provider',
  );
};
