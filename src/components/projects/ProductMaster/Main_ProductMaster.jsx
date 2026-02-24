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
import SavePageWithProvider from './SavePage/Main_SavePage';
import ProductSidebar from './AllProductList/ProductSidebar';
import Main_ProductImages from './ProductImages/Main_ProductImages';
import Main_Keywords from './Keywords/Main_Keywords';

const Main_ProductMaster = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showIconPanel, setShowIconPanel] = useState(true);

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
      initialData={
        selectedProduct || {
          id: null,
          name: '',
          icon_url: '',
        }
      }
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
          <button
            type="button"
            className={styles.iconToggleBtn}
            onClick={() => setShowIconPanel((prev) => !prev)}
            aria-label={showIconPanel ? 'Hide icon panel' : 'Show icon panel'}
            title={showIconPanel ? 'Hide icon panel' : 'Show icon panel'}
          >
            {showIconPanel ? '‹' : '›'}
          </button>

          <div className={`${styles.inputSide} ${styles.withIconOverlay}`}>
            <Main_ProductName />
            <Main_Category />
            <Main_Keywords />
            <Main_ProductImages />
            <Main_Supplier />
            <Main_ProductLink />
            <Main_AlibabaLink />
            <Main_Pack />
            <Main_CertificateData />
            <Main_Remark />
          </div>

          {showIconPanel && (
            <div className={styles.iconOverlay}>
              <Main_ProductIcon />
            </div>
          )}
        </div>
      </div>
    </SavePageWithProvider>
  );
};

export default Main_ProductMaster;
