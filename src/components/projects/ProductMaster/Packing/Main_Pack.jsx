import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { sortByDisplayOrder } from '../../../../utils/arr';
import styles from './Main_Pack.module.css';

const Main_Pack = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { packType, packingReliabilityType } = useMasterContext();
  const packRows = pageData.product_packings || [];

  const packTypeOptions = useMemo(
    () =>
      (packType || []).map((item) => ({
        id: item.id,
        label: item.label ?? item.name ?? '',
      })),
    [packType],
  );

  const reliabilityTypeOptions = useMemo(
    () =>
      (packingReliabilityType || []).map((item) => ({
        id: item.id,
        label: item.label ?? item.name ?? '',
      })),
    [packingReliabilityType],
  );

  const upsertPackRow = useCallback(
    (row, patch) => {
      upsertProductPageData({
        product_packings: [
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

  const handleAddPackRow = useCallback(() => {
    upsertProductPageData({
      product_packings: [
        {
          id: uuidv4(),
          product_id: pageData.id,
          packing_type_id: '',
          packing_reliability_type_id: '',
          length: 0,
          width: 0,
          height: 0,
          quantity: 0,
          weight: 0,
          remark: '',
          product_packing_images: [],
        },
      ],
    });
  }, [upsertProductPageData, pageData.id]);

  const handleDeletePackRow = useCallback(
    (row) => {
      if (!row?.id) return;

      upsertProductPageData({
        product_packings: [
          {
            id: row.id,
            _delete: true,
          },
        ],
      });
    },
    [upsertProductPageData],
  );

  const handlePackImagesChange = useCallback(
    (row, oldImages = [], newImages = []) => {
      const oldList = Array.isArray(oldImages) ? oldImages : [];
      const newList = Array.isArray(newImages) ? newImages : [];

      const removedImages = oldList.filter(
        (img) => !newList.some((newImg) => newImg.id === img.id),
      );

      const addedImages = newList.filter(
        (img) => !oldList.some((oldImg) => oldImg.id === img.id),
      );

      const sameLength = oldList.length === newList.length;
      const sameOrder =
        sameLength && oldList.every((img, i) => img.id === newList[i]?.id);

      if (removedImages.length === 0 && addedImages.length === 0 && sameOrder) {
        return;
      }

      if (removedImages.length > 0) {
        upsertPackRow(row, {
          product_packing_images: removedImages.map((img) => ({
            id: img.id,
            _delete: true,
          })),
        });
      }

      if (newList.length > 0) {
        const addedImageIds = new Set(addedImages.map((img) => img.id));

        upsertPackRow(row, {
          product_packing_images: newList.map((img, index) => ({
            id: img.id,
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
    [upsertPackRow],
  );

  const parseNumericInput = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const columns = useMemo(
    () => [
      {
        key: 'packing_type_id',
        label: 'Package Type',
        sortType: 'string',
        getSortValue: (row) =>
          packTypeOptions.find((item) => item.id === row.packing_type_id)
            ?.label || '',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={packTypeOptions.map((item) => ({
              id: item.id,
              name: item.label,
            }))}
            defaultSelectedOption={row.packing_type_id || ''}
            onChange={(ov, nv) => upsertPackRow(row, { packing_type_id: nv })}
          />
        ),
      },
      {
        key: 'packing_reliability_type_id',
        label: 'Pack Reliability',
        sortType: 'string',
        getSortValue: (row) =>
          reliabilityTypeOptions.find(
            (item) => item.id === row.packing_reliability_type_id,
          )?.label || '',
        renderCell: (row) => (
          <Main_Dropdown
            defaultOptions={reliabilityTypeOptions.map((item) => ({
              id: item.id,
              name: item.label,
            }))}
            defaultSelectedOption={row.packing_reliability_type_id || ''}
            onChange={(ov, nv) =>
              upsertPackRow(row, { packing_reliability_type_id: nv })
            }
          />
        ),
      },
      {
        key: 'length',
        label: 'L',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={String(row.length ?? '')}
            placeholder="Length"
            onChange={(ov, nv) =>
              upsertPackRow(row, { length: parseNumericInput(nv) })
            }
          />
        ),
      },
      {
        key: 'width',
        label: 'W',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={String(row.width ?? '')}
            placeholder="Width"
            onChange={(ov, nv) =>
              upsertPackRow(row, { width: parseNumericInput(nv) })
            }
          />
        ),
      },
      {
        key: 'height',
        label: 'H',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={String(row.height ?? '')}
            placeholder="Height"
            onChange={(ov, nv) =>
              upsertPackRow(row, { height: parseNumericInput(nv) })
            }
          />
        ),
      },
      {
        key: 'quantity',
        label: 'Qty',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={String(row.quantity ?? '')}
            placeholder="Quantity"
            onChange={(ov, nv) =>
              upsertPackRow(row, { quantity: parseNumericInput(nv) })
            }
          />
        ),
      },
      {
        key: 'weight',
        label: 'Weight (kg)',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={String(row.weight ?? '')}
            placeholder="Weight"
            onChange={(ov, nv) =>
              upsertPackRow(row, { weight: parseNumericInput(nv) })
            }
          />
        ),
      },
      {
        key: 'product_packing_images',
        label: 'Images',
        sortable: false,
        renderCell: (row) => {
          const imageDefaults = sortByDisplayOrder(
            row.product_packing_images || [],
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
                tableCell
                hoverPreview
                compactButtonText="Upload"
                defaultImages={imageDefaults}
                onChange={(ov, nv) => handlePackImagesChange(row, ov, nv)}
                onError={(error) => {
                  console.error('Packing image upload error:', error);
                }}
              />
            </div>
          );
        },
      },
      {
        key: 'remark',
        label: 'Remark',
        sortable: false,
        minWidth: '280px',
        renderCell: (row) => (
          <div className={styles.remarkCell}>
            <Main_TextArea
              defaultValue={row.remark || ''}
              placeholder="Remark"
              rows={2}
              resize="none"
              onChange={(ov, nv) => upsertPackRow(row, { remark: nv })}
            />
          </div>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeletePackRow(row)} />
        ),
      },
    ],
    [
      packTypeOptions,
      reliabilityTypeOptions,
      upsertPackRow,
      handlePackImagesChange,
      handleDeletePackRow,
    ],
  );

  return (
    <Main_InputContainer label="Packing Information">
      <div className={styles.tableSection}>
        <div className={styles.actionsBar}>
          <AddNewBtn
            onClick={handleAddPackRow}
            text="Add Packing"
            ariaLabel="Add new packing"
            title="Add Packing"
          />
        </div>

        <EditableDataTable
          rows={packRows}
          columns={columns}
          rowKey="id"
          emptyMessage="No packing rows yet. Click + Add Packing."
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_Pack;
