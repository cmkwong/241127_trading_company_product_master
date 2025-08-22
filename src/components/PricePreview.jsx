import zoomIcon from '../assets/zoom.svg';
import { useEffect, useState } from 'react';
import styles from './PricePreview.module.css';

import { makeComplexId } from '../utils/string';
import PriceUpdate from './PriceUpdate';
import Icon from './common/Icon';
import { useProductDatasContext } from '../store/ProductDatasContext';
import { useProductDataRowContext } from '../store/ProductDataRowContext';

const PricePreviewRow = (props) => {
  let { row, varient_rows } = props;

  return (
    <div className={styles.datarow}>
      <Icon src={row.img} width={'30px'} />
      <div>
        <p>
          {varient_rows
            .sort((a, b) => a.level - b.level)
            .map((v) => v.value)
            .join(' / ')}
        </p>
      </div>
      <div>
        <p>{`${row.currency} ${row.price}`}</p>
      </div>
      <div>
        <a href={row.link}>{row.supplier}</a>
      </div>
    </div>
  );
};

const PricePreview = (props) => {
  const { prices, varient_level, varient_value } = useProductDataRowContext();
  const { varientValues } = useProductDatasContext();

  const [popWindow, setPopWindow] = useState(false);

  // preview data refactoring
  const previewDataRefactoring = () => {
    const refactored_varients = prices.map((price) => {
      const price_id = price.price_id;
      const varient_rows = price.varient_value_keys.map((varient_value_id) => {
        // find the varient value
        const required_varient_value = varient_value.filter(
          (vv) => vv.key === varient_value_id
        )[0];
        // find the varient level
        const required_varient_level = Object.values(varient_level).filter(
          (vl) => vl.varient_id === required_varient_value.varient_id
        )[0]['level'];
        // find the varient label
        const required_varient_name = Object.values(varient_level).filter(
          (v) => v.varient_id === required_varient_value.varient_id
        )[0]['name'];
        // find the varient value label
        const required_varient_value_name = varientValues.filter(
          (varientValue) =>
            varientValue.id === required_varient_value.varient_value_id
        )[0]['name'];
        return {
          level: required_varient_level,
          varient: required_varient_name, // varient label
          value: required_varient_value_name, // varient value label
        };
      });
      return {
        ...price,
        varient_rows: varient_rows.sort((a, b) => a.level - b.level),
      };
    });
    return refactored_varients.sort((a, b) =>
      // sorting with same level of varient value
      a.varient_rows[0].value.localeCompare(b.varient_rows[0].value)
    );
  };

  // useEffect(() => {
  //   const refactored_varients = productData.prices.map((price) => {
  //     const varient_rows = price.varient_value_keys.map((varient_value_id) => {
  //       // find the varient value
  //       const required_varient_value = productData.varient_value.filter(
  //         (vv) => vv.varient_value_id === varient_value_id
  //       )[0];
  //       // find the varient level
  //       const required_varient_level = productData.varient_level.filter(
  //         (vl) => vl.varient_id === required_varient_value.varient_id
  //       )[0]['level'];
  //       // find the varient label
  //       const required_varient_name = varients.filter(
  //         (v) => v.id === required_varient_value.varient_id
  //       )[0]['name'];
  //       // find the varient value label
  //       const required_varient_value_name = varientValues.filter(
  //         (varientValue) =>
  //           varientValue.id === required_varient_value.varient_value_id
  //       )[0]['name'];
  //       return {
  //         level: required_varient_level,
  //         varient: required_varient_name,
  //         value: required_varient_value_name,
  //       };
  //     });
  //     return {
  //       ...price,
  //       varient_rows: varient_rows.sort((a, b) => a.level - b.level),
  //     };
  //   });
  //   setProductData_prices(
  //     refactored_varients.sort((a, b) =>
  //       // sorting with same level of varient value
  //       a.varient_rows[0].value.localeCompare(b.varient_rows[0].value)
  //     )
  //   );
  // }, [productData, varients, varientValues]);

  // const [productData_prices, setProductData_prices] = useState(
  //   previewDataRefactoring()
  // );

  let productData_prices = previewDataRefactoring();

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <p></p>
          <p>Varient</p>
          <p>Price</p>
          <p>Supplier</p>
        </div>
        {productData_prices.map((row) => (
          <PricePreviewRow
            key={makeComplexId(8)}
            row={row}
            varient_rows={row.varient_rows}
          />
        ))}
        <img
          onClick={() => setPopWindow(true)}
          className={styles.zoom}
          src={zoomIcon}
          alt="Zoom"
        />
      </div>
      {popWindow && (
        <PriceUpdate
          productData_prices={productData_prices}
          setPopWindow={setPopWindow}
        />
      )}
    </div>
  );
};

export default PricePreview;
