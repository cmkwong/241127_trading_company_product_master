import { useState } from 'react';
import CustomerMasterSavePageContainer from './Container/CustomerMasterSavePageContainer';
import CustomerSidebar from './AllCustomerList/CustomerSidebar';
import Main_CustomerBasicInfo from './CustomerBasicInfo/Main_CustomerBasicInfo';
import Main_CustomerNames from './Names/Main_CustomerNames';
import Main_CustomerTypes from './Types/Main_CustomerTypes';
import Main_CustomerAddresses from './Addresses/Main_CustomerAddresses';
import Main_CustomerContacts from './Contacts/Main_CustomerContacts';
import Main_CustomerImages from './Images/Main_CustomerImages';
import styles from './Main_CustomerMaster.module.css';

const Main_CustomerMaster = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
