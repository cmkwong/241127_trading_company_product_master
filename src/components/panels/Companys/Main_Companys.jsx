import { useCallback, useEffect, useRef, useState } from 'react';
import Main_SavePage from '../../common/SavePage/Main_SavePage';
import Main_InputContainer from '../../common/Container/Main_InputContainer';
import Main_CompanysBasicInfo from './CompanysBasicInfo/Main_CompanysBasicInfo';
import Main_CompanyAddresses from './Addresses/Main_CompanyAddresses';
import { getEntityRecord, setEntityRecord } from '../../../store/GeneralContext';
import { useAuthContext } from '../../../store/AuthContext';
import { apiDelete, apiPatch, apiPost } from '../../../utils/crud';
import {
  COMPANY_API_BASE,
  COMPANY_ADDRESS_TABLE,
  buildCompanyPayload,
  createEmptyCompanyDraft,
  extractFirstCompany,
  normalizeCompanyListResponse,
  validateCompany,
} from './utils/companyPayload';
import styles from './Main_Companys.module.css';

const Main_Companys = () => {
  const { token } = useAuthContext();
  const [persistedCompanyId, setPersistedCompanyId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const hasLoadedRef = useRef(false);
  const initialAddressIdsRef = useRef(new Set());

  const syncInitialAddressIds = useCallback((record) => {
    const ids = Array.isArray(record?.[COMPANY_ADDRESS_TABLE])
      ? record[COMPANY_ADDRESS_TABLE]
      : [];
    initialAddressIdsRef.current = new Set(
      ids.map((row) => String(row?.id || '').trim()).filter(Boolean),
    );
  }, []);

  // Auto-load the first company (falling back to a blank draft).
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const load = async () => {
      if (!token) {
        setEntityRecord('company', createEmptyCompanyDraft());
        return;
      }

      try {
        const response = await apiPost(
          `${COMPANY_API_BASE}/data/list`,
          { includeBase64: false, compress: false },
          { token },
        );

        const normalized = normalizeCompanyListResponse(response);
        const firstCompany = extractFirstCompany(normalized);

        if (firstCompany) {
          setEntityRecord('company', firstCompany);
          setPersistedCompanyId(String(firstCompany.id || '').trim() || null);
        } else {
          setEntityRecord('company', createEmptyCompanyDraft());
          setPersistedCompanyId(null);
        }
      } catch (error) {
        console.error('Failed to load company:', error);
        setEntityRecord('company', createEmptyCompanyDraft());
        setPersistedCompanyId(null);
      } finally {
        const record = getEntityRecord('company');
        syncInitialAddressIds(record);
      }
    };

    load();
  }, [token, syncInitialAddressIds]);

  const computeDeletedAddressIds = useCallback(() => {
    const record = getEntityRecord('company');
    const currentIds = new Set(
      (Array.isArray(record?.[COMPANY_ADDRESS_TABLE])
        ? record[COMPANY_ADDRESS_TABLE]
        : []
      )
        .map((row) => String(row?.id || '').trim())
        .filter(Boolean),
    );

    return Array.from(initialAddressIdsRef.current).filter(
      (id) => !currentIds.has(id),
    );
  }, []);

  const handleDryRun = useCallback(async () => {
    const record = getEntityRecord('company');
    const deleted = computeDeletedAddressIds();
    const payload = buildCompanyPayload(record, deleted);
    const validation = validateCompany(record);

    return {
      mode: persistedCompanyId ? 'update' : 'create',
      valid: validation.ok,
      errors: validation.errors,
      deletions: deleted.map((id) => ({ id })),
      payload,
    };
  }, [persistedCompanyId, computeDeletedAddressIds]);

  const handleSave = useCallback(async () => {
    const record = getEntityRecord('company');
    const validation = validateCompany(record);

    if (!validation.ok) {
      setSaveError(validation.errors.join(' '));
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const deleted = computeDeletedAddressIds();
      const payload = buildCompanyPayload(record, deleted);

      if (deleted.length > 0) {
        await apiDelete(
          `${COMPANY_API_BASE}/data/ids`,
          {
            token,
            body: {
              data: {
                [COMPANY_ADDRESS_TABLE]: deleted.map((id) => ({ id })),
              },
            },
          },
        );
      }

      if (persistedCompanyId) {
        await apiPatch(
          `${COMPANY_API_BASE}/data/ids`,
          { data: payload },
          { token },
        );
      } else {
        await apiPost(`${COMPANY_API_BASE}/data`, { data: payload }, { token });
      }

      setPersistedCompanyId(String(record?.id || '').trim() || null);
      syncInitialAddressIds(record);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return true;
    } catch (error) {
      console.error('Failed to save company:', error);
      setSaveError(error?.message || 'Failed to save company');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [persistedCompanyId, computeDeletedAddressIds, syncInitialAddressIds, token]);

  return (
    <Main_SavePage
      saveButtonText="Save Company"
      successMessage="Company saved successfully!"
      dryRunAction={handleDryRun}
      saveAction={handleSave}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
      saveError={saveError}
    >
      <div className={styles.container}>
        <div className={styles.inputSide}>
          <Main_CompanysBasicInfo />
          <Main_InputContainer label="Details">
            <Main_CompanyAddresses />
          </Main_InputContainer>
        </div>
      </div>
    </Main_SavePage>
  );
};

export default Main_Companys;
