import InputOption from './InputOption';
import MediaPreview from './MediaPreview';
import PricePreview from './PricePreview';
import styles from './ProductTable.module.css';
import TextCell from './TextCell';
import Varients from './Varients';

const ProductTable = () => {
  return (
    <div className={styles['container']}>
      <table>
        <tbody>
          <tr className={styles['header']}>
            <th className={styles['productName']}>Product Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Collections</th>
            <th>Tags</th>
            <th>Images</th>
            <th>Videos</th>
            <th>Description</th>
            <th>Varients</th>
            <th>Prices</th>
          </tr>
          <tr>
            <td>
              <TextCell></TextCell>
            </td>
            <td>
              <TextCell></TextCell>
            </td>
            <td>
              <TextCell></TextCell>
            </td>
            <td className={styles['tagging']}>
              <InputOption />
            </td>
            <td className={styles['tagging']}>
              <InputOption />
            </td>
            <td>
              <MediaPreview media="image" />
            </td>
            <td>
              <MediaPreview media="video" />
            </td>
            <td>Male</td>
            <td>
              <Varients></Varients>
            </td>
            <td>
              <PricePreview />
            </td>
          </tr>
          <tr>
            <td>Megha</td>
            <td>19</td>
            <td>Female</td>
            <td>Female</td>
            <td>Female</td>
            <td>Female</td>
            <td>Female</td>
            <td>Female</td>
            <td>Female</td>
            <td>Female</td>
          </tr>
          <tr>
            <td>Subham</td>
            <td>25</td>
            <td>Male</td>
            <td>Male</td>
            <td>Male</td>
            <td>Male</td>
            <td>Male</td>
            <td>Male</td>
            <td>Male</td>
            <td>Male</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
