import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import {
  upsertEntityData,
  useEntityRows,
  useEntityField,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { sortByDisplayOrder } from '../../../../utils/arr';

const Main_CertificateData = () => {
  const { certType } = useMasterContext();
  const productId = useEntityField('products', 'id');
  const certificateRows = useEntityRows('products', 'product_certificates');

  const certTypeOptions = useMemo(
    () =>
      (certType || []).map((item) => ({
        id: item.id,
        name: item.label ?? item.name ?? '',
      })),
    [certType],
  );

  const upsertCertificateRow = useCallback(
    (row, patch) => {
      upsertEntityData('products', {
        product_certificates: [
          {
            id: row?.id || uuidv4(),
            product_id: productId,
            ...patch,
          },
        ],
      });
    },
    [upsertEntityData, productId],
  );

  const handleAddCertificateRow = useCallback(() => {
    upsertEntityData('products', {
      product_certificates: [
        {
          id: uuidv4(),
          product_id: productId,
          certificate_type_id: '',
          remark: '',
          product_certificate_files: [],
        },
      ],
    });
  }, [upsertEntityData, productId]);

  const handleDeleteCertificateRow = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertEntityData('products', {
        product_certificates: [
          {
            id: row.id,
            _delete: true,
          },
        ],
      });
    },
    [upsertEntityData],
  );

  const handleCertificateFilesChange = useCallback(
    (row, oldFiles = [], newFiles = []) => {
      const oldList = Array.isArray(oldFiles) ? oldFiles : [];
      const newList = Array.isArray(newFiles) ? newFiles : [];

      const removedFiles = oldList.filter(
        (oldFile) => !newList.some((newFile) => newFile.id === oldFile.id),
      );

      const addedFiles = newList.filter(
        (newFile) => !oldList.some((oldFile) => oldFile.id === newFile.id),
      );

      const sameLength = oldList.length === newList.length;
      const sameOrder =
        sameLength && oldList.every((file, i) => file.id === newList[i]?.id);

      if (removedFiles.length === 0 && addedFiles.length === 0 && sameOrder) {
        return;
      }

      if (removedFiles.length > 0) {
        upsertCertificateRow(row, {
          product_certificate_files: removedFiles.map((file) => ({
            id: file.id,
            _delete: true,
          })),
        });
      }

      if (newList.length > 0) {
        const addedFileIds = new Set(addedFiles.map((file) => file.id));

        upsertCertificateRow(row, {
          product_certificate_files: newList.map((file, index) => ({
            id: file.id,
            display_order: index + 1,
            ...(addedFileIds.has(file.id)
              ? {
                  file_name: file.name,
                  file_size: file.size,
                  file_type: file.type,
                  file_url: file.url,
                }
              : {}),
          })),
        });
      }
    },
    [upsertCertificateRow],
  );

  const columns = useMemo(
    () => [
      {
        key: 'certificate_type_id',
        label: 'Certificate Type',
        size: 'L',
        sortType: 'string',
        getSortValue: (row) => {
          const option = certTypeOptions.find(
            (opt) => opt.id === row.certificate_type_id,
          );
          return option?.name || '';
        },
        renderCell: (row) => (
          <Main_Dropdown
            matchParentWidth
            defaultOptions={certTypeOptions}
            defaultSelectedOption={row.certificate_type_id || ''}
            onChange={(ov, nv) =>
              upsertCertificateRow(row, { certificate_type_id: nv })
            }
          />
        ),
      },
      {
        key: 'files',
        label: 'Files',
        size: 'XL',
        sortable: false,
        nextRow: true,
        renderCell: (row) => {
          const defaultFiles = sortByDisplayOrder(
            row.product_certificate_files || [],
          ).map((file, fileIndex) => ({
            id: file.id || uuidv4(),
            name: file.file_name || `file_${fileIndex + 1}`,
            size: file.file_size || file._file_size || 0,
            type:
              file.file_type || file._file_type || 'application/octet-stream',
            url: file.file_url || '',
            display_order: file.display_order,
          }));

          return (
            <Main_FileUploads
              mode="file"
              label=""
              compact
              tableCell
              compactButtonText="Upload"
              defaultFiles={defaultFiles}
              maxFiles={5}
              maxSizeInMB={2}
              acceptedTypes={[
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml',
                'image/bmp',
                'image/tiff',
              ]}
              onChange={(ov, nv) => handleCertificateFilesChange(row, ov, nv)}
              onError={(errorMessage) => {
                console.error(`File upload error: ${errorMessage}`);
              }}
            />
          );
        },
      },
      {
        key: 'remark',
        label: 'Remark',
        size: 'XL',
        sortType: 'string',
        nextRow: true,
        getSortValue: (row) => row.remark || '',
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={row.remark || ''}
            placeholder="Add remark..."
            rows={2}
            resize="none"
            onChange={(ov, nv) => upsertCertificateRow(row, { remark: nv })}
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        size: 'S',
        sortable: false,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteCertificateRow(row)} />
        ),
      },
    ],
    [
      certTypeOptions,
      upsertCertificateRow,
      handleCertificateFilesChange,
      handleDeleteCertificateRow,
    ],
  );

  return (
    <Main_InputContainer label="Certificates">
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}
      >
        <AddNewBtn
          onClick={handleAddCertificateRow}
          text="Add Certificate"
          ariaLabel="Add new certificate"
          title="Add Certificate"
        />
      </div>
      <EditableDataTable
        rows={certificateRows}
        columns={columns}
        rowKey="id"
        emptyMessage="No certificates yet. Click Add Certificate."
      />
    </Main_InputContainer>
  );
};

export default Main_CertificateData;
