import { useMemo } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import styles from '../Main_PurchaseRequest.module.css';

const toSafeString = (value) => String(value || '').trim();
const toNumberOrEmpty = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

const PurchaseRequestProductDetails = ({
  rows = [],
  productSuggestionOptions = [],
  currencyDropdownOptions = [],
  quotationSuggestionOptions = [],
  quotationSuggestionValue = '',
  onQuotationSuggestionInputChange,
  onQuotationSuggestionSelect,
  onAdd,
  onSetField,
  onRemove,
  buildDefaultUploadFiles,
  onFilesChange,
  resolveFileUrl,
  fileUrlBase = '',
}) => {
  const columns = useMemo(
    () => [
      {
        key: 'product_id',
        label: 'Product',
        size: 'XXL',
        getSortValue: (row) => {
          const product = productSuggestionOptions.find(
            (item) => item.id === toSafeString(row?.product_id),
          );
          return toSafeString(product?.name || row?.product_id);
        },
        renderCell: (row) => (
          <div className={styles.suggestCell}>
            <Main_Suggest
              defaultSuggestions={productSuggestionOptions}
              defaultValue={
                productSuggestionOptions.find(
                  (item) => item.id === toSafeString(row?.product_id),
                )?.name || ''
              }
              placeholder="Search product"
              getSuggestionLabel={(suggestion) => suggestion?.name || ''}
              getSuggestionSearchText={(suggestion) =>
                toSafeString(
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
                    {resolveFileUrl?.(suggestion?.icon_url) ? (
                      <img
                        src={resolveFileUrl?.(suggestion?.icon_url)}
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
                if (!toSafeString(nv)) {
                  onSetField?.(row?.id, 'product_id', '');
                }
              }}
              onSelectSuggestion={(suggestion) =>
                onSetField?.(
                  row?.id,
                  'product_id',
                  toSafeString(suggestion?.id),
                )
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
            defaultValue={toSafeString(row?.qty)}
            placeholder="Qty"
            onChange={(ov, nv) =>
              onSetField?.(row?.id, 'qty', toNumberOrEmpty(nv))
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
            defaultSelectedOption={toSafeString(row?.currency_id)}
            onChange={(ov, nv) => onSetField?.(row?.id, 'currency_id', nv)}
          />
        ),
      },
      {
        key: 'price',
        label: 'Price',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={toSafeString(row?.price)}
            placeholder="Price"
            onChange={(ov, nv) =>
              onSetField?.(row?.id, 'price', toNumberOrEmpty(nv))
            }
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        size: 'S',
        sortable: false,
        renderCell: (row) => <DeleteBtn onClick={() => onRemove?.(row?.id)} />,
      },
      {
        key: 'details',
        label: 'Details',
        size: 'XL',
        nextRow: true,
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={toSafeString(row?.details)}
            rows={2}
            placeholder="Product details"
            onChange={(ov, nv) => onSetField?.(row?.id, 'details', nv)}
          />
        ),
      },
      {
        key: 'images',
        label: 'Product Images',
        size: 'XL',
        nextRow: true,
        sortable: false,
        renderCell: (row) => (
          <div className={styles.uploadsCell}>
            <Main_FileUploads
              mode="file"
              compact
              tableCell
              hoverPreview
              compactButtonText="Upload"
              fileUrlBase={fileUrlBase}
              defaultFiles={buildDefaultUploadFiles?.(
                row?.purchase_product_images,
                'image_name',
                'image_url',
              )}
              onChange={(oldFiles, newFiles) =>
                onFilesChange?.(row?.id, oldFiles, newFiles)
              }
            />
          </div>
        ),
      },
    ],
    [
      buildDefaultUploadFiles,
      currencyDropdownOptions,
      onFilesChange,
      onRemove,
      onSetField,
      productSuggestionOptions,
      fileUrlBase,
      resolveFileUrl,
    ],
  );

  return (
    <Main_InputContainer label="Product Details">
      <div className={styles.tableSection}>
        <div className={styles.tableActions}>
          <div className={styles.tableActionsLeft}>
            <Main_Suggest
              defaultSuggestions={quotationSuggestionOptions}
              defaultValue={quotationSuggestionValue}
              placeholder="Select product item from quotation"
              getSuggestionLabel={(suggestion) => suggestion?.name || ''}
              getSuggestionSearchText={(suggestion) =>
                toSafeString(
                  suggestion?.searchText ||
                    [suggestion?.name, suggestion?.id, suggestion?.details]
                      .filter(Boolean)
                      .join(' '),
                )
              }
              onChange={(ov, nv) => onQuotationSuggestionInputChange?.(nv)}
              onSelectSuggestion={(suggestion) =>
                onQuotationSuggestionSelect?.(suggestion)
              }
            />
          </div>
          <div className={styles.tableActionsRight}>
            <AddNewBtn
              onClick={onAdd}
              text="Add Product Detail"
              ariaLabel="Add product detail"
              title="Add product detail"
            />
          </div>
        </div>

        <EditableDataTable
          rows={rows}
          columns={columns}
          rowKey="id"
          emptyMessage="No product details yet. Click + Add Product Detail."
        />
      </div>
    </Main_InputContainer>
  );
};

export default PurchaseRequestProductDetails;
