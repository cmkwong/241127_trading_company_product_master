import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { sortByDisplayOrder } from '../../../../utils/arr';
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
          link: '',
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
            name: image.image_name,
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
                defaultImages={imageDefaults}
                onChange={(ov, nv) =>
                  handleServiceImagesChange(row, ov, nv, serviceImages)
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
