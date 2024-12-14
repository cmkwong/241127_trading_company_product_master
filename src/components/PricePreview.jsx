import zoomIcon from '../assets/zoom.svg';
import { useState } from 'react';
import styles from './PricePreview.module.css';

import { makeComplexId } from '../utils/string';
import PriceUpdate from './PriceUpdate';
import Icon from './common/Icon';
import { useProductData } from '../store/ProductDataContext';

const PricePreviewRow = (props) => {
  let { row, varients } = props;

  return (
    <div className={styles.datarow}>
      <Icon src={row.img} width={'30px'} />
      <div>
        <p>
          {varients
            .map((varient) => row.varientValue[varient.name])
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
  let { productData } = props;

  const [popWindow, setPopWindow] = useState(false);

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <p></p>
          <p>Varient</p>
          <p>Price</p>
          <p>Supplier</p>
        </div>
        {productData.prices.map((row) => (
          <PricePreviewRow
            key={makeComplexId(8)}
            row={row}
            varients={productData.varients}
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
        <PriceUpdate productData={productData} setPopWindow={setPopWindow} />
      )}
    </div>
  );
};

export default PricePreview;
