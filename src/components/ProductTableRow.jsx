import styles from './ProductTableRow.module.css';
import Collections from './Collections';
import Tags from './Tags';
import MediaPreview from './MediaPreview';
import PricePreview from './PricePreview';
import TextCell from './TextCell';
import Varients from './Varients';
import Category from './Category';

const ProductTableRow = (props) => {
  const { productData, labels, allMedia } = props;

  return (
    <>
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
        <Collections productData={productData} options={labels} />
      </div>
      <div>
        <Tags productData={productData} options={labels} />
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
    </>
  );
};

export default ProductTableRow;
