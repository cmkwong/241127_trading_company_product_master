import styles from './ProductTableRow.module.css';
// import MediaPreview from './MediaPreview';
import PricePreview from './PricePreview';
import TextCell from './TextCell';
import Varients from './Varients';
import Category from './Category';
import { ProductDataRowProvider } from '../store/ProductDataRowContext';
// import { useProductDatasContext } from '../store/ProductDatasContext';
import Labels from './Labels';
import ImagePreview from './Media/ImagePreview';
import VideoPreview from './Media/VideoPreview';
import DescriptionPreview from './Media/DescriptionPreview';

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
        <ImagePreview />
      </div>
      <div>
        <VideoPreview />
      </div>
      <div>
        <DescriptionPreview />
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
