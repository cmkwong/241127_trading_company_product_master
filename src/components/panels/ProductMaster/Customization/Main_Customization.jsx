import { useCallback, useMemo } from 'react';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import EditableDataForm from '../../../common/Forms/EditableDataForm';
import {
  upsertEntityData,
  useEntityRows,
  useEntityField,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { v4 as uuidv4 } from 'uuid';
import { sortByDisplayOrder } from '../../../../utils/arr';
import styles from './Main_Customization.module.css';

const Main_Customization = () => {
  const { productCustomizationOptions, currencies } = useMasterContext();
  const productId = useEntityField('products', 'id');
  const customizations = useEntityRows('products', 'product_customizations');

  const customizationOptionSuggestions = useMemo(
    () =>
      (productCustomizationOptions || []).map((item) => ({
        id: item.id,
        name: item.name ?? item.label ?? '',
      })),
    [productCustomizationOptions],
  );

  const currencyOptions = useMemo(
    () =>
      (currencies || []).map((currency) => ({
        id: currency.id,
        name:
          currency?.code || currency?.name || currency?.label || currency?.id,
      })),
    [currencies],
  );

  const currencyLabelMap = useMemo(
    () =>
      (currencies || []).reduce((acc, currency) => {
        acc[currency.id] =
          currency?.code || currency?.name || currency?.label || currency?.id;
        return acc;
      }, {}),
    [currencies],
  );

  const upsertCustomizationRow = useCallback(
    (row, patch) => {
      upsertEntityData('products', {
        product_customizations: [
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

  const handleAddCustomizationRow = useCallback(() => {
    upsertEntityData('products', {
      product_customizations: [
        {
          id: uuidv4(),
          product_id: productId,
          name: '',
          value: '',
          MOQ: '',
          price_arise_per_pcs: '',
          price_arise_currency: '',
          remark: '',
          product_customization_images: [],
        },
      ],
    });
  }, [upsertEntityData, productId]);

  const handleDeleteCustomizationRow = useCallback(
    (row) => {
      if (!row?.id) return;

      upsertEntityData('products', {
        product_customizations: [
          {
            id: row.id,
            _delete: true,
          },
        ],
      });
    },
    [upsertEntityData],
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
        key: 'value',
        label: 'Value',
        sortType: 'string',
        minWidth: '180px',
        maxWidth: '300px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_TextField
            defaultValue={String(row.value ?? '')}
            placeholder="Value"
            onChange={(ov, nv) => upsertCustomizationRow(row, { value: nv })}
          />
        ),
      },
      {
        key: 'MOQ',
        label: 'MOQ',
        sortType: 'number',
        minWidth: '120px',
        maxWidth: '180px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_TextField
            type="number"
            defaultValue={String(row.MOQ ?? '')}
            placeholder="0"
            onChange={(ov, nv) => upsertCustomizationRow(row, { MOQ: nv })}
          />
        ),
      },
      {
        key: 'price_arise_currency',
        label: 'Currency',
        sortType: 'string',
        minWidth: '150px',
        maxWidth: '220px',
        cellClassName: styles.tableCell,
        getSortValue: (row) => currencyLabelMap[row.price_arise_currency] || '',
        renderCell: (row) => (
          <Main_Dropdown
            size="100%"
            defaultOptions={currencyOptions}
            defaultSelectedOption={row.price_arise_currency || ''}
            onChange={(ov, nv) =>
              upsertCustomizationRow(row, { price_arise_currency: nv })
            }
          />
        ),
      },
      {
        key: 'price_arise_per_pcs',
        label: 'Price Arise / Pcs',
        sortType: 'number',
        minWidth: '160px',
        maxWidth: '220px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_TextField
            type="number"
            defaultValue={String(row.price_arise_per_pcs ?? '')}
            placeholder="0.0000"
            onChange={(ov, nv) =>
              upsertCustomizationRow(row, { price_arise_per_pcs: nv })
            }
          />
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
      customizationOptionSuggestions,
      currencyOptions,
      currencyLabelMap,
      upsertCustomizationRow,
      handleCustomizationImagesChange,
    ],
  );

  return (
    <Main_InputContainer label="Customization Options">
      <div className={styles.tableSection}>
        <EditableDataForm
          rows={customizations}
          columns={columns}
          rowKey="id"
          emptyMessage="No customizations yet. Click + Add Customization."
          onAddRow={handleAddCustomizationRow}
          addRowText="Add Customization"
          onRemoveRow={handleDeleteCustomizationRow}
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_Customization;
