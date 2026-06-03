import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import styles from './Main_SalesProductDetails.module.css';

const FILE_SERVER_BASE_URL = 'http://localhost:3001';

const resolveIconUrl = (iconUrl) => {
  const normalized = String(iconUrl || '').trim();
  if (!normalized) {
    return '';
  }

  if (/^(blob:|data:|https?:\/\/)/i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('/')) {
    return `${FILE_SERVER_BASE_URL}${normalized}`;
  }

  return `${FILE_SERVER_BASE_URL}/${normalized}`;
};

const toNumber = (value, fallback = '') => {
  if (value === '' || value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const Main_SalesProductDetails = ({
  quotation,
  productOptions = [],
  currencyOptions = [],
  onPatchQuotation,
}) => {
  const productDetails = useMemo(
    () => quotation?.sales_product_details || [],
    [quotation?.sales_product_details],
  );
  const productImages = useMemo(
    () => quotation?.sales_product_detail_images || [],
    [quotation?.sales_product_detail_images],
  );

  const setProductDetails = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_product_details: nextRows });
    },
    [onPatchQuotation],
  );

  const setProductImages = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_product_detail_images: nextRows });
    },
    [onPatchQuotation],
  );

  const handleUpsertProductDetail = useCallback(
    (row, patch) => {
      const rowId = String(row?.id || uuidv4());
      const nextRow = {
        id: rowId,
        sales_quotation_id: quotation?.id,
        product_id: '',
        qty: 1,
        currency_id: '',
        price: '',
        details: '',
        ...row,
        ...patch,
      };

      const exists = productDetails.some((item) => item.id === rowId);
      if (exists) {
        setProductDetails(
          productDetails.map((item) => (item.id === rowId ? nextRow : item)),
        );
        return;
      }

      setProductDetails([...productDetails, nextRow]);
    },
    [quotation?.id, productDetails, setProductDetails],
  );

  const handleDeleteProductDetail = useCallback(
    (row) => {
      const rowId = String(row?.id || '');
      if (!rowId) return;

      setProductDetails(productDetails.filter((item) => item.id !== rowId));
      setProductImages(
        productImages.filter(
          (item) => String(item?.sales_product_detail_id || '') !== rowId,
        ),
      );
    },
    [productDetails, productImages, setProductDetails, setProductImages],
  );

  const handleAddProductDetail = useCallback(() => {
    setProductDetails([
      ...productDetails,
      {
        id: uuidv4(),
        sales_quotation_id: quotation?.id,
        product_id: productOptions[0]?.id || '',
        qty: 1,
        currency_id: currencyOptions[0]?.id || '',
        price: '',
        details: '',
      },
    ]);
  }, [
    productDetails,
    quotation?.id,
    productOptions,
    currencyOptions,
    setProductDetails,
  ]);

  const handleProductImagesChange = useCallback(
    (salesProductDetailId, newFiles = []) => {
      const detailId = String(salesProductDetailId || '').trim();
      if (!detailId) return;

      const preservedRows = productImages.filter(
        (item) => String(item?.sales_product_detail_id || '') !== detailId,
      );

      const mappedRows = (newFiles || []).map((file, index) => ({
        id: file?.id || uuidv4(),
        sales_product_detail_id: detailId,
        image_name: file?.name || `product-${index + 1}.jpg`,
        image_url: file?.url || '',
        display_order: index + 1,
      }));

      setProductImages([...preservedRows, ...mappedRows]);
    },
    [productImages, setProductImages],
  );

  const productDropdownOptions = useMemo(
    () =>
      (productOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.name || item?.label || item?.id || '').trim(),
        icon_url: String(item?.icon_url || '').trim(),
        category_name: String(item?.category_name || '').trim(),
        alibaba_id_value: String(item?.alibaba_id_value || '').trim(),
        searchText: String(item?.searchText || '').trim(),
      })),
    [productOptions],
  );

  const currencyDropdownOptions = useMemo(
    () =>
      (currencyOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.name || item?.label || item?.id || '').trim(),
      })),
    [currencyOptions],
  );

  const productColumns = useMemo(
    () => [
      {
        key: 'product_id',
        label: 'Product',
        sortType: 'string',
        getSortValue: (row) =>
          productDropdownOptions.find((item) => item.id === row.product_id)
            ?.name || '',
        renderCell: (row) => (
          <div className={styles.suggestCell}>
            <Main_Suggest
              defaultSuggestions={productDropdownOptions}
              defaultValue={
                productDropdownOptions.find(
                  (item) => item.id === row.product_id,
                )?.name || ''
              }
              placeholder="Search product"
              getSuggestionLabel={(suggestion) => suggestion?.name || ''}
              getSuggestionSearchText={(suggestion) =>
                String(
                  [
                    suggestion?.searchText,
                    suggestion?.id,
                    suggestion?.name,
                    suggestion?.category_name,
                    suggestion?.alibaba_id_value,
                  ]
                    .filter(Boolean)
                    .join(' '),
                )
              }
              renderSuggestion={(suggestion) => (
                <div className={styles.suggestionContent}>
                  <div className={styles.suggestionIconWrapper}>
                    {resolveIconUrl(suggestion?.icon_url) ? (
                      <img
                        src={resolveIconUrl(suggestion?.icon_url)}
                        alt={suggestion?.name || 'Product icon'}
                        className={styles.suggestionIcon}
                        loading="lazy"
                      />
                    ) : (
                      <span className={styles.suggestionIconFallback}>?</span>
                    )}
                  </div>
                  <div className={styles.suggestionTextBlock}>
                    <div className={styles.suggestionTitle}>
                      {suggestion?.name || ''}
                    </div>
                    <div className={styles.suggestionMeta}>
                      <span>
                        Category: {suggestion?.category_name || 'Uncategorized'}
                      </span>
                      <span>
                        Alibaba ID: {suggestion?.alibaba_id_value || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              onChange={(ov, nv) => {
                if (!String(nv || '').trim()) {
                  handleUpsertProductDetail(row, { product_id: '' });
                }
              }}
              onSelectSuggestion={(suggestion) =>
                handleUpsertProductDetail(row, {
                  product_id: String(suggestion?.id || '').trim(),
                })
              }
            />
          </div>
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
              handleUpsertProductDetail(row, { qty: toNumber(nv, 1) })
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
              handleUpsertProductDetail(row, { currency_id: nv })
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
              handleUpsertProductDetail(row, { price: toNumber(nv) })
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
            placeholder="Product details"
            rows={2}
            onChange={(ov, nv) =>
              handleUpsertProductDetail(row, { details: nv })
            }
          />
        ),
      },
      {
        key: 'images',
        label: 'Images',
        sortable: false,
        renderCell: (row) => {
          const defaultImages = productImages
            .filter(
              (image) =>
                String(image?.sales_product_detail_id || '') ===
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
                defaultImages={defaultImages}
                onChange={(ov, nv) => handleProductImagesChange(row?.id, nv)}
                onError={(error) => {
                  console.error('Sales product image upload error:', error);
                }}
                fileUrlBase={FILE_SERVER_BASE_URL}
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
          <DeleteBtn onClick={() => handleDeleteProductDetail(row)} />
        ),
      },
    ],
    [
      productDropdownOptions,
      currencyDropdownOptions,
      productImages,
      handleUpsertProductDetail,
      handleDeleteProductDetail,
      handleProductImagesChange,
    ],
  );

  return (
    <Main_InputContainer label="Sales Product Details">
      <div className={styles.tableSection}>
        <div className={styles.actionsBar}>
          <AddNewBtn
            onClick={handleAddProductDetail}
            text="Add Product Detail"
            ariaLabel="Add new product detail"
            title="Add Product Detail"
          />
        </div>

        <EditableDataTable
          rows={productDetails}
          columns={productColumns}
          rowKey="id"
          emptyMessage="No product details yet. Click + Add Product Detail."
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_SalesProductDetails;
