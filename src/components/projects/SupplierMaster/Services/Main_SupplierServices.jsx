/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ControlRowBtn from '../../../common/Buttons/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import { useSupplierContext } from '../../../../store/SupplierContext';
import { useMasterContext } from '../../../../store/MasterContext';
import sharedStyles from '../SupplierMasterShared.module.css';

const ServiceRowFields = ({
  rowindex,
  servicesRows,
  services,
  serviceImages,
  onUpsert,
  onImagesChange,
}) => {
  const row = servicesRows[rowindex] || {};

  const serviceOptions = (services || []).map((item) => ({
    id: item.id,
    name: item.label ?? item.name ?? '',
  }));

  const imageDefaults = (row.supplier_service_images || []).map((image) => ({
    id: image.id,
    url: image.image_url,
    name: image.image_name,
  }));

  return (
    <div className={sharedStyles.serviceCard}>
      <div className={sharedStyles.rowGridTwo}>
        <Main_Dropdown
          defaultOptions={serviceOptions}
          defaultSelectedOption={row.service_id || ''}
          onChange={(ov, nv) => {
            onUpsert(row.id, { service_id: nv });
          }}
        />
        <Main_TextArea
          defaultValue={row.remark || ''}
          placeholder="Service Remark"
          onChange={(ov, nv) => {
            onUpsert(row.id, { remark: nv });
          }}
        />
      </div>

      <div>
        <Main_FileUploads
          mode="image"
          label="Service Images"
          defaultImages={imageDefaults}
          onChange={(ov, nv) => onImagesChange(row.id, ov, nv, serviceImages)}
          onError={(error) => {
            console.error('Service image upload error:', error);
          }}
        />
      </div>
    </div>
  );
};

const Main_SupplierServices = () => {
  const { pageData, upsertSupplierPageData } = useSupplierContext();
  const { services, serviceImages } = useMasterContext();
  const [rowIds, setRowIds] = useState(
    pageData.supplier_services?.map((row) => row.id) || [],
  );

  useEffect(() => {
    setRowIds(pageData.supplier_services?.map((row) => row.id) || []);
  }, [pageData.supplier_services]);

  const handleRowAdd = useCallback(
    (newId) => {
      upsertSupplierPageData({
        supplier_services: [
          {
            id: newId,
            supplier_id: pageData.id,
            supplier_service_images: [],
          },
        ],
      });
      setRowIds((prev) => [...prev, newId]);
    },
    [pageData.id, upsertSupplierPageData],
  );

  const handleRowRemove = useCallback(
    (id) => {
      upsertSupplierPageData({
        supplier_services: [{ id, _delete: true }],
      });
      setRowIds((prev) => prev.filter((rowId) => rowId !== id));
    },
    [upsertSupplierPageData],
  );

  const handleUpsertRow = useCallback(
    (rowId, patch) => {
      upsertSupplierPageData({
        supplier_services: [
          {
            id: rowId || uuidv4(),
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

  return (
    <Main_InputContainer label="Supplier Services">
      <ControlRowBtn
        rowIds={rowIds}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <ServiceRowFields
          servicesRows={pageData.supplier_services || []}
          services={services}
          serviceImages={serviceImages}
          onUpsert={handleUpsertRow}
          onImagesChange={handleServiceImagesChange}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_SupplierServices;
