import { useReducer, useState } from 'react';
import { useContext, createContext } from 'react';

const _labels = [
  { id: 1, label_type: 'collections', name: 'pet brush' },
  { id: 2, label_type: 'collections', name: 'pet mats' },
  { id: 3, label_type: 'collections', name: 'clean up' },
  { id: 4, label_type: 'collections', name: 'clipper' },
  { id: 5, label_type: 'collections', name: 'shower' },
  { id: 6, label_type: 'collections', name: 'headwears' },
  { id: 7, label_type: 'collections', name: 'tops' },
  { id: 8, label_type: 'tags', name: 'Pet Bowl' },
  { id: 9, label_type: 'tags', name: 'Drinking Tools' },
  { id: 10, label_type: 'tags', name: 'Feeding Tools' },
  { id: 11, label_type: 'tags', name: 'Glasses' },
  { id: 12, label_type: 'tags', name: 'collar' },
  { id: 13, label_type: 'tags', name: 'leash' },
];

const _allMedia = [
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

const _varients = [
  { id: 1, name: 'color' },
  { id: 2, name: 'size' },
  { id: 3, name: 'lock' },
  { id: 4, name: 'gender' },
];

const _varientValues = [
  { id: 1, name: 'red' },
  { id: 2, name: 'green' },
  { id: 3, name: 'orange' },
  { id: 4, name: 'front' },
  { id: 5, name: 'back' },
  { id: 6, name: 'small' },
  { id: 7, name: 'middle' },
  { id: 8, name: 'large' },
];

let _productDatas = [
  {
    product_id: '1Y#23#@1%#12',
    product_name:
      'Autumn And Winter Christmas Festive Series Dog Clothes Cat Dress',
    sku: 'SDW3287612-UI',
    // Pet Supplies >> Pet Products>>Pet Toys >> Cat Trees & Scratcher
    category: [
      { id: 32, level: 1, name: 'Pet Supplies' },
      { id: 22, level: 0, name: 'Pet Products' },
      { id: 14, level: 3, name: 'Cat Trees & Scratcher' },
      { id: 33, level: 2, name: 'Pet Toys' },
    ],
    labels: [5, 7, 12, 13],
    media: [8, 9],
    description: '',
    varient_level: [
      { varient_id: 3, name: 'lock', level: 0 },
      { varient_id: 1, name: 'color', level: 1 },
    ],
    varient_value: [
      { varient_value_id: 1, varient_id: 1 },
      { varient_value_id: 2, varient_id: 1 },
      { varient_value_id: 3, varient_id: 1 },
      { varient_value_id: 4, varient_id: 3 },
      { varient_value_id: 5, varient_id: 3 },
    ],
    prices: [
      {
        price_id: 1,
        varient_value_ids: [1, 4],
        currency: 'HKD',
        img: '/products/785027093526.jpg',
        price: 125,
        stock: 1254,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
      {
        price_id: 2,
        varient_value_ids: [1, 5],
        currency: 'HKD',
        img: '',
        price: 125,
        stock: 1254,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
      {
        price_id: 3,
        varient_value_ids: [2, 4],
        currency: 'HKD',
        img: '',
        price: 137,
        stock: 4281,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
      {
        price_id: 4,
        varient_value_ids: [2, 5],
        currency: 'HKD',
        img: '',
        price: 125,
        stock: 1254,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
      {
        price_id: 5,
        varient_value_ids: [3, 4],
        currency: 'HKD',
        img: '',
        price: 137,
        stock: 4281,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
      {
        price_id: 6,
        varient_value_ids: [3, 5],
        currency: 'HKD',
        img: '/products/1173534224478.jpg',
        price: 137,
        stock: 4281,
        supplier: 'Sink Lin Trading Company',
        link: 'https://www.google.com/search?q=array+filter&sca_esv=3837dfeb0f430c76&sxsrf=ADLYWIKspdky7njPNkdKKwycnaSkErCxYQ%3A1732965347900&ei=4_NKZ7bJNrvc1e8PkYDA4Ak&ved=0ahUKEwj2xuD_9oOKAxU7bvUHHREAEJwQ4dUDCBA&uact=5&oq=array+filter&gs_lp=Egxnd3Mtd2l6LXNlcnAiDGFycmF5IGZpbHRlcjIGEAAYBxgeMggQABiABBjLATIFEAAYgAQyBRAAGIAEMgYQABgHGB4yBRAAGIAEMggQABiABBjLATIIEAAYgAQYywEyCBAAGIAEGMsBMggQABiABBjLAUiSElDeCFjJEHABeAGQAQCYAV2gAc4DqgEBNrgBA8gBAPgBAZgCBqAClAPCAgoQABiwAxjWBBhHmAMAiAYBkAYKkgcBNqAHuBQ&sclient=gws-wiz-serp',
      },
    ],
  },
];

const ProductDatasContext = createContext(null);

export const ProductDatasProvider = ({ children }) => {
  const [labels, setLabels] = useState(_labels);
  const [allMedia, setAllMedia] = useState(_allMedia);
  // const [varients, setVarients] = useState(_varients);
  const [varientValues, setVarientValues] = useState(_varientValues);

  // remove the duplicated prices
  const removeDuplicatedPrices = (prices) => {
    const duplicatedRows = prices
      .map((p, i) => {
        const valueIdsStr = JSON.stringify(
          p.varient_value_ids.sort((a, b) => a - b)
        );
        return prices
          .map((pp, ii) => {
            if (i >= ii) return;
            const valueIdsStr_compared = JSON.stringify(
              pp.varient_value_ids.sort((a, b) => a - b)
            );
            if (valueIdsStr === valueIdsStr_compared) {
              return pp.price_id;
            }
          })
          .filter((el) => el);
      })
      .filter((el) => el)
      .reduce((acc, curr) => acc.concat(curr), []);
    return prices.filter((el) => !duplicatedRows.includes(el.price_id));
  };

  // product data reducer
  const reducer = (productDatas, action) => {
    const { product_id, payload } = action;
    // getting which of target row
    const row = productDatas
      .map((el, i) => {
        if (el.product_id === product_id) {
          return i;
        }
      })
      .filter((el) => el !== undefined)[0];
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
        const { label_type, name } = payload;
        // check if value if exist in master
        const found = labels.filter(
          (el) =>
            el.name.toLowerCase() === name.toLowerCase() &&
            el.label_type === label_type
        );
        let required_id;
        if (found.length > 0) {
          // old label
          required_id = found[0].id;
        } else {
          // new label
          required_id = [...labels].sort((a, b) => b.id - a.id)[0].id + 1;
          setLabels((prv) => [...prv, { id: required_id, label_type, name }]);
        }
        // update the selected label
        new_productDatas[row]['labels'] = [
          ...new_productDatas[row]['labels'],
          required_id,
        ];
        return new_productDatas;
      }
      case 'checkSelectedLabels': {
        const { id } = payload;
        new_productDatas[row]['labels'] = [
          ...new_productDatas[row]['labels'],
          id,
        ];
        return new_productDatas;
      }
      case 'uncheckSelectedLabels': {
        const { id } = payload;
        new_productDatas[row]['labels'] = new_productDatas[row][
          'labels'
        ].filter((el) => el !== id);
        return new_productDatas;
      }
      case 'addProductVarient': {
        const { name, level } = payload;
        // get the required id
        const required_id =
          [...new_productDatas[row]['varient_level']].sort(
            (a, b) => b.varient_id - a.varient_id
          )[0].varient_id + 1;
        new_productDatas[row]['varient_level'] = [
          ...new_productDatas[row]['varient_level'],
          { varient_id: required_id, name: name, level: level },
        ];
        return new_productDatas;
      }
      case 'updateProductVarient': {
        const { id, name, level } = payload;
        // find the required row
        const varient_row = [...new_productDatas[row]['varient_level']]
          .map((el, i) => {
            if (el.varient_id === id) {
              return i;
            }
          })
          .filter((el) => el !== undefined)[0];
        // getting the original level and check if level being changed
        const original_level =
          new_productDatas[row]['varient_level'][varient_row]['level'];
        // new level is larger
        if (level > original_level) {
          new_productDatas[row]['varient_level'][varient_row] =
            new_productDatas[row]['varient_level'][varient_row].map((el) => {
              if (el.level > original_level && el.level <= level) {
                return { ...el, level: el.level - 1 };
              } else {
                return el;
              }
            });
          // new level is smaller
        } else if (level < original_level) {
          new_productDatas[row]['varient_level'][varient_row] =
            new_productDatas[row]['varient_level'][varient_row].map((el) => {
              if (el.level < original_level && el.level >= level) {
                return { ...el, level: el.level + 1 };
              } else {
                return el;
              }
            });
        }
        // overwrite the data
        new_productDatas[row]['varient_level'][varient_row] = {
          varient_id: id,
          name,
          level,
        };
        return new_productDatas;
      }
      // update the product varient name and its varient value
      case 'addProductVarientValue': {
        const { varient_id, varientValue } = payload;
        // find if exist in varient master
        const found = varientValues.filter(
          (el) => el.name.toLowerCase() === varientValue.toLowerCase()
        );
        let required_id;
        // if existed, get the varient id
        if (found.length > 0) {
          required_id = found[0]['id'];
        } else {
          // not found then add value into master
          required_id =
            [...varientValues].sort((a, b) => b.id - a.id)[0].id + 1;
          setVarientValues((prv) => [
            ...prv,
            { id: required_id, name: varientValue },
          ]);
        }
        new_productDatas[row]['varient_value'] = [
          ...new_productDatas[row]['varient_value'],
          { varient_value_id: required_id, varient_id },
        ];
        return new_productDatas;
      }
      case 'checkProductVarientValue': {
        const { varient_id, varient_value_id } = payload;
        new_productDatas[row]['varient_value'] = [
          ...new_productDatas[row]['varient_value'],
          { varient_value_id, varient_id },
        ];
        return new_productDatas;
      }
      case 'uncheckProductVarientValue': {
        const { varient_id, varient_value_id } = payload;
        new_productDatas[row]['varient_value'] = new_productDatas[row][
          'varient_value'
        ].filter(
          (el) =>
            el.varient_id !== varient_id &&
            el.varient_value_id !== varient_value_id
        );
        return new_productDatas;
      }
      case 'addSelectedMedia': {
        const { media_type, filename } = payload;
        // find in master
        const found = allMedia.filter(
          (el) => el.filename === filename && el.media_type === media_type
        );
        let required_id;
        if (found.length > 0) {
          // old filename
          required_id = found[0].id;
        } else {
          // new filename
          required_id = [...allMedia].sort((a, b) => b.id - a.id)[0].id + 1;
          setAllMedia((prv) => [
            ...prv,
            { id: required_id, media_type, filename },
          ]);
        }
        // update the selected filename
        new_productDatas[row]['media'] = [
          ...new_productDatas[row]['media'],
          required_id,
        ];
        return new_productDatas;
      }
      case 'checkSelectedMedia': {
        const { id } = payload;
        new_productDatas[row]['media'] = [
          ...new_productDatas[row]['media'],
          id,
        ];
        return new_productDatas;
      }
      case 'uncheckSelectedMedia': {
        const { id } = payload;
        new_productDatas[row]['media'] = new_productDatas[row]['media'].filter(
          (el) => el !== id
        );
        return new_productDatas;
      }
      case 'updateDescription': {
        const { txt } = payload;
        new_productDatas[row]['description'] = txt;
        return new_productDatas;
      }
      case 'updatePriceRow': {
        const { id, new_row_data } = payload;
        // finding the changed row
        const price_row = new_productDatas[row]['prices']
          .map((el, i) => {
            if (el.price_id === id) {
              return i;
            }
          })
          .filter((el) => el !== undefined)[0];
        // required row data
        let required_row = new_productDatas[row]['prices'].filter(
          (el) => el.price_id === id
        )[0];
        const updated_row = { ...required_row, ...new_row_data };
        // re-assign data
        new_productDatas[row]['prices'][price_row] = updated_row;
        return new_productDatas;
      }
    }
  };
  const [productDatas, dispatchProductDatas] = useReducer(
    reducer,
    _productDatas
  );

  return (
    <ProductDatasContext.Provider
      value={{
        productDatas,
        dispatchProductDatas,
        labels,
        allMedia,
        // varients,
        varientValues,
      }}
    >
      {children}
    </ProductDatasContext.Provider>
  );
};

export const useProductDatasContext = () => {
  return useContext(ProductDatasContext);
};

export default ProductDatasContext;
