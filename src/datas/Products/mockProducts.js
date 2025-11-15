// Helper function to generate formatted timestamp in yyyymmddhhmmss format
const getFormattedTimestamp = (secondNeed = true) => {
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

export const mockProduct_template = () => {
  const template = {
    id: `new-product-${getFormattedTimestamp()}`,
    productId: `${getFormattedTimestamp(false)}`,
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
  return template;
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
  // New product 2
  {
    id: '2',
    productId: '202510280945',
    iconUrl:
      '\\pet_product_images\\202510290945\\display\\dog_leash_main_800x800.jpg',
    productNames: [
      { id: 1, name: 'Retractable Dog Leash with LED Light', type: 1 },
      { id: 2, name: '伸縮式LED狗繩', type: 2 },
    ],
    category: [1, 3, 5],
    customizations: [
      {
        id: 1,
        name: 'custom color',
        code: 'C000127',
        remark: 'Available in blue, red, and black',
        images: [
          '\\pet_product_images\\202510290945\\display\\dog_leash_blue_800x800.jpg',
          '\\pet_product_images\\202510290945\\display\\dog_leash_red_800x800.jpg',
          '\\pet_product_images\\202510290945\\display\\dog_leash_black_800x800.jpg',
        ],
      },
      {
        id: 2,
        name: 'custom logo',
        code: 'L000089',
        remark: 'Logo printing available on handle',
        images: [
          '\\pet_product_images\\202510290945\\display\\dog_leash_logo_800x800.jpg',
        ],
      },
    ],
    productLinks: [
      {
        id: 1,
        link: 'https://www.amazon.com/pet-supplies',
        images: [
          '\\pet_product_images\\202510290945\\display\\dog_leash_amazon.jpg',
        ],
        remark: 'Amazon listing',
        date: '2025-10-15',
      },
      {
        id: 2,
        link: 'https://www.petco.com',
        images: [
          '\\pet_product_images\\202510290945\\display\\dog_leash_petco_01.jpg',
          '\\pet_product_images\\202510290945\\display\\dog_leash_petco_02.jpg',
        ],
        remark: 'Petco listing',
        date: '2025-10-18',
      },
    ],
    alibabaIds: [
      {
        id: 1,
        value: '62514789632145',
        link: 'https://www.alibaba.com/product/62514789632145',
      },
      {
        id: 2,
        value: '62514789699999',
        link: 'https://www.alibaba.com/product/62514789699999',
      },
    ],
    packings: [
      { id: 1, L: 15, W: 10, H: 5, qty: 1, kg: 0.5, type: 1 },
      { id: 2, L: 45, W: 35, H: 25, qty: 24, kg: 15, type: 2 },
    ],
    certificates: [
      {
        id: 1,
        type: 1,
        files: [
          '\\pet_product_images\\202510290945\\certificates\\msds_leash.pdf',
        ],
        remark: 'MSDS for plastic components',
      },
      {
        id: 2,
        type: 3,
        files: [
          '\\pet_product_images\\202510290945\\certificates\\ce_leash.pdf',
        ],
        remark: 'CE certification',
      },
    ],
    remark: 'Bestselling product with high customer satisfaction',
  },
  // New product 3
  {
    id: '3',
    productId: '202510291123',
    iconUrl:
      '\\pet_product_images\\202510291123\\display\\cat_tree_main_800x800.jpg',
    productNames: [
      { id: 1, name: 'Multi-Level Cat Tree with Scratching Posts', type: 1 },
      { id: 2, name: '多層貓爬架', type: 2 },
    ],
    category: [2, 4],
    customizations: [
      {
        id: 1,
        name: 'custom fabric',
        code: 'F000215',
        remark: 'Premium plush or sisal rope options',
        images: [
          '\\pet_product_images\\202510291123\\display\\cat_tree_plush_800x800.jpg',
          '\\pet_product_images\\202510291123\\display\\cat_tree_sisal_800x800.jpg',
        ],
      },
      {
        id: 2,
        name: 'custom size',
        code: 'S000156',
        remark: 'Available in small, medium, and large',
        images: [
          '\\pet_product_images\\202510291123\\display\\cat_tree_small_800x800.jpg',
          '\\pet_product_images\\202510291123\\display\\cat_tree_medium_800x800.jpg',
          '\\pet_product_images\\202510291123\\display\\cat_tree_large_800x800.jpg',
        ],
      },
    ],
    productLinks: [
      {
        id: 1,
        link: 'https://www.chewy.com',
        images: [
          '\\pet_product_images\\202510291123\\display\\cat_tree_chewy.jpg',
        ],
        remark: 'Chewy listing',
        date: '2025-09-20',
      },
      {
        id: 2,
        link: 'https://www.walmart.com',
        images: [
          '\\pet_product_images\\202510291123\\display\\cat_tree_walmart_01.jpg',
          '\\pet_product_images\\202510291123\\display\\cat_tree_walmart_02.jpg',
        ],
        remark: 'Walmart listing',
        date: '2025-09-25',
      },
    ],
    alibabaIds: [
      {
        id: 1,
        value: '62514799875321',
        link: 'https://www.alibaba.com/product/62514799875321',
      },
      {
        id: 2,
        value: '62514799888888',
        link: 'https://www.alibaba.com/product/62514799888888',
      },
    ],
    packings: [
      { id: 1, L: 80, W: 40, H: 20, qty: 1, kg: 12, type: 1 },
      { id: 2, L: 120, W: 80, H: 100, qty: 4, kg: 55, type: 2 },
    ],
    certificates: [
      {
        id: 1,
        type: 2,
        files: [
          '\\pet_product_images\\202510291123\\certificates\\rohs_cattree.pdf',
        ],
        remark: 'RoHS certification',
      },
      {
        id: 2,
        type: 4,
        files: [
          '\\pet_product_images\\202510291123\\certificates\\fsc_cattree.pdf',
        ],
        remark: 'FSC certification for wood components',
      },
    ],
    remark: 'Assembly required, instructions included in each package',
  },
  // New product 4
  {
    id: '4',
    productId: '202510301456',
    iconUrl:
      '\\pet_product_images\\202510301456\\display\\pet_feeder_main_800x800.jpg',
    productNames: [
      { id: 1, name: 'Automatic Pet Feeder with Timer', type: 1 },
      { id: 2, name: '自動寵物餵食器', type: 2 },
    ],
    category: [1, 2, 6],
    customizations: [
      {
        id: 1,
        name: 'custom capacity',
        code: 'C000345',
        remark: '2L, 3L, or 5L food capacity',
        images: [
          '\\pet_product_images\\202510301456\\display\\pet_feeder_2L_800x800.jpg',
          '\\pet_product_images\\202510301456\\display\\pet_feeder_3L_800x800.jpg',
          '\\pet_product_images\\202510301456\\display\\pet_feeder_5L_800x800.jpg',
        ],
      },
      {
        id: 2,
        name: 'custom power',
        code: 'P000078',
        remark: 'Battery-operated or USB power options',
        images: [
          '\\pet_product_images\\202510301456\\display\\pet_feeder_battery_800x800.jpg',
          '\\pet_product_images\\202510301456\\display\\pet_feeder_usb_800x800.jpg',
        ],
      },
    ],
    productLinks: [
      {
        id: 1,
        link: 'https://www.petsmart.com',
        images: [
          '\\pet_product_images\\202510301456\\display\\pet_feeder_petsmart.jpg',
        ],
        remark: 'PetSmart listing',
        date: '2025-10-05',
      },
      {
        id: 2,
        link: 'https://www.target.com',
        images: [
          '\\pet_product_images\\202510301456\\display\\pet_feeder_target_01.jpg',
          '\\pet_product_images\\202510301456\\display\\pet_feeder_target_02.jpg',
        ],
        remark: 'Target listing',
        date: '2025-10-10',
      },
    ],
    alibabaIds: [
      {
        id: 1,
        value: '62514822456789',
        link: 'https://www.alibaba.com/product/62514822456789',
      },
      {
        id: 2,
        value: '62514822477777',
        link: 'https://www.alibaba.com/product/62514822477777',
      },
    ],
    packings: [
      { id: 1, L: 30, W: 20, H: 35, qty: 1, kg: 2, type: 1 },
      { id: 2, L: 65, W: 45, H: 75, qty: 8, kg: 18, type: 2 },
    ],
    certificates: [
      {
        id: 1,
        type: 1,
        files: [
          '\\pet_product_images\\202510301456\\certificates\\msds_feeder.pdf',
        ],
        remark: 'MSDS for plastic components',
      },
      {
        id: 2,
        type: 3,
        files: [
          '\\pet_product_images\\202510301456\\certificates\\ce_feeder.pdf',
        ],
        remark: 'CE certification for electronic components',
      },
      {
        id: 3,
        type: 5,
        files: [
          '\\pet_product_images\\202510301456\\certificates\\fda_feeder.pdf',
        ],
        remark: 'FDA food-safe certification',
      },
    ],
    remark: 'App control feature available on premium models',
  },
  // New product 5
  {
    id: '5',
    productId: '202511011234',
    iconUrl:
      '\\pet_product_images\\202511011234\\display\\pet_carrier_main_800x800.jpg',
    productNames: [
      { id: 1, name: 'Foldable Pet Travel Carrier', type: 1 },
      { id: 2, name: '可折疊寵物旅行箱', type: 2 },
    ],
    category: [1, 2, 7],
    customizations: [
      {
        id: 1,
        name: 'custom size',
        code: 'S000432',
        remark:
          'Small for cats/small dogs, Medium for medium dogs, Large for large dogs',
        images: [
          '\\pet_product_images\\202511011234\\display\\pet_carrier_small_800x800.jpg',
          '\\pet_product_images\\202511011234\\display\\pet_carrier_medium_800x800.jpg',
          '\\pet_product_images\\202511011234\\display\\pet_carrier_large_800x800.jpg',
        ],
      },
      {
        id: 2,
        name: 'custom pattern',
        code: 'P000156',
        remark: 'Various patterns available',
        images: [
          '\\pet_product_images\\202511011234\\display\\pet_carrier_pattern1_800x800.jpg',
          '\\pet_product_images\\202511011234\\display\\pet_carrier_pattern2_800x800.jpg',
          '\\pet_product_images\\202511011234\\display\\pet_carrier_pattern3_800x800.jpg',
        ],
      },
    ],
    productLinks: [
      {
        id: 1,
        link: 'https://www.petco.com',
        images: [
          '\\pet_product_images\\202511011234\\display\\pet_carrier_petco.jpg',
        ],
        remark: 'Petco listing',
        date: '2025-11-01',
      },
      {
        id: 2,
        link: 'https://www.amazon.com',
        images: [
          '\\pet_product_images\\202511011234\\display\\pet_carrier_amazon_01.jpg',
          '\\pet_product_images\\202511011234\\display\\pet_carrier_amazon_02.jpg',
        ],
        remark: 'Amazon listing',
        date: '2025-11-05',
      },
    ],
    alibabaIds: [
      {
        id: 1,
        value: '62514855123456',
        link: 'https://www.alibaba.com/product/62514855123456',
      },
      {
        id: 2,
        value: '62514855166666',
        link: 'https://www.alibaba.com/product/62514855166666',
      },
    ],
    packings: [
      { id: 1, L: 50, W: 35, H: 10, qty: 1, kg: 1.5, type: 1 },
      { id: 2, L: 105, W: 75, H: 55, qty: 12, kg: 20, type: 2 },
    ],
    certificates: [
      {
        id: 1,
        type: 2,
        files: [
          '\\pet_product_images\\202511011234\\certificates\\rohs_carrier.pdf',
        ],
        remark: 'RoHS certification',
      },
      {
        id: 2,
        type: 6,
        files: [
          '\\pet_product_images\\202511011234\\certificates\\airline_carrier.pdf',
        ],
        remark: 'Airline-approved certification',
      },
    ],
    remark: 'Folds flat for easy storage when not in use',
  },
  // New product 6
  {
    id: '6',
    productId: '202511021545',
    iconUrl:
      '\\pet_product_images\\202511021545\\display\\pet_bed_main_800x800.jpg',
    productNames: [
      { id: 1, name: 'Orthopedic Memory Foam Pet Bed', type: 1 },
      { id: 2, name: '記憶棉寵物床', type: 2 },
    ],
    category: [1, 2, 8],
    customizations: [
      {
        id: 1,
        name: 'custom size',
        code: 'S000567',
        remark: 'Small, Medium, Large, XL sizes available',
        images: [
          '\\pet_product_images\\202511021545\\display\\pet_bed_small_800x800.jpg',
          '\\pet_product_images\\202511021545\\display\\pet_bed_medium_800x800.jpg',
          '\\pet_product_images\\202511021545\\display\\pet_bed_large_800x800.jpg',
          '\\pet_product_images\\202511021545\\display\\pet_bed_xl_800x800.jpg',
        ],
      },
      {
        id: 2,
        name: 'custom cover',
        code: 'C000278',
        remark: 'Removable/washable covers in various materials',
        images: [
          '\\pet_product_images\\202511021545\\display\\pet_bed_plush_800x800.jpg',
          '\\pet_product_images\\202511021545\\display\\pet_bed_canvas_800x800.jpg',
          '\\pet_product_images\\202511021545\\display\\pet_bed_waterproof_800x800.jpg',
        ],
      },
    ],
    productLinks: [
      {
        id: 1,
        link: 'https://www.chewy.com',
        images: [
          '\\pet_product_images\\202511021545\\display\\pet_bed_chewy.jpg',
        ],
        remark: 'Chewy listing',
        date: '2025-10-22',
      },
      {
        id: 2,
        link: 'https://www.wayfair.com',
        images: [
          '\\pet_product_images\\202511021545\\display\\pet_bed_wayfair_01.jpg',
          '\\pet_product_images\\202511021545\\display\\pet_bed_wayfair_02.jpg',
        ],
        remark: 'Wayfair listing',
        date: '2025-10-25',
      },
    ],
    alibabaIds: [
      {
        id: 1,
        value: '62514877891234',
        link: 'https://www.alibaba.com/product/62514877891234',
      },
      {
        id: 2,
        value: '62514877855555',
        link: 'https://www.alibaba.com/product/62514877855555',
      },
    ],
    packings: [
      { id: 1, L: 70, W: 60, H: 20, qty: 1, kg: 3, type: 1 },
      { id: 2, L: 110, W: 80, H: 120, qty: 6, kg: 22, type: 2 },
    ],
    certificates: [
      {
        id: 1,
        type: 1,
        files: [
          '\\pet_product_images\\202511021545\\certificates\\msds_bed.pdf',
        ],
        remark: 'MSDS for foam materials',
      },
      {
        id: 2,
        type: 7,
        files: [
          '\\pet_product_images\\202511021545\\certificates\\oeko_bed.pdf',
        ],
        remark: 'Oeko-Tex certification for fabrics',
      },
    ],
    remark: 'Non-slip bottom, waterproof inner liner included',
  },
];
