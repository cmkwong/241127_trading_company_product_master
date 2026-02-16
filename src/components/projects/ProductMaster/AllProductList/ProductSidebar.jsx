import { useState, useEffect } from 'react';
import styles from './ProductSidebar.module.css';
import Main_AllProductList from './Main_AllProductList';

const ProductSidebar = ({ onSelectProduct, isCollapsed, onToggleCollapse }) => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );

  // Handle product selection
  const handleProductSelect = (product) => {
    // On mobile, collapse the sidebar after selection
    if (windowWidth <= 768) {
      onToggleCollapse(true);
    }

    // Pass the selected product to the parent component
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  // Track window resize for responsive behavior
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return (
    <>
      <div
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      >
        <Main_AllProductList onSelectProduct={handleProductSelect} />
      </div>

      {/* Toggle button for sidebar */}
      <div
        className={`${styles.sidebarToggle} ${
          isCollapsed ? styles.collapsed : ''
        }`}
        onClick={() => onToggleCollapse(!isCollapsed)}
      >
        {isCollapsed ? '›' : '‹'}
      </div>
    </>
  );
};

export default ProductSidebar;
