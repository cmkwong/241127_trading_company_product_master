import InputSelection from './InputSelection';
import styles from './ProductTable.module.css';
import TextCell from './TextCell';

const ProductTable = () => {
  return (
    <div className={styles['container']}>
      <table>
        <tr className={styles['header']}>
          <th className={styles['productName']}>Product Name</th>
          <th>SKU</th>
          <th>Category</th>
          <th>Collections</th>
          <th>Tags</th>
          <th>Images</th>
          <th>Videos</th>
          <th>Description</th>
          <th>Suppliers</th>
        </tr>
        <tr>
          <TextCell></TextCell>
          <td>
            <TextCell></TextCell>
          </td>
          <td>
            <TextCell></TextCell>
          </td>
          <td>
            <InputSelection></InputSelection>
          </td>
          <td>Male</td>
          <td>Male</td>
          <td>Male</td>
          <td>Male</td>
          <td>Male</td>
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
        </tr>
      </table>
    </div>
  );
};

export default ProductTable;
