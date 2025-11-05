import { useState } from 'react';
import Main_Pack from './Packing/Main_Pack';
import styles from './Main_ProductMaster.module.css';
import Main_ProductName from './ProductName/Main_ProductName';
import Main_Category from './Categories/Main_Category';
import Main_Supplier from './Customization/Main_Customization';
import Main_ProductLink from './ProductLink/Main_ProductLink';
import Main_AlibabaLink from './AlibabaLink/Main_AlibabaLink';
import Main_Remark from './Remarks/Main_Remark';
import Main_ProductIcon from './ProductIcon/Main_ProductIcon';
import Main_CertificateData from './CertificateData/Main_CertificateData';
import SavePageWithProvider from '../../common/SavePage/Main_SavePage';
import ProductSidebar from './AllProductList/ProductSidebar';
import {
  mockProduct_template,
  mockProducts,
} from '../../../datas/Products/mockProducts';

const Main_ProductMaster = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Function to handle saving product data
  const onSaveProduct = async () => {
    // In a real app, you would make an API call here
    console.log('Saving data to database ... ');

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  // Handle product selection from the list
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  // Toggle sidebar visibility
  const handleToggleSidebar = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <SavePageWithProvider
      onSave={onSaveProduct}
      saveButtonText="Save Product"
      successMessage="Product saved successfully!"
      initialData={selectedProduct || mockProduct_template}
    >
      <div className={styles.masterContainer}>
        <ProductSidebar
          onSelectProduct={handleProductSelect}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        <div
          className={`${styles.container} ${
            sidebarCollapsed ? styles.fullWidth : ''
          }`}
        >
          <div className={styles.inputSide}>
            <Main_ProductName />
            <Main_Category />
            <Main_Supplier />
            <Main_ProductLink />
            <Main_AlibabaLink />
            <Main_Pack />
            <Main_CertificateData />
            <Main_Remark />
          </div>
          <div className={styles.icon}>
            <Main_ProductIcon />
          </div>
        </div>
      </div>
    </SavePageWithProvider>
  );
};

export default Main_ProductMaster;
