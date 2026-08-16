import { useCallback, useMemo } from 'react';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { v4 as uuidv4 } from 'uuid';
import { sortByDisplayOrder } from '../../../../utils/arr';
import styles from './Main_Customization.module.css';

const Main_Customization = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { productCustomizationOptions } = useMasterContext();
  const customizations = pageData.product_customizations || [];

  const customizationOptionSuggestions = useMemo(
    () =>
      (productCustomizationOptions || []).map((item) => ({
        id: item.id,
        name: item.name ?? item.label ?? '',
      })),
    [productCustomizationOptions],
  );
  const supplierSuggestions = useMemo(
    () =>
      [].map((supplier, index) => ({
        id: `${supplier.code || 'supplier'}-${index + 1}`,
        code: String(supplier.code || '').trim(),
        companyName: String(supplier.companyName || '').trim(),
        searchText: [supplier.code, supplier.companyName]
          .map((value) => String(value || '').trim())
          .filter(Boolean)
          .join(' '),
      })),
    [],
  );

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
        label: 'Customization Header',
        sortType: 'string',
        minWidth: '220px',
        maxWidth: '400px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_Suggest
            defaultSuggestions={customizationOptionSuggestions}
            placeholder="Customization Header"
            autoComplete="off"
            defaultValue={row.name || ''}
            getSuggestionLabel={(suggestion) => suggestion?.name || ''}
            getSuggestionSearchText={(suggestion) =>
              String(suggestion?.name || '')
            }
            onChange={(ov, nv) => upsertCustomizationRow(row, { name: nv })}
            onSelectSuggestion={(suggestion) =>
              upsertCustomizationRow(row, {
                name: String(suggestion?.name || '').trim(),
              })
            }
          />
        ),
      },
      {
        key: 'code',
        label: 'Supplier',
        sortType: 'string',
        minWidth: '200px',
        maxWidth: '300px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_Suggest
            defaultSuggestions={supplierSuggestions}
            placeholder="Suppliers"
            autoComplete="new-password"
            defaultValue={row.code || ''}
            getSuggestionLabel={(suggestion) => suggestion?.code || ''}
            getSuggestionSearchText={(suggestion) =>
              String(suggestion?.searchText || suggestion?.code || '')
            }
            renderSuggestion={(suggestion) => (
              <div className={styles.suggestionItemWrap}>
                <span className={styles.suggestionCode}>
                  {suggestion?.code || ''}
                </span>
                <span className={styles.suggestionName}>
                  {suggestion?.companyName || ''}
                </span>
              </div>
            )}
            onChange={(ov, nv) => upsertCustomizationRow(row, { code: nv })}
            onSelectSuggestion={(suggestion) =>
              upsertCustomizationRow(row, {
                code: String(suggestion?.code || '').trim(),
              })
            }
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        width: '90px',
        minWidth: '90px',
        maxWidth: '90px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteCustomizationRow(row)} />
        ),
      },
      {
        key: 'remark',
        label: 'Remark',
        sortable: false,
        nextRow: true,
        minWidth: '260px',
        maxWidth: '100%',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_TextArea
            defaultValue={row.remark || ''}
            placeholder="Add remarks..."
            rows={2}
            resize="none"
            onChange={(ov, nv) => upsertCustomizationRow(row, { remark: nv })}
          />
        ),
      },
      {
        key: 'product_customization_images',
        label: 'Images',
        sortable: false,
        nextRow: true,
        minWidth: '300px',
        maxWidth: '100%',
        cellClassName: styles.tableCell,
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
            <Main_FileUploads
              mode="image"
              label=""
              compact
              tableCell
              hoverPreview
              compactButtonText="Upload"
              maxFiles={12}
              maxSizeInMB={5}
              defaultImages={defaultImages}
              onError={(error) => {
                console.error('Customization image upload error:', error);
              }}
              onChange={(ov, nv) =>
                handleCustomizationImagesChange(row, ov, nv)
              }
            />
          );
        },
      },
    ],
    [
      supplierSuggestions,
      customizationOptionSuggestions,
      upsertCustomizationRow,
      handleDeleteCustomizationRow,
      handleCustomizationImagesChange,
    ],
  );

  return (
    <Main_InputContainer
      label="Customization Options"
      onAddNew={handleAddCustomizationRow}
      addNewText="Add Customization"
    >
      <div className={styles.tableSection}>
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
