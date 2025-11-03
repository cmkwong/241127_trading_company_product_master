export const mockProducts = [
  {
    id: '1',
    productId: '202510271831',
    iconUrl: 'https://via.placeholder.com/50',
    productName: [
      { id: 1, name: 'Elizabeth Collar Pet Grooming Shield', type: 1 },
      { id: 2, name: '狗仔花花頸圈', type: 2 },
    ],
    category: [1],
    customization: [
      {
        id: 1,
        name: 'custom package',
        code: 'S000325',
        remark: 'Testing',
        images: [],
      },
      {
        id: 2,
        name: 'custom labels',
        code: '',
        remark: 'Testing2',
        images: [],
      },
    ],
    productLinks: [
      {
        id: 1,
        link: 'http://yahoo.com.hk',
        images: [],
        remark: '',
        date: '2025-10-27',
      },
      {
        id: 2,
        link: 'www.google.com',
        images: [],
        remark: '',
        date: '2025-10-27',
      },
    ],
    alibabaIds: [
      { id: 1, value: '10215135354354', link: 'http://yahoo.com.hk' },
      { id: 2, value: '48412151513215', link: 'www.google.com' },
    ],
    packings: [
      { id: 1, L: 12, W: 52, H: 25, qty: 1, kg: 5, type: 1 },
      { id: 2, L: 24, W: 52, H: 50, qty: 10, kg: 10, type: 2 },
    ],
    certificates: [
      { id: 1, type: 1, files: [], remark: 'MSDS remark' },
      { id: 2, type: 2, files: [], remark: 'RoHS remark' },
    ],
    remark: '',
  },
];
