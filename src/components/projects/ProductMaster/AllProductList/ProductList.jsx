import styles from './Main_AllProductList.module.css';
import ProductItem from './ProductItem';
import NoResults from './NoResults';

const ProductList = ({ products, selectedProductId, onProductSelect }) => {
  return (
    <div className={styles.productList}>
      {products.length > 0 ? (
        products.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            isSelected={selectedProductId === product.id}
            onClick={onProductSelect}
          />
        ))
      ) : (
        <NoResults />
      )}
    </div>
  );
};

export default ProductList;
