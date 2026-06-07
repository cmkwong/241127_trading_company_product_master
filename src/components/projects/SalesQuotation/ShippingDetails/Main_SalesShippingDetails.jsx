import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import styles from './Main_SalesShippingDetails.module.css';

const FILE_SERVER_BASE_URL = 'http://localhost:3001';

const toNumber = (value, fallback = '') => {
  if (value === '' || value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toInteger = (value, fallback = '') => {
  if (value === '' || value === null || value === undefined) {
    return fallback;
  }

  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const buildAddressPreview = (address) => {
  const detail = String(address?.address_detail || '').trim();
  if (detail) {
    return detail;
  }

  const parts = [
    address?.address,
    address?.line1,
    address?.line2,
    address?.city,
    address?.state || address?.province,
    address?.country,
    address?.postal_code || address?.zip_code,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join(', ');
  }

  return String(address?.name || address?.label || address?.id || '').trim();
};

const Main_SalesShippingDetails = ({
  quotation,
  customerAddressOptions = [],
  supplierOptions = [],
  shippingMethodOptions = [],
  currencyOptions = [],
  incotermOptions = [],
  onPatchQuotation,
}) => {
  const shippingDetails = useMemo(
    () => quotation?.sales_shipping_details || [],
    [quotation?.sales_shipping_details],
  );
  const shippingPrices = useMemo(
    () => quotation?.sales_shipping_prices || [],
    [quotation?.sales_shipping_prices],
  );
  const shippingImages = useMemo(
    () => quotation?.sales_shipping_images || [],
    [quotation?.sales_shipping_images],
  );
  const shippingInternalImages = useMemo(
    () => quotation?.sales_shipping_internal_images || [],
    [quotation?.sales_shipping_internal_images],
  );
  const shippingPriceImages = useMemo(
    () => quotation?.sales_shipping_price_images || [],
    [quotation?.sales_shipping_price_images],
  );
  const shippingPriceInternalImages = useMemo(
    () => quotation?.sales_shipping_price_internal_images || [],
    [quotation?.sales_shipping_price_internal_images],
  );
  const selectedCustomerId = String(quotation?.customer_id || '').trim();

  const setShippingDetails = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_shipping_details: nextRows });
    },
    [onPatchQuotation],
  );

  const setShippingPrices = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_shipping_prices: nextRows });
    },
    [onPatchQuotation],
  );

  const setShippingImages = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_shipping_images: nextRows });
    },
    [onPatchQuotation],
  );

  const setShippingInternalImages = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_shipping_internal_images: nextRows });
    },
    [onPatchQuotation],
  );

  const setShippingPriceImages = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_shipping_price_images: nextRows });
    },
    [onPatchQuotation],
  );

  const setShippingPriceInternalImages = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_shipping_price_internal_images: nextRows });
    },
    [onPatchQuotation],
  );

  const handleUpsertShippingDetail = useCallback(
    (row, patch) => {
      const rowId = String(row?.id || uuidv4());
      const nextRow = {
        id: rowId,
        sales_quotation_id: quotation?.id,
        remark: '',
        ...row,
        ...patch,
      };

      const exists = shippingDetails.some((item) => item.id === rowId);
      if (exists) {
        setShippingDetails(
          shippingDetails.map((item) => (item.id === rowId ? nextRow : item)),
        );
        return;
      }

      setShippingDetails([...shippingDetails, nextRow]);
    },
    [quotation?.id, shippingDetails, setShippingDetails],
  );

  const handleDeleteShippingDetail = useCallback(
    (row) => {
      const rowId = String(row?.id || '');
      if (!rowId) return;

      const removedPriceIds = shippingPrices
        .filter(
          (item) => String(item?.sales_shipping_detail_id || '') === rowId,
        )
        .map((item) => String(item?.id || '').trim())
        .filter(Boolean);
      const removedPriceIdSet = new Set(removedPriceIds);

      setShippingDetails(shippingDetails.filter((item) => item.id !== rowId));
      setShippingPrices(
        shippingPrices.filter(
          (item) => String(item?.sales_shipping_detail_id || '') !== rowId,
        ),
      );
      setShippingImages(
        shippingImages.filter(
          (item) => String(item?.sales_shipping_detail_id || '') !== rowId,
        ),
      );
      setShippingInternalImages(
        shippingInternalImages.filter(
          (item) => String(item?.sales_shipping_detail_id || '') !== rowId,
        ),
      );
      setShippingPriceImages(
        shippingPriceImages.filter(
          (item) =>
            !removedPriceIdSet.has(String(item?.sales_shipping_price_id || '')),
        ),
      );
      setShippingPriceInternalImages(
        shippingPriceInternalImages.filter(
          (item) =>
            !removedPriceIdSet.has(String(item?.sales_shipping_price_id || '')),
        ),
      );
    },
    [
      shippingDetails,
      shippingPrices,
      shippingImages,
      shippingInternalImages,
      shippingPriceImages,
      shippingPriceInternalImages,
      setShippingDetails,
      setShippingPrices,
      setShippingImages,
      setShippingInternalImages,
      setShippingPriceImages,
      setShippingPriceInternalImages,
    ],
  );

  const handleAddShippingDetail = useCallback(() => {
    const newId = uuidv4();
    setShippingDetails([
      ...shippingDetails,
      {
        id: newId,
        sales_quotation_id: quotation?.id,
        customer_address_id: quotation?.customer_address_id || '',
        length: '',
        width: '',
        height: '',
        qty: 0,
        weight: '',
        details: '',
        remark: '',
      },
    ]);
  }, [
    shippingDetails,
    quotation?.id,
    quotation?.customer_address_id,
    setShippingDetails,
  ]);

  const handleShippingImagesChange = useCallback(
    (shippingDetailId, newFiles = []) => {
      const detailId = String(shippingDetailId || '').trim();
      if (!detailId) return;

      const preservedRows = shippingImages.filter(
        (item) => String(item?.sales_shipping_detail_id || '') !== detailId,
      );

      const mappedRows = (newFiles || []).map((file, index) => ({
        id: file?.id || uuidv4(),
        sales_shipping_detail_id: detailId,
        image_url: file?.url || '',
        image_name: file?.name || `shipping-${index + 1}.jpg`,
        display_order: index + 1,
      }));

      setShippingImages([...preservedRows, ...mappedRows]);
    },
    [shippingImages, setShippingImages],
  );

  const handleShippingInternalImagesChange = useCallback(
    (shippingDetailId, newFiles = []) => {
      const detailId = String(shippingDetailId || '').trim();
      if (!detailId) return;

      const preservedRows = shippingInternalImages.filter(
        (item) => String(item?.sales_shipping_detail_id || '') !== detailId,
      );

      const mappedRows = (newFiles || []).map((file, index) => ({
        id: file?.id || uuidv4(),
        sales_shipping_detail_id: detailId,
        image_url: file?.url || '',
        image_name: file?.name || `shipping-internal-${index + 1}.jpg`,
        display_order: index + 1,
      }));

      setShippingInternalImages([...preservedRows, ...mappedRows]);
    },
    [shippingInternalImages, setShippingInternalImages],
  );

  const handleUpsertShippingPrice = useCallback(
    (row, patch) => {
      const rowId = String(row?.id || uuidv4());
      const nextRow = {
        id: rowId,
        sales_shipping_detail_id: row?.sales_shipping_detail_id || '',
        supplier_id: '',
        shipping_method_id: '',
        incoterms: '',
        currency_id: '',
        cost_currency_id: '',
        price: '',
        cost_price: '',
        delivery_lead_time_from: '',
        delivery_lead_time_to: '',
        details: '',
        remark: '',
        selected: false,
        ...row,
        ...patch,
      };

      const exists = shippingPrices.some((item) => item.id === rowId);
      if (exists) {
        setShippingPrices(
          shippingPrices.map((item) => (item.id === rowId ? nextRow : item)),
        );
        return;
      }

      setShippingPrices([...shippingPrices, nextRow]);
    },
    [shippingPrices, setShippingPrices],
  );

  const handleDeleteShippingPrice = useCallback(
    (row) => {
      const rowId = String(row?.id || '');
      if (!rowId) return;

      setShippingPrices(shippingPrices.filter((item) => item.id !== rowId));
      setShippingPriceImages(
        shippingPriceImages.filter(
          (item) => String(item?.sales_shipping_price_id || '') !== rowId,
        ),
      );
      setShippingPriceInternalImages(
        shippingPriceInternalImages.filter(
          (item) => String(item?.sales_shipping_price_id || '') !== rowId,
        ),
      );
    },
    [
      shippingPrices,
      shippingPriceImages,
      shippingPriceInternalImages,
      setShippingPrices,
      setShippingPriceImages,
      setShippingPriceInternalImages,
    ],
  );

  const handleShippingPriceImagesChange = useCallback(
    (shippingPriceId, newFiles = []) => {
      const priceId = String(shippingPriceId || '').trim();
      if (!priceId) return;

      const preservedRows = shippingPriceImages.filter(
        (item) => String(item?.sales_shipping_price_id || '') !== priceId,
      );

      const mappedRows = (newFiles || []).map((file, index) => ({
        id: file?.id || uuidv4(),
        sales_shipping_price_id: priceId,
        image_url: file?.url || '',
        image_name: file?.name || `shipping-price-${index + 1}.jpg`,
        display_order: index + 1,
      }));

      setShippingPriceImages([...preservedRows, ...mappedRows]);
    },
    [shippingPriceImages, setShippingPriceImages],
  );

  const handleShippingPriceInternalImagesChange = useCallback(
    (shippingPriceId, newFiles = []) => {
      const priceId = String(shippingPriceId || '').trim();
      if (!priceId) return;

      const preservedRows = shippingPriceInternalImages.filter(
        (item) => String(item?.sales_shipping_price_id || '') !== priceId,
      );

      const mappedRows = (newFiles || []).map((file, index) => ({
        id: file?.id || uuidv4(),
        sales_shipping_price_id: priceId,
        image_url: file?.url || '',
        image_name: file?.name || `shipping-price-internal-${index + 1}.jpg`,
        display_order: index + 1,
      }));

      setShippingPriceInternalImages([...preservedRows, ...mappedRows]);
    },
    [shippingPriceInternalImages, setShippingPriceInternalImages],
  );

  const handleAddShippingPrice = useCallback(
    (shippingDetailId) => {
      const detailId = String(shippingDetailId || '').trim();
      if (!detailId) return;

      setShippingPrices([
        ...shippingPrices,
        {
          id: uuidv4(),
          sales_shipping_detail_id: detailId,
          supplier_id: '',
          shipping_method_id: shippingMethodOptions[0]?.id || '',
          incoterms: incotermOptions[0]?.id || '',
          currency_id: currencyOptions[0]?.id || '',
          cost_currency_id: currencyOptions[0]?.id || '',
          price: '',
          cost_price: '',
          delivery_lead_time_from: '',
          delivery_lead_time_to: '',
          details: '',
          remark: '',
          selected: false,
        },
      ]);
    },
    [
      shippingPrices,
      shippingMethodOptions,
      incotermOptions,
      currencyOptions,
      setShippingPrices,
    ],
  );

  const handleToggleShippingPriceSelected = useCallback(
    (row, isSelected) => {
      const rowId = String(row?.id || '').trim();
      const detailId = String(row?.sales_shipping_detail_id || '').trim();

      if (!rowId || !detailId) {
        return;
      }

      if (!isSelected) {
        handleUpsertShippingPrice(row, { selected: false });
        return;
      }

      setShippingPrices(
        shippingPrices.map((item) => {
          const itemId = String(item?.id || '').trim();
          const itemDetailId = String(
            item?.sales_shipping_detail_id || '',
          ).trim();

          if (itemDetailId !== detailId) {
            return item;
          }

          return {
            ...item,
            selected: itemId === rowId,
          };
        }),
      );
    },
    [shippingPrices, setShippingPrices, handleUpsertShippingPrice],
  );

  const addressSuggestionOptions = useMemo(() => {
    const scopedAddresses = !selectedCustomerId
      ? customerAddressOptions || []
      : (customerAddressOptions || []).filter(
          (item) =>
            String(item?.customer_id || '').trim() === selectedCustomerId,
        );

    return scopedAddresses.map((item) => ({
      id: String(item?.id || '').trim(),
      name: buildAddressPreview(item),
      customer_id: String(item?.customer_id || '').trim(),
      address_detail: buildAddressPreview(item),
      searchText: [
        buildAddressPreview(item),
        String(item?.customer_id || '').trim(),
        String(item?.id || '').trim(),
      ]
        .filter(Boolean)
        .join(' '),
    }));
  }, [customerAddressOptions, selectedCustomerId]);

  const supplierDropdownOptions = useMemo(
    () =>
      (supplierOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.name || item?.label || item?.id || '').trim(),
        supplier_type_name: String(item?.supplier_type_name || '').trim(),
        supplier_code: String(item?.supplier_code || '').trim(),
        searchText: String(item?.searchText || '').trim(),
      })),
    [supplierOptions],
  );

  const shippingMethodSuggestionOptions = useMemo(
    () =>
      (shippingMethodOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.name || item?.label || item?.id || '').trim(),
        searchText: String(
          item?.searchText || item?.name || item?.label || item?.id || '',
        ).trim(),
      })),
    [shippingMethodOptions],
  );

  const currencyDropdownOptions = useMemo(
    () =>
      (currencyOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.name || item?.label || item?.id || '').trim(),
      })),
    [currencyOptions],
  );

  const incotermDropdownOptions = useMemo(
    () =>
      (incotermOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.name || item?.label || item?.id || '').trim(),
      })),
    [incotermOptions],
  );

  const shippingDetailColumns = useMemo(
    () => [
      {
        key: 'customer_address_id',
        label: 'Customer Address',
        size: 'XXL',
        sortType: 'string',
        getSortValue: (row) =>
          addressSuggestionOptions.find(
            (item) => item.id === row.customer_address_id,
          )?.name || '',
        renderCell: (row) => (
          <Main_Suggest
            defaultSuggestions={addressSuggestionOptions}
            defaultValue={
              addressSuggestionOptions.find(
                (item) => item.id === row.customer_address_id,
              )?.name || ''
            }
            placeholder="Search customer address"
            autoComplete="new-password"
            getSuggestionLabel={(suggestion) => suggestion?.name || ''}
            getSuggestionSearchText={(suggestion) =>
              String(
                suggestion?.searchText ||
                  [
                    suggestion?.name,
                    suggestion?.address_detail,
                    suggestion?.customer_id,
                    suggestion?.id,
                  ]
                    .filter(Boolean)
                    .join(' '),
              )
            }
            renderSuggestion={(suggestion) => (
              <div className={styles.suggestionContent}>
                <div className={styles.suggestionTitle}>
                  {suggestion?.name || suggestion?.id || ''}
                </div>
                <div className={styles.suggestionMeta}>
                  <span>Customer ID: {suggestion?.customer_id || '-'}</span>
                  <span>
                    Address Detail: {suggestion?.address_detail || '-'}
                  </span>
                </div>
              </div>
            )}
            onChange={(ov, nv) => {
              if (!String(nv || '').trim()) {
                handleUpsertShippingDetail(row, { customer_address_id: '' });
              }
            }}
            onSelectSuggestion={(suggestion) =>
              handleUpsertShippingDetail(row, {
                customer_address_id: String(suggestion?.id || '').trim(),
              })
            }
          />
        ),
      },
      {
        key: 'length',
        label: 'Length',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(row.length ?? '')}
            placeholder="Length"
            onChange={(ov, nv) =>
              handleUpsertShippingDetail(row, { length: toNumber(nv) })
            }
          />
        ),
      },
      {
        key: 'width',
        label: 'Width',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(row.width ?? '')}
            placeholder="Width"
            onChange={(ov, nv) =>
              handleUpsertShippingDetail(row, { width: toNumber(nv) })
            }
          />
        ),
      },
      {
        key: 'height',
        label: 'Height',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(row.height ?? '')}
            placeholder="Height"
            onChange={(ov, nv) =>
              handleUpsertShippingDetail(row, { height: toNumber(nv) })
            }
          />
        ),
      },
      {
        key: 'qty',
        label: 'Qty',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(row.qty ?? '')}
            placeholder="Qty"
            onChange={(ov, nv) =>
              handleUpsertShippingDetail(row, { qty: toNumber(nv, 0) })
            }
          />
        ),
      },
      {
        key: 'weight',
        label: 'Weight',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(row.weight ?? '')}
            placeholder="Weight"
            onChange={(ov, nv) =>
              handleUpsertShippingDetail(row, { weight: toNumber(nv) })
            }
          />
        ),
      },
      {
        key: 'details',
        label: 'Details',
        size: 'XL',
        nextRow: true,
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={row.details || ''}
            placeholder="Shipping details"
            rows={2}
            onChange={(ov, nv) =>
              handleUpsertShippingDetail(row, { details: nv })
            }
          />
        ),
      },
      {
        key: 'remark',
        label: 'Internal Remark',
        size: 'XL',
        nextRow: true,
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={row.remark || ''}
            placeholder="Internal remark (not printed)"
            rows={2}
            onChange={(ov, nv) =>
              handleUpsertShippingDetail(row, { remark: nv })
            }
          />
        ),
      },
      {
        key: 'images',
        label: 'Print Images',
        size: 'XL',
        nextRow: true,
        sortable: false,
        renderCell: (row) => {
          const defaultImages = shippingImages
            .filter(
              (image) =>
                String(image?.sales_shipping_detail_id || '') ===
                String(row?.id || ''),
            )
            .sort(
              (a, b) =>
                Number(a.display_order || 0) - Number(b.display_order || 0),
            )
            .map((image) => ({
              id: image.id,
              name: image.image_name,
              url: image.image_url,
              display_order: image.display_order,
            }));

          return (
            <div className={styles.uploadsCell}>
              <Main_FileUploads
                mode="image"
                label=""
                compact
                tableCell
                hoverPreview
                showDownloadButton={false}
                compactButtonText="Upload"
                fileUrlBase={FILE_SERVER_BASE_URL}
                defaultImages={defaultImages}
                onChange={(ov, nv) => handleShippingImagesChange(row?.id, nv)}
                onError={(error) => {
                  console.error('Shipping image upload error:', error);
                }}
              />
            </div>
          );
        },
      },
      {
        key: 'internal_images',
        label: 'Internal Images',
        size: 'XL',
        nextRow: true,
        sortable: false,
        renderCell: (row) => {
          const defaultImages = shippingInternalImages
            .filter(
              (image) =>
                String(image?.sales_shipping_detail_id || '') ===
                String(row?.id || ''),
            )
            .sort(
              (a, b) =>
                Number(a.display_order || 0) - Number(b.display_order || 0),
            )
            .map((image) => ({
              id: image.id,
              name: image.image_name,
              url: image.image_url,
              display_order: image.display_order,
            }));

          return (
            <div className={styles.uploadsCell}>
              <Main_FileUploads
                mode="image"
                label=""
                compact
                tableCell
                hoverPreview
                showDownloadButton={false}
                compactButtonText="Upload"
                fileUrlBase={FILE_SERVER_BASE_URL}
                defaultImages={defaultImages}
                onChange={(ov, nv) =>
                  handleShippingInternalImagesChange(row?.id, nv)
                }
                onError={(error) => {
                  console.error('Shipping internal image upload error:', error);
                }}
              />
            </div>
          );
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        size: 'S',
        sortable: false,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteShippingDetail(row)} />
        ),
      },
    ],
    [
      addressSuggestionOptions,
      shippingImages,
      shippingInternalImages,
      handleShippingImagesChange,
      handleShippingInternalImagesChange,
      handleUpsertShippingDetail,
      handleDeleteShippingDetail,
    ],
  );

  const shippingPriceColumns = useMemo(
    () => [
      {
        key: 'supplier_id',
        label: 'Supplier',
        size: 'L',
        sortType: 'string',
        getSortValue: (row) =>
          supplierDropdownOptions.find((item) => item.id === row.supplier_id)
            ?.name || '',
        renderCell: (row) => (
          <Main_Suggest
            defaultSuggestions={supplierDropdownOptions}
            defaultValue={
              supplierDropdownOptions.find(
                (item) => item.id === row.supplier_id,
              )?.name || ''
            }
            placeholder="Search supplier"
            getSuggestionLabel={(suggestion) => suggestion?.name || ''}
            getSuggestionSearchText={(suggestion) =>
              String(
                suggestion?.searchText ||
                  [
                    suggestion?.name,
                    suggestion?.supplier_type_name,
                    suggestion?.supplier_code,
                  ]
                    .filter(Boolean)
                    .join(' '),
              )
            }
            renderSuggestion={(suggestion) => (
              <div className={styles.suggestionContent}>
                <div className={styles.suggestionTitle}>
                  {suggestion?.name || ''}
                </div>
                <div className={styles.suggestionMeta}>
                  <span>
                    Supplier Type: {suggestion?.supplier_type_name || 'Unknown'}
                  </span>
                  <span>Supplier Code: {suggestion?.supplier_code || '-'}</span>
                </div>
              </div>
            )}
            onChange={(ov, nv) => {
              if (!String(nv || '').trim()) {
                handleUpsertShippingPrice(row, { supplier_id: '' });
              }
            }}
            onSelectSuggestion={(suggestion) =>
              handleUpsertShippingPrice(row, {
                supplier_id: String(suggestion?.id || '').trim(),
              })
            }
          />
        ),
      },
      {
        key: 'shipping_method_id',
        label: 'Shipping Method',
        size: 'L',
        sortType: 'string',
        getSortValue: (row) =>
          shippingMethodSuggestionOptions.find(
            (item) => item.id === row.shipping_method_id,
          )?.name || '',
        renderCell: (row) => (
          <Main_Suggest
            defaultSuggestions={shippingMethodSuggestionOptions}
            defaultValue={
              shippingMethodSuggestionOptions.find(
                (item) => item.id === row.shipping_method_id,
              )?.name || ''
            }
            placeholder="Search shipping method"
            getSuggestionLabel={(suggestion) => suggestion?.name || ''}
            getSuggestionSearchText={(suggestion) =>
              String(suggestion?.searchText || suggestion?.name || '')
            }
            onChange={(ov, nv) => {
              if (!String(nv || '').trim()) {
                handleUpsertShippingPrice(row, { shipping_method_id: '' });
              }
            }}
            onSelectSuggestion={(suggestion) =>
              handleUpsertShippingPrice(row, {
                shipping_method_id: String(suggestion?.id || '').trim(),
              })
            }
          />
        ),
      },
      {
        key: 'incoterms',
        label: 'Incoterms',
        size: 'M',
        sortType: 'string',
        renderCell: (row) => (
          <Main_Dropdown
            matchParentWidth
            defaultOptions={incotermDropdownOptions}
            defaultSelectedOption={row.incoterms || ''}
            onChange={(ov, nv) =>
              handleUpsertShippingPrice(row, { incoterms: nv })
            }
          />
        ),
      },
      {
        key: 'currency_id',
        label: 'Currency',
        size: 'L',
        sortType: 'string',
        renderCell: (row) => (
          <Main_Dropdown
            matchParentWidth
            defaultOptions={currencyDropdownOptions}
            defaultSelectedOption={row.currency_id || ''}
            onChange={(ov, nv) =>
              handleUpsertShippingPrice(row, { currency_id: nv })
            }
          />
        ),
      },
      {
        key: 'price',
        label: 'Sales Price',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(row.price ?? '')}
            placeholder="Price"
            onChange={(ov, nv) =>
              handleUpsertShippingPrice(row, { price: toNumber(nv) })
            }
          />
        ),
      },
      {
        key: 'cost_currency_id',
        label: 'Cost Currency',
        size: 'L',
        sortType: 'string',
        renderCell: (row) => (
          <Main_Dropdown
            matchParentWidth
            defaultOptions={currencyDropdownOptions}
            defaultSelectedOption={row.cost_currency_id || ''}
            onChange={(ov, nv) =>
              handleUpsertShippingPrice(row, { cost_currency_id: nv })
            }
          />
        ),
      },
      {
        key: 'cost_price',
        label: 'Cost Price',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(row.cost_price ?? '')}
            placeholder="Cost Price"
            onChange={(ov, nv) =>
              handleUpsertShippingPrice(row, { cost_price: toNumber(nv) })
            }
          />
        ),
      },
      {
        key: 'delivery_lead_time_from',
        label: 'Lead Time From (Days)',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(row.delivery_lead_time_from ?? '')}
            placeholder="From"
            onChange={(ov, nv) =>
              handleUpsertShippingPrice(row, {
                delivery_lead_time_from: toInteger(nv),
              })
            }
          />
        ),
      },
      {
        key: 'delivery_lead_time_to',
        label: 'Lead Time To (Days)',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(row.delivery_lead_time_to ?? '')}
            placeholder="To"
            onChange={(ov, nv) =>
              handleUpsertShippingPrice(row, {
                delivery_lead_time_to: toInteger(nv),
              })
            }
          />
        ),
      },
      {
        key: 'selected',
        label: 'Selected',
        size: 'S',
        sortType: 'string',
        renderCell: (row) => (
          <div className={styles.checkboxCell}>
            <input
              type="checkbox"
              checked={Boolean(row.selected)}
              onChange={(event) =>
                handleToggleShippingPriceSelected(row, event.target.checked)
              }
            />
          </div>
        ),
      },
      {
        key: 'details',
        label: 'Details',
        size: 'XL',
        nextRow: true,
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={row.details || ''}
            placeholder="Shipping price details"
            rows={2}
            onChange={(ov, nv) =>
              handleUpsertShippingPrice(row, { details: nv })
            }
          />
        ),
      },
      {
        key: 'remark',
        label: 'Internal Remark',
        size: 'XL',
        nextRow: true,
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={row.remark || ''}
            placeholder="Internal remark (not printed)"
            rows={2}
            onChange={(ov, nv) =>
              handleUpsertShippingPrice(row, { remark: nv })
            }
          />
        ),
      },
      {
        key: 'images',
        label: 'Print Images',
        size: 'XL',
        nextRow: true,
        sortable: false,
        renderCell: (row) => {
          const defaultImages = shippingPriceImages
            .filter(
              (image) =>
                String(image?.sales_shipping_price_id || '') ===
                String(row?.id || ''),
            )
            .sort(
              (a, b) =>
                Number(a.display_order || 0) - Number(b.display_order || 0),
            )
            .map((image) => ({
              id: image.id,
              name: image.image_name,
              url: image.image_url,
              display_order: image.display_order,
            }));

          return (
            <div className={styles.uploadsCell}>
              <Main_FileUploads
                mode="image"
                label=""
                compact
                tableCell
                hoverPreview
                showDownloadButton={false}
                compactButtonText="Upload"
                fileUrlBase={FILE_SERVER_BASE_URL}
                defaultImages={defaultImages}
                onChange={(ov, nv) =>
                  handleShippingPriceImagesChange(row?.id, nv)
                }
                onError={(error) => {
                  console.error('Shipping price image upload error:', error);
                }}
              />
            </div>
          );
        },
      },
      {
        key: 'internal_images',
        label: 'Internal Images',
        size: 'XL',
        nextRow: true,
        sortable: false,
        renderCell: (row) => {
          const defaultImages = shippingPriceInternalImages
            .filter(
              (image) =>
                String(image?.sales_shipping_price_id || '') ===
                String(row?.id || ''),
            )
            .sort(
              (a, b) =>
                Number(a.display_order || 0) - Number(b.display_order || 0),
            )
            .map((image) => ({
              id: image.id,
              name: image.image_name,
              url: image.image_url,
              display_order: image.display_order,
            }));

          return (
            <div className={styles.uploadsCell}>
              <Main_FileUploads
                mode="image"
                label=""
                compact
                tableCell
                hoverPreview
                showDownloadButton={false}
                compactButtonText="Upload"
                fileUrlBase={FILE_SERVER_BASE_URL}
                defaultImages={defaultImages}
                onChange={(ov, nv) =>
                  handleShippingPriceInternalImagesChange(row?.id, nv)
                }
                onError={(error) => {
                  console.error(
                    'Shipping price internal image upload error:',
                    error,
                  );
                }}
              />
            </div>
          );
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        size: 'S',
        sortable: false,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteShippingPrice(row)} />
        ),
      },
    ],
    [
      supplierDropdownOptions,
      shippingMethodSuggestionOptions,
      incotermDropdownOptions,
      currencyDropdownOptions,
      shippingPriceImages,
      shippingPriceInternalImages,
      handleUpsertShippingPrice,
      handleToggleShippingPriceSelected,
      handleShippingPriceImagesChange,
      handleShippingPriceInternalImagesChange,
      handleDeleteShippingPrice,
    ],
  );

  return (
    <div className={styles.sectionStack}>
      <Main_InputContainer label="Sales Shipping Details">
        <div className={styles.tableSection}>
          <div className={styles.actionsBar}>
            <AddNewBtn
              onClick={handleAddShippingDetail}
              text="Add Shipping Detail"
              ariaLabel="Add new shipping detail"
              title="Add Shipping Detail"
            />
          </div>

          <EditableDataTable
            rows={shippingDetails}
            columns={shippingDetailColumns}
            rowKey="id"
            emptyMessage="No shipping details yet. Click + Add Shipping Detail."
          />

          <div className={styles.pricesByDetailSection}>
            <div className={styles.pricesByDetailHeading}>
              Sales Shipping Prices (By Shipping Detail)
            </div>

            {shippingDetails.length === 0 && (
              <span className={styles.helperText}>
                Add at least one shipping detail first.
              </span>
            )}

            {shippingDetails.map((detailRow, detailIndex) => {
              const detailId = String(detailRow?.id || '').trim();
              const detailLabel =
                String(detailRow?.details || '').trim() ||
                `Shipping Detail ${String(detailIndex + 1)}`;

              return (
                <div
                  key={
                    detailId || `shipping-detail-price-${String(detailIndex)}`
                  }
                  className={styles.detailPriceCard}
                >
                  <div className={styles.detailPriceHeader}>
                    <h4 className={styles.detailPriceTitle}>{detailLabel}</h4>
                    <AddNewBtn
                      onClick={() => handleAddShippingPrice(detailId)}
                      text="Add Shipping Price"
                      ariaLabel={`Add shipping price for ${detailLabel}`}
                      title="Add Shipping Price"
                      disabled={!detailId}
                    />
                  </div>

                  <EditableDataTable
                    rows={shippingPrices.filter(
                      (item) =>
                        String(item?.sales_shipping_detail_id || '') ===
                        detailId,
                    )}
                    columns={shippingPriceColumns}
                    rowKey="id"
                    emptyMessage="No shipping prices for this detail yet."
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Main_InputContainer>
    </div>
  );
};

export default Main_SalesShippingDetails;
