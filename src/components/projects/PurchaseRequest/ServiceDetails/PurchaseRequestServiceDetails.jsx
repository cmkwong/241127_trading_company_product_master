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

const PurchaseRequestServiceDetails = ({
  rows = [],
  serviceSuggestionOptions = [],
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
  fileUrlBase = '',
}) => {
  const columns = useMemo(
    () => [
      {
        key: 'service_id',
        label: 'Service',
        size: 'XXL',
        getSortValue: (row) => {
          const service = serviceSuggestionOptions.find(
            (item) => item.id === toSafeString(row?.service_id),
          );
          return toSafeString(service?.name || row?.service_id);
        },
        renderCell: (row) => (
          <div className={styles.suggestCell}>
            <Main_Suggest
              defaultSuggestions={serviceSuggestionOptions}
              defaultValue={
                serviceSuggestionOptions.find(
                  (item) => item.id === toSafeString(row?.service_id),
                )?.name || ''
              }
              placeholder="Search service"
              getSuggestionLabel={(suggestion) => suggestion?.name || ''}
              getSuggestionSearchText={(suggestion) =>
                toSafeString(
                  suggestion?.searchText ||
                    [suggestion?.name, suggestion?.id]
                      .filter(Boolean)
                      .join(' '),
                )
              }
              onChange={(ov, nv) => {
                if (!toSafeString(nv)) {
                  onSetField?.(row?.id, 'service_id', '');
                }
              }}
              onSelectSuggestion={(suggestion) =>
                onSetField?.(
                  row?.id,
                  'service_id',
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
            placeholder="Service details"
            onChange={(ov, nv) => onSetField?.(row?.id, 'details', nv)}
          />
        ),
      },
      {
        key: 'images',
        label: 'Service Images',
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
                row?.purchase_service_images,
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
      fileUrlBase,
      onFilesChange,
      onRemove,
      onSetField,
      serviceSuggestionOptions,
    ],
  );

  return (
    <Main_InputContainer label="Service Details">
      <div className={styles.tableSection}>
        <div className={styles.tableActions}>
          <div className={styles.tableActionsLeft}>
            <Main_Suggest
              defaultSuggestions={quotationSuggestionOptions}
              defaultValue={quotationSuggestionValue}
              placeholder="Select service item from quotation"
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
              text="Add Service Detail"
              ariaLabel="Add service detail"
              title="Add service detail"
            />
          </div>
        </div>

        <EditableDataTable
          rows={rows}
          columns={columns}
          rowKey="id"
          emptyMessage="No service details yet. Click + Add Service Detail."
        />
      </div>
    </Main_InputContainer>
  );
};

export default PurchaseRequestServiceDetails;
