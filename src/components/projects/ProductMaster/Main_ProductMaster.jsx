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
import { mockProducts } from '../../../datas/Products/mockProducts';

const Main_ProductMaster = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [productsList, setProductsList] = useState(mockProducts);

  // Function to handle saving product data
  const onSaveProduct = async (productData) => {
    // In a real app, you would make an API call here
    console.log('Saving product data:', productData);

    // Create a copy of the products list
    const updatedProductsList = [...productsList];

    // Check if the product already exists in the list
    const existingProductIndex = updatedProductsList.findIndex(
      (p) => p.id === productData.id || p.productId === productData.productId
    );

    if (existingProductIndex >= 0) {
      // Update existing product while preserving its original structure
      updatedProductsList[existingProductIndex] = {
        ...updatedProductsList[existingProductIndex],
        // Keep the original structure for productName field from mockProducts
        // If productData.productName exists and is a string, use it directly
        // If it's an array, use the first non-empty name or the original value
        productName: Array.isArray(productData.productName)
          ? productData.productName
          : [],
        // Only update fields that are present in mockProducts
        ...(productData.category && { category: productData.category }),
        ...(productData.alibabaIds && {
          alibabaIds: productData.alibabaIds
            .map((item) => (typeof item === 'object' ? item.value || '' : item))
            .filter(Boolean),
        }),
        ...(productData.iconUrl && { iconUrl: productData.iconUrl }),
      };
    } else if (productData.id || productData.productId) {
      // Add new product following the mockProducts structure
      updatedProductsList.push({
        id: productData.id || `product-${Date.now()}`,
        productId: productData.productId || `PID-${Date.now().toString(36)}`,
        // Format productName according to mockProducts structure (as a string)
        productName: Array.isArray(productData.productName)
          ? productData.productName
          : [],
        category: Array.isArray(productData.category)
          ? productData.category
          : [],
        alibabaIds: Array.isArray(productData.alibabaIds)
          ? productData.alibabaIds
              .map((item) =>
                typeof item === 'object' ? item.value || '' : item
              )
              .filter(Boolean)
          : [],
        iconUrl: productData.iconUrl || 'https://via.placeholder.com/50',
      });
    }

    // Update the state with the new list
    setProductsList(updatedProductsList);

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, updatedProducts: updatedProductsList });
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
          id: `new-product-${Date.now()}`,
          productId: `PID-${Date.now().toString(36)}`,
          iconUrl: 'https://via.placeholder.com/50',
          productName: [
            { id: 1, name: '', type: 1 },
            { id: 2, name: '', type: 2 },
          ],
          category: [],
          customization: [{ id: 1, code: '', remark: '', images: [] }],
          productLinks: [
            {
              id: 1,
              link: '',
              images: [],
              remark: '',
              date: new Date().toISOString().split('T')[0],
            },
          ],
          alibabaIds: [{ id: 1, value: '', link: '' }],
          packings: [{ id: 1, L: 0, W: 0, H: 0, qty: 1, kg: 0, type: 1 }],
          certificates: [{ id: 1, type: 1, files: [], remark: '' }],
          remark: '',
        }
      }
    >
      <div className={styles.masterContainer}>
        <ProductSidebar
          onSelectProduct={handleProductSelect}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          productsList={productsList}
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
