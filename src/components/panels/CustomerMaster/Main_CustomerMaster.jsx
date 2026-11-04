import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomerMasterSavePageContainer from './Container/CustomerMasterSavePageContainer';
import CustomerSidebar from './AllCustomerList/CustomerSidebar';
import Main_CustomerBasicInfo from './CustomerBasicInfo/Main_CustomerBasicInfo';
import Main_CustomerNames from './Names/Main_CustomerNames';
import Main_CustomerAddresses from './Addresses/Main_CustomerAddresses';
import Main_CustomerContacts from './Contacts/Main_CustomerContacts';
import Main_CustomerImages from './Images/Main_CustomerImages';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import { useCustomerContext } from '../../../store/CustomerContext';
import { useEntityField } from '../../../store/GeneralContext';
import styles from './Main_CustomerMaster.module.css';
import Main_InputContainer from '../../common/Container/Main_InputContainer';
import Divider from '../../common/Container/Divider';

const Main_CustomerMaster = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const navigate = useNavigate();
  const { customer_id } = useParams();
  const {
    selectedCustomerId,
    getCustomerData,
    getAllCustomers,
    deleteCustomerById,
    createNewCustomer,
    duplicateSelectedCustomer,
  } = useCustomerContext();
  const pageDataId = useEntityField('customer', 'id');

  const getCustomerDataRef = useRef(getCustomerData);
  useEffect(() => {
    getCustomerDataRef.current = getCustomerData;
  }, [getCustomerData]);

  const handledCustomerIdRef = useRef(null);

  useEffect(() => {
    const routeId = String(customer_id || '').trim();
    if (!routeId) {
      handledCustomerIdRef.current = '';
      return;
    }

    if (String(selectedCustomerId || '').trim() === routeId) {
      handledCustomerIdRef.current = routeId;
      return;
    }

    if (handledCustomerIdRef.current === routeId) {
      return;
    }

    handledCustomerIdRef.current = routeId;
    const loaded = getCustomerDataRef.current(routeId);
    if (!loaded) {
      navigate('/panel/customer_master', { replace: true });
      handledCustomerIdRef.current = '';
    }
  }, [customer_id, selectedCustomerId, navigate]);

  const customerId = String(pageDataId || '').trim();
  const hasPersistedCustomer = (getAllCustomers() || []).some(
    (item) => String(item?.id || '').trim() === customerId,
  );

  const handleDeleteCustomer = useCallback(async () => {
    if (!customerId || !hasPersistedCustomer || isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      'Delete this customer? This action cannot be undone.',
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCustomerById(customerId);
      navigate('/panel/customer_master', { replace: true });
      alert('Customer deleted successfully.');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert(error?.message || 'Failed to delete customer.');
    } finally {
      setIsDeleting(false);
    }
  }, [
    customerId,
    deleteCustomerById,
    hasPersistedCustomer,
    isDeleting,
    navigate,
  ]);

  const handleDuplicateCustomer = useCallback(async () => {
    if (!hasPersistedCustomer || isDuplicating) {
      return;
    }

    setIsDuplicating(true);
    try {
      await duplicateSelectedCustomer();
      navigate('/panel/customer_master', { replace: true });
    } catch (error) {
      console.error('Failed to duplicate customer:', error);
      alert(error?.message || 'Failed to duplicate customer.');
    } finally {
      setIsDuplicating(false);
    }
  }, [
    duplicateSelectedCustomer,
    hasPersistedCustomer,
    isDuplicating,
    navigate,
  ]);

  const onSaveCustomer = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  return (
    <CustomerMasterSavePageContainer
      onSave={onSaveCustomer}
      saveButtonText="Save Customer"
      successMessage="Customer saved successfully!"
      onCreate={() => {
        const created = createNewCustomer();
        if (created) {
          navigate('/panel/customer_master', { replace: true });
        }
      }}
      createButtonText="Add Customer"
      showCreateButton
      leftBottomAction={
        <div className={styles.bottomActionGroup}>
          <DeleteBtn
            text={isDeleting ? 'Deleting...' : 'Delete Customer'}
            onClick={handleDeleteCustomer}
            disabled={
              !customerId ||
              !hasPersistedCustomer ||
              isDeleting ||
              isDuplicating
            }
            title="Delete customer"
            ariaLabel="Delete customer"
          />
          <button
            type="button"
            className={styles.duplicateBottomButton}
            onClick={handleDuplicateCustomer}
            disabled={!hasPersistedCustomer || isDuplicating}
            title="Duplicate selected customer"
            aria-label="Duplicate selected customer"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="5.5" y="5.5" width="7" height="7" rx="1" />
              <path d="M10.5 5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1H5" />
            </svg>
            {isDuplicating ? 'Duplicating...' : 'Duplicate Customer'}
          </button>
        </div>
      }
    >
      <div className={styles.masterContainer}>
        <CustomerSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />

        <div
          className={`${styles.container} ${
            sidebarCollapsed ? styles.fullWidth : ''
          }`}
        >
          <div className={styles.inputSide}>
            <Main_CustomerBasicInfo />
            <Main_InputContainer label="Details">
              <Main_CustomerNames />
              <Divider />
              <Main_CustomerAddresses />
              <Divider />
              <Main_CustomerContacts />
              <Divider />
              <Main_CustomerImages />
            </Main_InputContainer>
          </div>
        </div>
      </div>
    </CustomerMasterSavePageContainer>
  );
};

export default Main_CustomerMaster;
