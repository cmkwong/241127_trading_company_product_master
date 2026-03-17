import { useState, useCallback, useEffect } from 'react';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField.jsx';
import styles from './Sub_PackRow.module.css';
import { useProductContext } from '../../../../store/ProductContext.jsx';
import { useMasterContext } from '../../../../store/MasterContext.jsx';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads.jsx';
import SplitLayout from '../../../common/Layouts/SplitLayout.jsx';
import VerticalLayout from '../../../common/Layouts/VerticalLayout.jsx';

const Sub_PackRow = ({ packings, rowindex }) => {
  // Get the current row data or use template data if it doesn't exist
  const packing = packings[rowindex];

  const { pageData, upsertProductPageData } = useProductContext();
  const { packType, packingReliabilityType } = useMasterContext();

  const [length, setLength] = useState(packing?.length || '');
  const [width, setWidth] = useState(packing?.width || '');
  const [height, setHeight] = useState(packing?.height || '');
  const [quantity, setQuantity] = useState(packing?.quantity || '');
  const [weight, setWeight] = useState(packing?.weight || '');
  const [packingTypeId, setPackingTypeId] = useState(
    packing?.packing_type_id || '',
  );
  const [packingReliabilityTypeId, setPackingReliabilityTypeId] = useState(
    packing?.packing_reliability_type_id || '',
  );
  const [defaultImages, setDefaultImages] = useState(
    packing?.product_packing_images?.map((img) => ({
      id: img.id,
      url: img.image_url,
      name: img.image_name,
    })) || [],
  );
  useEffect(() => {
    setLength(packing?.length || '');
    setWidth(packing?.width || '');
    setHeight(packing?.height || '');
    setQuantity(packing?.quantity || '');
    setWeight(packing?.weight || '');
    setPackingTypeId(packing?.packing_type_id || '');
    setPackingReliabilityTypeId(packing?.packing_reliability_type_id || '');
    setDefaultImages(
      packing?.product_packing_images?.map((img) => ({
        id: img.id,
        url: img.image_url,
        name: img.image_name,
      })) || [],
    );
  }, [packing]);

  // handle packing type change
  const handleTypeChange = useCallback(
    (ov, nv) => {
      setPackingTypeId(nv);
      upsertProductPageData({
        product_packings: [
          {
            id: packing.id,
            product_id: pageData.id,
            packing_type_id: nv,
          },
        ],
      });
    },
    [packing, pageData.id, upsertProductPageData],
  );

  // handle packing reliability type change
  const handleReliabilityTypeChange = useCallback(
    (ov, nv) => {
      setPackingReliabilityTypeId(nv);
      upsertProductPageData({
        product_packings: [
          {
            id: packing.id,
            product_id: pageData.id,
            packing_reliability_type_id: nv,
          },
        ],
      });
    },
    [packing, pageData.id, upsertProductPageData],
  );

  // handle image change
  const handleImageChange = useCallback(
    (oldImages, newImages) => {
      if (newImages.length > oldImages.length) {
        // New image added
        const addedImages = newImages.filter(
          (img) => !oldImages.some((oldImg) => oldImg.id === img.id),
        );
        for (let i = 0; i < addedImages.length; i++) {
          upsertProductPageData({
            product_packings: [
              {
                id: packing.id,
                product_id: pageData.id,
                product_packing_images: [
                  {
                    id: addedImages[i].id,
                    image_name: addedImages[i].name,
                    image_url: addedImages[i].url,
                    base64_image: addedImages[i].base64,
                  },
                ],
              },
            ],
          });
        }
      } else if (newImages.length < oldImages.length) {
        // Image removed
        const removedImages = oldImages.filter(
          (img) => !newImages.some((newImg) => newImg.id === img.id),
        );
        for (let i = 0; i < removedImages.length; i++) {
          upsertProductPageData({
            product_packings: [
              {
                id: packing.id,
                product_id: pageData.id,
                product_packing_images: [
                  {
                    id: removedImages[i].id,
                    _delete: true,
                  },
                ],
              },
            ],
          });
        }
      }
    },
    [packing, pageData.id, upsertProductPageData],
  );

  // Convert numeric values to strings for display in text fields
  const getStringValue = (value) => {
    if (value === 0) return '0';
    return value !== undefined && value !== null ? String(value) : '';
  };

  return (
    <div className={styles.inputsContainer}>
      <SplitLayout position="L">
        <VerticalLayout>
          <div className={styles.topRow}>
            <div className={styles.packageTypeField}>
              <Main_Dropdown
                defaultOptions={packType}
                label="Package Type"
                defaultSelectedOption={packingTypeId || 1}
                onChange={handleTypeChange}
              />
            </div>
            <div className={styles.packageTypeField}>
              <Main_Dropdown
                defaultOptions={packingReliabilityType}
                label="Pack Reliability"
                defaultSelectedOption={packingReliabilityTypeId || ''}
                onChange={handleReliabilityTypeChange}
              />
            </div>
          </div>
          <VerticalLayout>
            <Main_TextField
              label="L: "
              labelPosition={'left'}
              className={styles.packingField}
              defaultValue={getStringValue(length)}
              onChange={(ov, nv) =>
                upsertProductPageData({
                  product_packings: [
                    {
                      id: packing?.id,
                      length: parseFloat(nv) || 0,
                    },
                  ],
                })
              }
            />
            <Main_TextField
              label="W: "
              labelPosition={'left'}
              className={styles.packingField}
              defaultValue={getStringValue(width)}
              onChange={(ov, nv) =>
                upsertProductPageData({
                  product_packings: [
                    {
                      id: packing?.id,
                      width: parseFloat(nv) || 0,
                    },
                  ],
                })
              }
            />
            <Main_TextField
              label="H: "
              labelPosition={'left'}
              className={styles.packingField}
              defaultValue={getStringValue(height)}
              onChange={(ov, nv) =>
                upsertProductPageData({
                  product_packings: [
                    {
                      id: packing?.id,
                      height: parseFloat(nv) || 0,
                    },
                  ],
                })
              }
            />
            <Main_TextField
              label="Qty: "
              labelPosition={'left'}
              className={styles.packingField}
              defaultValue={getStringValue(quantity)}
              onChange={(ov, nv) =>
                upsertProductPageData({
                  product_packings: [
                    {
                      id: packing?.id,
                      quantity: parseFloat(nv) || 0,
                    },
                  ],
                })
              }
            />
            <Main_TextField
              label="kg: "
              labelPosition={'left'}
              className={styles.packingField}
              defaultValue={getStringValue(weight)}
              onChange={(ov, nv) =>
                upsertProductPageData({
                  product_packings: [
                    {
                      id: packing?.id,
                      weight: parseFloat(nv) || 0,
                    },
                  ],
                })
              }
            />
          </VerticalLayout>
        </VerticalLayout>

        <div>
          <div className={styles.uploadColumn}>
            <Main_FileUploads
              mode="image"
              label="Images"
              onChange={handleImageChange}
              onError={() => {
                console.error('Error uploading packing image');
              }}
              maxFiles={10}
              multiple={false}
              defaultImages={defaultImages}
            />
          </div>
        </div>
      </SplitLayout>
    </div>
  );
};
export default Sub_PackRow;
