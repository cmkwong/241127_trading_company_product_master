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

const PurchaseRequestShippingDetails = ({
  rows = [],
  currencyDropdownOptions = [],
  quotationSuggestionOptions = [],
  onQuotationSuggestionSelect,
  onAdd,
  onSetField,
  onRemove,
  buildDefaultUploadFiles,
  onFilesChange,
  fileUrlBase = '',
}) => {
  const columns = useMemo(
    () => [
      {
        key: 'address_text',
        label: 'Shipping Address',
        size: 'XXL',
        sortType: 'string',
        getSortValue: (row) => toSafeString(row?.address_text),
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={toSafeString(row?.address_text)}
            rows={2}
            placeholder="Shipping address"
            onChange={(ov, nv) => onSetField?.(row?.id, 'address_text', nv)}
          />
        ),
      },
      {
        key: 'sales_shipping_detail_id',
        label: 'Linked SQ Row',
        size: 'L',
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
        key: 'length',
        label: 'Length',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={toSafeString(row?.length)}
            placeholder="Length"
            onChange={(ov, nv) =>
              onSetField?.(row?.id, 'length', toNumberOrEmpty(nv))
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
            defaultValue={toSafeString(row?.width)}
            placeholder="Width"
            onChange={(ov, nv) =>
              onSetField?.(row?.id, 'width', toNumberOrEmpty(nv))
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
            defaultValue={toSafeString(row?.height)}
            placeholder="Height"
            onChange={(ov, nv) =>
              onSetField?.(row?.id, 'height', toNumberOrEmpty(nv))
            }
          />
        ),
      },
      {
        key: 'quantity',
        label: 'Qty',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={toSafeString(row?.quantity)}
            placeholder="Quantity"
            onChange={(ov, nv) =>
              onSetField?.(row?.id, 'quantity', toNumberOrEmpty(nv))
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
            defaultValue={toSafeString(row?.weight)}
            placeholder="Weight"
            onChange={(ov, nv) =>
              onSetField?.(row?.id, 'weight', toNumberOrEmpty(nv))
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
        key: 'details',
        label: 'Details',
        size: 'XL',
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
        size: 'XL',
        nextRow: true,
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
                row?.purchase_shipping_images,
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
      {
        key: 'actions',
        label: 'Actions',
        size: 'S',
        sortable: false,
        renderCell: (row) => <DeleteBtn onClick={() => onRemove?.(row?.id)} />,
      },
    ],
    [
      buildDefaultUploadFiles,
      currencyDropdownOptions,
      fileUrlBase,
      quotationSuggestionOptions,
      onFilesChange,
      onQuotationSuggestionSelect,
      onRemove,
      onSetField,
    ],
  );

  return (
    <Main_InputContainer label="Shipping Details">
      <div className={styles.tableSection}>
        <div className={styles.tableActions}>
          <div className={styles.tableActionsRight}>
            <AddNewBtn
              onClick={onAdd}
              text="Add Shipping Detail"
              ariaLabel="Add shipping detail"
              title="Add shipping detail"
            />
          </div>
        </div>

        <EditableDataTable
          rows={rows}
          columns={columns}
          rowKey="id"
          emptyMessage="No shipping details yet. Click + Add Shipping Detail."
        />
      </div>
    </Main_InputContainer>
  );
};

export default PurchaseRequestShippingDetails;
