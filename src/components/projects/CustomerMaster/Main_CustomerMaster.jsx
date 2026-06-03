import { useCallback, useState } from 'react';
import CustomerMasterSavePageContainer from './Container/CustomerMasterSavePageContainer';
import CustomerSidebar from './AllCustomerList/CustomerSidebar';
import Main_CustomerBasicInfo from './CustomerBasicInfo/Main_CustomerBasicInfo';
import Main_CustomerNames from './Names/Main_CustomerNames';
import Main_CustomerTypes from './Types/Main_CustomerTypes';
import Main_CustomerAddresses from './Addresses/Main_CustomerAddresses';
import Main_CustomerContacts from './Contacts/Main_CustomerContacts';
import Main_CustomerImages from './Images/Main_CustomerImages';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import bottomBarDeleteStyles from '../../common/Buttons/BottomBarDeleteAction.module.css';
import { useCustomerContext } from '../../../store/CustomerContext';
import styles from './Main_CustomerMaster.module.css';

const Main_CustomerMaster = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { pageData, getAllCustomers, deleteCustomerById } =
    useCustomerContext();

  const customerId = String(pageData?.id || '').trim();
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
      alert('Customer deleted successfully.');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert(error?.message || 'Failed to delete customer.');
    } finally {
      setIsDeleting(false);
    }
  }, [customerId, deleteCustomerById, hasPersistedCustomer, isDeleting]);

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
      leftBottomAction={
        <DeleteBtn
          text={isDeleting ? 'Deleting...' : 'Delete Customer'}
          onClick={handleDeleteCustomer}
          disabled={!customerId || !hasPersistedCustomer || isDeleting}
          title="Delete customer"
          ariaLabel="Delete customer"
          className={bottomBarDeleteStyles.bottomBarDeleteAction}
        />
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
            <Main_CustomerTypes />
            <Main_CustomerNames />
            <Main_CustomerAddresses />
            <Main_CustomerContacts />
            <Main_CustomerImages />
          </div>
        </div>
      </div>
    </CustomerMasterSavePageContainer>
  );
};

export default Main_CustomerMaster;
