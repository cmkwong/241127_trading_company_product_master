export const mockProduct_template = {
  id: `new-product-${Date.now()}`,
  productId: `PID-${Date.now().toString(36)}`,
  iconUrl: '',
  productName: [{ id: `product-name-${Date.now()}`, name: '', type: 1 }],
  category: [],
  customizations: [
    { id: `customization-${Date.now()}`, code: '', remark: '', images: [] },
  ],
  productLinks: [
    {
      id: `product-link-${Date.now()}`,
      link: '',
      images: [],
      remark: '',
      date: new Date().toISOString().split('T')[0],
    },
  ],
  alibabaIds: [{ id: `alibaba-ids-${Date.now()}`, value: '', link: '' }],
  packings: [
    {
      id: `packings-${Date.now()}`,
      L: 0,
      W: 0,
      H: 0,
      qty: 1,
      kg: 0,
      type: 1,
    },
  ],
  certificates: [
    { id: `certificates-${Date.now()}`, type: 1, files: [], remark: '' },
  ],
  remark: '',
};

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
    customizations: [
      {
        id: 1,
        name: 'custom package',
        code: 'S000325',
        remark: 'Testing',
        images: [
          '\\pet_product_images\\202510282119\\display\\display_202510282117_06_800x800.jpg',
          '\\pet_product_images\\202510282119\\display\\display_202510282117_02_800x800.jpg',
          '\\pet_product_images\\202510282119\\display\\display_202510282117_03_800x800.jpg',
        ],
      },
      {
        id: 2,
        name: 'custom labels',
        code: '',
        remark: 'Testing2',
        images: [
          '\\pet_product_images\\202510282119\\display\\display_202510282117_03_800x800.jpg',
        ],
      },
    ],
    productLinks: [
      {
        id: 1,
        link: 'http://yahoo.com.hk',
        images: ['\\pet_product_images\\202511032115\\display\\Main_01.jpg'],
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
