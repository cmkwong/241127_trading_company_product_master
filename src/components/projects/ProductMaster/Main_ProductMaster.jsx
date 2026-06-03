import { useState, useRef, useEffect, useCallback } from 'react';
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
import ProductSidebar from './AllProductList/ProductSidebar';
import Main_ProductImages from './ProductImages/Main_ProductImages';
import Main_Keywords from './Keywords/Main_Keywords';
import ProductMasterSavePageContainer from './Container/ProductMasterSavePageContainer';
import Main_ProductCosts from './ProductCosts/Main_ProductCosts';
import VerticalLayout from '../../common/Layouts/VerticalLayout';
import SplitLayout from '../../common/Layouts/SplitLayout';
import DeleteBtn from '../../common/Buttons/DeleteBtn';
import bottomBarDeleteStyles from '../../common/Buttons/BottomBarDeleteAction.module.css';
import { useProductContext } from '../../../store/ProductContext';

const Main_ProductMaster = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showIconPanel, setShowIconPanel] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const iconOverlayRef = useRef(null);
  const iconToggleBtnRef = useRef(null);
  const { pageData, getAllProducts, deleteProductById } = useProductContext();

  const productId = String(pageData?.id || '').trim();
  const hasPersistedProduct = (getAllProducts() || []).some(
    (item) => String(item?.id || '').trim() === productId,
  );

  const handleDeleteProduct = useCallback(async () => {
    if (!productId || !hasPersistedProduct || isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      'Delete this product? This action cannot be undone.',
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProductById(productId);
      alert('Product deleted successfully.');
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert(error?.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteProductById, hasPersistedProduct, isDeleting, productId]);

  useEffect(() => {
    if (!showIconPanel) return;

    const handleOutsideClick = (event) => {
      const target = event.target;

      if (iconOverlayRef.current?.contains(target)) return;
      if (iconToggleBtnRef.current?.contains(target)) return;

      setShowIconPanel(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showIconPanel]);

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

  // Toggle sidebar visibility
  const handleToggleSidebar = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <ProductMasterSavePageContainer
      onSave={onSaveProduct}
      saveButtonText="Save Product"
      successMessage="Product saved successfully!"
      leftBottomAction={
        <DeleteBtn
          text={isDeleting ? 'Deleting...' : 'Delete Product'}
          onClick={handleDeleteProduct}
          disabled={!productId || !hasPersistedProduct || isDeleting}
          title="Delete product"
          ariaLabel="Delete product"
          className={bottomBarDeleteStyles.bottomBarDeleteAction}
        />
      }
    >
      <div className={styles.masterContainer}>
        <ProductSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        <div
          className={`${styles.container} ${
            sidebarCollapsed ? styles.fullWidth : ''
          }`}
        >
          <button
            ref={iconToggleBtnRef}
            type="button"
            className={styles.iconToggleBtn}
            onClick={() => setShowIconPanel((prev) => !prev)}
            aria-label={showIconPanel ? 'Hide icon panel' : 'Show icon panel'}
            title={showIconPanel ? 'Hide icon panel' : 'Show icon panel'}
          >
            {showIconPanel ? '‹' : '›'}
          </button>

          <div className={`${styles.inputSide} ${styles.withIconOverlay}`}>
            <SplitLayout>
              <VerticalLayout>
                <Main_ProductName />
                <Main_Category />
                <Main_Keywords />
              </VerticalLayout>
              <VerticalLayout>
                <Main_AlibabaLink />
              </VerticalLayout>
            </SplitLayout>
            <Main_ProductLink />

            <Main_ProductImages />
            <Main_Supplier />
            <Main_Pack />
            <Main_CertificateData />
            <Main_ProductCosts />
            <Main_Remark />
          </div>

          <div
            ref={iconOverlayRef}
            className={`${styles.iconOverlay} ${
              showIconPanel ? styles.iconOverlayOpen : styles.iconOverlayClosed
            }`}
            aria-hidden={!showIconPanel}
          >
            <Main_ProductIcon />
          </div>
        </div>
      </div>
    </ProductMasterSavePageContainer>
  );
};

export default Main_ProductMaster;
