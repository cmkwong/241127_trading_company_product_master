import zoomIcon from '../assets/zoom.svg';
import { useState } from 'react';
import styles from './PricePreview.module.css';

import { makeComplexId } from '../utils/string';
import PriceUpdate from './PriceUpdate';
import Icon from './common/Icon';

const PricePreviewRow = (props) => {
  let { row, varient } = props;

  return (
    <div className={styles.datarow}>
      <Icon src={row.img} width={'30px'} />
      <div>
        <p>{varient.map((name) => row.varientValue[name]).join(' / ')}</p>
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

const PricePreview = () => {
  let _varientData = {
    product_id: '1Y#23#@1%#23',
    product_name:
      'Autumn And Winter Christmas Festive Series Dog Clothes Cat Dress',
    sku: 'SDW3287623-UI',
    description: '',
    // Pet Supplies>>Pet Products>>Pet Toys>>Cat Trees & Scratcher
    category: [
      { id: 32, name: 'Pet Supplies' },
      { id: 22, name: 'Pet Products' },
      { id: 12, name: 'Pet Toys' },
      { id: 14, name: 'Cat Trees & Scratcher' },
    ],
    collections: [
      { id: 2, name: 'Pet Brush' },
      { id: 5, name: 'Head Wears' },
      { id: null, name: 'Pet Shower' },
    ],
    tags: [
      { id: 2, name: 'Pet Brush' },
      { id: 5, name: 'Head Wears' },
      { id: null, name: 'Pet Shower' },
      { id: null, name: 'Clipper' },
    ],
    images: [{ id: 23 }],
    varient: ['lock', 'color'],
    prices: [
      {
        varientValue: { lock: 'front', color: 'red' },
        currency: 'HKD',
        img: '/products/1/785027093526.jpg',
        price: 125,
        stock: 1254,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
      {
        varientValue: { lock: 'front', color: 'yellow' },
        currency: 'HKD',
        img: '/products/1/785027093526.jpg',
        price: 137,
        stock: 4281,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
      {
        varientValue: { lock: 'front', color: 'blue' },
        currency: 'HKD',
        img: '',
        price: 125,
        stock: 1254,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
      {
        varientValue: { lock: 'back', color: 'red' },
        currency: 'HKD',
        img: '',
        price: 137,
        stock: 4281,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
      {
        varientValue: { lock: 'back', color: 'yellow' },
        currency: 'HKD',
        img: '',
        price: 125,
        stock: 1254,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
      {
        varientValue: { lock: 'back', color: 'blue' },
        currency: 'HKD',
        img: '',
        price: 137,
        stock: 4281,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
    ],
  };

  const [popWindow, setPopWindow] = useState(false);
  const [varientData, setVarientData] = useState(_varientData);

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <p></p>
          <p>Varient</p>
          <p>Price</p>
          <p>Supplier</p>
        </div>
        {varientData.prices.map((row) => (
          <PricePreviewRow
            key={makeComplexId(8)}
            row={row}
            varient={varientData.varient}
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
        <PriceUpdate varientData={varientData} setPopWindow={setPopWindow} />
      )}
    </div>
  );
};

export default PricePreview;
