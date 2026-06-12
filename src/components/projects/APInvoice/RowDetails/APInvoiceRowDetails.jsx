import { useMemo } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';

const APInvoiceRowDetails = ({
  rowDetails = [],
  currencyOptions = [],
  invoiceTypeOptions = [],
  fileUrlBase = '',
  onAddRow,
  onDeleteRow,
  onPatchRow,
  onChangeImages,
  onChangeFiles,
  buildDefaultUploadFiles,
}) => {
  const currencyDropdownOptions = useMemo(
    () =>
      (currencyOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.code || item?.name || item?.id || '').trim(),
      })),
    [currencyOptions],
  );

  const invoiceTypeDropdownOptions = useMemo(
    () =>
      (invoiceTypeOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.name || item?.id || '').trim(),
      })),
    [invoiceTypeOptions],
  );

  const columns = useMemo(
    () => [
      {
        key: 'ap_invoice_type',
        label: 'Invoice Type',
        size: 'L',
        sortType: 'string',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={invoiceTypeDropdownOptions}
            defaultSelectedOption={String(row?.ap_invoice_type || '')}
            onChange={(ov, nv) => onPatchRow?.(row, { ap_invoice_type: nv })}
          />
        ),
      },
      {
        key: 'description',
        label: 'Description',
        size: 'L',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextField
            defaultValue={String(row?.description || '')}
            placeholder="Row description"
            onChange={(ov, nv) => onPatchRow?.(row, { description: nv })}
          />
        ),
      },
      {
        key: 'currency_id',
        label: 'Currency',
        size: 'M',
        sortType: 'string',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={currencyDropdownOptions}
            defaultSelectedOption={String(row?.currency_id || '')}
            onChange={(ov, nv) => onPatchRow?.(row, { currency_id: nv })}
          />
        ),
      },
      {
        key: 'amount',
        label: 'Amount',
        size: 'M',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            type="number"
            defaultValue={String(row?.amount ?? '')}
            placeholder="Amount"
            onChange={(ov, nv) => onPatchRow?.(row, { amount: nv })}
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
            defaultValue={String(row?.details || '')}
            placeholder="Row details"
            rows={2}
            onChange={(ov, nv) => onPatchRow?.(row, { details: nv })}
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
            defaultValue={String(row?.remark || '')}
            placeholder="Internal remark (not printed)"
            rows={2}
            onChange={(ov, nv) => onPatchRow?.(row, { remark: nv })}
          />
        ),
      },
      {
        key: 'ap_invoice_row_detail_images',
        label: 'Row Images',
        size: 'XL',
        nextRow: true,
        sortable: false,
        renderCell: (row) => (
          <Main_FileUploads
            mode="image"
            compact
            tableCell
            hoverPreview
            compactButtonText="Upload"
            fileUrlBase={fileUrlBase}
            defaultImages={buildDefaultUploadFiles(
              row?.ap_invoice_row_detail_images,
              'image_name',
              'image_url',
              fileUrlBase,
            )}
            onChange={(oldFiles, newFiles) =>
              onChangeImages?.(row, oldFiles, newFiles)
            }
          />
        ),
      },
      {
        key: 'ap_invoice_row_detail_files',
        label: 'Row Files',
        size: 'XL',
        nextRow: true,
        sortable: false,
        renderCell: (row) => (
          <Main_FileUploads
            mode="file"
            compact
            tableCell
            hoverPreview
            compactButtonText="Upload"
            fileUrlBase={fileUrlBase}
            defaultFiles={buildDefaultUploadFiles(
              row?.ap_invoice_row_detail_files,
              'file_name',
              'file_url',
              fileUrlBase,
            )}
            onChange={(oldFiles, newFiles) =>
              onChangeFiles?.(row, oldFiles, newFiles)
            }
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        renderCell: (row) => <DeleteBtn onClick={() => onDeleteRow?.(row)} />,
      },
    ],
    [
      buildDefaultUploadFiles,
      currencyDropdownOptions,
      fileUrlBase,
      invoiceTypeDropdownOptions,
      onChangeFiles,
      onChangeImages,
      onDeleteRow,
      onPatchRow,
    ],
  );

  return (
    <Main_InputContainer label="AP Invoice Row Details">
      <div style={{ marginBottom: '10px' }}>
        <AddNewBtn
          text="Add Row Detail"
          onClick={onAddRow}
          title="Add AP invoice row detail"
          ariaLabel="Add AP invoice row detail"
        />
      </div>

      <EditableDataTable
        rows={rowDetails}
        columns={columns}
        rowKey="id"
        emptyMessage="No row details yet. Click + Add Row Detail."
      />
    </Main_InputContainer>
  );
};

export default APInvoiceRowDetails;
