import { v4 as uuidv4 } from 'uuid';
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
    id: `${uuidv4()}`,
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

export const mockProducts_v2 = [
  {
    id: '97e83121-f6e0-4aac-9c8a-837f1afffc81',
    icon_name: null,
    icon_url: 'public/products/202511181231/Alibaba 1688/display/Main_01.jpg',
    hs_code: null,
    remark: 'Premium quality product with multiple customization options',
    created_at: '2026-01-10T09:23:45.000Z',
    updated_at: '2026-01-10T09:23:45.000Z',
    base64_image: null,
    error:
      "ENOENT: no such file or directory, access 'C:\\Users\\Chris\\projects\\241127_trading_company_product_master_server\\public\\products\\202511181231\\Alibaba 1688\\display\\Main_01.jpg'",
    product_names: [
      {
        id: '76b76260-1876-4e23-94f6-b9e60c9ec5b3',
        product_id: '97e83121-f6e0-4aac-9c8a-837f1afffc81',
        name: '装饰陶瓷花瓶',
        name_type_id: '9b2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q',
      },
      {
        id: '7d6db9d9-f604-4a60-92e9-bac3343c9c64',
        product_id: '97e83121-f6e0-4aac-9c8a-837f1afffc81',
        name: 'Decorative Ceramic Vase',
        name_type_id: '8a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
      },
    ],
    product_categories: [
      {
        id: '44e64995-2609-43ab-9de0-603837fc506c',
        product_id: '97e83121-f6e0-4aac-9c8a-837f1afffc81',
        category_id: 'c7500000-0000-0000-0000-000000000000',
      },
    ],
    product_customizations: [
      {
        id: '14516f45-21a5-4f3b-ac83-007e4120e6c7',
        product_id: '97e83121-f6e0-4aac-9c8a-837f1afffc81',
        name: 'Color Variation',
        code: 'CV-001',
        remark: 'Available in blue, green, and red glazes',
        product_customization_images: [
          {
            id: '8b0defbf-c0db-4437-be06-6c57c5e5a0a4',
            customization_id: '14516f45-21a5-4f3b-ac83-007e4120e6c7',
            image_name: 'Main_01.jpg',
            image_url:
              '/public/97e83121-f6e0-4aac-9c8a-837f1afffc81/customizations//a0a52125-162a-44b9-8d0b-d97b29adc3ab.png',
            display_order: '1',
            base64_image:
              'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
            is_compressed: true,
          },
          {
            id: '9ac4d613-727b-4847-944c-a990ed0dfb71',
            customization_id: '14516f45-21a5-4f3b-ac83-007e4120e6c7',
            image_name: 'Main_02.jpg',
            image_url:
              '/public/97e83121-f6e0-4aac-9c8a-837f1afffc81/customizations//045a737c-2a0f-44f7-80b7-48c2ca47a9e6.png',
            display_order: '2',
            base64_image:
              'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
            is_compressed: true,
          },
        ],
      },
    ],
    product_links: [
      {
        id: '3551fb83-bd53-42ba-b2f5-821721dbda48',
        product_id: '97e83121-f6e0-4aac-9c8a-837f1afffc81',
        link: 'https://example.com/supplier/vase-details',
        remark: 'Supplier product page',
        link_date: '2025-10-10T00:00:00.000Z',
        product_link_images: [
          {
            id: '36082bf4-1d7d-4acc-8fe8-9019558a2002',
            product_link_id: '3551fb83-bd53-42ba-b2f5-821721dbda48',
            image_name: 'Main_01.jpg',
            image_url:
              '/public/97e83121-f6e0-4aac-9c8a-837f1afffc81/product_links//fbf586d3-6485-4dd6-b02c-498379bfbf56.png',
            display_order: '1',
            base64_image:
              'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
            is_compressed: true,
          },
          {
            id: '81fb5a7a-baed-4c5b-a384-8aca87d95716',
            product_link_id: '3551fb83-bd53-42ba-b2f5-821721dbda48',
            image_name: 'Main_01.jpg',
            image_url:
              '/public/97e83121-f6e0-4aac-9c8a-837f1afffc81/product_links//e34ee748-f3f7-4a80-9558-3240981ba61f.png',
            display_order: '2',
            base64_image:
              'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
            is_compressed: true,
          },
        ],
      },
    ],
    product_alibaba_ids: [
      {
        id: 'b5d931d0-e6a8-4b96-8aa0-2a94920cd361',
        product_id: '97e83121-f6e0-4aac-9c8a-837f1afffc81',
        value: '1600189276392',
        link: 'https://www.alibaba.com/product-detail/1600189276392.html',
      },
    ],
    product_packings: [
      {
        id: 'd29ed5da-7644-4631-a6c7-aa81a7bc73f5',
        product_id: '97e83121-f6e0-4aac-9c8a-837f1afffc81',
        packing_type_id: '5h8i9j0k-1l2m-3n4o-5p6q-7r8s9t0u1v2w',
        length: '30.50',
        width: '20.75',
        height: '40.00',
        quantity: '1',
        weight: '2.50',
        remark: 'testing',
      },
    ],
    product_certificates: [
      {
        id: 'd7679d9a-a628-4ce2-9cfe-2787b30d195c',
        product_id: '97e83121-f6e0-4aac-9c8a-837f1afffc81',
        certificate_type_id: '8k1l2m3n-4o5p-6q7r-8s9t-0u1v2w3x4y5z',
        remark: 'Certified for European market',
        product_certificate_files: [
          {
            id: 'd9472a09-5dfa-4cb6-a555-ffba98443626',
            certificate_id: 'd7679d9a-a628-4ce2-9cfe-2787b30d195c',
            file_name:
              'quotation-sq202511221513-282-rivolx-limited-arman-sayed.txt',
            file_url:
              '/public/97e83121-f6e0-4aac-9c8a-837f1afffc81/certificates//document/6a718a90-069d-48f9-8c25-e4f34f9d1502.txt',
            display_order: 1,
            file_type: 'document',
            description: null,
            base64_file:
              'data:application/octet-stream;base64,VGhpcyBpcyBhIHNhbXBsZSB0ZXh0IGZpbGUgd2l0aCBjb250ZW50IGVuY29kZWQgaW4gYmFzZTY0Lg==',
            is_compressed: false,
          },
        ],
      },
    ],
  },
];

