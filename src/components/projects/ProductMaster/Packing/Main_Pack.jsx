import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import RemoveRowBtn from '../../../common/Buttons/RemoveRowBtn';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import { sortByDisplayOrder } from '../../../../utils/arr';
import Frame from '../../../common/Layouts/Frame';
import styles from './Main_Pack.module.css';

const Main_Pack = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { packType, packingReliabilityType } = useMasterContext();
  const packRows = pageData.product_packings || [];

  // Prepare dropdown options
  const packTypeOptions = useMemo(
    () =>
      (packType || []).map((item) => ({
        id: item.id,
        label: item.label ?? item.name ?? '',
      })),
    [packType],
  );

  // Reliability type options for dropdown
  const reliabilityTypeOptions = useMemo(
    () =>
      (packingReliabilityType || []).map((item) => ({
        id: item.id,
        label: item.label ?? item.name ?? '',
      })),
    [packingReliabilityType],
  );

  // Upsert (add/update) a packing row
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

  const parseNumericInput = (value) => {
    if (value === '' || value === null || value === undefined) {
      return '';
    }

    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? '' : parsed;
  };

  const dropdownPackTypeOptions = useMemo(
    () =>
      packTypeOptions.map((item) => ({
        id: item.id,
        name: item.label,
      })),
    [packTypeOptions],
  );

  const dropdownReliabilityOptions = useMemo(
    () =>
      reliabilityTypeOptions.map((item) => ({
        id: item.id,
        name: item.label,
      })),
    [reliabilityTypeOptions],
  );

  return (
    <Frame
      direction="vertical"
      gap={24}
      className={styles.cardRoot}
      horizontal_padding={32}
      vertical_padding={32}
    >
      <Frame
        direction="horizontal"
        gap="auto"
        alignment="center"
        className={styles.headerRow}
      >
        <h3 className={styles.title}>Packing Information</h3>
        <div className={styles.actionsBar}>
          <AddNewBtn
            onClick={handleAddPackRow}
            text="Add Packing"
            ariaLabel="Add new packing"
            title="Add Packing"
            className={styles.addActionBtn}
          />
        </div>
      </Frame>

      <Frame direction="vertical" gap={16} className={styles.packingRows}>
        {packRows.length === 0 ? (
          <div className={styles.emptyState}>
            No packing rows yet. Click Add Packing.
          </div>
        ) : (
          packRows.map((row, index) => {
            const fileDefaults = sortByDisplayOrder(
              row.product_packing_files || [],
            ).map((file) => ({
              id: file.id,
              url: file.file_url ?? file.image_url,
              name: file.file_name ?? file.image_name,
              display_order: file.display_order,
            }));

            return (
              <Frame
                key={row?.id || `packing-row-${index}`}
                direction="vertical"
                gap={16}
                className={styles.packingRowCard}
                horizontal_padding={16}
                vertical_padding={16}
              >
                <Frame
                  direction="horizontal"
                  gap="auto"
                  alignment="center"
                  className={styles.rowTools}
                >
                  <span className={styles.rowToolsSpacer} aria-hidden="true" />
                  <RemoveRowBtn
                    ariaLabel="Delete packing row"
                    title="Delete packing row"
                    onClick={() => handleDeletePackRow(row)}
                  />
                </Frame>

                <Frame
                  direction="horizontal"
                  gap={12}
                  alignment="top left"
                  className={styles.dropdownRow}
                >
                  <div
                    className={`${styles.fieldBlock} ${styles.packTypeField}`}
                  >
                    <label className={styles.fieldLabel}>Package Type</label>
                    <div className={styles.dropdownInputWrap}>
                      <Main_Dropdown
                        matchParentWidth
                        defaultOptions={dropdownPackTypeOptions}
                        defaultSelectedOption={row.packing_type_id || ''}
                        onChange={(ov, nv) =>
                          upsertPackRow(row, { packing_type_id: nv })
                        }
                      />
                    </div>
                  </div>

                  <div
                    className={`${styles.fieldBlock} ${styles.packReliabilityField}`}
                  >
                    <label className={styles.fieldLabel}>
                      Pack Reliability
                    </label>
                    <div className={styles.dropdownInputWrap}>
                      <Main_Dropdown
                        matchParentWidth
                        defaultOptions={dropdownReliabilityOptions}
                        defaultSelectedOption={
                          row.packing_reliability_type_id || ''
                        }
                        onChange={(ov, nv) =>
                          upsertPackRow(row, {
                            packing_reliability_type_id: nv,
                          })
                        }
                      />
                    </div>
                  </div>
                </Frame>

                <Frame
                  direction="horizontal"
                  gap={12}
                  alignment="top left"
                  className={styles.dimensionRow}
                >
                  <div
                    className={`${styles.fieldBlock} ${styles.metricFieldSmall}`}
                  >
                    <label className={styles.fieldLabel}>L</label>
                    <Main_TextField
                      type="number"
                      className={styles.metricInput}
                      defaultValue={String(row.length ?? '')}
                      placeholder="L"
                      onChange={(ov, nv) =>
                        upsertPackRow(row, { length: parseNumericInput(nv) })
                      }
                    />
                  </div>

                  <div
                    className={`${styles.fieldBlock} ${styles.metricFieldSmall}`}
                  >
                    <label className={styles.fieldLabel}>W</label>
                    <Main_TextField
                      type="number"
                      className={styles.metricInput}
                      defaultValue={String(row.width ?? '')}
                      placeholder="W"
                      onChange={(ov, nv) =>
                        upsertPackRow(row, { width: parseNumericInput(nv) })
                      }
                    />
                  </div>

                  <div
                    className={`${styles.fieldBlock} ${styles.metricFieldSmall}`}
                  >
                    <label className={styles.fieldLabel}>H</label>
                    <Main_TextField
                      type="number"
                      className={styles.metricInput}
                      defaultValue={String(row.height ?? '')}
                      placeholder="H"
                      onChange={(ov, nv) =>
                        upsertPackRow(row, { height: parseNumericInput(nv) })
                      }
                    />
                  </div>

                  <div
                    className={`${styles.fieldBlock} ${styles.metricFieldSmall}`}
                  >
                    <label className={styles.fieldLabel}>Qty</label>
                    <Main_TextField
                      type="number"
                      className={styles.metricInput}
                      defaultValue={String(row.quantity ?? '')}
                      placeholder="Qty"
                      onChange={(ov, nv) =>
                        upsertPackRow(row, {
                          quantity: parseNumericInput(nv),
                        })
                      }
                    />
                  </div>

                  <div
                    className={`${styles.fieldBlock} ${styles.metricFieldWide}`}
                  >
                    <label className={styles.fieldLabel}>Weight kg</label>
                    <Main_TextField
                      type="number"
                      className={styles.metricInput}
                      defaultValue={String(row.weight ?? '')}
                      placeholder="Weight"
                      onChange={(ov, nv) =>
                        upsertPackRow(row, { weight: parseNumericInput(nv) })
                      }
                    />
                  </div>
                </Frame>

                <div className={styles.filesBlock}>
                  <div className={styles.filesUploaderWrap}>
                    <Main_FileUploads
                      mode="file"
                      maxFiles={12}
                      maxSizeInMB={20}
                      label="Files"
                      compact
                      tableCell
                      hoverPreview
                      compactButtonText="Upload"
                      defaultFiles={fileDefaults}
                      onChange={(ov, nv) => handlePackFilesChange(row, ov, nv)}
                      onError={(error) => {
                        console.error('Packing file upload error:', error);
                      }}
                    />
                  </div>
                  <div className={styles.scrollbarTrack}>
                    <div className={styles.scrollbarThumb} />
                  </div>
                </div>

                <div className={styles.remarkBlock}>
                  <label className={styles.fieldLabel}>Remark</label>
                  <div className={styles.remarkInputWrap}>
                    <Main_TextArea
                      defaultValue={row.remark || ''}
                      placeholder="Add remark..."
                      rows={2}
                      resize="none"
                      onChange={(ov, nv) => upsertPackRow(row, { remark: nv })}
                    />
                  </div>
                </div>
              </Frame>
            );
          })
        )}
      </Frame>
    </Frame>
  );
};

export default Main_Pack;
