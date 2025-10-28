export const mockProductNameType = [
  { id: 1, name: 'Alibaba' },
  { id: 2, name: '1688' },
  { id: 3, name: 'Amazon' },
  { id: 4, name: 'Internal' },
];

export const mockCategory = [
  { id: 1, name: 'Aquatic Tank' },
  { id: 2, name: 'Aquatic Cleaning Supplies' },
  { id: 3, name: 'Aquatic Pump Accessories' },
];

export const mockSupplierType = [
  { id: 1, name: 'Manufacturer' },
  { id: 2, name: 'Printing' },
  { id: 3, name: 'Package' },
];

export const mockPackType = [
  { id: 1, name: 'OPP' },
  { id: 2, name: 'Carton' },
];

export const mockCertType = [
  { id: 1, name: 'MSDS' },
  { id: 2, name: 'RoHS' },
];

// // Map category IDs to category names
// export const getCategoryLabels = (categoryIds) => {
//   return categoryIds.map((categoryId) => {
//     const category = mockCategory.find((cat) => cat.id === categoryId);
//     return category ? category.name : `Unknown (${categoryId})`;
//   });
// };

// // Map product name type IDs to product name type labels
// export const getProductNameTypeLabels = (typeIds) => {
//   return typeIds.map((typeId) => {
//     const productType = mockProductNameType.find((type) => type.id === typeId);
//     return productType ? productType.name : `Unknown (${typeId})`;
//   });
// };

// // Map supplier type IDs to supplier type labels
// export const getSupplierTypeLabels = (typeIds) => {
//   return typeIds.map((typeId) => {
//     const supplierType = mockSupplierType.find((type) => type.id === typeId);
//     return supplierType ? supplierType.name : `Unknown (${typeId})`;
//   });
// };

// // Map pack type IDs to pack type labels
// export const getPackTypeLabels = (typeIds) => {
//   return typeIds.map((typeId) => {
//     const packType = mockPackType.find((type) => type.id === typeId);
//     return packType ? packType.name : `Unknown (${typeId})`;
//   });
// };

// // Map certificate type IDs to certificate type labels
// export const getCertTypeLabels = (typeIds) => {
//   return typeIds.map((typeId) => {
//     const certType = mockCertType.find((type) => type.id === typeId);
//     return certType ? certType.name : `Unknown (${typeId})`;
//   });
// };

// Generic function to get labels from any lookup array
export const getLabelsFromLookup = (ids, lookupArray) => {
  return ids.map((id) => {
    const item = lookupArray.find((lookupItem) => lookupItem.id === id);
    return item ? item.name : `Unknown (${id})`;
  });
};

// Get a single label from any lookup array
export const getLabelFromLookup = (id, lookupArray) => {
  const item = lookupArray.find((lookupItem) => lookupItem.id === id);
  return item ? item.name : `Unknown (${id})`;
};
