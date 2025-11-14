// Helper function to generate formatted timestamp in yyyymmddhhmmss format
const getFormattedTimestamp = (secondNeed = false) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  if (!secondNeed) {
    return `${year}${month}${day}${hours}${minutes}`;
  } else {
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
};

export const mockProduct_template = {
  id: `new-product-${getFormattedTimestamp()}`,
  productId: `${getFormattedTimestamp(true)}`,
  iconUrl: '',
  productNames: [
    { id: `product-name-${getFormattedTimestamp()}`, name: '', type: 1 },
  ],
  category: [],
  customizations: [
    {
      id: `customization-${getFormattedTimestamp()}`,
      code: '',
      remark: '',
      images: [],
    },
  ],
  productLinks: [
    {
      id: `product-link-${getFormattedTimestamp()}`,
      link: '',
      images: [],
      remark: '',
      date: new Date().toISOString().split('T')[0],
    },
  ],
  alibabaIds: [
    { id: `alibaba-ids-${getFormattedTimestamp()}`, value: '', link: '' },
  ],
  packings: [
    {
      id: `packings-${getFormattedTimestamp()}`,
      L: 0,
      W: 0,
      H: 0,
      qty: 1,
      kg: 0,
      type: 1,
    },
  ],
  certificates: [
    {
      id: `certificates-${getFormattedTimestamp()}`,
      type: 1,
      files: [],
      remark: '',
    },
  ],
  remark: '',
};

export const mockProducts = [
  {
    id: '1',
    productId: '202510271831',
    iconUrl:
      '\\pet_product_images\\202510282119\\display\\display_202510282117_07_800x800.jpg',
    productNames: [
      { id: 1, name: 'Elizabeth Collar Pet Grooming Shield', type: 1 },
      { id: 2, name: '狗仔花花頸圈', type: 2 },
    ],
    category: [1, 2],
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
        remark: 'test remark',
        date: '2025-10-27',
      },
      {
        id: 2,
        link: 'www.google.com',
        images: [
          '\\pet_product_images\\202511032115\\display\\Main_02.jpg',
          '\\pet_product_images\\202511032115\\display\\Main_03.jpg',
        ],
        remark: '',
        date: '2025-10-27',
      },
      {
        id: 3,
        link: 'www.google.com',
        images: [
          '\\pet_product_images\\202511032115\\display\\Main_04.jpg',
          '\\pet_product_images\\202511032115\\display\\Main_05.jpg',
        ],
        remark: 'testing remark 3',
        date: '2025-11-13',
      },
    ],
    alibabaIds: [
      { id: 1, value: '10215135354354', link: 'http://yahoo.com.hk' },
      { id: 2, value: '48412151513215', link: 'www.google.com' },
      { id: 3, value: '84548454545888', link: 'www.instagram.com' },
    ],
    packings: [
      { id: 1, L: 12, W: 52, H: 25, qty: 1, kg: 5, type: 1 },
      { id: 2, L: 24, W: 52, H: 50, qty: 10, kg: 10, type: 2 },
    ],
    certificates: [
      {
        id: 1,
        type: 1,
        files: ['\\pet_product_images\\202511032115\\display\\Main_02.jpg'],
        remark: 'MSDS remark',
      },
      {
        id: 2,
        type: 2,
        files: ['\\pet_product_images\\202511032115\\display\\Main_01.jpg'],
        remark: 'RoHS remark',
      },
    ],
    remark: 'main remark',
  },
];
