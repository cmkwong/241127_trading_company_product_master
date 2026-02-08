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
    product_names: [
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
    product_alibaba_ids: [
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

export const mockProduct_base64_config = {
  products: { url: 'icon_url', base64: 'base64_image' },
  product_images: { url: 'image_url', base64: 'base64_image' },
  product_customization_images: { url: 'image_url', base64: 'base64_image' },
  product_certificate_files: { url: 'file_url', base64: 'base64_file' },
  product_link_images: { url: 'image_url', base64: 'base64_image' },
};

export const mockProducts = {
  products: [
    {
      id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
      icon_name: 'Main022.jpg',
      icon_url:
        '/public/13649f12-f9b6-4abf-8a8c-b63fe2f11091/icon//9e9c3caf-97b4-440e-b7d1-528256d94cd1.png',
      hs_code: '39249000',
      remark: 'Premium Non-Slip Dog Bowl - 2025 Model',
      created_at: '2026-01-24T12:28:27.000Z',
      updated_at: '2026-01-24T12:28:27.000Z',
      base64_image:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
      is_compressed: true,
      product_names: [
        {
          id: '46a0c9e6-b1a5-4f54-8f53-c72e204194e2',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          name: 'Anti-Skid Pet Feeder',
          name_type_id: '8a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
        },
        {
          id: '90730c42-c2d3-4f5f-ab71-2a2af16277d8',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          name: 'P-BOWL-001',
          name_type_id: '9b2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
        },
      ],
      product_images: [
        {
          id: '7b3acbcf-d7ec-4faa-b1c6-815f2bd30faa',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          image_type_id: 'e5c3a8f6-7b2d-8e9a-3c5f-6d7e8f9a0b1c',
          image_name: 'Main_Display.jpg',
          image_url:
            '/public/13649f12-f9b6-4abf-8a8c-b63fe2f11091/products//56bd4714-473b-4c54-8eb6-a81caf8607e0.png',
          alt_text: null,
          display_order: '1',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
          base64_image:
            'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
          is_compressed: true,
        },
        {
          id: '9c3acbcf-d7ec-4faa-b1c6-815f2bd30fab',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          image_type_id: 'a1e9c4b2-3d8f-4a5c-9e1b-2f3d4e5a6c7b',
          image_name: 'Main_Display2.jpg',
          image_url:
            '/public/13649f12-f9b6-4abf-8a8c-b63fe2f11091/products//56bd4714-473b-4c54-8eb6-a81caf8607e0.png',
          alt_text: null,
          display_order: '2',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
          base64_image:
            'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
          is_compressed: true,
        },
        {
          id: '52sacbcf-d7ec-4faa-b1c6-815f2bd30fab',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          image_type_id: 'a1e9c4b2-3d8f-4a5c-9e1b-2f3d4e5a6c7b',
          image_name: 'Main_Display3.jpg',
          image_url:
            '/public/13649f12-f9b6-4abf-8a8c-b63fe2f11091/products//56bd4714-473b-4c54-8eb6-a81caf8607e0.png',
          alt_text: null,
          display_order: '3',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
          base64_image:
            'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
          is_compressed: true,
        },
      ],
      product_categories: [
        {
          id: '90821dcb-9b2c-496a-8e7f-2be1e9db5b7d',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          category_id: 'c1400000-0000-0000-0000-000000000000',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
        },
        // {
        //   id: 'b9414217-3c4c-44c9-b52a-1b3406a284bd',
        //   product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
        //   category_id: 'c1000000-0000-0000-0000-000000000000',
        //   created_at: '2026-01-24T12:28:27.000Z',
        //   updated_at: '2026-01-24T12:28:27.000Z',
        // },
      ],
      product_customizations: [
        {
          id: '228b8c82-2b62-4662-9652-54c8f198370e',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          name: 'Packing',
          code: 'S000025',
          remark: 'Packing Company provide small qty packing service.',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
          product_customization_images: [
            {
              id: '03018f86-1ad5-447f-8ca4-725fb33a954b',
              customization_id: '228b8c82-2b62-4662-9652-54c8f198370e',
              image_name: 'Main_01.png',
              image_url:
                '/public/13649f12-f9b6-4abf-8a8c-b63fe2f11091/customizations//a1e17c2e-5c0c-439e-83c8-3ba48c8a20c1.png',
              display_order: 1,
              created_at: '2026-01-24T12:28:27.000Z',
              updated_at: '2026-01-24T12:28:27.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
            {
              id: 'e6046606-63aa-4e70-a5f6-8a1c9dfb7bf3',
              customization_id: '228b8c82-2b62-4662-9652-54c8f198370e',
              image_name: 'Main_99.jpg',
              image_url:
                '/public/13649f12-f9b6-4abf-8a8c-b63fe2f11091/customizations//7aa3affd-c105-4bd1-ab18-66182b5b9e3a.png',
              display_order: 2,
              created_at: '2026-01-24T12:28:27.000Z',
              updated_at: '2026-01-24T12:28:27.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
          ],
        },
      ],
      product_links: [
        {
          id: 'e3462c0e-0686-462d-970d-5a4821c8abe0',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          link: 'https://detail.1688.com/offer/745597988983.html?spm=a262uh.11750465/2507.offer.7',
          remark: 'testing2',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
        },
        {
          id: 'f75a06b2-eef2-4f7d-992a-69c8f0fb41fd',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          link: 'https://detail.1688.com/offer/970992106862.html?spm=a26352.b28411319/2508.0.0',
          remark: 'testing1',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
        },
      ],
      product_alibaba_ids: [
        {
          id: '9443e01d-489d-4fe4-85ce-2f4fb1755719',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          value: '1601589576641',
          link: 'https://hz-productposting.alibaba.com/product/products_manage.htm?spm=a2756.trade-list-seller.0.0.4406601aFWZmlM#/product/all/1-10/ydtState=&groupId=&boutiqueTag=-1&productKeyword=&ownerMemberId=&gmtModifiedFrom=&gmtModifiedTo=&bkGmtModified=&gmtCreatedFrom=&gmtCreatedTo=&bkGmtCreate=&categoryId=&displayStatus=all&isToAddSpecific=&redModel=&ydtSearchKey=&isGoods=false&isPrivate=false&isVideo=false&isSpecific=false&gmtModified=desc&subject=Modern%20Anti-Stress%20Orthopedic%20Memory%20Foam%20Pet%20Bed%20Factory%20Customized%20Funny%20Rectangle%20Bolster%20Minimalist%20Design%20Dogs%20Pet%20Bed&size=10&productId=&noFreightCost=&tradeType=&detailType=&powerScoreLayer=-1&isManualEdit=&isCountry=&isOriginal=all&dropShipping=&qualityScore=0~5&hasRadarRiskTask=all&notBusinessCategoryProduct=false&isSemiManaged=false&productSource=&riskCountry=&gpsrFilter=&deliveryProduct=&lightCustom=&semiManagedType=&maxCompetitivenessScore=&minCompetitivenessScore=&productTag=&uiAdvanceSearch=true&groupLevel=&lowInventoryAlert=',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
        },
        {
          id: 'a990d2ba-f82f-49e6-bd55-93860c9e8375',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          value: '9601589571232',
          link: 'https://hz-productposting.alibaba.com/product/products_manage.htm?spm=a2756.trade-list-seller.0.0.4406601aFWZmlM#/product/all/1-10/ydtState=&groupId=&boutiqueTag=-1&productKeyword=&ownerMemberId=&gmtModifiedFrom=&gmtModifiedTo=&bkGmtModified=&gmtCreatedFrom=&gmtCreatedTo=&bkGmtCreate=&categoryId=&displayStatus=all&isToAddSpecific=&redModel=&ydtSearchKey=&isGoods=false&isPrivate=false&isVideo=false&isSpecific=false&gmtModified=desc&subject=Modern%20Anti-Stress%20Orthopedic%20Memory%20Foam%20Pet%20Bed%20Factory%20Customized%20Funny%20Rectangle%20Bolster%20Minimalist%20Design%20Dogs%20Pet%20Bed&size=10&productId=&noFreightCost=&tradeType=&detailType=&powerScoreLayer=-1&isManualEdit=&isCountry=&isOriginal=all&dropShipping=&qualityScore=0~5&hasRadarRiskTask=all&notBusinessCategoryProduct=false&isSemiManaged=false&productSource=&riskCountry=&gpsrFilter=&deliveryProduct=&lightCustom=&semiManagedType=&maxCompetitivenessScore=&minCompetitivenessScore=&productTag=&uiAdvanceSearch=true&groupLevel=&lowInventoryAlert=',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
        },
      ],
      product_packings: [
        {
          id: '5464ae6b-a061-4197-ad8c-f8dd7fd59fed',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          packing_type_id: '0m3n4o5p-6q7r-8s9t-0u1v-9t0u1v2w3x5b',
          length: '50.00',
          width: '40.00',
          height: '30.00',
          quantity: '24',
          weight: '12.50',
          remark: null,
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
        },
      ],
      product_certificates: [
        {
          id: 'a6bb8db5-f685-49a4-8cc8-80df3396b8f4',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          certificate_type_id: '0m3n4o5p-6q7r-8s9t-0u1v-2w3x4y5z6a7b',
          remark: 'Material Safety Compliance',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
          product_certificate_files: [
            {
              id: 'd3df9c17-96ab-40e6-addb-f7f2cb53202f',
              certificate_id: 'a6bb8db5-f685-49a4-8cc8-80df3396b8f4',
              file_name: 'RoHS_Report.pdf',
              file_url:
                '/public/13649f12-f9b6-4abf-8a8c-b63fe2f11091/certificates//pdf/06a173fd-598a-4065-adfb-786b9cdc621c.pdf',
              display_order: 0,
              file_type: 'pdf',
              description: '2025 Lab Report',
              created_at: '2026-01-24T12:28:27.000Z',
              updated_at: '2026-01-24T12:28:27.000Z',
              base64_file: 'data:application/pdf;base64,JVBERi0xLg==',
              is_compressed: false,
            },
          ],
        },
        {
          id: '52ab8db5-f685-49a4-8cc8-80df3396b8f3',
          product_id: '13649f12-f9b6-4abf-8a8c-b63fe2f11091',
          certificate_type_id: '2o5p6q7r-8s9t-0u1v-2w3x-4y5z6a7b8c9d',
          remark: 'Material Safety Compliance',
          created_at: '2026-01-24T12:28:27.000Z',
          updated_at: '2026-01-24T12:28:27.000Z',
          product_certificate_files: [
            {
              id: 'd4df9c17-96ab-40e6-addb-f7f2cb53212f',
              certificate_id: 'a6bb8db5-f685-49a4-8cc8-80df3396b8f4',
              file_name: 'RoHS_Report22.pdf',
              file_url:
                '/public/13649f12-f9b6-4abf-8a8c-b63fe2f11091/certificates//pdf/06a173fd-598a-4065-adfb-786b9cdc621c.pdf',
              display_order: 0,
              file_type: 'pdf',
              description: '2025 Lab Report',
              created_at: '2026-01-24T12:28:27.000Z',
              updated_at: '2026-01-24T12:28:27.000Z',
              base64_file: 'data:application/pdf;base64,JVBERi0xLg==',
              is_compressed: false,
            },
          ],
        },
      ],
    },
    {
      id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
      icon_name: 'Main022.jpg',
      icon_url:
        '/public/1d532b23-1cb1-4bc1-9169-c250d51f0302/icon//dcf3b7c8-5d36-4efa-bcb4-1aad8ef21258.png',
      hs_code: '39249000',
      remark: 'Premium Non-Slip Dog Bowl - 2025 Model',
      created_at: '2026-01-24T12:28:25.000Z',
      updated_at: '2026-01-24T12:28:25.000Z',
      base64_image:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
      is_compressed: true,
      product_names: [
        {
          id: '98778294-d2ee-4f1f-8d1a-a8aa9e6fba10',
          product_id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
          name: 'Anti-Skid Pet Feeder',
          name_type_id: '8a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
          created_at: '2026-01-24T12:28:25.000Z',
          updated_at: '2026-01-24T12:28:25.000Z',
        },
        {
          id: 'ee54e748-b454-46bd-8b88-c49623020dd6',
          product_id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
          name: 'P-BOWL-001',
          name_type_id: '9b2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q',
          created_at: '2026-01-24T12:28:25.000Z',
          updated_at: '2026-01-24T12:28:25.000Z',
        },
      ],
      product_images: [
        {
          id: 'cdf001a1-50f1-4df7-a11d-a51b5e2821ac',
          product_id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
          image_type_id: 'a1e9c4b2-3d8f-4a5c-9e1b-2f3d4e5a6c7b',
          image_name: 'Main_Display.jpg',
          image_url:
            '/public/1d532b23-1cb1-4bc1-9169-c250d51f0302/products//c661dc8d-efec-4abb-97a0-2bc866ef4f7f.png',
          alt_text: null,
          display_order: '1',
          created_at: '2026-01-24T12:28:25.000Z',
          updated_at: '2026-01-24T12:28:25.000Z',
          base64_image:
            'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
          is_compressed: true,
        },
      ],
      product_categories: [
        {
          id: '13ba4d34-3c6f-4a73-b1da-3330b21aa3b2',
          product_id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
          category_id: 'c1400000-0000-0000-0000-000000000000',
          created_at: '2026-01-24T12:28:25.000Z',
          updated_at: '2026-01-24T12:28:25.000Z',
        },
        {
          id: '56193e24-a87d-4454-bdd7-1cc65a971d3e',
          product_id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
          category_id: 'c1000000-0000-0000-0000-000000000000',
          created_at: '2026-01-24T12:28:25.000Z',
          updated_at: '2026-01-24T12:28:25.000Z',
        },
      ],
      product_customizations: [
        {
          id: '7cafe10d-6f06-4b2b-a432-49cf50a4a608',
          product_id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
          name: 'Packing',
          code: 'S000025',
          remark: 'Packing Company provide small qty packing service.',
          created_at: '2026-01-24T12:28:26.000Z',
          updated_at: '2026-01-24T12:28:26.000Z',
          product_customization_images: [
            {
              id: '2f398ca1-82df-44a5-9cc1-4e119dd8a1b3',
              customization_id: '7cafe10d-6f06-4b2b-a432-49cf50a4a608',
              image_name: 'Main_99.jpg',
              image_url:
                '/public/1d532b23-1cb1-4bc1-9169-c250d51f0302/customizations//d2562291-63e7-4d56-9f17-cd8955d210d5.png',
              display_order: 2,
              created_at: '2026-01-24T12:28:26.000Z',
              updated_at: '2026-01-24T12:28:26.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
            {
              id: '4aea627e-537b-4831-9144-4f0a03620b25',
              customization_id: '7cafe10d-6f06-4b2b-a432-49cf50a4a608',
              image_name: 'Main_01.png',
              image_url:
                '/public/1d532b23-1cb1-4bc1-9169-c250d51f0302/customizations//79b49cb0-8288-435a-b306-ba893c41a831.png',
              display_order: 1,
              created_at: '2026-01-24T12:28:26.000Z',
              updated_at: '2026-01-24T12:28:26.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
          ],
        },
      ],
      product_links: [
        {
          id: '15009e74-5a7f-4265-8cb9-e9b5812572bf',
          product_id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
          link: 'https://detail.1688.com/offer/745597988983.html?spm=a262uh.11750465/2507.offer.7',
          remark: 'testing2',
          created_at: '2026-01-24T12:28:26.000Z',
          updated_at: '2026-01-24T12:28:26.000Z',
        },
        {
          id: 'cc61fb5d-81ea-42e4-9e76-4dc315f7a5c9',
          product_id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
          link: 'https://detail.1688.com/offer/970992106862.html?spm=a26352.b28411319/2508.0.0',
          remark: 'testing1',
          created_at: '2026-01-24T12:28:26.000Z',
          updated_at: '2026-01-24T12:28:26.000Z',
        },
      ],
      product_alibaba_ids: [
        {
          id: '61a72649-af08-4cfd-8719-2fd7e8a9c186',
          product_id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
          value: '9601589571232',
          link: 'https://hz-productposting.alibaba.com/product/products_manage.htm?spm=a2756.trade-list-seller.0.0.4406601aFWZmlM#/product/all/1-10/ydtState=&groupId=&boutiqueTag=-1&productKeyword=&ownerMemberId=&gmtModifiedFrom=&gmtModifiedTo=&bkGmtModified=&gmtCreatedFrom=&gmtCreatedTo=&bkGmtCreate=&categoryId=&displayStatus=all&isToAddSpecific=&redModel=&ydtSearchKey=&isGoods=false&isPrivate=false&isVideo=false&isSpecific=false&gmtModified=desc&subject=Modern%20Anti-Stress%20Orthopedic%20Memory%20Foam%20Pet%20Bed%20Factory%20Customized%20Funny%20Rectangle%20Bolster%20Minimalist%20Design%20Dogs%20Pet%20Bed&size=10&productId=&noFreightCost=&tradeType=&detailType=&powerScoreLayer=-1&isManualEdit=&isCountry=&isOriginal=all&dropShipping=&qualityScore=0~5&hasRadarRiskTask=all&notBusinessCategoryProduct=false&isSemiManaged=false&productSource=&riskCountry=&gpsrFilter=&deliveryProduct=&lightCustom=&semiManagedType=&maxCompetitivenessScore=&minCompetitivenessScore=&productTag=&uiAdvanceSearch=true&groupLevel=&lowInventoryAlert=',
          created_at: '2026-01-24T12:28:26.000Z',
          updated_at: '2026-01-24T12:28:26.000Z',
        },
        {
          id: 'aa89020e-e143-4246-a3da-d8be3e138ff4',
          product_id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
          value: '1601589576641',
          link: 'https://hz-productposting.alibaba.com/product/products_manage.htm?spm=a2756.trade-list-seller.0.0.4406601aFWZmlM#/product/all/1-10/ydtState=&groupId=&boutiqueTag=-1&productKeyword=&ownerMemberId=&gmtModifiedFrom=&gmtModifiedTo=&bkGmtModified=&gmtCreatedFrom=&gmtCreatedTo=&bkGmtCreate=&categoryId=&displayStatus=all&isToAddSpecific=&redModel=&ydtSearchKey=&isGoods=false&isPrivate=false&isVideo=false&isSpecific=false&gmtModified=desc&subject=Modern%20Anti-Stress%20Orthopedic%20Memory%20Foam%20Pet%20Bed%20Factory%20Customized%20Funny%20Rectangle%20Bolster%20Minimalist%20Design%20Dogs%20Pet%20Bed&size=10&productId=&noFreightCost=&tradeType=&detailType=&powerScoreLayer=-1&isManualEdit=&isCountry=&isOriginal=all&dropShipping=&qualityScore=0~5&hasRadarRiskTask=all&notBusinessCategoryProduct=false&isSemiManaged=false&productSource=&riskCountry=&gpsrFilter=&deliveryProduct=&lightCustom=&semiManagedType=&maxCompetitivenessScore=&minCompetitivenessScore=&productTag=&uiAdvanceSearch=true&groupLevel=&lowInventoryAlert=',
          created_at: '2026-01-24T12:28:26.000Z',
          updated_at: '2026-01-24T12:28:26.000Z',
        },
      ],
      product_packings: [
        {
          id: 'b226310f-f57c-474c-94eb-1e3cea2a62c1',
          product_id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
          packing_type_id: '0m3n4o5p-6q7r-8s9t-0u1v-9t0u1v2w3x5b',
          length: '50.00',
          width: '40.00',
          height: '30.00',
          quantity: '24',
          weight: '12.50',
          remark: null,
          created_at: '2026-01-24T12:28:25.000Z',
          updated_at: '2026-01-24T12:28:25.000Z',
        },
      ],
      product_certificates: [
        {
          id: 'fe2e9acf-1eec-491e-bc8e-75f67b8b2451',
          product_id: '1d532b23-1cb1-4bc1-9169-c250d51f0302',
          certificate_type_id: '0m3n4o5p-6q7r-8s9t-0u1v-2w3x4y5z6a7b',
          remark: 'Material Safety Compliance',
          created_at: '2026-01-24T12:28:25.000Z',
          updated_at: '2026-01-24T12:28:25.000Z',
          product_certificate_files: [
            {
              id: 'bdc1230e-135d-411d-8505-bbdc8ccc3f30',
              certificate_id: 'fe2e9acf-1eec-491e-bc8e-75f67b8b2451',
              file_name: 'RoHS_Report.pdf',
              file_url:
                '/public/1d532b23-1cb1-4bc1-9169-c250d51f0302/certificates//pdf/14e367b1-0fde-4e96-933c-54682daf2755.pdf',
              display_order: 0,
              file_type: 'pdf',
              description: '2025 Lab Report',
              created_at: '2026-01-24T12:28:26.000Z',
              updated_at: '2026-01-24T12:28:26.000Z',
              base64_file: 'data:application/pdf;base64,JVBERi0xLg==',
              is_compressed: false,
            },
          ],
        },
      ],
    },
    {
      id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
      icon_name: 'Main022.jpg',
      icon_url:
        '/public/3348dd2a-70a8-418b-a858-82f7e91ea106/icon//3d74482e-6889-4ff7-be7d-602d0043d11c.png',
      hs_code: '39249000',
      remark: 'Premium Non-Slip Dog Bowl - 2025 Model',
      created_at: '2026-01-24T12:28:29.000Z',
      updated_at: '2026-01-24T12:28:29.000Z',
      base64_image:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
      is_compressed: true,
      product_names: [
        {
          id: '07131ab8-cd2e-4396-a76c-1ef52979dc03',
          product_id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
          name: 'P-BOWL-001',
          name_type_id: '9b2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q',
          created_at: '2026-01-24T12:28:29.000Z',
          updated_at: '2026-01-24T12:28:29.000Z',
        },
        {
          id: '7af97e54-3c1f-4d04-bb6f-b8abb17a854b',
          product_id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
          name: 'Anti-Skid Pet Feeder',
          name_type_id: '8a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
          created_at: '2026-01-24T12:28:29.000Z',
          updated_at: '2026-01-24T12:28:29.000Z',
        },
      ],
      product_images: [
        {
          id: 'a2a61e6f-91ce-48b4-9b5c-79d577356e2a',
          product_id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
          image_type_id: 'a1e9c4b2-3d8f-4a5c-9e1b-2f3d4e5a6c7b',
          image_name: 'Main_Display.jpg',
          image_url:
            '/public/3348dd2a-70a8-418b-a858-82f7e91ea106/products//26973b8a-14e9-4447-b3ca-bd88740410c8.png',
          alt_text: null,
          display_order: '1',
          created_at: '2026-01-24T12:28:29.000Z',
          updated_at: '2026-01-24T12:28:29.000Z',
          base64_image:
            'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
          is_compressed: true,
        },
      ],
      product_categories: [
        {
          id: '46b8659d-aaa4-4344-bcb2-20d253270689',
          product_id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
          category_id: 'c1000000-0000-0000-0000-000000000000',
          created_at: '2026-01-24T12:28:29.000Z',
          updated_at: '2026-01-24T12:28:29.000Z',
        },
        {
          id: 'f9976296-111f-4f98-94b2-b9561432dfe6',
          product_id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
          category_id: 'c1400000-0000-0000-0000-000000000000',
          created_at: '2026-01-24T12:28:29.000Z',
          updated_at: '2026-01-24T12:28:29.000Z',
        },
      ],
      product_customizations: [
        {
          id: 'a930e804-4ffe-4a26-b644-b4d1e62858f1',
          product_id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
          name: 'Packing',
          code: 'S000025',
          remark: 'Packing Company provide small qty packing service.',
          created_at: '2026-01-24T12:28:30.000Z',
          updated_at: '2026-01-24T12:28:30.000Z',
          product_customization_images: [
            {
              id: '464e0b28-de4a-41b2-ab48-66a9d7409d71',
              customization_id: 'a930e804-4ffe-4a26-b644-b4d1e62858f1',
              image_name: 'Main_01.png',
              image_url:
                '/public/3348dd2a-70a8-418b-a858-82f7e91ea106/customizations//a4e3b577-ed10-4857-9d1e-683e91fe0a75.png',
              display_order: 1,
              created_at: '2026-01-24T12:28:30.000Z',
              updated_at: '2026-01-24T12:28:30.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
            {
              id: 'dd287ad2-9f04-4bd4-a468-bb682ef23dd8',
              customization_id: 'a930e804-4ffe-4a26-b644-b4d1e62858f1',
              image_name: 'Main_99.jpg',
              image_url:
                '/public/3348dd2a-70a8-418b-a858-82f7e91ea106/customizations//2bffbdbb-acd9-4aea-9190-1bbc774fdbb9.png',
              display_order: 2,
              created_at: '2026-01-24T12:28:30.000Z',
              updated_at: '2026-01-24T12:28:30.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
          ],
        },
      ],
      product_links: [
        {
          id: 'b849be86-abd4-4b7a-876e-d28c72f5d4f6',
          product_id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
          link: 'https://detail.1688.com/offer/745597988983.html?spm=a262uh.11750465/2507.offer.7',
          remark: 'testing2',
          created_at: '2026-01-24T12:28:30.000Z',
          updated_at: '2026-01-24T12:28:30.000Z',
        },
        {
          id: 'ee14dfa5-b2a5-43bc-981e-a9b645b3860b',
          product_id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
          link: 'https://detail.1688.com/offer/970992106862.html?spm=a26352.b28411319/2508.0.0',
          remark: 'testing1',
          created_at: '2026-01-24T12:28:30.000Z',
          updated_at: '2026-01-24T12:28:30.000Z',
        },
      ],
      product_alibaba_ids: [
        {
          id: '0c41866f-3ae4-4579-8166-10549d087185',
          product_id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
          value: '1601589576641',
          link: 'https://hz-productposting.alibaba.com/product/products_manage.htm?spm=a2756.trade-list-seller.0.0.4406601aFWZmlM#/product/all/1-10/ydtState=&groupId=&boutiqueTag=-1&productKeyword=&ownerMemberId=&gmtModifiedFrom=&gmtModifiedTo=&bkGmtModified=&gmtCreatedFrom=&gmtCreatedTo=&bkGmtCreate=&categoryId=&displayStatus=all&isToAddSpecific=&redModel=&ydtSearchKey=&isGoods=false&isPrivate=false&isVideo=false&isSpecific=false&gmtModified=desc&subject=Modern%20Anti-Stress%20Orthopedic%20Memory%20Foam%20Pet%20Bed%20Factory%20Customized%20Funny%20Rectangle%20Bolster%20Minimalist%20Design%20Dogs%20Pet%20Bed&size=10&productId=&noFreightCost=&tradeType=&detailType=&powerScoreLayer=-1&isManualEdit=&isCountry=&isOriginal=all&dropShipping=&qualityScore=0~5&hasRadarRiskTask=all&notBusinessCategoryProduct=false&isSemiManaged=false&productSource=&riskCountry=&gpsrFilter=&deliveryProduct=&lightCustom=&semiManagedType=&maxCompetitivenessScore=&minCompetitivenessScore=&productTag=&uiAdvanceSearch=true&groupLevel=&lowInventoryAlert=',
          created_at: '2026-01-24T12:28:30.000Z',
          updated_at: '2026-01-24T12:28:30.000Z',
        },
        {
          id: 'b9484947-ea07-4689-8691-cbf8e115e912',
          product_id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
          value: '9601589571232',
          link: 'https://hz-productposting.alibaba.com/product/products_manage.htm?spm=a2756.trade-list-seller.0.0.4406601aFWZmlM#/product/all/1-10/ydtState=&groupId=&boutiqueTag=-1&productKeyword=&ownerMemberId=&gmtModifiedFrom=&gmtModifiedTo=&bkGmtModified=&gmtCreatedFrom=&gmtCreatedTo=&bkGmtCreate=&categoryId=&displayStatus=all&isToAddSpecific=&redModel=&ydtSearchKey=&isGoods=false&isPrivate=false&isVideo=false&isSpecific=false&gmtModified=desc&subject=Modern%20Anti-Stress%20Orthopedic%20Memory%20Foam%20Pet%20Bed%20Factory%20Customized%20Funny%20Rectangle%20Bolster%20Minimalist%20Design%20Dogs%20Pet%20Bed&size=10&productId=&noFreightCost=&tradeType=&detailType=&powerScoreLayer=-1&isManualEdit=&isCountry=&isOriginal=all&dropShipping=&qualityScore=0~5&hasRadarRiskTask=all&notBusinessCategoryProduct=false&isSemiManaged=false&productSource=&riskCountry=&gpsrFilter=&deliveryProduct=&lightCustom=&semiManagedType=&maxCompetitivenessScore=&minCompetitivenessScore=&productTag=&uiAdvanceSearch=true&groupLevel=&lowInventoryAlert=',
          created_at: '2026-01-24T12:28:30.000Z',
          updated_at: '2026-01-24T12:28:30.000Z',
        },
      ],
      product_packings: [
        {
          id: 'e4625a4b-ce4c-4c52-93a7-4662f298e78e',
          product_id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
          packing_type_id: '0m3n4o5p-6q7r-8s9t-0u1v-9t0u1v2w3x5b',
          length: '50.00',
          width: '40.00',
          height: '30.00',
          quantity: '24',
          weight: '12.50',
          remark: null,
          created_at: '2026-01-24T12:28:29.000Z',
          updated_at: '2026-01-24T12:28:29.000Z',
        },
      ],
      product_certificates: [
        {
          id: 'c3a832bb-958e-422d-84e4-323a1b85ad1f',
          product_id: '3348dd2a-70a8-418b-a858-82f7e91ea106',
          certificate_type_id: '0m3n4o5p-6q7r-8s9t-0u1v-2w3x4y5z6a7b',
          remark: 'Material Safety Compliance',
          created_at: '2026-01-24T12:28:29.000Z',
          updated_at: '2026-01-24T12:28:29.000Z',
          product_certificate_files: [
            {
              id: '9f9566de-d115-4c18-b7d9-f42b32604562',
              certificate_id: 'c3a832bb-958e-422d-84e4-323a1b85ad1f',
              file_name: 'RoHS_Report.pdf',
              file_url:
                '/public/3348dd2a-70a8-418b-a858-82f7e91ea106/certificates//pdf/124acf17-2a47-4ff2-a329-890b9bef6472.pdf',
              display_order: 0,
              file_type: 'pdf',
              description: '2025 Lab Report',
              created_at: '2026-01-24T12:28:29.000Z',
              updated_at: '2026-01-24T12:28:29.000Z',
              base64_file: 'data:application/pdf;base64,JVBERi0xLg==',
              is_compressed: false,
            },
          ],
        },
      ],
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      icon_name: 'Rounded Bowl.png',
      icon_url:
        '/public/550e8400-e29b-41d4-a716-446655440001/icon//b4cf43ca-3cde-4559-887c-426c1141c9af.png',
      hs_code: null,
      remark: 'Premium quality product with multiple customization options',
      created_at: '2026-01-24T12:28:21.000Z',
      updated_at: '2026-01-24T12:28:21.000Z',
      base64_image:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
      is_compressed: true,
      product_keywords: [
        {
          id: '550e8400-e29b-41d4-a716-446655440101',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          keyword_id: 1,
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440102',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          keyword_id: 2,
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
        },
      ],
      product_names: [
        {
          id: '550e8400-e29b-41d4-a716-446655440201',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Decorative Ceramic Vase',
          name_type_id: '8a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440202',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          name: '装饰陶瓷花瓶',
          name_type_id: '9b2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q',
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
        },
      ],
      product_images: [
        {
          id: '550e8400-e29b-41d4-a716-446655440204',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          image_type_id: 'a1e9c4b2-3d8f-4a5c-9e1b-2f3d4e5a6c7b',
          image_name: 'Main_01.jpg',
          image_url:
            '/public/550e8400-e29b-41d4-a716-446655440001/products//5196c2fb-7f95-4499-b20f-710c70afa74f.png',
          alt_text: 'Front view of the decorative ceramic vase',
          display_order: '1',
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
          base64_image:
            'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
          is_compressed: true,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440205',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          image_type_id: 'a1e9c4b2-3d8f-4a5c-9e1b-2f3d4e5a6c7b',
          image_name: 'Main_02.jpg',
          image_url:
            '/public/550e8400-e29b-41d4-a716-446655440001/products//0ffb3ddb-cb80-4e30-ae10-f60c2d866a3b.png',
          alt_text: 'Front view of the decorative ceramic vase',
          display_order: '2',
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
          base64_image:
            'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
          is_compressed: true,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440206',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          image_type_id: 'b2f0d5c3-4e9a-5b6d-0f2c-3a4b5c6d7e8f',
          image_name: 'Main_03.jpg',
          image_url:
            '/public/550e8400-e29b-41d4-a716-446655440001/products//c9826f31-62f1-48c1-85d3-7a1d140dcfc2.png',
          alt_text: 'Front view of the decorative ceramic vase',
          display_order: '1',
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
          base64_image:
            'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
          is_compressed: true,
        },
      ],
      product_categories: [
        {
          id: '550e8400-e29b-41d4-a716-446655440301',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          category_id: 'c7500000-0000-0000-0000-000000000000',
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
        },
      ],
      product_customizations: [
        {
          id: '550e8400-e29b-41d4-a716-446655440401',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Color Variation',
          code: 'CV-001',
          remark: 'Available in blue, green, and red glazes',
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
          product_customization_images: [
            {
              id: '550e8400-e29b-41d4-a716-446655440501',
              customization_id: '550e8400-e29b-41d4-a716-446655440401',
              image_name: 'Main_01.jpg',
              image_url:
                '/public/550e8400-e29b-41d4-a716-446655440001/customizations//470893eb-8322-472b-bc38-52720738dc8d.png',
              display_order: 1,
              created_at: '2026-01-24T12:28:21.000Z',
              updated_at: '2026-01-24T12:28:21.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440502',
              customization_id: '550e8400-e29b-41d4-a716-446655440401',
              image_name: 'Main_02.jpg',
              image_url:
                '/public/550e8400-e29b-41d4-a716-446655440001/customizations//03b52edb-d433-4403-8dee-928aacaf69d8.png',
              display_order: 2,
              created_at: '2026-01-24T12:28:21.000Z',
              updated_at: '2026-01-24T12:28:21.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
          ],
        },
      ],
      product_links: [
        {
          id: '550e8400-e29b-41d4-a716-446655440601',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          link: 'https://example.com/supplier/vase-details',
          remark: 'Supplier product page',
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
          product_link_images: [
            {
              id: '550e8400-e29b-41d4-a716-446655440701',
              product_link_id: '550e8400-e29b-41d4-a716-446655440601',
              image_name: 'Main_01.jpg',
              image_url:
                '/public/550e8400-e29b-41d4-a716-446655440001/product_links//e77653f2-d540-4307-9595-de4959bc83c8.png',
              display_order: 1,
              created_at: '2026-01-24T12:28:21.000Z',
              updated_at: '2026-01-24T12:28:21.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440702',
              product_link_id: '550e8400-e29b-41d4-a716-446655440601',
              image_name: 'Main_01.jpg',
              image_url:
                '/public/550e8400-e29b-41d4-a716-446655440001/product_links//7dcbbafa-fa4a-4331-8a98-fcbdbf31524a.png',
              display_order: 2,
              created_at: '2026-01-24T12:28:21.000Z',
              updated_at: '2026-01-24T12:28:21.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
          ],
        },
      ],
      product_alibaba_ids: [
        {
          id: '550e8400-e29b-41d4-a716-446655440801',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          value: '1600189276392',
          link: 'https://www.alibaba.com/product-detail/1600189276392.html',
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
        },
      ],
      product_packings: [
        {
          id: '550e8400-e29b-41d4-a716-446655440901',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          packing_type_id: '5h8i9j0k-1l2m-3n4o-5p6q-7r8s9t0u1v2w',
          length: '30.50',
          width: '20.75',
          height: '40.00',
          quantity: '1',
          weight: '2.50',
          remark: 'testing',
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
        },
      ],
      product_certificates: [
        {
          id: '550e8400-e29b-41d4-a716-446655441001',
          product_id: '550e8400-e29b-41d4-a716-446655440001',
          certificate_type_id: '8k1l2m3n-4o5p-6q7r-8s9t-0u1v2w3x4y5z',
          remark: 'Certified for European market',
          created_at: '2026-01-24T12:28:21.000Z',
          updated_at: '2026-01-24T12:28:21.000Z',
          product_certificate_files: [
            {
              id: '550e8400-e29b-41d4-a716-446655441101',
              certificate_id: '550e8400-e29b-41d4-a716-446655441001',
              file_name:
                'quotation-sq202511221513-282-rivolx-limited-arman-sayed.txt',
              file_url:
                '/public/550e8400-e29b-41d4-a716-446655440001/certificates//document/4476d371-2ac2-4be4-a39a-bf32f672c02d.txt',
              display_order: 1,
              file_type: 'document',
              description: null,
              created_at: '2026-01-24T12:28:21.000Z',
              updated_at: '2026-01-24T12:28:21.000Z',
              base64_file:
                'data:application/octet-stream;base64,VGhpcyBpcyBhIHNhbXBsZSB0ZXh0IGZpbGUgd2l0aCBjb250ZW50IGVuY29kZWQgaW4gYmFzZTY0Lg==',
              is_compressed: false,
            },
          ],
        },
      ],
    },
    {
      id: '8e6ae7c8-d321-481c-b85f-beca8f1e1927',
      icon_name: 'Stainless-Steel-Bottle.png',
      icon_url:
        '/public/8e6ae7c8-d321-481c-b85f-beca8f1e1927/icon//ddb1d314-da92-485e-a01c-d31dca87c2b2.png',
      hs_code: null,
      remark: 'Stainless steel water bottle with eco-friendly design',
      created_at: '2026-01-24T12:28:22.000Z',
      updated_at: '2026-01-24T12:28:22.000Z',
      base64_image:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
      is_compressed: true,
      product_keywords: [
        {
          id: '08607e8e-ee67-4ed5-89b2-0649dba15f24',
          product_id: '8e6ae7c8-d321-481c-b85f-beca8f1e1927',
          keyword_id: 1,
          created_at: '2026-01-24T12:28:22.000Z',
          updated_at: '2026-01-24T12:28:22.000Z',
        },
        {
          id: '31e98b5f-8d4c-4e9d-87f0-7fb9e5e770ba',
          product_id: '8e6ae7c8-d321-481c-b85f-beca8f1e1927',
          keyword_id: 9,
          created_at: '2026-01-24T12:28:22.000Z',
          updated_at: '2026-01-24T12:28:22.000Z',
        },
      ],
      product_names: [
        {
          id: '0764a6f4-ebc1-448b-8553-f67ae553ed8d',
          product_id: '8e6ae7c8-d321-481c-b85f-beca8f1e1927',
          name: 'Premium Stainless Steel Water Bottle',
          name_type_id: '8a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
          created_at: '2026-01-24T12:28:22.000Z',
          updated_at: '2026-01-24T12:28:22.000Z',
        },
        {
          id: '0ad4ae52-23d6-470f-a372-5977873e929d',
          product_id: '8e6ae7c8-d321-481c-b85f-beca8f1e1927',
          name: '高级不锈钢水瓶',
          name_type_id: '9b2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q',
          created_at: '2026-01-24T12:28:22.000Z',
          updated_at: '2026-01-24T12:28:22.000Z',
        },
      ],
      product_images: [
        {
          id: '1133f693-3a10-47ac-9faa-5fa98d16f744',
          product_id: '8e6ae7c8-d321-481c-b85f-beca8f1e1927',
          image_type_id: 'a1e9c4b2-3d8f-4a5c-9e1b-2f3d4e5a6c7b',
          image_name: 'Steel-Bottle-Front.jpg',
          image_url:
            '/public/8e6ae7c8-d321-481c-b85f-beca8f1e1927/products//881b20b1-7d86-40b6-80df-55416f1032f0.png',
          alt_text: 'Front view of stainless steel water bottle',
          display_order: '1',
          created_at: '2026-01-24T12:28:22.000Z',
          updated_at: '2026-01-24T12:28:22.000Z',
          base64_image:
            'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
          is_compressed: true,
        },
        {
          id: 'f3c03b96-8e21-48e9-adee-dce46b0f95b9',
          product_id: '8e6ae7c8-d321-481c-b85f-beca8f1e1927',
          image_type_id: 'b2f0d5c3-4e9a-5b6d-0f2c-3a4b5c6d7e8f',
          image_name: 'Steel-Bottle-Side.jpg',
          image_url:
            '/public/8e6ae7c8-d321-481c-b85f-beca8f1e1927/products//0cc59e02-093a-463a-9c07-23569ed01c55.png',
          alt_text: 'Side view of stainless steel water bottle',
          display_order: '1',
          created_at: '2026-01-24T12:28:22.000Z',
          updated_at: '2026-01-24T12:28:22.000Z',
          base64_image:
            'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
          is_compressed: true,
        },
      ],
      product_categories: [
        {
          id: '6c8b9055-be5c-48cc-bf0a-cf422c4be017',
          product_id: '8e6ae7c8-d321-481c-b85f-beca8f1e1927',
          category_id: 'c7500000-0000-0000-0000-000000000000',
          created_at: '2026-01-24T12:28:22.000Z',
          updated_at: '2026-01-24T12:28:22.000Z',
        },
      ],
      product_customizations: [
        {
          id: '19940ec2-d051-49fd-8219-ff4946f75f31',
          product_id: '8e6ae7c8-d321-481c-b85f-beca8f1e1927',
          name: 'Capacity Variant',
          code: 'CV-002',
          remark: 'Available in 500ml, 750ml, and 1000ml sizes',
          created_at: '2026-01-24T12:28:22.000Z',
          updated_at: '2026-01-24T12:28:22.000Z',
          product_customization_images: [
            {
              id: 'e83dcb82-8b14-48e4-b976-d702f8ca325d',
              customization_id: '19940ec2-d051-49fd-8219-ff4946f75f31',
              image_name: 'Capacity-500ml.jpg',
              image_url:
                '/public/8e6ae7c8-d321-481c-b85f-beca8f1e1927/customizations//11afa278-baa6-4237-ba77-151ffe6327aa.png',
              display_order: 1,
              created_at: '2026-01-24T12:28:22.000Z',
              updated_at: '2026-01-24T12:28:22.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
          ],
        },
      ],
      product_links: [
        {
          id: 'd2b1964b-d2f9-404f-90b0-ef7800ecf355',
          product_id: '8e6ae7c8-d321-481c-b85f-beca8f1e1927',
          link: 'https://example.com/supplier/bottle-details',
          remark: 'Supplier product page for steel bottle',
          created_at: '2026-01-24T12:28:22.000Z',
          updated_at: '2026-01-24T12:28:22.000Z',
          product_link_images: [
            {
              id: 'd332fb41-7c31-48b0-a5a3-336de02e81da',
              product_link_id: 'd2b1964b-d2f9-404f-90b0-ef7800ecf355',
              image_name: 'Link-Preview.jpg',
              image_url:
                '/public/8e6ae7c8-d321-481c-b85f-beca8f1e1927/product_links//5ad67381-221d-4fd9-bab2-55f6d436fc83.png',
              display_order: 1,
              created_at: '2026-01-24T12:28:22.000Z',
              updated_at: '2026-01-24T12:28:22.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
          ],
        },
      ],
      product_certificates: [
        {
          id: '82c6e86c-1606-426d-b99d-534c5f61a43e',
          product_id: '8e6ae7c8-d321-481c-b85f-beca8f1e1927',
          certificate_type_id: '9l2m3n4o-5p6q-7r8s-9t0u-1v2w3x4y5z6a',
          remark: 'Certified for quality management',
          created_at: '2026-01-24T12:28:22.000Z',
          updated_at: '2026-01-24T12:28:22.000Z',
          product_certificate_files: [
            {
              id: '3fb7f28b-4bd5-4c2c-a001-92e3c9810b2d',
              certificate_id: '82c6e86c-1606-426d-b99d-534c5f61a43e',
              file_name: 'ISO-9001-Certificate.txt',
              file_url:
                '/public/8e6ae7c8-d321-481c-b85f-beca8f1e1927/certificates//document/00f99e0a-0c4c-4db3-996b-162e810f3ff3.txt',
              display_order: 1,
              file_type: 'document',
              description: null,
              created_at: '2026-01-24T12:28:22.000Z',
              updated_at: '2026-01-24T12:28:22.000Z',
              base64_file:
                'data:application/octet-stream;base64,VGhpcyBpcyBhIHNhbXBsZSBJU08gY2VydGlmaWNhdGUgZmlsZSBlbmNvZGVkIGluIGJhc2U2NC4=',
              is_compressed: false,
            },
          ],
        },
      ],
    },
    {
      id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
      icon_name: 'Main022.jpg',
      icon_url:
        '/public/a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9/icon//f0b368bd-ab1c-4225-9ac2-9e2aa6032cc1.png',
      hs_code: '39249000',
      remark: 'Premium Non-Slip Dog Bowl - 2025 Model',
      created_at: '2026-01-24T12:28:28.000Z',
      updated_at: '2026-01-24T12:28:28.000Z',
      base64_image:
        'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
      is_compressed: true,
      product_names: [
        {
          id: '55a578a5-5dc3-4359-93d6-5e94099545d8',
          product_id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
          name: 'Anti-Skid Pet Feeder',
          name_type_id: '8a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p',
          created_at: '2026-01-24T12:28:28.000Z',
          updated_at: '2026-01-24T12:28:28.000Z',
        },
        {
          id: 'd4d5d58e-5032-41a4-b6bb-3cf60a36570d',
          product_id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
          name: 'P-BOWL-001',
          name_type_id: '9b2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q',
          created_at: '2026-01-24T12:28:28.000Z',
          updated_at: '2026-01-24T12:28:28.000Z',
        },
      ],
      product_images: [
        {
          id: '0ad17a2c-690b-483a-9424-b78434be9a19',
          product_id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
          image_type_id: 'a1e9c4b2-3d8f-4a5c-9e1b-2f3d4e5a6c7b',
          image_name: 'Main_Display.jpg',
          image_url:
            '/public/a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9/products//f7a9d321-8ef1-4f7e-9306-b5b3b44977f6.png',
          alt_text: null,
          display_order: '1',
          created_at: '2026-01-24T12:28:28.000Z',
          updated_at: '2026-01-24T12:28:28.000Z',
          base64_image:
            'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
          is_compressed: true,
        },
      ],
      product_categories: [
        {
          id: '9a2da962-4bb7-4b1a-9b4a-9e2438e51662',
          product_id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
          category_id: 'c1400000-0000-0000-0000-000000000000',
          created_at: '2026-01-24T12:28:28.000Z',
          updated_at: '2026-01-24T12:28:28.000Z',
        },
        {
          id: 'b5c6cd57-17a9-49be-a6a5-4672bb432d52',
          product_id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
          category_id: 'c1000000-0000-0000-0000-000000000000',
          created_at: '2026-01-24T12:28:28.000Z',
          updated_at: '2026-01-24T12:28:28.000Z',
        },
      ],
      product_customizations: [
        {
          id: 'da083995-11e3-4244-817a-140c2ac793c4',
          product_id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
          name: 'Packing',
          code: 'S000025',
          remark: 'Packing Company provide small qty packing service.',
          created_at: '2026-01-24T12:28:28.000Z',
          updated_at: '2026-01-24T12:28:28.000Z',
          product_customization_images: [
            {
              id: '03d29d9e-6d56-416e-b1fc-31ded2281ac9',
              customization_id: 'da083995-11e3-4244-817a-140c2ac793c4',
              image_name: 'Main_01.png',
              image_url:
                '/public/a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9/customizations//ab84c44e-61b3-469a-b07d-01108cb2d42e.png',
              display_order: 1,
              created_at: '2026-01-24T12:28:28.000Z',
              updated_at: '2026-01-24T12:28:28.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
            {
              id: 'dfed7e1d-d7af-4dbf-85ed-8a6f8d17335a',
              customization_id: 'da083995-11e3-4244-817a-140c2ac793c4',
              image_name: 'Main_99.jpg',
              image_url:
                '/public/a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9/customizations//17600ed6-2f1b-4afc-ad33-28b1e50127ff.png',
              display_order: 2,
              created_at: '2026-01-24T12:28:28.000Z',
              updated_at: '2026-01-24T12:28:28.000Z',
              base64_image:
                'data:image/jpeg;base64,/9j/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCbgDlk/9k=',
              is_compressed: true,
            },
          ],
        },
      ],
      product_links: [
        {
          id: '247333dc-7eb2-46b2-b1f9-17b5a8ed677f',
          product_id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
          link: 'https://detail.1688.com/offer/970992106862.html?spm=a26352.b28411319/2508.0.0',
          remark: 'testing1',
          created_at: '2026-01-24T12:28:28.000Z',
          updated_at: '2026-01-24T12:28:28.000Z',
        },
        {
          id: '367cacc7-0d1d-44d0-b89c-1931494673f1',
          product_id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
          link: 'https://detail.1688.com/offer/745597988983.html?spm=a262uh.11750465/2507.offer.7',
          remark: 'testing2',
          created_at: '2026-01-24T12:28:28.000Z',
          updated_at: '2026-01-24T12:28:28.000Z',
        },
      ],
      product_alibaba_ids: [
        {
          id: 'b1fb3116-49a4-437f-aae2-30e932cf0167',
          product_id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
          value: '9601589571232',
          link: 'https://hz-productposting.alibaba.com/product/products_manage.htm?spm=a2756.trade-list-seller.0.0.4406601aFWZmlM#/product/all/1-10/ydtState=&groupId=&boutiqueTag=-1&productKeyword=&ownerMemberId=&gmtModifiedFrom=&gmtModifiedTo=&bkGmtModified=&gmtCreatedFrom=&gmtCreatedTo=&bkGmtCreate=&categoryId=&displayStatus=all&isToAddSpecific=&redModel=&ydtSearchKey=&isGoods=false&isPrivate=false&isVideo=false&isSpecific=false&gmtModified=desc&subject=Modern%20Anti-Stress%20Orthopedic%20Memory%20Foam%20Pet%20Bed%20Factory%20Customized%20Funny%20Rectangle%20Bolster%20Minimalist%20Design%20Dogs%20Pet%20Bed&size=10&productId=&noFreightCost=&tradeType=&detailType=&powerScoreLayer=-1&isManualEdit=&isCountry=&isOriginal=all&dropShipping=&qualityScore=0~5&hasRadarRiskTask=all&notBusinessCategoryProduct=false&isSemiManaged=false&productSource=&riskCountry=&gpsrFilter=&deliveryProduct=&lightCustom=&semiManagedType=&maxCompetitivenessScore=&minCompetitivenessScore=&productTag=&uiAdvanceSearch=true&groupLevel=&lowInventoryAlert=',
          created_at: '2026-01-24T12:28:28.000Z',
          updated_at: '2026-01-24T12:28:28.000Z',
        },
        {
          id: 'c327af9a-28a8-45ac-b1d6-5123f3868de3',
          product_id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
          value: '1601589576641',
          link: 'https://hz-productposting.alibaba.com/product/products_manage.htm?spm=a2756.trade-list-seller.0.0.4406601aFWZmlM#/product/all/1-10/ydtState=&groupId=&boutiqueTag=-1&productKeyword=&ownerMemberId=&gmtModifiedFrom=&gmtModifiedTo=&bkGmtModified=&gmtCreatedFrom=&gmtCreatedTo=&bkGmtCreate=&categoryId=&displayStatus=all&isToAddSpecific=&redModel=&ydtSearchKey=&isGoods=false&isPrivate=false&isVideo=false&isSpecific=false&gmtModified=desc&subject=Modern%20Anti-Stress%20Orthopedic%20Memory%20Foam%20Pet%20Bed%20Factory%20Customized%20Funny%20Rectangle%20Bolster%20Minimalist%20Design%20Dogs%20Pet%20Bed&size=10&productId=&noFreightCost=&tradeType=&detailType=&powerScoreLayer=-1&isManualEdit=&isCountry=&isOriginal=all&dropShipping=&qualityScore=0~5&hasRadarRiskTask=all&notBusinessCategoryProduct=false&isSemiManaged=false&productSource=&riskCountry=&gpsrFilter=&deliveryProduct=&lightCustom=&semiManagedType=&maxCompetitivenessScore=&minCompetitivenessScore=&productTag=&uiAdvanceSearch=true&groupLevel=&lowInventoryAlert=',
          created_at: '2026-01-24T12:28:28.000Z',
          updated_at: '2026-01-24T12:28:28.000Z',
        },
      ],
      product_packings: [
        {
          id: '2b618d5d-f9f7-40f7-980e-95dbd61fb00e',
          product_id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
          packing_type_id: '0m3n4o5p-6q7r-8s9t-0u1v-9t0u1v2w3x5b',
          length: '50.00',
          width: '40.00',
          height: '30.00',
          quantity: '24',
          weight: '12.50',
          remark: null,
          created_at: '2026-01-24T12:28:28.000Z',
          updated_at: '2026-01-24T12:28:28.000Z',
        },
      ],
      product_certificates: [
        {
          id: 'fea7514d-4d5d-4baf-a141-df3a667bb2fe',
          product_id: 'a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9',
          certificate_type_id: '0m3n4o5p-6q7r-8s9t-0u1v-2w3x4y5z6a7b',
          remark: 'Material Safety Compliance',
          created_at: '2026-01-24T12:28:28.000Z',
          updated_at: '2026-01-24T12:28:28.000Z',
          product_certificate_files: [
            {
              id: '2f0045da-eb00-4386-b216-f81694e55248',
              certificate_id: 'fea7514d-4d5d-4baf-a141-df3a667bb2fe',
              file_name: 'RoHS_Report.pdf',
              file_url:
                '/public/a7dac19e-c6e9-4fa7-a0de-3af624dbd1b9/certificates//pdf/7fea4bd7-0f40-4772-9925-c655b0bc10dc.pdf',
              display_order: 0,
              file_type: 'pdf',
              description: '2025 Lab Report',
              created_at: '2026-01-24T12:28:28.000Z',
              updated_at: '2026-01-24T12:28:28.000Z',
              base64_file: 'data:application/pdf;base64,JVBERi0xLg==',
              is_compressed: false,
            },
          ],
        },
      ],
    },
  ],
};

// export const mockProducts_ = [
//   {
//     id: '1',
//     productId: '202510271831',
//     iconUrl: {
//       id: 1,
//       url: '\\pet_product_images\\202510282119\\display\\display_202510282117_07_800x800.jpg',
//       base64_content: '',
//     },
//     product_names: [
//       { id: 1, name: 'Elizabeth Collar Pet Grooming Shield', type: 1 },
//       { id: 2, name: '狗仔花花頸圈', type: 2 },
//     ],
//     category: [1, 2],
//     customizations: [
//       {
//         id: 1,
//         name: 'custom package',
//         code: 'S000325',
//         remark: 'Testing',
//         images: [
//           {
//             id: 1,
//             url: '\\pet_product_images\\202510282119\\display\\display_202510282117_06_800x800.jpg',
//             base64_content: '',
//           },
//           {
//             id: 2,
//             url: '\\pet_product_images\\202510282119\\display\\display_202510282117_02_800x800.jpg',
//             base64_content: '',
//           },
//           {
//             id: 3,
//             url: '\\pet_product_images\\202510282119\\display\\display_202510282117_03_800x800.jpg',
//             base64_content: '',
//           },
//         ],
//       },
//       {
//         id: 2,
//         name: 'custom labels',
//         code: '',
//         remark: 'Testing2',
//         images: [
//           {
//             id: 1,
//             url: '\\pet_product_images\\202510282119\\display\\display_202510282117_03_800x800.jpg',
//             base64_content: '',
//           },
//         ],
//       },
//     ],
//     productLinks: [
//       {
//         id: 1,
//         link: 'http://yahoo.com.hk',
//         images: [
//           {
//             id: 1,
//             url: '\\pet_product_images\\202511032115\\display\\Main_01.jpg',
//             base64_content: '',
//           },
//         ],
//         remark: 'test remark',
//         date: '2025-10-27',
//       },
//       {
//         id: 2,
//         link: 'www.google.com',
//         images: [
//           {
//             id: 1,
//             url: '\\pet_product_images\\202511032115\\display\\Main_02.jpg',
//             base64_content: '',
//           },
//           {
//             id: 2,
//             url: '\\pet_product_images\\202511032115\\display\\Main_03.jpg',
//             base64_content: '',
//           },
//         ],
//         remark: '',
//         date: '2025-10-27',
//       },
//       {
//         id: 3,
//         link: 'www.google.com',
//         images: [
//           {
//             id: 1,
//             url: '\\pet_product_images\\202511032115\\display\\Main_04.jpg',
//             base64_content: '',
//           },
//           {
//             id: 2,
//             url: '\\pet_product_images\\202511032115\\display\\Main_05.jpg',
//             base64_content: '',
//           },
//         ],
//         remark: 'testing remark 3',
//         date: '2025-11-13',
//       },
//     ],
//     product_alibaba_ids: [
//       { id: 1, value: '10215135354354', link: 'http://yahoo.com.hk' },
//       { id: 2, value: '48412151513215', link: 'www.google.com' },
//       { id: 3, value: '84548454545888', link: 'www.instagram.com' },
//     ],
//     packings: [
//       { id: 1, L: 12, W: 52, H: 25, qty: 1, kg: 5, type: 1 },
//       { id: 2, L: 24, W: 52, H: 50, qty: 10, kg: 10, type: 2 },
//     ],
//     certificates: [
//       {
//         id: 1,
//         type: 1,
//         files: [
//           {
//             id: 1,
//             url: '\\pet_product_images\\202511032115\\display\\Main_02.jpg',
//             base64_content: '',
//           },
//         ],
//         remark: 'MSDS remark',
//       },
//       {
//         id: 2,
//         type: 2,
//         files: [
//           {
//             id: 1,
//             url: '\\pet_product_images\\202511032115\\display\\Main_01.jpg',
//             base64_content: '',
//           },
//         ],
//         remark: 'RoHS remark',
//       },
//     ],
//     remark: 'main remark',
//   },
// ];
