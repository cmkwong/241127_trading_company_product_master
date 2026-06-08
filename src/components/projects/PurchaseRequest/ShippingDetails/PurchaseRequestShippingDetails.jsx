import { useMemo } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
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
  supplierAddressSuggestionOptions = [],
  quotationSuggestionOptions = [],
  quotationSuggestionValue = '',
  onQuotationSuggestionInputChange,
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
        key: 'supplier_address_id',
        label: 'Supplier Address',
        size: 'XXL',
        getSortValue: (row) => {
          const match = supplierAddressSuggestionOptions.find(
            (item) => item.id === toSafeString(row?.supplier_address_id),
          );
          return toSafeString(match?.name || row?.supplier_address_id);
        },
        renderCell: (row) => (
          <div className={styles.suggestCell}>
            <Main_Suggest
              defaultSuggestions={supplierAddressSuggestionOptions}
              defaultValue={
                supplierAddressSuggestionOptions.find(
                  (item) => item.id === toSafeString(row?.supplier_address_id),
                )?.name || ''
              }
              placeholder="Search supplier address"
              autoComplete="new-password"
              getSuggestionLabel={(suggestion) => suggestion?.name || ''}
              getSuggestionSearchText={(suggestion) =>
                toSafeString(
                  suggestion?.searchText ||
                    [
                      suggestion?.name,
                      suggestion?.address_detail,
                      suggestion?.supplier_id,
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
                    <span>Address ID: {suggestion?.id || '-'}</span>
                    <span>
                      Address Detail: {suggestion?.address_detail || '-'}
                    </span>
                  </div>
                </div>
              )}
              onChange={(ov, nv) => {
                if (!toSafeString(nv)) {
                  onSetField?.(row?.id, 'supplier_address_id', '');
                }
              }}
              onSelectSuggestion={(suggestion) =>
                onSetField?.(
                  row?.id,
                  'supplier_address_id',
                  toSafeString(suggestion?.id),
                )
              }
            />
          </div>
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
            placeholder="Shipping details"
            onChange={(ov, nv) => onSetField?.(row?.id, 'details', nv)}
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
    ],
    [
      buildDefaultUploadFiles,
      fileUrlBase,
      onFilesChange,
      onRemove,
      onSetField,
      supplierAddressSuggestionOptions,
    ],
  );

  return (
    <Main_InputContainer label="Shipping Details">
      <div className={styles.tableSection}>
        <div className={styles.tableActions}>
          <div className={styles.tableActionsLeft}>
            <Main_Suggest
              defaultSuggestions={quotationSuggestionOptions}
              defaultValue={quotationSuggestionValue}
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
              onChange={(ov, nv) => onQuotationSuggestionInputChange?.(nv)}
              onSelectSuggestion={(suggestion) =>
                onQuotationSuggestionSelect?.(suggestion)
              }
            />
          </div>
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
