import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import styles from './Main_SalesServiceDetails.module.css';

const FILE_SERVER_BASE_URL = 'http://localhost:3001';

const toNumber = (value, fallback = '') => {
  if (value === '' || value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const Main_SalesServiceDetails = ({
  quotation,
  supplierOptions = [],
  serviceOptions = [],
  currencyOptions = [],
  onPatchQuotation,
}) => {
  const serviceDetails = useMemo(
    () => quotation?.sales_service_details || [],
    [quotation?.sales_service_details],
  );
  const serviceImages = useMemo(
    () => quotation?.sales_service_detail_images || [],
    [quotation?.sales_service_detail_images],
  );

  const setServiceDetails = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_service_details: nextRows });
    },
    [onPatchQuotation],
  );

  const setServiceImages = useCallback(
    (nextRows) => {
      onPatchQuotation({ sales_service_detail_images: nextRows });
    },
    [onPatchQuotation],
  );

  const handleUpsertServiceDetail = useCallback(
    (row, patch) => {
      const rowId = String(row?.id || uuidv4());
      const nextRow = {
        id: rowId,
        sales_quotation_id: quotation?.id,
        supplier_id: '',
        service_id: '',
        qty: 1,
        currency_id: '',
        price: '',
        details: '',
        ...row,
        ...patch,
      };

      const exists = serviceDetails.some((item) => item.id === rowId);
      if (exists) {
        setServiceDetails(
          serviceDetails.map((item) => (item.id === rowId ? nextRow : item)),
        );
        return;
      }

      setServiceDetails([...serviceDetails, nextRow]);
    },
    [quotation?.id, serviceDetails, setServiceDetails],
  );

  const handleDeleteServiceDetail = useCallback(
    (row) => {
      const rowId = String(row?.id || '');
      if (!rowId) return;

      setServiceDetails(serviceDetails.filter((item) => item.id !== rowId));
      setServiceImages(
        serviceImages.filter(
          (item) => String(item?.sales_service_detail_id || '') !== rowId,
        ),
      );
    },
    [serviceDetails, serviceImages, setServiceDetails, setServiceImages],
  );

  const handleAddServiceDetail = useCallback(() => {
    setServiceDetails([
      ...serviceDetails,
      {
        id: uuidv4(),
        sales_quotation_id: quotation?.id,
        supplier_id: supplierOptions[0]?.id || '',
        service_id: serviceOptions[0]?.id || '',
        qty: 1,
        currency_id: currencyOptions[0]?.id || '',
        price: '',
        details: '',
      },
    ]);
  }, [
    serviceDetails,
    quotation?.id,
    supplierOptions,
    serviceOptions,
    currencyOptions,
    setServiceDetails,
  ]);

  const handleServiceImagesChange = useCallback(
    (salesServiceDetailId, newFiles = []) => {
      const detailId = String(salesServiceDetailId || '').trim();
      if (!detailId) return;

      const preservedRows = serviceImages.filter(
        (item) => String(item?.sales_service_detail_id || '') !== detailId,
      );

      const mappedRows = (newFiles || []).map((file, index) => ({
        id: file?.id || uuidv4(),
        sales_service_detail_id: detailId,
        image_name: file?.name || `service-${index + 1}.jpg`,
        image_url: file?.url || '',
        display_order: index + 1,
      }));

      setServiceImages([...preservedRows, ...mappedRows]);
    },
    [serviceImages, setServiceImages],
  );

  const supplierDropdownOptions = useMemo(
    () =>
      (supplierOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.name || item?.label || item?.id || '').trim(),
        supplier_type_name: String(item?.supplier_type_name || '').trim(),
        supplier_code: String(item?.supplier_code || '').trim(),
        searchText: String(item?.searchText || '').trim(),
      })),
    [supplierOptions],
  );

  const serviceDropdownOptions = useMemo(
    () =>
      (serviceOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.name || item?.label || item?.id || '').trim(),
      })),
    [serviceOptions],
  );

  const currencyDropdownOptions = useMemo(
    () =>
      (currencyOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.name || item?.label || item?.id || '').trim(),
      })),
    [currencyOptions],
  );

  const serviceColumns = useMemo(
    () => [
      {
        key: 'supplier_id',
        label: 'Supplier',
        sortType: 'string',
        getSortValue: (row) =>
          supplierDropdownOptions.find((item) => item.id === row.supplier_id)
            ?.name || '',
        renderCell: (row) => (
          <Main_Suggest
            defaultSuggestions={supplierDropdownOptions}
            defaultValue={
              supplierDropdownOptions.find(
                (item) => item.id === row.supplier_id,
              )?.name || ''
            }
            placeholder="Search supplier"
            getSuggestionLabel={(suggestion) => suggestion?.name || ''}
            getSuggestionSearchText={(suggestion) =>
              String(
                suggestion?.searchText ||
                  [
                    suggestion?.name,
                    suggestion?.supplier_type_name,
                    suggestion?.supplier_code,
                  ]
                    .filter(Boolean)
                    .join(' '),
              )
            }
            renderSuggestion={(suggestion) => (
              <div className={styles.suggestionContent}>
                <div className={styles.suggestionTitle}>
                  {suggestion?.name || ''}
                </div>
                <div className={styles.suggestionMeta}>
                  <span>
                    Supplier Type: {suggestion?.supplier_type_name || 'Unknown'}
                  </span>
                  <span>Supplier Code: {suggestion?.supplier_code || '-'}</span>
                </div>
              </div>
            )}
            onChange={(ov, nv) => {
              if (!String(nv || '').trim()) {
                handleUpsertServiceDetail(row, { supplier_id: '' });
              }
            }}
            onSelectSuggestion={(suggestion) =>
              handleUpsertServiceDetail(row, {
                supplier_id: String(suggestion?.id || '').trim(),
              })
            }
          />
        ),
      },
      {
        key: 'service_id',
        label: 'Service',
        sortType: 'string',
        getSortValue: (row) =>
          serviceDropdownOptions.find((item) => item.id === row.service_id)
            ?.name || '',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={serviceDropdownOptions}
            defaultSelectedOption={row.service_id || ''}
            onChange={(ov, nv) =>
              handleUpsertServiceDetail(row, { service_id: nv })
            }
          />
        ),
      },
      {
        key: 'qty',
        label: 'Qty',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(row.qty ?? '')}
            placeholder="Qty"
            onChange={(ov, nv) =>
              handleUpsertServiceDetail(row, { qty: toNumber(nv, 1) })
            }
          />
        ),
      },
      {
        key: 'currency_id',
        label: 'Currency',
        sortType: 'string',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={currencyDropdownOptions}
            defaultSelectedOption={row.currency_id || ''}
            onChange={(ov, nv) =>
              handleUpsertServiceDetail(row, { currency_id: nv })
            }
          />
        ),
      },
      {
        key: 'price',
        label: 'Price',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            defaultValue={String(row.price ?? '')}
            placeholder="Price"
            onChange={(ov, nv) =>
              handleUpsertServiceDetail(row, { price: toNumber(nv) })
            }
          />
        ),
      },
      {
        key: 'details',
        label: 'Details',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={row.details || ''}
            placeholder="Service details"
            rows={2}
            onChange={(ov, nv) =>
              handleUpsertServiceDetail(row, { details: nv })
            }
          />
        ),
      },
      {
        key: 'images',
        label: 'Images',
        sortable: false,
        renderCell: (row) => {
          const defaultImages = serviceImages
            .filter(
              (image) =>
                String(image?.sales_service_detail_id || '') ===
                String(row?.id || ''),
            )
            .sort(
              (a, b) =>
                Number(a.display_order || 0) - Number(b.display_order || 0),
            )
            .map((image) => ({
              id: image.id,
              name: image.image_name,
              url: image.image_url,
              display_order: image.display_order,
            }));

          return (
            <div className={styles.uploadsCell}>
              <Main_FileUploads
                mode="image"
                label=""
                compact
                tableCell
                hoverPreview
                showDownloadButton={false}
                compactButtonText="Upload"
                defaultImages={defaultImages}
                onChange={(ov, nv) => handleServiceImagesChange(row?.id, nv)}
                onError={(error) => {
                  console.error('Sales service image upload error:', error);
                }}
                fileUrlBase={FILE_SERVER_BASE_URL}
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
          <DeleteBtn onClick={() => handleDeleteServiceDetail(row)} />
        ),
      },
    ],
    [
      supplierDropdownOptions,
      serviceDropdownOptions,
      currencyDropdownOptions,
      serviceImages,
      handleUpsertServiceDetail,
      handleDeleteServiceDetail,
      handleServiceImagesChange,
    ],
  );

  return (
    <Main_InputContainer label="Sales Service Details">
      <div className={styles.tableSection}>
        <div className={styles.actionsBar}>
          <AddNewBtn
            onClick={handleAddServiceDetail}
            text="Add Service Detail"
            ariaLabel="Add new service detail"
            title="Add Service Detail"
          />
        </div>

        <EditableDataTable
          rows={serviceDetails}
          columns={serviceColumns}
          rowKey="id"
          emptyMessage="No service details yet. Click + Add Service Detail."
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_SalesServiceDetails;
