import styles from './ProductTableRow.module.css';
import Collections from './Collections';
import Tags from './Tags';
import MediaPreview from './MediaPreview';
import PricePreview from './PricePreview';
import TextCell from './TextCell';
import Varients from './Varients';
import InputOption from './InputOption';
import { useReducer, useState } from 'react';

const ProductTableRow = (props) => {
  let _selectedCollection = [6, 1, 12];
  let _selectedTags = [6, 1, 11, 12];

  const {
    productData,
    collections,
    setCollections,
    tags,
    setTags,
    setProductDatas,
  } = props;

  const [selectedCollection, setSelectedCollection] =
    useState(_selectedCollection);
  const [selectedTag, setSelectedTag] = useState(_selectedTags);

  return (
    <>
      <div>
        <TextCell value={productData.product_name} />
      </div>
      <div>
        <TextCell value={productData.sku} />
      </div>
      <div>
        <TextCell
          value={productData.category.map((data) => data.name).join(' >> ')}
        />
      </div>
      <div className={styles['tagging']}>
        <InputOption
          selectedOptions={selectedCollection}
          setSelectedOptions={setSelectedCollection}
          options={collections}
          setOptions={setCollections}
        />
      </div>
      <div className={styles['tagging']}>
        <InputOption
          selectedOptions={selectedTag}
          setSelectedOptions={setSelectedTag}
          options={tags}
          setOptions={setTags}
        />
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
        <PricePreview productData={productData} />
      </>
    </>
  );
};

export default ProductTableRow;
