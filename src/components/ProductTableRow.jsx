import styles from './ProductTableRow.module.css';
import Collections from './Collections';
import Tags from './Tags';
import MediaPreview from './MediaPreview';
import PricePreview from './PricePreview';
import TextCell from './TextCell';
import Varients from './Varients';
import { useReducer, useState } from 'react';

const ProductTableRow = (props) => {
  const { productData, setProductDatas } = props;

  return (
    <>
      <div>
        <TextCell />
      </div>
      <div>
        <TextCell />
      </div>
      <div>
        <TextCell />
      </div>
      <div className={styles['tagging']}>
        <Collections />
      </div>
      <div className={styles['tagging']}>
        <Tags />
      </div>
      <div>
        <MediaPreview media="image" />
      </div>
      <div>
        <MediaPreview media="video" />
      </div>
      <div>
        <MediaPreview media="description" />
      </div>
      <div>
        <Varients />
      </div>
      <>
        <PricePreview productData={data} />
      </>
    </>
  );
};

export default ProductTableRow;
