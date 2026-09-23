/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Main_SupplierMaster.module.css';
import SupplierMasterSavePageContainer from './Container/SupplierMasterSavePageContainer';
import Main_SupplierAddresses from './Addresses/Main_SupplierAddresses';
import Main_SupplierContacts from './Contacts/Main_SupplierContacts';
import Main_SupplierLinks from './Links/Main_SupplierLinks';
import Main_SupplierServices from './Services/Main_SupplierServices';
import SupplierSidebar from './AllSupplierList/SupplierSidebar';
import Main_SupplierBasicInfo from './SupplierBasicInfo/Main_SupplierBasicInfo';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import { useSupplierContext } from '../../../store/SupplierContext';
import { useEntityField } from '../../../store/GeneralContext';

const SupplierMasterContent = ({ onSelectSupplier }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={styles.masterContainer}>
      <SupplierSidebar
        onSelectSupplier={onSelectSupplier}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
      />

      <div
        className={`${styles.container} ${
          sidebarCollapsed ? styles.fullWidth : ''
        }`}
      >
        <div className={styles.inputSide}>
          <Main_SupplierBasicInfo />

          <Main_SupplierAddresses />
          <Main_SupplierContacts />
          <Main_SupplierLinks />
          <Main_SupplierServices />
        </div>
      </div>
    </div>
  );
};

const Main_SupplierMaster = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const navigate = useNavigate();
  const { supplier_id } = useParams();
  const {
    selectedSupplierId,
    getSupplierData,
    getAllSuppliers,
    deleteSupplierById,
    createNewSupplier,
    duplicateSelectedSupplier,
  } = useSupplierContext();
  const pageDataId = useEntityField('supplier', 'id');

  const getSupplierDataRef = useRef(getSupplierData);
  useEffect(() => {
    getSupplierDataRef.current = getSupplierData;
  }, [getSupplierData]);

  const handledSupplierIdRef = useRef(null);

  useEffect(() => {
    const routeId = String(supplier_id || '').trim();
    if (!routeId) {
      handledSupplierIdRef.current = '';
      return;
    }

    if (String(selectedSupplierId || '').trim() === routeId) {
      handledSupplierIdRef.current = routeId;
      return;
    }

    if (handledSupplierIdRef.current === routeId) {
      return;
    }

    handledSupplierIdRef.current = routeId;
    const loaded = getSupplierDataRef.current(routeId);
    if (!loaded) {
      navigate('/panel/supplier_master', { replace: true });
      handledSupplierIdRef.current = '';
    }
  }, [supplier_id, selectedSupplierId, navigate]);

  const activeSupplierId = String(
    selectedSupplierId || pageDataId || '',
  ).trim();
  const hasPersistedSupplier = (getAllSuppliers() || []).some(
    (item) => String(item?.id || '').trim() === activeSupplierId,
  );

  const handleDeleteSupplier = useCallback(async () => {
    if (
      !activeSupplierId ||
      !hasPersistedSupplier ||
      isDeleting ||
      isDuplicating
    ) {
      return;
    }

    const confirmed = window.confirm(
      'Delete this supplier? This action cannot be undone.',
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSupplierById(activeSupplierId);
      navigate('/panel/supplier_master', { replace: true });
      alert('Supplier deleted successfully.');
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      alert(error?.message || 'Failed to delete supplier.');
    } finally {
      setIsDeleting(false);
    }
  }, [
    deleteSupplierById,
    hasPersistedSupplier,
    isDeleting,
    activeSupplierId,
    isDuplicating,
    navigate,
  ]);

  const handleDuplicateSupplier = useCallback(async () => {
    if (!hasPersistedSupplier || isDuplicating) {
      return;
    }

    setIsDuplicating(true);
    try {
      await duplicateSelectedSupplier();
      navigate('/panel/supplier_master', { replace: true });
    } catch (error) {
      console.error('Failed to duplicate supplier:', error);
      alert(error?.message || 'Failed to duplicate supplier.');
    } finally {
      setIsDuplicating(false);
    }
  }, [
    duplicateSelectedSupplier,
    hasPersistedSupplier,
    isDuplicating,
    navigate,
  ]);

  const onSaveSupplier = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  return (
    <SupplierMasterSavePageContainer
      onSave={onSaveSupplier}
      saveButtonText="Save Supplier"
      successMessage="Supplier saved successfully!"
      onCreate={() => {
        const created = createNewSupplier();
        if (created) {
          navigate('/panel/supplier_master', { replace: true });
        }
      }}
      createButtonText="Add Supplier"
      showCreateButton
      leftBottomAction={
        <div className={styles.bottomActionGroup}>
          <DeleteBtn
            text={isDeleting ? 'Deleting...' : 'Delete Supplier'}
            onClick={handleDeleteSupplier}
            disabled={
              !activeSupplierId ||
              !hasPersistedSupplier ||
              isDeleting ||
              isDuplicating
            }
            title="Delete supplier"
            ariaLabel="Delete supplier"
          />
          <button
            type="button"
            className={styles.duplicateBottomButton}
            onClick={handleDuplicateSupplier}
            disabled={!hasPersistedSupplier || isDuplicating}
            title="Duplicate selected supplier"
            aria-label="Duplicate selected supplier"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="5.5" y="5.5" width="7" height="7" rx="1" />
              <path d="M10.5 5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1H5" />
            </svg>
            {isDuplicating ? 'Duplicating...' : 'Duplicate Supplier'}
          </button>
        </div>
      }
      initialData={
        selectedSupplier || {
          id: null,
          code: '',
          name: '',
          status: 'active',
          supplier_type_id: '',
          supplier_types: [],
          remark: '',
          supplier_addresses: [],
          supplier_contacts: [],
          supplier_links: [],
          supplier_services: [],
        }
      }
    >
      <SupplierMasterContent onSelectSupplier={setSelectedSupplier} />
    </SupplierMasterSavePageContainer>
  );
};

export default Main_SupplierMaster;
