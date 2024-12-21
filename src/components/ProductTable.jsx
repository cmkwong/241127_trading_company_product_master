import { useReducer, useState } from 'react';
import styles from './ProductTable.module.css';
import ProductTableRow from './ProductTableRow';

let _labels = [
  { id: 1, label_type: 'collections', label: 'pet brush' },
  { id: 2, label_type: 'collections', label: 'pet mats' },
  { id: 3, label_type: 'collections', label: 'clean up' },
  { id: 4, label_type: 'collections', label: 'clipper' },
  { id: 5, label_type: 'collections', label: 'shower' },
  { id: 6, label_type: 'collections', label: 'headwears' },
  { id: 7, label_type: 'collections', label: 'tops' },
  { id: 8, label_type: 'tags', label: 'Pet Bowl' },
  { id: 9, label_type: 'tags', label: 'Drinking Tools' },
  { id: 10, label_type: 'tags', label: 'Feeding Tools' },
  { id: 11, label_type: 'tags', label: 'Glasses' },
  { id: 12, label_type: 'tags', label: 'collar' },
  { id: 13, label_type: 'tags', label: 'leash' },
];

let _allMedia = [
  { id: 1, media_type: 'image', filename: '785027093526.jpg' },
  { id: 2, media_type: 'image', filename: '1173534224478.jpg' },
  { id: 3, media_type: 'image', filename: '4051485751744.jpg' },
  {
    id: 4,
    media_type: 'image',
    filename:
      'Professional-Cat-Nail-Clippers-for-Small-Cat-Dog-Stainless-Steel-Puppy-Claws-Cutter-Pet-Nail-Grooming.jpg_2d7e0c35-8b87-4da8-a2b2-927e7196d4df.jpg',
  },
  {
    id: 5,
    media_type: 'image',
    filename:
      'Professional-Cat-Nail-Clippers-for-Small-Cat-Dog-Stainless-Steel-Puppy-Claws-Cutter-Pet-Nail-Grooming.jpg_067b8506-730b-4ca8-844d-0a24707668ce.jpg',
  },
  {
    id: 6,
    media_type: 'image',
    filename:
      'Professional-Cat-Nail-Clippers-for-Small-Cat-Dog-Stainless-Steel-Puppy-Claws-Cutter-Pet-Nail-Grooming.jpg_ae568cb2-57d7-46b6-b930-fa275df88101.jpg',
  },
  {
    id: 7,
    media_type: 'image',
    filename:
      'Professional-Cat-Nail-Clippers-for-Small-Cat-Dog-Stainless-Steel-Puppy-Claws-Cutter-Pet-Nail-Grooming.jpg_b441dd2b-e07a-4040-9f2a-6d4662b8555f.jpg',
  },
  {
    id: 8,
    media_type: 'image',
    filename:
      'Professional-Cat-Nail-Clippers-for-Small-Cat-Dog-Stainless-Steel-Puppy-Claws-Cutter-Pet-Nail-Grooming.jpg_c9a088d9-de78-42e1-b322-e7d945ffb398.jpg',
  },
  {
    id: 9,
    media_type: 'image',
    filename:
      'Professional-Cat-Nail-Clippers-for-Small-Cat-Dog-Stainless-Steel-Puppy-Claws-Cutter-Pet-Nail-Grooming.jpg_e028c09d-8170-41ad-97ba-04733e1d9a75.jpg',
  },
  {
    id: 10,
    media_type: 'image',
    filename:
      'S0e8245c8df18465f89a5df7e80477610u.jpg_640x640.jpg_1556fe2a-83da-4052-abe1-aaae0423b5f1.jpg',
  },
  {
    id: 11,
    media_type: 'image',
    filename:
      'S0fd1722ca1f84edabe34166d35dde1977.jpg_640x640.jpg_5ad89cc1-e722-4910-b0aa-c170ce6f3394.jpg',
  },
  {
    id: 12,
    media_type: 'image',
    filename:
      'S8ef5049b77c3414ab15ea1e504ba97caT.jpg_640x640.jpg_5a6f807b-652a-47f0-b69a-7a54a63d7a5f.jpg',
  },
  {
    id: 13,
    media_type: 'image',
    filename:
      'S505a013920b84dff9e7cf49cdae85e9cF.jpg_640x640.jpg_11fc2fe7-5d33-422c-81f7-3852fd194920.jpg',
  },
  {
    id: 14,
    media_type: 'image',
    filename:
      'Sc2a4b9d89bb94e4ba6edeb33d862498c2.jpg_640x640.jpg_a960ac42-f80f-4b43-9981-530a3b2ec172.jpg',
  },
  {
    id: 15,
    media_type: 'image',
    filename:
      'Sd4b1174caa8a43ee9534c330bfc93159k.jpg_640x640.jpg_9c6f7141-1702-4b27-8133-d1411e0376cd.jpg',
  },
];

