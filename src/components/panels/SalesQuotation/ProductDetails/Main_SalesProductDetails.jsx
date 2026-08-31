import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Sub_SuggestionCard from '../../../common/InputOptions/Suggest/Sub_SuggestionCard';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import {
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';
import {
  getDiscountedRate,
  isSelectedFlag,
  normalizeDiscountPercent,
} from '../utils/quotationTotals';
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
  productOptions = [],
  currencyOptions = [],
  onPatchQuotation,
}) => {
  const quotationId = useEntityField('sales_quotations', 'id');
  const productDetails = useEntityRows(
    'sales_quotations',
    'sales_product_details',
  );
  const productImages = useEntityRows(
    'sales_quotations',
    'sales_product_detail_images',
  );
  const productInternalImages = useEntityRows(
    'sales_quotations',
    'sales_product_detail_internal_images',
  );
  const productInternalFiles = useEntityRows(
    'sales_quotations',
    'sales_product_detail_internal_files',
  );

  const setProductDetails = useCallback(
    (nextRowsOrUpdater) => {
      onPatchQuotation((currentQuotation) => {
        const previousRows = currentQuotation?.sales_product_details || [];
        const nextRows =
          typeof nextRowsOrUpdater === 'function'
            ? nextRowsOrUpdater(previousRows)
            : nextRowsOrUpdater;

        return { sales_product_details: nextRows };
      });
    },
    [onPatchQuotation],
  );

  const setProductImages = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_product_detail_images: nextRows });
    },
    [onPatchQuotation],
  );

  const setProductInternalImages = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_product_detail_internal_images: nextRows });
    },
    [onPatchQuotation],
  );

  const setProductInternalFiles = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_product_detail_internal_files: nextRows });
    },
    [onPatchQuotation],
  );

  const handleUpsertProductDetail = useCallback(
    (row, patch) => {
      const rowId = String(row?.id || uuidv4());
      const nextRow = {
        id: rowId,
        sales_quotation_id: quotationId,
        product_id: '',
        qty: 1,
        currency_id: '',
        cost_currency_id: '',
        price: '',
        discount_percent: 0,
        cost_price: '',
        details: '',
        override_product_name: '',
        remark: '',
        selected: true,
        ari_selected: true,
        ...row,
        ...patch,
      };

      setProductDetails((previousRows) => {
        const exists = previousRows.some(
          (item) => String(item?.id || '') === rowId,
        );

        if (exists) {
          return previousRows.map((item) =>
            String(item?.id || '') === rowId ? nextRow : item,
          );
        }

        return [...previousRows, nextRow];
      });
    },
    [quotationId, setProductDetails],
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
      setProductInternalImages(
        productInternalImages.filter(
          (item) => String(item?.sales_product_detail_id || '') !== rowId,
        ),
      );
      setProductInternalFiles(
        productInternalFiles.filter(
          (item) => String(item?.sales_product_detail_id || '') !== rowId,
        ),
      );
    },
    [
      productDetails,
      productImages,
      productInternalImages,
      productInternalFiles,
      setProductDetails,
      setProductImages,
      setProductInternalImages,
      setProductInternalFiles,
    ],
  );

  const handleAddProductDetail = useCallback(() => {
    setProductDetails((previousRows) => [
      ...previousRows,
      {
        id: uuidv4(),
        sales_quotation_id: quotationId,
        product_id: productOptions[0]?.id || '',
        qty: 1,
        currency_id: currencyOptions[0]?.id || '',
        cost_currency_id: currencyOptions[0]?.id || '',
        price: '',
        discount_percent: 0,
        cost_price: '',
        details: '',
        override_product_name: '',
        remark: '',
        selected: true,
        ari_selected: true,
      },
    ]);
  }, [quotationId, productOptions, currencyOptions, setProductDetails]);

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

  const handleProductInternalImagesChange = useCallback(
    (salesProductDetailId, newFiles = []) => {
      const detailId = String(salesProductDetailId || '').trim();
      if (!detailId) return;

      const preservedRows = productInternalImages.filter(
        (item) => String(item?.sales_product_detail_id || '') !== detailId,
      );

      const mappedRows = (newFiles || []).map((file, index) => ({
        id: file?.id || uuidv4(),
        sales_product_detail_id: detailId,
        image_name: file?.name || `product-internal-${index + 1}.jpg`,
        image_url: file?.url || '',
        display_order: index + 1,
      }));

      setProductInternalImages([...preservedRows, ...mappedRows]);
    },
    [productInternalImages, setProductInternalImages],
  );

  const handleProductInternalFilesChange = useCallback(
    (salesProductDetailId, newFiles = []) => {
      const detailId = String(salesProductDetailId || '').trim();
      if (!detailId) return;

      const preservedRows = productInternalFiles.filter(
        (item) => String(item?.sales_product_detail_id || '') !== detailId,
      );

      const mappedRows = (newFiles || []).map((file, index) => ({
        id: file?.id || uuidv4(),
        sales_product_detail_id: detailId,
        file_name: file?.name || `product-internal-${index + 1}`,
        file_url: file?.url || '',
        display_order: index + 1,
      }));

      setProductInternalFiles([...preservedRows, ...mappedRows]);
    },
    [productInternalFiles, setProductInternalFiles],
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
        size: 'XXL',
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
                <Sub_SuggestionCard
                  iconUrl={resolveIconUrl(suggestion?.icon_url)}
                  iconAlt={suggestion?.name || 'Product icon'}
                  title={suggestion?.name || ''}
                  metaItems={[
                    {
                      label: 'Category',
                      value: suggestion?.category_name || 'Uncategorized',
                    },
                    {
                      label: 'Alibaba ID',
                      value: suggestion?.alibaba_id_value || '-',
                    },
                  ]}
                  linkTo={`/panel/product_master/${suggestion?.id || ''}`}
                />
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
        size: 'M',
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
        size: 'L',
        sortType: 'string',
        renderCell: (row) => (
          <Main_Dropdown
            matchParentWidth
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
              handleUpsertProductDetail(row, { price: toNumber(nv) })
            }
          />
        ),
      },
      {
        key: 'discount_percent',
        label: 'Discount %',
        size: 'S',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(
              normalizeDiscountPercent(row.discount_percent),
            )}
            placeholder="0"
            onChange={(ov, nv) =>
              handleUpsertProductDetail(row, {
                discount_percent: normalizeDiscountPercent(nv),
              })
            }
          />
        ),
      },
      {
        key: 'discount_sales_price',
        label: 'Discount Sales Price',
        size: 'M',
        sortType: 'number',
        getSortValue: (row) =>
          getDiscountedRate(row?.price, row?.discount_percent),
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(
              Number.isFinite(
                getDiscountedRate(row?.price, row?.discount_percent),
              )
                ? getDiscountedRate(row?.price, row?.discount_percent)
                : '',
            )}
            placeholder="Auto"
            disabled
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
              checked={isSelectedFlag(row?.selected, true)}
              onChange={(event) =>
                handleUpsertProductDetail(row, {
                  selected: event.target.checked,
                })
              }
            />
          </div>
        ),
      },
      {
        key: 'ari_selected',
        label: 'AR Invoice',
        size: 'S',
        sortType: 'string',
        renderCell: (row) => (
          <div className={styles.checkboxCell}>
            <input
              type="checkbox"
              checked={isSelectedFlag(row?.ari_selected, true)}
              onChange={(event) =>
                handleUpsertProductDetail(row, {
                  ari_selected: event.target.checked,
                })
              }
            />
          </div>
        ),
      },
      {
        key: 'override_product_name',
        label: 'Override Product Name (Print)',
        size: 'XXL',
        sortType: 'string',
        nextRow: true,
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.override_product_name || ''}
            placeholder="Override print product name"
            onChange={(ov, nv) =>
              handleUpsertProductDetail(row, { override_product_name: nv })
            }
          />
        ),
      },
      {
        key: 'cost_currency_id',
        label: 'Cost Currency',
        size: 'L',
        nextRow: true,
        sortType: 'string',
        renderCell: (row) => (
          <Main_Dropdown
            matchParentWidth
            defaultOptions={currencyDropdownOptions}
            defaultSelectedOption={row.cost_currency_id || ''}
            onChange={(ov, nv) =>
              handleUpsertProductDetail(row, { cost_currency_id: nv })
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
              handleUpsertProductDetail(row, { cost_price: toNumber(nv) })
            }
          />
        ),
      },
      {
        key: 'details',
        label: 'Details',
        size: 'XL',
        sortType: 'string',
        nextRow: true,
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
        key: 'remark',
        label: 'Internal Remark',
        size: 'XL',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={row.remark || ''}
            placeholder="Internal remark (not printed)"
            rows={2}
            onChange={(ov, nv) =>
              handleUpsertProductDetail(row, { remark: nv })
            }
          />
        ),
      },
      {
        key: 'images',
        label: 'Print Images',
        size: 'XL',
        sortable: false,
        nextRow: true,
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
        key: 'internal_images',
        label: 'Internal Images',
        size: 'XL',
        sortable: false,
        nextRow: true,
        renderCell: (row) => {
          const defaultImages = productInternalImages
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
                onChange={(ov, nv) =>
                  handleProductInternalImagesChange(row?.id, nv)
                }
                onError={(error) => {
                  console.error(
                    'Sales product internal image upload error:',
                    error,
                  );
                }}
                fileUrlBase={FILE_SERVER_BASE_URL}
              />
            </div>
          );
        },
      },
      {
        key: 'internal_files',
        label: 'Internal Files',
        size: 'XL',
        sortable: false,
        renderCell: (row) => {
          const defaultFiles = productInternalFiles
            .filter(
              (file) =>
                String(file?.sales_product_detail_id || '') ===
                String(row?.id || ''),
            )
            .sort(
              (a, b) =>
                Number(a.display_order || 0) - Number(b.display_order || 0),
            )
            .map((file) => ({
              id: file.id,
              name: file.file_name,
              url: file.file_url,
              display_order: file.display_order,
            }));

          return (
            <div className={styles.uploadsCell}>
              <Main_FileUploads
                mode="file"
                label=""
                compact
                tableCell
                hoverPreview
                showDownloadButton={false}
                compactButtonText="Upload"
                defaultFiles={defaultFiles}
                onChange={(ov, nv) =>
                  handleProductInternalFilesChange(row?.id, nv)
                }
                onError={(error) => {
                  console.error(
                    'Sales product internal file upload error:',
                    error,
                  );
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
        size: 'S',
        sortable: false,
        nextRow: true,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteProductDetail(row)} />
        ),
      },
    ],
    [
      productDropdownOptions,
      currencyDropdownOptions,
      productImages,
      productInternalImages,
      productInternalFiles,
      handleUpsertProductDetail,
      handleDeleteProductDetail,
      handleProductImagesChange,
      handleProductInternalImagesChange,
      handleProductInternalFilesChange,
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
