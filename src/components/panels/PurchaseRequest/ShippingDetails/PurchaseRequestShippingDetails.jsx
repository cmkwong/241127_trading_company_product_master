import { memo, useMemo } from 'react';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import EditableDataForm from '../../../common/Forms/EditableDataForm';
import { sortByCreatedAt } from '../../../../utils/arr';
import styles from '../Main_PurchaseRequest.module.css';

const toSafeString = (value) => String(value || '').trim();
const toNumberOrEmpty = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

const isCheckedBoolean = (value, defaultWhenMissing = true) => {
  if (value === undefined || value === null || value === '') {
    return defaultWhenMissing;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  const normalized = toSafeString(value).toLowerCase();
  return !['false', '0', 'no', 'n', 'off'].includes(normalized);
};

const PurchaseRequestShippingDetails = ({
  rows = [],
  currencyDropdownOptions = [],
  quotationSuggestionOptions = [],
  onQuotationSuggestionSelect,
  onAdd,
  onSetField,
  onRemove,
  onAddDimension,
  onRemoveDimension,
  onSetDimensionField,
  buildDefaultUploadFiles,
  onImageFilesChange,
  onFilesChange,
  fileUrlBase = '',
}) => {
  const dimensionColumns = useMemo(
    () => [
      {
        key: 'length',
        label: 'Length',
        flex: '1 1 100px',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={toSafeString(row?.length)}
            placeholder="Length"
            onChange={(ov, nv) =>
              onSetDimensionField?.(row?.id, 'length', toNumberOrEmpty(nv))
            }
          />
        ),
      },
      {
        key: 'width',
        label: 'Width',
        flex: '1 1 100px',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={toSafeString(row?.width)}
            placeholder="Width"
            onChange={(ov, nv) =>
              onSetDimensionField?.(row?.id, 'width', toNumberOrEmpty(nv))
            }
          />
        ),
      },
      {
        key: 'height',
        label: 'Height',
        flex: '1 1 100px',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={toSafeString(row?.height)}
            placeholder="Height"
            onChange={(ov, nv) =>
              onSetDimensionField?.(row?.id, 'height', toNumberOrEmpty(nv))
            }
          />
        ),
      },
      {
        key: 'qty',
        label: 'Cartons',
        flex: '1 1 100px',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={toSafeString(row?.qty)}
            placeholder="Qty"
            onChange={(ov, nv) =>
              onSetDimensionField?.(row?.id, 'qty', toNumberOrEmpty(nv))
            }
          />
        ),
      },
      {
        key: 'weight',
        label: 'Weight / Carton',
        flex: '1 1 130px',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={toSafeString(row?.weight)}
            placeholder="kg"
            onChange={(ov, nv) =>
              onSetDimensionField?.(row?.id, 'weight', toNumberOrEmpty(nv))
            }
          />
        ),
      },
    ],
    [onSetDimensionField],
  );

  const columns = useMemo(
    () => [
      {
        key: 'address_text',
        label: 'Shipping Address',
        flex: '1 1 450px',
        sortType: 'string',
        getSortValue: (row) => toSafeString(row?.address_text),
        renderCell: (row) => (
          <Main_TextField
            defaultValue={toSafeString(row?.address_text)}
            placeholder="Shipping address"
            onChange={(ov, nv) => onSetField?.(row?.id, 'address_text', nv)}
          />
        ),
      },
      {
        key: 'sales_shipping_detail_id',
        label: 'Linked SQ Row',
        flex: '1 1 270px',
        sortType: 'string',
        getSortValue: (row) => {
          const matched = quotationSuggestionOptions.find(
            (item) =>
              toSafeString(item?.id) ===
              toSafeString(row?.sales_shipping_detail_id),
          );
          return toSafeString(matched?.name || row?.sales_shipping_detail_id);
        },
        renderCell: (row) => (
          <Main_Suggest
            defaultSuggestions={quotationSuggestionOptions}
            defaultValue={
              quotationSuggestionOptions.find(
                (item) =>
                  toSafeString(item?.id) ===
                  toSafeString(row?.sales_shipping_detail_id),
              )?.name || ''
            }
            placeholder="Select shipping item from quotation"
            getSuggestionLabel={(suggestion) => suggestion?.name || ''}
            getSuggestionSearchText={(suggestion) =>
              toSafeString(
                suggestion?.searchText ||
                  [suggestion?.name, suggestion?.id, suggestion?.details]
                    .filter(Boolean)
                    .join(' '),
              )
            }
            onChange={(ov, nv) => {
              if (!toSafeString(nv)) {
                onSetField?.(row?.id, 'sales_shipping_detail_id', '');
              }
            }}
            onSelectSuggestion={(suggestion) =>
              onQuotationSuggestionSelect?.(suggestion, row)
            }
          />
        ),
      },
      {
        key: 'api_selected',
        label: 'AP Invoice',
        flex: '1 1 90px',
        sortType: 'string',
        renderCell: (row) => (
          <div className={styles.checkboxCell}>
            <input
              type="checkbox"
              checked={isCheckedBoolean(row?.api_selected, true)}
              onChange={(event) =>
                onSetField?.(row?.id, 'api_selected', event.target.checked)
              }
            />
          </div>
        ),
      },
      {
        key: 'purchase_shipping_dimensions',
        label: 'Dimensions',
        flex: '1 1 100%',
        nextRow: true,
        sortable: false,
        nestedForm: (row) => ({
          rows: sortByCreatedAt(
            (row?.purchase_shipping_dimensions || []).filter(
              (dimension) => !dimension?._delete,
            ),
          ),
          columns: dimensionColumns,
          rowKey: 'id',
          emptyMessage: 'No dimensions for this shipping detail yet.',
          onAddRow: () => onAddDimension?.(toSafeString(row?.id)),
          addRowText: 'Add Dimension',
          addRowDisabled: !toSafeString(row?.id),
          onRemoveRow: (dimension) => onRemoveDimension?.(dimension?.id),
        }),
      },
      {
        key: 'currency_id',
        label: 'Currency',
        flex: '1 1 270px',
        sortType: 'string',
        nextRow: true,
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
        label: 'Total Cost',
        flex: '1 1 180px',
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
        key: 'details',
        label: 'Details',
        flex: '1 1 360px',
        nextRow: true,
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={toSafeString(row?.details)}
            rows={2}
            placeholder="Shipping details"
            onChange={(ov, nv) => onSetField?.(row?.id, 'details', nv)}
          />
        ),
      },
      {
        key: 'remark',
        label: 'Internal Remark',
        flex: '1 1 360px',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={toSafeString(row?.remark)}
            rows={2}
            placeholder="Internal remark (not printed)"
            onChange={(ov, nv) => onSetField?.(row?.id, 'remark', nv)}
          />
        ),
      },
      {
        key: 'images',
        label: 'Shipping Images',
        flex: '1 1 360px',
        nextRow: true,
        sortable: false,
        renderCell: (row) => (
          <div className={styles.uploadsCell}>
            <Main_FileUploads
              mode="image"
              compact
              tableCell
              hoverPreview
              compactButtonText="Upload"
              fileUrlBase={fileUrlBase}
              defaultImages={buildDefaultUploadFiles?.(
                row?.purchase_shipping_images,
                'image_name',
                'image_url',
              )}
              onChange={(oldFiles, newFiles) =>
                onImageFilesChange?.(row?.id, oldFiles, newFiles)
              }
            />
          </div>
        ),
      },
      {
        key: 'files',
        label: 'Shipping Files',
        flex: '1 1 360px',
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
                row?.purchase_shipping_files,
                'file_name',
                'file_url',
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
      fileUrlBase,
      onImageFilesChange,
      quotationSuggestionOptions,
      onFilesChange,
      onQuotationSuggestionSelect,
      onSetField,
      dimensionColumns,
      onAddDimension,
      onRemoveDimension,
    ],
  );

  return (
    <div className={styles.tableSection}>
      <EditableDataForm
        label="Shipping Details"
        rows={rows}
        columns={columns}
        rowKey="id"
        emptyMessage="No shipping details yet. Click + Add Shipping Detail."
        onAddRow={onAdd}
        addRowText="Add Shipping Detail"
        onRemoveRow={(row) => onRemove?.(row?.id)}
      />
    </div>
  );
};

export default memo(PurchaseRequestShippingDetails);
