import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Sub_SuggestionCard from '../../../common/InputOptions/Suggest/Sub_SuggestionCard';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/TextArea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import EditableDataForm from '../../../common/Forms/EditableDataForm';
import {
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';
import styles from './Main_SalesPackingItems.module.css';

const FILE_SERVER_BASE_URL = 'http://localhost:3001';

const resolveIconUrl = (iconUrl) => {
  const normalized = String(iconUrl || '').trim();
  if (!normalized) {
    return '';
  }

  if (/^(blob:|data:|https?:\/\/)/i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('/')) {
    return `${FILE_SERVER_BASE_URL}${normalized}`;
  }

  return `${FILE_SERVER_BASE_URL}/${normalized}`;
};

const Main_SalesPackingItems = ({ productOptions = [], onPatchQuotation }) => {
  const quotationId = useEntityField('sales_quotations', 'id');
  const packingItems = useEntityRows('sales_quotations', 'sales_packing_items');
  const packingItemImages = useEntityRows(
    'sales_quotations',
    'sales_packing_item_images',
  );
  const packingItemInternalImages = useEntityRows(
    'sales_quotations',
    'sales_packing_item_internal_images',
  );
  const packingItemInternalFiles = useEntityRows(
    'sales_quotations',
    'sales_packing_item_internal_files',
  );

  const setPackingItems = useCallback(
    (nextRowsOrUpdater) => {
      onPatchQuotation((currentQuotation) => {
        const previousRows = currentQuotation?.sales_packing_items || [];
        const nextRows =
          typeof nextRowsOrUpdater === 'function'
            ? nextRowsOrUpdater(previousRows)
            : nextRowsOrUpdater;

        return { sales_packing_items: nextRows };
      });
    },
    [onPatchQuotation],
  );

  const setPackingItemImages = useCallback(
    (nextRowsOrUpdater) => {
      onPatchQuotation((currentQuotation) => {
        const previousRows = currentQuotation?.sales_packing_item_images || [];
        const nextRows =
          typeof nextRowsOrUpdater === 'function'
            ? nextRowsOrUpdater(previousRows)
            : nextRowsOrUpdater;

        return { sales_packing_item_images: nextRows };
      });
    },
    [onPatchQuotation],
  );
  const setPackingItemInternalImages = useCallback(
    (nextRowsOrUpdater) => {
      onPatchQuotation((currentQuotation) => {
        const previousRows =
          currentQuotation?.sales_packing_item_internal_images || [];
        const nextRows =
          typeof nextRowsOrUpdater === 'function'
            ? nextRowsOrUpdater(previousRows)
            : nextRowsOrUpdater;

        return { sales_packing_item_internal_images: nextRows };
      });
    },
    [onPatchQuotation],
  );
  const setPackingItemInternalFiles = useCallback(
    (nextRowsOrUpdater) => {
      onPatchQuotation((currentQuotation) => {
        const previousRows =
          currentQuotation?.sales_packing_item_internal_files || [];
        const nextRows =
          typeof nextRowsOrUpdater === 'function'
            ? nextRowsOrUpdater(previousRows)
            : nextRowsOrUpdater;

        return { sales_packing_item_internal_files: nextRows };
      });
    },
    [onPatchQuotation],
  );

  const handlePackingItemImagesChange = useCallback(
    (parentId, nextFiles) => {
      setPackingItemImages((previousRows) => {
        const withoutParent = (previousRows || []).filter(
          (file) =>
            String(file?.sales_packing_item_id || '') !==
            String(parentId || ''),
        );
        const nextRows = (nextFiles || []).map((file, index) => ({
          id: file.id,
          sales_packing_item_id: parentId,
          image_name: file.name,
          image_url: file.url,
          display_order: file.display_order ?? index + 1,
        }));
        return [...withoutParent, ...nextRows];
      });
    },
    [setPackingItemImages],
  );

  const handlePackingItemInternalImagesChange = useCallback(
    (parentId, nextFiles) => {
      setPackingItemInternalImages((previousRows) => {
        const withoutParent = (previousRows || []).filter(
          (file) =>
            String(file?.sales_packing_item_id || '') !==
            String(parentId || ''),
        );
        const nextRows = (nextFiles || []).map((file, index) => ({
          id: file.id,
          sales_packing_item_id: parentId,
          image_name: file.name,
          image_url: file.url,
          display_order: file.display_order ?? index + 1,
        }));
        return [...withoutParent, ...nextRows];
      });
    },
    [setPackingItemInternalImages],
  );

  const handlePackingItemInternalFilesChange = useCallback(
    (parentId, nextFiles) => {
      setPackingItemInternalFiles((previousRows) => {
        const withoutParent = (previousRows || []).filter(
          (file) =>
            String(file?.sales_packing_item_id || '') !==
            String(parentId || ''),
        );
        const nextRows = (nextFiles || []).map((file, index) => ({
          id: file.id,
          sales_packing_item_id: parentId,
          file_name: file.name,
          file_url: file.url,
          display_order: file.display_order ?? index + 1,
        }));
        return [...withoutParent, ...nextRows];
      });
    },
    [setPackingItemInternalFiles],
  );

  const handleUpsertPackingItem = useCallback(
    (row, patch) => {
      const rowId = String(row?.id || uuidv4());
      const nextRow = {
        id: rowId,
        sales_quotation_id: quotationId,
        product_id: '',
        length: '',
        width: '',
        height: '',
        qty: 0,
        weight: '',
        details: '',
        remark: '',
        ...row,
        ...patch,
      };

      setPackingItems((previousRows) => {
        const exists = previousRows.some(
          (item) => String(item?.id || '') === rowId,
        );

        if (exists) {
          return previousRows.map((item) =>
            String(item?.id || '') === rowId ? nextRow : item,
          );
        }

        return [...previousRows, nextRow];
      });
    },
    [quotationId, setPackingItems],
  );

  const handleDeletePackingItem = useCallback(
    (row) => {
      const rowId = String(row?.id || '');
      if (!rowId) return;

      setPackingItems(
        packingItems.filter((item) => String(item?.id || '') !== rowId),
      );
      setPackingItemImages(
        packingItemImages.filter(
          (file) => String(file?.sales_packing_item_id || '') !== rowId,
        ),
      );
      setPackingItemInternalImages(
        packingItemInternalImages.filter(
          (file) => String(file?.sales_packing_item_id || '') !== rowId,
        ),
      );
      setPackingItemInternalFiles(
        packingItemInternalFiles.filter(
          (file) => String(file?.sales_packing_item_id || '') !== rowId,
        ),
      );
    },
    [
      packingItems,
      packingItemImages,
      packingItemInternalImages,
      packingItemInternalFiles,
      setPackingItems,
      setPackingItemImages,
      setPackingItemInternalImages,
      setPackingItemInternalFiles,
    ],
  );

  const handleAddPackingItem = useCallback(() => {
    setPackingItems((previousRows) => [
      ...previousRows,
      {
        id: uuidv4(),
        sales_quotation_id: quotationId,
        product_id: productOptions[0]?.id || '',
        length: '',
        width: '',
        height: '',
        qty: 0,
        weight: '',
        details: '',
        remark: '',
      },
    ]);
  }, [quotationId, productOptions, setPackingItems]);

  const productDropdownOptions = useMemo(
    () =>
      (productOptions || []).map((item) => ({
        id: String(item?.id || '').trim(),
        name: String(item?.name || item?.label || item?.id || '').trim(),
        icon_url: String(item?.icon_url || '').trim(),
        category_name: String(item?.category_name || '').trim(),
        alibaba_id_value: String(item?.alibaba_id_value || '').trim(),
        searchText: String(item?.searchText || '').trim(),
      })),
    [productOptions],
  );

  const renderNumberCell = (field) => (row) => (
    <Main_TextField
      className={styles.cellInput}
      type="number"
      step="0.001"
      defaultValue={
        row[field] === null || row[field] === undefined ? '' : row[field]
      }
      placeholder="0.000"
      onChange={(ov, nv) => handleUpsertPackingItem(row, { [field]: nv })}
    />
  );

  const packingColumns = useMemo(
    () => [
      {
        key: 'product_id',
        label: 'Product',
        size: 'XL',
        sortType: 'string',
        getSortValue: (row) =>
          productDropdownOptions.find((item) => item.id === row.product_id)
            ?.name || '',
        renderCell: (row) => (
          <div className={styles.suggestCell}>
            <Main_Suggest
              defaultSuggestions={productDropdownOptions}
              defaultValue={
                productDropdownOptions.find(
                  (item) => item.id === row.product_id,
                )?.name || ''
              }
              placeholder="Search product"
              getSuggestionLabel={(suggestion) => suggestion?.name || ''}
              getSuggestionSearchText={(suggestion) =>
                String(
                  [
                    suggestion?.searchText,
                    suggestion?.id,
                    suggestion?.name,
                    suggestion?.category_name,
                    suggestion?.alibaba_id_value,
                  ]
                    .filter(Boolean)
                    .join(' '),
                )
              }
              renderSuggestion={(suggestion) => (
                <Sub_SuggestionCard
                  iconUrl={resolveIconUrl(suggestion?.icon_url)}
                  iconAlt={suggestion?.name || 'Product icon'}
                  title={suggestion?.name || ''}
                  metaItems={[
                    {
                      label: 'Category',
                      value: suggestion?.category_name || 'Uncategorized',
                    },
                    {
                      label: 'Alibaba ID',
                      value: suggestion?.alibaba_id_value || '-',
                    },
                  ]}
                  linkTo={`/panel/product_master/${suggestion?.id || ''}`}
                />
              )}
              onChange={(ov, nv) => {
                if (!String(nv || '').trim()) {
                  handleUpsertPackingItem(row, { product_id: '' });
                }
              }}
              onSelectSuggestion={(suggestion) =>
                handleUpsertPackingItem(row, {
                  product_id: String(suggestion?.id || '').trim(),
                })
              }
            />
          </div>
        ),
      },
      {
        key: 'length',
        label: 'Length',
        size: 'S',
        sortType: 'number',
        nextRow: true,
        renderCell: renderNumberCell('length'),
      },
      {
        key: 'width',
        label: 'Width',
        size: 'S',
        sortType: 'number',
        renderCell: renderNumberCell('width'),
      },
      {
        key: 'height',
        label: 'Height',
        size: 'S',
        sortType: 'number',
        renderCell: renderNumberCell('height'),
      },
      {
        key: 'qty',
        label: 'Qty',
        size: 'S',
        sortType: 'number',
        renderCell: (row) => (
          <Main_TextField
            className={styles.cellInput}
            type="number"
            step="1"
            min="0"
            defaultValue={
              row.qty === null || row.qty === undefined ? '' : row.qty
            }
            placeholder="0"
            onChange={(ov, nv) => handleUpsertPackingItem(row, { qty: nv })}
          />
        ),
      },
      {
        key: 'weight',
        label: 'Weight (kg)',
        size: 'S',
        sortType: 'number',
        renderCell: renderNumberCell('weight'),
      },
      {
        key: 'details',
        label: 'Details',
        size: 'L',
        sortType: 'string',
        nextRow: true,
        renderCell: (row) => (
          <Main_TextArea
            className={styles.cellInput}
            defaultValue={row.details || ''}
            placeholder="Description shown on printout"
            onChange={(ov, nv) => handleUpsertPackingItem(row, { details: nv })}
          />
        ),
      },
      {
        key: 'remark',
        label: 'Remark',
        size: 'L',
        sortType: 'string',
        renderCell: (row) => (
          <Main_TextArea
            className={styles.cellInput}
            defaultValue={row.remark || ''}
            placeholder="Internal remark (not for print)"
            onChange={(ov, nv) => handleUpsertPackingItem(row, { remark: nv })}
          />
        ),
      },
      {
        key: 'images',
        label: 'Print Images',
        size: 'XL',
        sortable: false,
        renderCell: (row) => {
          const defaultImages = packingItemImages
            .filter(
              (image) =>
                String(image?.sales_packing_item_id || '') ===
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
                onChange={(ov, nv) =>
                  handlePackingItemImagesChange(row?.id, nv)
                }
                onError={(error) => {
                  console.error(
                    'Sales packing item image upload error:',
                    error,
                  );
                }}
                fileUrlBase={FILE_SERVER_BASE_URL}
              />
            </div>
          );
        },
      },
      {
        key: 'internal_images',
        label: 'Internal Images',
        size: 'XL',
        sortable: false,
        renderCell: (row) => {
          const defaultImages = packingItemInternalImages
            .filter(
              (image) =>
                String(image?.sales_packing_item_id || '') ===
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
                onChange={(ov, nv) =>
                  handlePackingItemInternalImagesChange(row?.id, nv)
                }
                onError={(error) => {
                  console.error(
                    'Sales packing item internal image upload error:',
                    error,
                  );
                }}
                fileUrlBase={FILE_SERVER_BASE_URL}
              />
            </div>
          );
        },
      },
      {
        key: 'internal_files',
        label: 'Internal Files',
        size: 'XL',
        sortable: false,
        renderCell: (row) => {
          const defaultFiles = packingItemInternalFiles
            .filter(
              (file) =>
                String(file?.sales_packing_item_id || '') ===
                String(row?.id || ''),
            )
            .sort(
              (a, b) =>
                Number(a.display_order || 0) - Number(b.display_order || 0),
            )
            .map((file) => ({
              id: file.id,
              name: file.file_name,
              url: file.file_url,
              display_order: file.display_order,
            }));

          return (
            <div className={styles.uploadsCell}>
              <Main_FileUploads
                mode="file"
                label=""
                compact
                tableCell
                hoverPreview
                showDownloadButton={false}
                compactButtonText="Upload"
                defaultFiles={defaultFiles}
                onChange={(ov, nv) =>
                  handlePackingItemInternalFilesChange(row?.id, nv)
                }
                onError={(error) => {
                  console.error(
                    'Sales packing item internal file upload error:',
                    error,
                  );
                }}
                fileUrlBase={FILE_SERVER_BASE_URL}
              />
            </div>
          );
        },
      },
    ],
    [
      productDropdownOptions,
      handleUpsertPackingItem,
      packingItemImages,
      packingItemInternalImages,
      packingItemInternalFiles,
      handlePackingItemImagesChange,
      handlePackingItemInternalImagesChange,
      handlePackingItemInternalFilesChange,
      renderNumberCell,
    ],
  );

  return (
    <Main_InputContainer label="Sales Packing List">
      <div className={styles.tableSection}>
        <EditableDataForm
          rows={packingItems}
          columns={packingColumns}
          rowKey="id"
          emptyMessage="No packing items yet. Click + Add Packing Item."
          onAddRow={handleAddPackingItem}
          addRowText="Add Packing Item"
          onRemoveRow={handleDeletePackingItem}
        />
      </div>
    </Main_InputContainer>
  );
};

export default Main_SalesPackingItems;