let _productDatas = [
  {
    product_id: '1Y#23#@1%#23',
    product_name:
      'Autumn And Winter Christmas Festive Series Dog Clothes Cat Dress',
    sku: 'SDW3287623-UI',
    // Pet Supplies >> Pet Products>>Pet Toys >> Cat Trees & Scratcher
    category: [
      { id: 32, level: 1, name: 'Pet Supplies' },
      { id: 22, level: 0, name: 'Pet Products' },
      { id: 14, level: 3, name: 'Cat Trees & Scratcher' },
      { id: 33, level: 2, name: 'Pet Toys' },
    ],
    labels: [
      { id: 5, label_type: 'collections' },
      { id: 6, label_type: 'collections' },
      { id: 7, label_type: 'collections' },
      { id: 10, label_type: 'tags' },
      { id: 11, label_type: 'tags' },
      { id: 12, label_type: 'tags' },
      { id: 13, label_type: 'tags' },
    ],
    media: [
      {
        id: 11,
        mediaType: 'image',
        filename:
          'S0fd1722ca1f84edabe34166d35dde1977.jpg_640x640.jpg_5ad89cc1-e722-4910-b0aa-c170ce6f3394.jpg',
      },
      { id: 12, mediaType: 'video', filename: 'browl.mp4' },
      { id: 13, mediaType: 'video', filename: 'cat.mp4' },
      { id: null, mediaType: 'image', filename: 'asdwwuquw.png' },
      { id: null, mediaType: 'video', filename: 'pet.mp4' },
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
        img: '/products/1173534224478.jpg',
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
  const [labels, setLabels] = useState(_labels);
  const [allMedia, setAllMedia] = useState(_allMedia);

  const reducer = (productDatas, action) => {
    const { product_id, payload } = action;
    // getting which of target row
    const row = productDatas.map((el, i) => {
      if (el.product_id === product_id) {
        return i;
      }
    })[0];
    let new_productDatas = [...productDatas];
    switch (action.type) {
      case 'updateProductName': {
        const { new_value } = payload;
        new_productDatas[row]['product_name'] = new_value;
        return new_productDatas;
      }
      case 'updateSku': {
        const { new_value } = payload;
        new_productDatas[row]['sku'] = new_value;
        return new_productDatas;
      }
      case 'addCategory': {
        const { new_category } = payload;
        new_productDatas[row]['category'] = new_category;
        return new_productDatas;
      }
      case 'addSelectedLabels': {
        const { label_type, label } = payload;
        // find in master
        const found = labels.filter(
          (el) => el.label === label && el.label_type === label_type
        );
        let required_id;
        if (found.length > 0) {
          // old label
          required_id = found[0].id;
        } else {
          // new label
          required_id = [...labels].sort((a, b) => b.id - a.id)[0].id + 1;
          setLabels((prv) => [...prv, { id: required_id, label_type, label }]);
        }
        // update the selected label
        new_productDatas[row]['labels'] = [
          ...new_productDatas[row]['labels'],
          { id: required_id, label_type },
        ];
        return new_productDatas;
      }
      case 'checkSelectedLabels': {
        const { label_type, id } = payload;
        new_productDatas[row]['labels'] = [
          ...new_productDatas[row]['labels'],
          { id: id, label_type: label_type },
        ];
        return new_productDatas;
      }
      case 'uncheckSelectedLabels': {
        const { label_type, id } = payload;
        new_productDatas[row]['labels'] = new_productDatas[row][
          'labels'
        ].filter((el) => el.id !== id);
        return new_productDatas;
      }
    }
  };
  const [productDatas, dispatchProductDatas] = useReducer(
    reducer,
    _productDatas
  );

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
            labels={labels}
            allMedia={allMedia}
            dispatchProductDatas={dispatchProductDatas}
          />
        </div>
      ))}
    </div>
  );
};

export default ProductTable;
