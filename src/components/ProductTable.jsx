import Collections from './Collections';
import Tags from './Tags';
import MediaPreview from './MediaPreview';
import PricePreview from './PricePreview';
import styles from './ProductTable.module.css';
import TextCell from './TextCell';
import Varients from './Varients';

const ProductTable = () => {
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
      <div className={styles.row}>
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
        <div>
          <PricePreview />
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
