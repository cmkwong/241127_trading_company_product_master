import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_SupplierServices.module.css';

const Main_SupplierServices = () => {
  const { pageData, upsertSupplierPageData } = useSupplierContext();
  const { services, serviceImages } = useMasterContext();
  const serviceRows = pageData.supplier_services || [];

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
    upsertSupplierPageData({
      supplier_services: [
        {
          id: uuidv4(),
          supplier_id: pageData.id,
          service_id: '',
          remark: '',
          supplier_service_images: [],
        },
      ],
    });
  }, [upsertSupplierPageData, pageData.id]);

  const handleDeleteServiceRow = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertSupplierPageData({
        supplier_services: [{ id: row.id, _delete: true }],
      });
    },
    [upsertSupplierPageData],
  );

  const handleUpsertRow = useCallback(
    (row, patch) => {
      upsertSupplierPageData({
        supplier_services: [
          {
            id: row?.id || uuidv4(),
            supplier_id: pageData.id,
            ...patch,
          },
        ],
      });
    },
    [upsertSupplierPageData, pageData.id],
  );

  const handleServiceImagesChange = useCallback(
    (serviceId, oldFiles, newFiles, serviceImageMasterOptions) => {
      const removedImages = oldFiles.filter(
        (oldImage) => !newFiles.some((newImage) => newImage.id === oldImage.id),
      );

      const addedImages = newFiles.filter(
        (newImage) => !oldFiles.some((oldImage) => oldImage.id === newImage.id),
      );

      const masterImageTypeId = serviceImageMasterOptions?.[0]?.id || null;

      if (removedImages.length > 0) {
        upsertSupplierPageData({
          supplier_services: [
            {
              id: serviceId,
              supplier_id: pageData.id,
              supplier_service_images: removedImages.map((img) => ({
                id: img.id,
                _delete: true,
              })),
            },
          ],
        });
      }

      if (addedImages.length > 0) {
        upsertSupplierPageData({
          supplier_services: [
            {
              id: serviceId,
              supplier_id: pageData.id,
              supplier_service_images: addedImages.map((img) => ({
                id: img.id,
                supplier_service_id: serviceId,
                image_url: img.url,
                image_name: img.name,
                service_image_type_id: masterImageTypeId,
              })),
            },
          ],
        });
      }
    },
    [upsertSupplierPageData, pageData.id],
  );

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
        key: 'remark',
        label: 'Remark',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.remark || ''}
            placeholder="Service Remark"
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
          const imageDefaults = (row.supplier_service_images || []).map(
            (image) => ({
              id: image.id,
              url: image.image_url,
              name: image.image_name,
            }),
          );

          return (
            <div className={styles.uploadsCell}>
              <Main_FileUploads
                mode="image"
                label=""
                compact
                compactButtonText="Upload"
                defaultImages={imageDefaults}
                onChange={(ov, nv) =>
                  handleServiceImagesChange(row.id, ov, nv, serviceImages)
                }
                onError={(error) => {
                  console.error('Service image upload error:', error);
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
      serviceImages,
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
