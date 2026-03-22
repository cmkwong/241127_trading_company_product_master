import { useCallback, useMemo } from 'react';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useProductContext } from '../../../../store/ProductContext';
import { v4 as uuidv4 } from 'uuid';
import { sortByDisplayOrder } from '../../../../utils/arr';
import { mockSuppliers } from '../../../../datas/Suppliers/mockSuppliers';
import styles from './Main_Customization.module.css';

const Main_Customization = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const customizations = pageData.product_customizations || [];

  const upsertCustomizationRow = useCallback(
    (row, patch) => {
      upsertProductPageData({
        product_customizations: [
          {
            id: row?.id || uuidv4(),
            product_id: pageData.id,
            ...patch,
          },
        ],
      });
    },
    [upsertProductPageData, pageData.id],
  );

  const handleAddCustomizationRow = useCallback(() => {
    upsertProductPageData({
      product_customizations: [
        {
          id: uuidv4(),
          product_id: pageData.id,
          name: '',
          code: '',
          remark: '',
          product_customization_images: [],
        },
      ],
    });
  }, [upsertProductPageData, pageData.id]);

  const handleDeleteCustomizationRow = useCallback(
    (row) => {
      if (!row?.id) return;

      upsertProductPageData({
        product_customizations: [
          {
            id: row.id,
            _delete: true,
          },
        ],
      });
    },
    [upsertProductPageData],
  );

  const handleCustomizationImagesChange = useCallback(
    (row, oldImages = [], newImages = []) => {
      const oldList = Array.isArray(oldImages) ? oldImages : [];
      const newList = Array.isArray(newImages) ? newImages : [];

      const removedImages = oldList.filter(
        (oldImg) => !newList.some((newImg) => newImg.id === oldImg.id),
      );
      const addedImages = newList.filter(
        (newImg) => !oldList.some((oldImg) => oldImg.id === newImg.id),
      );

      const sameLength = oldList.length === newList.length;
      const sameOrder =
        sameLength && oldList.every((img, i) => img.id === newList[i]?.id);

      if (removedImages.length === 0 && addedImages.length === 0 && sameOrder) {
        return;
      }

      if (removedImages.length > 0) {
        upsertCustomizationRow(row, {
          product_customization_images: removedImages.map((removedImage) => ({
            id: removedImage.id,
            _delete: true,
          })),
        });
      }

      if (newList.length > 0) {
        const addedImageIds = new Set(addedImages.map((img) => img.id));

        upsertCustomizationRow(row, {
          product_customization_images: newList.map((img, index) => ({
            id: img.id,
            customization_id: row.id,
            display_order: index + 1,
            ...(addedImageIds.has(img.id)
              ? {
                  image_name: img.name,
                  image_url: img.url,
                }
              : {}),
          })),
        });
      }
    },
    [upsertCustomizationRow],
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Customization Title',
        sortType: 'string',
        minWidth: '220px',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.name || ''}
            placeholder="Customization Title"
            onChange={(ov, nv) => upsertCustomizationRow(row, { name: nv })}
          />
        ),
      },
      {
        key: 'code',
        label: 'Suppliers',
        sortType: 'string',
        minWidth: '220px',
        renderCell: (row) => (
          <div className={styles.suggestCell}>
            <Main_Suggest
              defaultSuggestions={mockSuppliers.map(
                (supplier) => supplier.code,
              )}
              placeholder="Suppliers"
              defaultValue={row.code || ''}
              onChange={(ov, nv) => upsertCustomizationRow(row, { code: nv })}
            />
          </div>
        ),
      },
      {
        key: 'remark',
        label: 'Remark',
        sortable: false,
        minWidth: '240px',
        renderCell: (row) => (
          <div className={styles.remarkCell}>
            <Main_TextArea
              defaultValue={row.remark || ''}
              placeholder="Customization remarks ..."
              rows={2}
              resize="none"
              onChange={(ov, nv) => upsertCustomizationRow(row, { remark: nv })}
            />
          </div>
        ),
      },
      {
        key: 'product_customization_images',
        label: 'Images',
        sortable: false,
        minWidth: '320px',
        renderCell: (row) => {
          const defaultImages = sortByDisplayOrder(
            row.product_customization_images || [],
          ).map((img) => ({
            id: img.id,
            url: img.image_url,
            name: img.image_name,
            display_order: img.display_order,
          }));

          return (
            <div className={styles.uploadsCell}>
              <Main_FileUploads
                mode="image"
                label=""
                compact
                tableCell
                hoverPreview
                compactButtonText="Upload"
                maxFiles={10}
                maxSizeInMB={5}
                defaultImages={defaultImages}
                onError={(error) => {
                  console.error('Customization image upload error:', error);
                }}
                onChange={(ov, nv) =>
                  handleCustomizationImagesChange(row, ov, nv)
                }
              />
            </div>
          );
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        width: '90px',
        minWidth: '90px',
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteCustomizationRow(row)} />
        ),
      },
    ],
    [
      upsertCustomizationRow,
      handleCustomizationImagesChange,
      handleDeleteCustomizationRow,
    ],
  );

  return (
    <Main_InputContainer label="Customization Options">
      <div className={styles.tableSection}>
        <div className={styles.actionsBar}>
          <AddNewBtn
            onClick={handleAddCustomizationRow}
            text="Add Customization"
            ariaLabel="Add new customization"
            title="Add Customization"
          />
        </div>

        <EditableDataTable
          rows={customizations}
          columns={columns}
          rowKey="id"
          emptyMessage="No customizations yet. Click + Add Customization."
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_Customization;
