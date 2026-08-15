import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { sortByDisplayOrder } from '../../../../utils/arr';
import styles from './Main_Pack.module.css';

const parseNumericInput = (value) => {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? '' : parsed;
};

const Main_Pack = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { packType, packingReliabilityType, productLogisticsAttributes } =
    useMasterContext();
  const packRows = pageData.product_packings || [];

  const dropdownPackTypeOptions = useMemo(
    () =>
      (packType || []).map((item) => ({
        id: item.id,
        name: item.label ?? item.name ?? '',
      })),
    [packType],
  );

  const dropdownReliabilityOptions = useMemo(
    () =>
      (packingReliabilityType || []).map((item) => ({
        id: item.id,
        name: item.label ?? item.name ?? '',
      })),
    [packingReliabilityType],
  );

  const selectedLogisticsIds = pageData.product_logistics_attributes_id
    ? [pageData.product_logistics_attributes_id]
    : [];

  const handleLogisticsChange = useCallback(
    (ov, nv) => {
      const nextIds = Array.isArray(nv) ? nv : [];
      const newId = nextIds.find((id) => !(ov || []).includes(id));
      const removedId = (ov || []).find((id) => !nextIds.includes(id));

      if (newId) {
        upsertProductPageData({ product_logistics_attributes_id: newId });
      } else if (removedId) {
        upsertProductPageData({ product_logistics_attributes_id: '' });
      }
    },
    [upsertProductPageData],
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
          product_packing_files: [],
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

  const handlePackFilesChange = useCallback(
    (row, oldFiles = [], newFiles = []) => {
      const oldList = Array.isArray(oldFiles) ? oldFiles : [];
      const newList = Array.isArray(newFiles) ? newFiles : [];

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
          product_packing_files: removedImages.map((img) => ({
            id: img.id,
            _delete: true,
          })),
        });
      }

      if (newList.length > 0) {
        const addedFileIds = new Set(addedImages.map((img) => img.id));

        upsertPackRow(row, {
          product_packing_files: newList.map((img, index) => ({
            id: img.id,
            display_order: index + 1,
            ...(addedFileIds.has(img.id)
              ? {
                  file_name: img.name,
                  file_url: img.url,
                }
              : {}),
          })),
        });
      }
    },
    [upsertPackRow],
  );

  const columns = useMemo(
    () => [
      {
        key: 'packing_type_id',
        label: 'Package Type',
        sortType: 'string',
        minWidth: '200px',
        maxWidth: '320px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_Dropdown
            matchParentWidth
            defaultOptions={dropdownPackTypeOptions}
            defaultSelectedOption={row.packing_type_id || ''}
            onChange={(ov, nv) => upsertPackRow(row, { packing_type_id: nv })}
          />
        ),
      },
      {
        key: 'packing_reliability_type_id',
        label: 'Pack Reliability',
        sortType: 'string',
        minWidth: '180px',
        maxWidth: '280px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_Dropdown
            matchParentWidth
            defaultOptions={dropdownReliabilityOptions}
            defaultSelectedOption={row.packing_reliability_type_id || ''}
            onChange={(ov, nv) =>
              upsertPackRow(row, {
                packing_reliability_type_id: nv,
              })
            }
          />
        ),
      },
      {
        key: 'length',
        label: 'L',
        sortType: 'number',
        minWidth: '80px',
        maxWidth: '120px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_TextField
            type="number"
            className={styles.numericInput}
            defaultValue={String(row.length ?? '')}
            placeholder="L"
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
        minWidth: '80px',
        maxWidth: '120px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_TextField
            type="number"
            className={styles.numericInput}
            defaultValue={String(row.width ?? '')}
            placeholder="W"
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
        minWidth: '80px',
        maxWidth: '120px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_TextField
            type="number"
            className={styles.numericInput}
            defaultValue={String(row.height ?? '')}
            placeholder="H"
            onChange={(ov, nv) =>
              upsertPackRow(row, { height: parseNumericInput(nv) })
            }
          />
        ),
      },
      {
        key: 'quantity',
        label: 'Qty / Pack',
        sortType: 'number',
        minWidth: '90px',
        maxWidth: '140px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_TextField
            type="number"
            className={styles.numericInput}
            defaultValue={String(row.quantity ?? '')}
            placeholder="Qty"
            onChange={(ov, nv) =>
              upsertPackRow(row, {
                quantity: parseNumericInput(nv),
              })
            }
          />
        ),
      },
      {
        key: 'weight',
        label: 'Weight kg',
        sortType: 'number',
        minWidth: '90px',
        maxWidth: '140px',
        cellClassName: styles.tableCell,
        renderCell: (row) => (
          <Main_TextField
            type="number"
            className={styles.numericInput}
            defaultValue={String(row.weight ?? '')}
            placeholder="kg"
            onChange={(ov, nv) =>
              upsertPackRow(row, { weight: parseNumericInput(nv) })
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
          <DeleteBtn onClick={() => handleDeletePackRow(row)} />
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
            placeholder="Add remark..."
            rows={2}
            resize="none"
            onChange={(ov, nv) => upsertPackRow(row, { remark: nv })}
          />
        ),
      },
      {
        key: 'product_packing_files',
        label: 'Files',
        sortable: false,
        nextRow: true,
        minWidth: '300px',
        maxWidth: '100%',
        cellClassName: styles.tableCell,
        renderCell: (row) => {
          const defaultFiles = sortByDisplayOrder(
            row.product_packing_files || [],
          ).map((file) => ({
            id: file.id,
            url: file.file_url ?? file.image_url,
            name: file.file_name ?? file.image_name,
            display_order: file.display_order,
          }));

          return (
            <Main_FileUploads
              mode="file"
              maxFiles={12}
              maxSizeInMB={20}
              label=""
              compact
              tableCell
              hoverPreview
              compactButtonText="Upload"
              defaultFiles={defaultFiles}
              onChange={(ov, nv) => handlePackFilesChange(row, ov, nv)}
              onError={(error) => {
                console.error('Packing file upload error:', error);
              }}
            />
          );
        },
      },
    ],
    [
      dropdownPackTypeOptions,
      dropdownReliabilityOptions,
      upsertPackRow,
      handleDeletePackRow,
      handlePackFilesChange,
    ],
  );

  return (
    <Main_InputContainer label="Packing Information">
      <Main_TagInputField
        defaultOptions={productLogisticsAttributes}
        defaultSelectedOptions={selectedLogisticsIds}
        onChange={handleLogisticsChange}
        canAddNewOptions={false}
        enableHierarchyViewToggle={true}
        hierarchyToggleLabel="Show Hierarchy"
        placeholder="Search logistics attributes..."
      />

      <Main_InputContainer
        label="Packing Details"
        layout="column"
        onAddNew={handleAddPackRow}
        addNewText="Add Packing"
      >
        <EditableDataTable
          rows={packRows}
          columns={columns}
          rowKey="id"
          emptyMessage="No packing rows yet. Click + Add Packing."
        />
      </Main_InputContainer>
    </Main_InputContainer>
  );
};

export default Main_Pack;
