import { useCallback, useMemo } from 'react';
import styles from './Main_ProductLink.module.css';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_DateSelector from '../../../common/InputOptions/Date/Main_DateSelector';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import {
  upsertEntityData,
  useEntityRows,
  useEntityField,
} from '../../../../store/GeneralContext';
import { v4 as uuidv4 } from 'uuid';
import { sortByDisplayOrder } from '../../../../utils/arr';

const Main_ProductLink = () => {
  const productId = useEntityField('products', 'id');
  const productLinks = useEntityRows('products', 'product_links');

  const upsertLinkRow = useCallback(
    (row, patch) => {
      upsertEntityData('products', {
        product_links: [
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

  const handleAddLinkRow = useCallback(() => {
    upsertEntityData('products', {
      product_links: [
        {
          id: uuidv4(),
          product_id: productId,
          name: '',
          link: '',
          score: 1,
          remark: '',
          updated_at: '',
          product_link_images: [],
        },
      ],
    });
  }, [upsertEntityData, productId]);

  const handleDeleteLinkRow = useCallback(
    (row) => {
      if (!row?.id) return;

      upsertEntityData('products', {
        product_links: [
          {
            id: row.id,
            _delete: true,
          },
        ],
      });
    },
    [upsertEntityData],
  );

  const handleLinkImagesChange = useCallback(
    (row, oldImages = [], newImages = []) => {
      const oldList = Array.isArray(oldImages) ? oldImages : [];
      const newList = Array.isArray(newImages) ? newImages : [];

      const removedImages = oldList.filter(
        (o) => !newList.some((n) => n.id === o.id),
      );
      const addedImages = newList.filter(
        (n) => !oldList.some((o) => o.id === n.id),
      );

      const sameLength = oldList.length === newList.length;
      const sameOrder =
        sameLength && oldList.every((img, i) => img.id === newList[i]?.id);

      if (removedImages.length === 0 && addedImages.length === 0 && sameOrder) {
        return;
      }

      if (removedImages.length > 0) {
        upsertLinkRow(row, {
          product_link_images: removedImages.map((img) => ({
            id: img.id,
            _delete: true,
          })),
        });
      }

      if (newList.length > 0) {
        const addedImageIds = new Set(addedImages.map((img) => img.id));

        upsertLinkRow(row, {
          product_link_images: newList.map((img, index) => ({
            id: img.id,
            display_order: index + 1,
            ...(addedImageIds.has(img.id)
              ? {
                  image_url: img.url,
                  image_name: img.name,
                }
              : {}),
          })),
        });
      }
    },
    [upsertLinkRow],
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        sortType: 'string',
        minWidth: '220px',
        maxWidth: '400px',
        cellClassName: styles.middleCell,
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.name || ''}
            placeholder="Link name"
            onChange={(ov, nv) => upsertLinkRow(row, { name: nv })}
          />
        ),
      },
      {
        key: 'link',
        label: 'Link',
        sortType: 'string',
        minWidth: '280px',
        maxWidth: '800px',
        cellClassName: styles.middleCell,
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={row.link || ''}
            placeholder="Product link"
            type="link"
            onChange={(ov, nv) => upsertLinkRow(row, { link: nv })}
          />
        ),
      },
      {
        key: 'score',
        label: 'Scores',
        sortType: 'number',
        minWidth: '100px',
        maxWidth: '280px',
        cellClassName: styles.middleCell,
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            defaultValue={String(row.score ?? 1)}
            placeholder="1 - 10"
            type="number"
            onChange={(ov, nv) => {
              const parsed = Number.parseFloat(nv);
              const safeValue = Number.isNaN(parsed)
                ? 1
                : Math.min(10, Math.max(1, parsed));
              upsertLinkRow(row, { score: safeValue });
            }}
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
        cellClassName: styles.middleCell,
        renderCell: (row) => (
          <DeleteBtn onClick={() => handleDeleteLinkRow(row)} />
        ),
      },
      {
        key: 'remark',
        label: 'Remark',
        sortable: false,
        nextRow: true,
        minWidth: '260px',
        maxWidth: '800px',
        cellClassName: styles.middleCell,
        renderCell: (row) => (
          <div className={styles.remarkCell}>
            <Main_TextArea
              defaultValue={row.remark || ''}
              placeholder="Remark"
              rows={2}
              resize="none"
              onChange={(ov, nv) => upsertLinkRow(row, { remark: nv })}
            />
          </div>
        ),
      },
      {
        key: 'updated_at',
        label: 'Updated Date',
        sortable: false,
        width: '160px',
        minWidth: '160px',
        maxWidth: '260px',
        nextRow: true,
        cellClassName: styles.middleCell,
        renderCell: (row) => (
          <div className={styles.dateCell}>
            <Main_DateSelector
              defaultValue={row.updated_at || ''}
              disabled
              enableTime
              includeSeconds
            />
          </div>
        ),
      },
      {
        key: 'product_link_images',
        label: 'Images',
        sortable: false,
        width: '560px',
        nextRow: true,
        minWidth: '240px',
        maxWidth: '100%',
        cellClassName: styles.middleCell,
        renderCell: (row) => {
          const defaultImages = sortByDisplayOrder(
            row.product_link_images || [],
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
                showDownloadButton
                compactButtonText="Upload"
                downloadFileBaseName="product-link-images"
                downloadNameProductId={productId || ''}
                downloadNameImageType="link"
                defaultImages={defaultImages}
                onError={(error) => {
                  console.error('Link image upload error:', error);
                }}
                onChange={(ov, nv) => handleLinkImagesChange(row, ov, nv)}
              />
            </div>
          );
        },
      },
    ],
    [upsertLinkRow, handleLinkImagesChange, handleDeleteLinkRow, productId],
  );

  return (
    <Main_InputContainer
      label="Product Links"
      onAddNew={handleAddLinkRow}
      addNewText="Add Product Link"
    >
      <div className={styles.tableSection}>
        <EditableDataTable
          rows={productLinks}
          columns={columns}
          rowKey="id"
          emptyMessage="No product links yet. Click + Add Product Link."
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_ProductLink;
