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

  const handleUpsertShippingDetail = useCallback(
    (row, patch) => {
      const rowId = String(row?.id || uuidv4());
      const nextRow = {
        id: rowId,
        sales_quotation_id: quotation?.id,
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
    },
    [
      shippingDetails,
      shippingPrices,
      shippingImages,
      setShippingDetails,
      setShippingPrices,
      setShippingImages,
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

  const handleUpsertShippingPrice = useCallback(
    (row, patch) => {
      const rowId = String(row?.id || uuidv4());
      const nextRow = {
        id: rowId,
        sales_shipping_detail_id: row?.sales_shipping_detail_id || '',
        supplier_id: '',
        incoterms: '',
        currency_id: '',
        price: '',
        details: '',
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
    },
    [shippingPrices, setShippingPrices],
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
          incoterms: incotermOptions[0]?.id || '',
          currency_id: currencyOptions[0]?.id || '',
          price: '',
          details: '',
          selected: false,
        },
      ]);
    },
    [shippingPrices, incotermOptions, currencyOptions, setShippingPrices],
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
        key: 'images',
        label: 'Images',
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
        key: 'actions',
        label: 'Actions',
        sortable: false,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteShippingDetail(row)} />
        ),
      },
    ],
    [
      addressSuggestionOptions,
      shippingImages,
      handleShippingImagesChange,
      handleUpsertShippingDetail,
      handleDeleteShippingDetail,
    ],
  );

  const shippingPriceColumns = useMemo(
    () => [
      {
        key: 'supplier_id',
        label: 'Supplier',
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
        key: 'incoterms',
        label: 'Incoterms',
        sortType: 'string',
        renderCell: (row) => (
          <Main_Dropdown
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
        sortType: 'string',
        renderCell: (row) => (
          <Main_Dropdown
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
        label: 'Price',
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
        key: 'selected',
        label: 'Selected',
        sortType: 'string',
        renderCell: (row) => (
          <div className={styles.checkboxCell}>
            <input
              type="checkbox"
              checked={Boolean(row.selected)}
              onChange={(event) =>
                handleUpsertShippingPrice(row, {
                  selected: event.target.checked,
                })
              }
            />
          </div>
        ),
      },
      {
        key: 'details',
        label: 'Details',
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
        key: 'actions',
        label: 'Actions',
        sortable: false,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteShippingPrice(row)} />
        ),
      },
    ],
    [
      supplierDropdownOptions,
      incotermDropdownOptions,
      currencyDropdownOptions,
      handleUpsertShippingPrice,
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
