import styles from './ProductTableRow.module.css';
import Collections from './Collections';
import Tags from './Tags';
import MediaPreview from './MediaPreview';
import PricePreview from './PricePreview';
import TextCell from './TextCell';
import Varients from './Varients';
import Category from './Category';

const ProductTableRow = (props) => {
  // let _selectedCollection = [6, 1, 12];
  // let _selectedTags = [6, 1, 11, 12];

  const { productData, labels, allMedia } = props;

  // const [selectedCollection, setSelectedCollection] =
  //   useState(_selectedCollection);
  // const [selectedTag, setSelectedTag] = useState(_selectedTags);

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
