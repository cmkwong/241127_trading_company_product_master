import { useState } from 'react';
import { useContext, createContext } from 'react';

const ProductDataRowContext = createContext(null, () => {});

export const ProductDataRowProvider = ({ children, data }) => {
  return (
    <ProductDataRowContext.Provider value={{ ...data }}>
      {children}
    </ProductDataRowContext.Provider>
  );
};

export default ProductDataRowContext;

export const useProductDataRowContext = () => {
  return useContext(ProductDataRowContext);
};
