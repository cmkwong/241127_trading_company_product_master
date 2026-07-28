import { useCallback, useMemo } from 'react';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import RemoveRowBtn from '../../../common/Buttons/RemoveRowBtn';
import { useProductContext } from '../../../../store/ProductContext';
import { v4 as uuidv4 } from 'uuid';
import { sortByDisplayOrder } from '../../../../utils/arr';
import { mockSuppliers } from '../../../../datas/Suppliers/mockSuppliers';
import Frame from '../../../common/Layouts/Frame';
import styles from './Main_Customization.module.css';

const Main_Customization = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const customizations = pageData.product_customizations || [];
  const supplierSuggestions = useMemo(
    () =>
      (mockSuppliers || []).map((supplier, index) => ({
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
        <h3 className={styles.title}>Customization Options</h3>
        <div className={styles.actionsBar}>
          <AddNewBtn
            onClick={handleAddCustomizationRow}
            text="Add Customization"
            ariaLabel="Add new customization"
            title="Add Customization"
            className={styles.addActionBtn}
          />
        </div>
      </Frame>

      <Frame direction="vertical" gap={12} className={styles.customizationList}>
        {customizations.length === 0 ? (
          <div className={styles.emptyState}>
            No customizations yet. Click Add Customization.
          </div>
        ) : (
          customizations.map((row, index) => {
            const defaultImages = sortByDisplayOrder(
              row.product_customization_images || [],
            ).map((img) => ({
              id: img.id,
              url: img.image_url,
              name: img.image_name,
              display_order: img.display_order,
            }));

            return (
              <Frame
                key={row?.id || `customization-row-${index}`}
                direction="vertical"
                gap={12}
                className={styles.customizationRow}
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
                    ariaLabel="Delete customization row"
                    title="Delete customization row"
                    onClick={() => handleDeleteCustomizationRow(row)}
                  />
                </Frame>

                <Frame
                  direction="horizontal"
                  gap={12}
                  alignment="top left"
                  className={styles.primaryFieldsRow}
                >
                  <div className={styles.titleFieldBlock}>
                    <label className={styles.fieldLabel}>
                      Customization Title
                    </label>
                    <Main_TextField
                      className={styles.fieldInput}
                      defaultValue={row.name || ''}
                      placeholder="Customization Title"
                      onChange={(ov, nv) =>
                        upsertCustomizationRow(row, { name: nv })
                      }
                    />
                  </div>

                  <div className={styles.supplierFieldBlock}>
                    <label className={styles.fieldLabel}>Suppliers</label>
                    <div className={styles.supplierSuggestCell}>
                      <Main_Suggest
                        defaultSuggestions={supplierSuggestions}
                        placeholder="Suppliers"
                        autoComplete="new-password"
                        defaultValue={row.code || ''}
                        getSuggestionLabel={(suggestion) =>
                          suggestion?.code || ''
                        }
                        getSuggestionSearchText={(suggestion) =>
                          String(
                            suggestion?.searchText || suggestion?.code || '',
                          )
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
                        onChange={(ov, nv) =>
                          upsertCustomizationRow(row, { code: nv })
                        }
                        onSelectSuggestion={(suggestion) =>
                          upsertCustomizationRow(row, {
                            code: String(suggestion?.code || '').trim(),
                          })
                        }
                      />
                    </div>
                  </div>
                </Frame>

                <div className={styles.remarkFieldBlock}>
                  <label className={styles.fieldLabel}>Remark</label>
                  <div className={styles.remarkInputWrap}>
                    <Main_TextArea
                      defaultValue={row.remark || ''}
                      placeholder="Add remarks..."
                      rows={2}
                      resize="none"
                      onChange={(ov, nv) =>
                        upsertCustomizationRow(row, { remark: nv })
                      }
                    />
                  </div>
                </div>

                <div className={styles.filesFieldBlock}>
                  <Main_FileUploads
                    mode="image"
                    label="Files"
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
                </div>
              </Frame>
            );
          })
        )}
      </Frame>
    </Frame>
  );
};

export default Main_Customization;
