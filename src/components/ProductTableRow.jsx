import styles from './ProductTableRow.module.css';
import Collections from './Collections';
import Tags from './Tags';
import MediaPreview from './MediaPreview';
import PricePreview from './PricePreview';
import TextCell from './TextCell';
import Varients from './Varients';
import Category from './Category';
import { ProductDataRowProvider } from '../store/ProductDataRowContext';

const ProductTableRow = (props) => {
  const { productData, labels, allMedia, dispatchProductDatas } = props;

  return (
    <ProductDataRowProvider data={productData}>
      <div>
        <TextCell value={productData.product_name} />
      </div>
      <div>
        <TextCell value={productData.sku} />
      </div>
      <div>
        <Category
          productData={productData}
          dispatchProductDatas={dispatchProductDatas}
        />
      </div>
      <div>
        <Collections
          productData={productData}
          options={labels}
          dispatchProductDatas={dispatchProductDatas}
        />
      </div>
      <div>
        <Tags
          productData={productData}
          options={labels}
          dispatchProductDatas={dispatchProductDatas}
        />
      </div>
      <div>
        <MediaPreview media="image" allMedia={allMedia} />
      </div>
      <div>
        <MediaPreview media="video" allMedia={allMedia} />
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
    </ProductDataRowProvider>
  );
};

export default ProductTableRow;
