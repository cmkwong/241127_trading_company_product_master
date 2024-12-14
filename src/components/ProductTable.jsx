import { useState } from 'react';
import styles from './ProductTable.module.css';
import ProductTableRow from './ProductTableRow';

let _collections = [
  { id: 1, label: 'pet brush' },
  { id: 2, label: 'pet mats' },
  { id: 3, label: 'clean up' },
  { id: 4, label: 'clipper' },
  { id: 5, label: 'shower' },
  { id: 6, label: 'headwears' },
  { id: 7, label: 'tops' },
  { id: 8, label: 'Pet Bowl' },
  { id: 9, label: 'Drinking Tools' },
  { id: 10, label: 'Feeding Tools' },
  { id: 11, label: 'Glasses' },
  { id: 12, label: 'collar' },
  { id: 13, label: 'leash' },
];

let _tags = [
  { id: 1, label: 'pet brush' },
  { id: 2, label: 'pet mats' },
  { id: 3, label: 'clean up' },
  { id: 4, label: 'clipper' },
  { id: 5, label: 'shower' },
  { id: 6, label: 'headwears' },
  { id: 7, label: 'tops' },
  { id: 8, label: 'Pet Bowl' },
  { id: 9, label: 'Drinking Tools' },
  { id: 10, label: 'Feeding Tools' },
  { id: 11, label: 'Glasses' },
  { id: 12, label: 'collar' },
  { id: 13, label: 'leash' },
];

let _productDatas = [
  {
    product_id: '1Y#23#@1%#23',
    product_name:
      'Autumn And Winter Christmas Festive Series Dog Clothes Cat Dress',
    sku: 'SDW3287623-UI',
    // Pet Supplies >> Pet Products>>Pet Toys >> Cat Trees & Scratcher
    category: [
      { id: 32, name: 'Pet Supplies' },
      { id: 22, name: 'Pet Products' },
      { id: null, name: 'Pet Toys' },
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
    images: [
      { id: 23, filename: 'i2218273.jpg' },
      { id: null, filename: 'asdwwuquw.png' },
    ],
    videos: [
      { id: 52, filename: 'browl.mp4' },
      { id: null, filename: 'pet.mp4' },
      { id: 86, filename: 'cat.mp4' },
    ],
    description: '',
    varients: [
      {
        id: 42,
        name: 'lock',
        value: [
          { id: 1, value: 'back' },
          { id: 2, value: 'front' },
        ],
      },
      {
        id: null,
        name: 'color',
        value: [
          { id: null, value: 'red' },
          { id: 2, value: 'yellow' },
          { id: 3, value: 'blue' },
        ],
      },
    ],
    prices: [
      {
        varientValue: { lock: 'front', color: 'red' },
        currency: 'HKD',
        img: '/products/785027093526.jpg',
        price: 125,
        stock: 1254,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
      {
        varientValue: { lock: 'front', color: 'yellow' },
        currency: 'HKD',
        img: '/products/785027093526.jpg',
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
  },
];

const ProductTable = () => {
  const [productDatas, setProductDatas] = useState(_productDatas);
  const [collections, setCollections] = useState(_collections);
  const [tags, setTags] = useState(_tags);
  return (
    <div className={styles['container']}>
      <div className={styles['header']}>
        <div>Product Name</div>
        <div>SKU</div>
        <div>Category</div>
        <div>Collections</div>
        <div>Tags</div>
        <div>Images</div>
        <div>Videos</div>
        <div>Description</div>
        <div>Varients</div>
        <div>Prices</div>
      </div>
      {productDatas.map((productData, i) => (
        <div key={i} className={styles.row}>
          <ProductTableRow
            rowId={i}
            productData={productData}
            collections={collections}
            setCollections={setCollections}
            tags={tags}
            setTags={setTags}
            setProductDatas={setProductDatas}
          />
        </div>
      ))}
    </div>
  );
};

export default ProductTable;
