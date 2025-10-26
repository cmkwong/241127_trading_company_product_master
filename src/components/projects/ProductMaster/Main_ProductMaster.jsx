import { useState, useEffect } from 'react';
import Main_Pack from './Packing/Main_Pack';
import styles from './Main_ProductMaster.module.css';
import Main_ProductName from './ProductName/Main_ProductName';
import Main_Category from './Categories/Main_Category';
import Main_Supplier from './Suppliers/Main_Supplier';
import Main_ProductLink from './ProductLink/Main_ProductLink';
import Main_AlibabaLink from './AlibabaLink/Main_AlibabaLink';
import Main_Remark from './Remarks/Main_Remark';
import Main_ProductIcon from './ProductIcon/Main_ProductIcon';
import Main_CertificateData from './CertificateData/Main_CertificateData';
import Main_AllProductList from './AllProductList/Main_AllProductList';
import SavePageWithProvider from '../../common/SavePage/Main_SavePage';

const Main_ProductMaster = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Function to handle saving product data
  const onSaveProduct = async (productData) => {
    // In a real app, you would make an API call here
    console.log('Saving product data:', productData);

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
    // On mobile, collapse the sidebar after selection
    if (windowWidth <= 768) {
      setSidebarCollapsed(true);
    }
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Track window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <SavePageWithProvider
      onSave={onSaveProduct}
      saveButtonText="Save Product"
      successMessage="Product saved successfully!"
      initialData={{
        // You can provide initial data here if needed
        productName: selectedProduct ? selectedProduct.productName : 'ABC',
        productId: selectedProduct ? selectedProduct.productId : '',
        category: selectedProduct ? selectedProduct.category : [],
        supplier: {
          name: '',
          option: '',
        },
        packing: {
          dropdownOptions: ['OPP', 'carton'],
        },
        remarks: '',
        // ... other initial values
      }}
    >
      <div className={styles.masterContainer}>
        <div
          className={`${styles.sidebar} ${
            sidebarCollapsed ? styles.collapsed : ''
          }`}
        >
          <Main_AllProductList onSelectProduct={handleProductSelect} />
        </div>

        {/* Toggle button for sidebar */}
        <div
          className={`${styles.sidebarToggle} ${
            sidebarCollapsed ? styles.collapsed : ''
          }`}
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? '›' : '‹'}
        </div>

        <div className={styles.container}>
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