export const mockProducts = [
  {
    id: '1',
    productId: '202510271831',
    iconUrl: {
      id: 1,
      url: '\\pet_product_images\\202510282119\\display\\display_202510282117_07_800x800.jpg',
      base64_content: '',
    },
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
          {
            id: 1,
            url: '\\pet_product_images\\202510282119\\display\\display_202510282117_06_800x800.jpg',
            base64_content: '',
          },
          {
            id: 2,
            url: '\\pet_product_images\\202510282119\\display\\display_202510282117_02_800x800.jpg',
            base64_content: '',
          },
          {
            id: 3,
            url: '\\pet_product_images\\202510282119\\display\\display_202510282117_03_800x800.jpg',
            base64_content: '',
          },
        ],
      },
      {
        id: 2,
        name: 'custom labels',
        code: '',
        remark: 'Testing2',
        images: [
          {
            id: 1,
            url: '\\pet_product_images\\202510282119\\display\\display_202510282117_03_800x800.jpg',
            base64_content: '',
          },
        ],
      },
    ],
    productLinks: [
      {
        id: 1,
        link: 'http://yahoo.com.hk',
        images: [
          {
            id: 1,
            url: '\\pet_product_images\\202511032115\\display\\Main_01.jpg',
            base64_content: '',
          },
        ],
        remark: 'test remark',
        date: '2025-10-27',
      },
      {
        id: 2,
        link: 'www.google.com',
        images: [
          {
            id: 1,
            url: '\\pet_product_images\\202511032115\\display\\Main_02.jpg',
            base64_content: '',
          },
          {
            id: 2,
            url: '\\pet_product_images\\202511032115\\display\\Main_03.jpg',
            base64_content: '',
          },
        ],
        remark: '',
        date: '2025-10-27',
      },
      {
        id: 3,
        link: 'www.google.com',
        images: [
          {
            id: 1,
            url: '\\pet_product_images\\202511032115\\display\\Main_04.jpg',
            base64_content: '',
          },
          {
            id: 2,
            url: '\\pet_product_images\\202511032115\\display\\Main_05.jpg',
            base64_content: '',
          },
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
        files: [
          {
            id: 1,
            url: '\\pet_product_images\\202511032115\\display\\Main_02.jpg',
            base64_content: '',
          },
        ],
        remark: 'MSDS remark',
      },
      {
        id: 2,
        type: 2,
        files: [
          {
            id: 1,
            url: '\\pet_product_images\\202511032115\\display\\Main_01.jpg',
            base64_content: '',
          },
        ],
        remark: 'RoHS remark',
      },
    ],
    remark: 'main remark',
  },
];
