/* eslint-disable react-refresh/only-export-components */
import { useCallback, useState } from 'react';
import styles from './Main_SupplierMaster.module.css';
import SupplierMasterSavePageContainer from './Container/SupplierMasterSavePageContainer';
import Main_SupplierAddresses from './Addresses/Main_SupplierAddresses';
import Main_SupplierContacts from './Contacts/Main_SupplierContacts';
import Main_SupplierLinks from './Links/Main_SupplierLinks';
import Main_SupplierServices from './Services/Main_SupplierServices';
import SupplierSidebar from './AllSupplierList/SupplierSidebar';
import Main_SupplierBasicInfo from './SupplierBasicInfo/Main_SupplierBasicInfo';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import bottomBarDeleteStyles from '../../common/Buttons/BottomBarDeleteAction.module.css';
import { useSupplierContext } from '../../../store/SupplierContext';

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
  const { pageData, getAllSuppliers, deleteSupplierById } =
    useSupplierContext();

  const supplierId = String(pageData?.id || '').trim();
  const hasPersistedSupplier = (getAllSuppliers() || []).some(
    (item) => String(item?.id || '').trim() === supplierId,
  );

  const handleDeleteSupplier = useCallback(async () => {
    if (!supplierId || !hasPersistedSupplier || isDeleting) {
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
      await deleteSupplierById(supplierId);
      alert('Supplier deleted successfully.');
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      alert(error?.message || 'Failed to delete supplier.');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteSupplierById, hasPersistedSupplier, isDeleting, supplierId]);

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
      leftBottomAction={
        <DeleteBtn
          text={isDeleting ? 'Deleting...' : 'Delete Supplier'}
          onClick={handleDeleteSupplier}
          disabled={!supplierId || !hasPersistedSupplier || isDeleting}
          title="Delete supplier"
          ariaLabel="Delete supplier"
          className={bottomBarDeleteStyles.bottomBarDeleteAction}
        />
      }
      initialData={
        selectedSupplier || {
          id: null,
          code: '',
          name: '',
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
