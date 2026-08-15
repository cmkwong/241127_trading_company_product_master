import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useCustomerContext } from '../../../../store/CustomerContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { sortByDisplayOrder } from '../../../../utils/arr';
import styles from './Main_CustomerImages.module.css';

const Main_CustomerImages = () => {
  const { pageData, upsertCustomerPageData } = useCustomerContext();
  const { customerImageType = [], getMasterTableData } = useMasterContext();

  const imageRows = useMemo(() => pageData.customer_images || [], [pageData]);

  const imageTypeOptions = useMemo(() => {
    const fallbackRows =
      typeof getMasterTableData === 'function'
        ? getMasterTableData('master_customer_image_types')
        : [];

    const sourceRows =
      Array.isArray(customerImageType) && customerImageType.length > 0
        ? customerImageType
        : fallbackRows;

    return (sourceRows || []).map((item) => ({
      id: item.id,
      name: item.label || item.name || item.id,
    }));
  }, [customerImageType, getMasterTableData]);

  const upsertImageRow = useCallback(
    (row, patch) => {
      upsertCustomerPageData({
        customer_images: [
          {
            id: row?.id || uuidv4(),
            customer_id: pageData.id,
            ...patch,
          },
        ],
      });
    },
    [upsertCustomerPageData, pageData.id],
  );

  const handleAddImageRow = useCallback(() => {
    upsertCustomerPageData({
      customer_images: [
        {
          id: uuidv4(),
          customer_id: pageData.id,
          image_type_id: imageTypeOptions?.[0]?.id || '',
          image_url: '',
          image_name: '',
          display_order: (imageRows?.length || 0) + 1,
        },
      ],
    });
  }, [upsertCustomerPageData, pageData.id, imageRows, imageTypeOptions]);

  const handleDeleteImageRow = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertCustomerPageData({
        customer_images: [{ id: row.id, _delete: true }],
      });
    },
    [upsertCustomerPageData],
  );

  const handleImageUploadChange = useCallback(
    (row, nv = []) => {
      const nextImages = Array.isArray(nv) ? nv : [];
      const firstImage = nextImages[0] || null;

      if (!firstImage) {
        upsertImageRow(row, {
          image_url: '',
          image_name: '',
        });
        return;
      }

      upsertImageRow(row, {
        image_url: firstImage.url || '',
        image_name: firstImage.name || '',
      });
    },
    [upsertImageRow],
  );

  const sortedRows = useMemo(
    () => sortByDisplayOrder(imageRows || []),
    [imageRows],
  );

  const columns = useMemo(
    () => [
      {
        key: 'image_type_id',
        label: 'Image Type',
        sortType: 'string',
        getSortValue: (row) =>
          imageTypeOptions.find((item) => item.id === row.image_type_id)
            ?.name || '',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={imageTypeOptions}
            defaultSelectedOption={row.image_type_id || ''}
            onChange={(ov, nv) => {
              upsertImageRow(row, { image_type_id: nv });
            }}
          />
        ),
      },
      {
        key: 'image_url',
        label: 'Image',
        sortable: false,
        renderCell: (row) => {
          const imageDefaults = row.image_url
            ? [
                {
                  id: row.id,
                  url: row.image_url,
                  name: row.image_name || '',
                },
              ]
            : [];

          return (
            <div className={styles.uploadsCell}>
              <Main_FileUploads
                mode="image"
                label=""
                compact
                compactButtonText="Upload"
                tableCell
                hoverPreview
                multiple={false}
                defaultImages={imageDefaults}
                onChange={(ov, nv) => handleImageUploadChange(row, nv)}
                onError={(error) => {
                  console.error('Customer image upload error:', error);
                }}
              />
            </div>
          );
        },
      },
      {
        key: 'image_name',
        label: 'Image Name',
        sortType: 'string',
        getSortValue: (row) => row.image_name || '',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.image_name || ''}
            placeholder="Image Name"
            onChange={(ov, nv) => {
              upsertImageRow(row, { image_name: nv });
            }}
          />
        ),
      },
      {
        key: 'display_order',
        label: 'Order',
        sortType: 'number',
        getSortValue: (row) => Number(row.display_order || 0),
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={String(row.display_order || '')}
            placeholder="1"
            type="number"
            onChange={(ov, nv) => {
              const parsed = Number(nv);
              upsertImageRow(row, {
                display_order: Number.isFinite(parsed) ? parsed : null,
              });
            }}
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteImageRow(row)} />
        ),
      },
    ],
    [
      imageTypeOptions,
      upsertImageRow,
      handleImageUploadChange,
      handleDeleteImageRow,
    ],
  );

  return (
    <Main_InputContainer label="Customer Images">
      <div className={styles.tableSection}>
        <div className={styles.actionsBar}>
          <AddNewBtn
            onClick={handleAddImageRow}
            text="Add Image"
            ariaLabel="Add new image"
            title="Add Image"
          />
        </div>

        <EditableDataTable
          rows={sortedRows}
          columns={columns}
          rowKey="id"
          emptyMessage="No images yet. Click + Add Image."
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_CustomerImages;
