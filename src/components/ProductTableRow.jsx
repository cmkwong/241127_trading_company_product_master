import styles from './ProductTableRow.module.css';
import MediaPreview from './MediaPreview';
import PricePreview from './PricePreview';
import TextCell from './TextCell';
import Varients from './Varients';
import Category from './Category';
import { ProductDataRowProvider } from '../store/ProductDataRowContext';
import { useProductDatasContext } from '../store/ProductDatasContext';
import Labels from './Labels';

const ProductTableRow = (props) => {
  const { productData } = props;

  return (
    <ProductDataRowProvider data={productData}>
      <div>
        <TextCell value={productData.product_name} />
      </div>
      <div>
        <TextCell value={productData.sku} />
      </div>
      <div>
        <Category productData={productData} />
      </div>
      <div>
        <Labels label_type={'collections'} productData={productData} />
      </div>
      <div>
        <Labels label_type={'tags'} productData={productData} />
      </div>
      <div>
        <MediaPreview type="image" />
      </div>
      <div>
        <MediaPreview type="video" />
      </div>
      <div>
        <MediaPreview type="description" />
      </div>
      <div>
        <Varients />
      </div>
      <>
        <PricePreview productData={productData} />
      </>
    </ProductDataRowProvider>
  );
};

export default ProductTableRow;
