import { useReducer, useState } from 'react';
import styles from './ProductTable.module.css';
import ProductTableRow from './ProductTableRow';
import { useProductDatasContext } from '../store/ProductDatasContext';

const ProductTable = () => {
  const { productDatas } = useProductDatasContext();
  return (
    <div className={styles['container']}>
      <div className={styles['header']}>
        <div>Product Name</div>
        <div>SKU</div>
        <div>Category</div>
        <div>Collections</div>
        <div>Tags</div>
        <div>Images</div>
        <div>Videos</div>
        <div>Description</div>
        <div>Varients</div>
        <div>Prices</div>
      </div>
      {productDatas.map((productData, i) => (
        <div key={i} className={styles.row}>
          <ProductTableRow rowId={i} productData={productData} />
        </div>
      ))}
    </div>
  );
};

export default ProductTable;
