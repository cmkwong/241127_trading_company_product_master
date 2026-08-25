import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import {
  upsertEntityData,
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { sortByDisplayOrder } from '../../../../utils/arr';
import styles from './Main_SupplierServices.module.css';

const FILE_SERVER_BASE_URL = 'http://localhost:3001';

const Main_SupplierServices = () => {
  const { services, serviceImages } = useMasterContext();
  const supplierId = useEntityField('supplier', 'id');
  const serviceRows = useEntityRows('supplier', 'supplier_services');

  const serviceOptions = useMemo(
    () =>
      (services || []).map((item) => ({
        id: item.id,
        name:
          item.service_name ||
          item.label ||
          item.name ||
          item.description ||
          String(item.id || ''),
      })),
    [services],
  );

  const handleAddServiceRow = useCallback(() => {
    upsertEntityData('supplier', {
      supplier_services: [
        {
          id: uuidv4(),
          supplier_id: supplierId,
          service_id: '',
          remark: '',
          link: '',
          supplier_service_images: [],
          supplier_service_files: [],
        },
      ],
    });
  }, [supplierId]);

  const handleDeleteServiceRow = useCallback((row) => {
    if (!row?.id) return;
    upsertEntityData('supplier', {
      supplier_services: [{ id: row.id, _delete: true }],
    });
  }, []);

  const handleUpsertRow = useCallback(
    (row, patch) => {
      upsertEntityData('supplier', {
        supplier_services: [
          {
            id: row?.id || uuidv4(),
            supplier_id: supplierId,
            ...patch,
          },
        ],
      });
    },
    [supplierId],
  );

  const handleServiceFilesChange = useCallback(
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
        sameLength && oldList.every((img, i) => img.id === newList[i]?.id);

      if (removedFiles.length === 0 && addedFiles.length === 0 && sameOrder) {
        return;
      }

      if (removedFiles.length > 0) {
        handleUpsertRow(row, {
          supplier_service_files: removedFiles
            .filter((file) => !!file?.id)
            .map((file) => ({
              id: file.id,
              _delete: true,
            })),
        });
      }

      if (newList.length > 0) {
        const addedFileIds = new Set(addedFiles.map((file) => file.id));

        handleUpsertRow(row, {
          supplier_service_files: newList
            .filter((file) => !!file?.id)
            .map((file, index) => ({
              id: file.id,
              supplier_service_id: row.id,
              display_order: index + 1,
              ...(addedFileIds.has(file.id)
                ? {
                    file_url: file.url,
                    file_name: file.name,
                  }
                : {}),
            })),
        });
      }
    },
    [handleUpsertRow],
  );

  const handleServiceImagesChange = useCallback(
    (row, oldFiles = [], newFiles = [], serviceImageMasterOptions) => {
      const oldList = Array.isArray(oldFiles) ? oldFiles : [];
      const newList = Array.isArray(newFiles) ? newFiles : [];

      const removedImages = oldList.filter(
        (oldImage) => !newList.some((newImage) => newImage.id === oldImage.id),
      );

      const addedImages = newList.filter(
        (newImage) => !oldList.some((oldImage) => oldImage.id === newImage.id),
      );

      const sameLength = oldList.length === newList.length;
      const sameOrder =
        sameLength && oldList.every((img, i) => img.id === newList[i]?.id);

      if (removedImages.length === 0 && addedImages.length === 0 && sameOrder) {
        return;
      }

      const masterImageTypeId = serviceImageMasterOptions?.[0]?.id || null;

      if (removedImages.length > 0) {
        handleUpsertRow(row, {
          supplier_service_images: removedImages
            .filter((img) => !!img?.id)
            .map((img) => ({
              id: img.id,
              _delete: true,
            })),
        });
      }

      if (newList.length > 0) {
        const addedImageIds = new Set(addedImages.map((img) => img.id));

        handleUpsertRow(row, {
          supplier_service_images: newList
            .filter((img) => !!img?.id)
            .map((img, index) => ({
              id: img.id,
              supplier_service_id: row.id,
              display_order: index + 1,
              ...(addedImageIds.has(img.id)
                ? {
                    image_url: img.url,
                    image_name: img.name,
                    service_image_type_id: masterImageTypeId,
                  }
                : {}),
            })),
        });
      }
    },
    [handleUpsertRow],
  );

  const handleUploadsError = useCallback((error, fallbackMessage) => {
    const message =
      (typeof error === 'string' && error.trim()) ||
      error?.message ||
      fallbackMessage ||
      'File operation failed.';

    console.error(message, error);
    window.alert(message);
  }, []);

  const columns = useMemo(
    () => [
      {
        key: 'service_id',
        label: 'Service',
        sortType: 'string',
        getSortValue: (row) =>
          serviceOptions.find((item) => item.id === row.service_id)?.name || '',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={serviceOptions}
            defaultSelectedOption={row.service_id || ''}
            onChange={(ov, nv) => {
              handleUpsertRow(row, { service_id: nv });
            }}
          />
        ),
      },
      {
        key: 'link',
        label: 'Link',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.link || ''}
            placeholder="Service Link"
            type="link"
            onChange={(ov, nv) => {
              handleUpsertRow(row, { link: nv });
            }}
          />
        ),
      },
      {
        key: 'remark',
        label: 'Remark',
        sortType: 'string',
        size: 'XL',
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={row.remark || ''}
            placeholder="Service Remark"
            rows={2}
            onChange={(ov, nv) => {
              handleUpsertRow(row, { remark: nv });
            }}
          />
        ),
      },
      {
        key: 'supplier_service_images',
        label: 'Service Images',
        sortable: false,
        renderCell: (row) => {
          const imageDefaults = sortByDisplayOrder(
            row.supplier_service_images || [],
          ).map((image) => ({
            id: image.id,
            url: image.image_url,
            _original_image_url: image._original_image_url || image.image_url,
            name: image.image_name,
            base64_image: image.base64_image,
            display_order: image.display_order,
          }));

          return (
            <div className={styles.uploadsCell}>
              <Main_FileUploads
                mode="image"
                label=""
                compact
                compactButtonText="Upload"
                tableCell
                hoverPreview
                fileUrlBase={FILE_SERVER_BASE_URL}
                defaultImages={imageDefaults}
                onChange={(ov, nv) =>
                  handleServiceImagesChange(row, ov, nv, serviceImages)
                }
                onError={(error) => {
                  handleUploadsError(
                    error,
                    'Service image upload/download failed.',
                  );
                }}
              />
            </div>
          );
        },
      },
      {
        key: 'supplier_service_files',
        label: 'Service Files',
        sortable: false,
        renderCell: (row) => {
          const fileDefaults = sortByDisplayOrder(
            row.supplier_service_files || [],
          ).map((file) => ({
            id: file.id,
            url: file.file_url,
            _original_file_url: file._original_file_url || file.file_url,
            name: file.file_name,
            base64_file: file.base64_file,
            display_order: file.display_order,
          }));

          return (
            <div className={styles.uploadsCell}>
              <Main_FileUploads
                mode="file"
                label=""
                compact
                compactButtonText="Upload"
                tableCell
                hoverPreview
                fileUrlBase={FILE_SERVER_BASE_URL}
                defaultFiles={fileDefaults}
                onChange={(ov, nv) => handleServiceFilesChange(row, ov, nv)}
                onError={(error) => {
                  handleUploadsError(
                    error,
                    'Service file upload/download failed.',
                  );
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
          <DeleteBtn onClick={() => handleDeleteServiceRow(row)} />
        ),
      },
    ],
    [
      serviceOptions,
      handleUpsertRow,
      handleServiceImagesChange,
      handleUploadsError,
      serviceImages,
      handleServiceFilesChange,
      handleDeleteServiceRow,
    ],
  );

  return (
    <Main_InputContainer label="Supplier Services">
      <div className={styles.tableSection}>
        <div className={styles.actionsBar}>
          <AddNewBtn
            onClick={handleAddServiceRow}
            text="Add Service"
            ariaLabel="Add new service"
            title="Add Service"
          />
        </div>

        <EditableDataTable
          rows={serviceRows}
          columns={columns}
          rowKey="id"
          emptyMessage="No services yet. Click + Add Service."
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_SupplierServices;
