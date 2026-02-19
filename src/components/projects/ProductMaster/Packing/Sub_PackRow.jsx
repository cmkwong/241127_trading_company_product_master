import { useState, useCallback, useMemo } from 'react';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField.jsx';
import styles from './Sub_PackRow.module.css';
import { useProductContext } from '../../../../store/ProductContext.jsx';
import { useMasterContext } from '../../../../store/MasterContext.jsx';

const Sub_PackRow = ({ packings, rowindex }) => {
  // Get the current row data or use template data if it doesn't exist
  const packing = packings[rowindex];
  console.log('Rendering Sub_PackRow with packing data: ', packing);

  const { pageData, upsertProductPageData } = useProductContext();
  const { packType } = useMasterContext();

  const [length, setLength] = useState(packing?.length || '');
  const [width, setWidth] = useState(packing?.width || '');
  const [height, setHeight] = useState(packing?.height || '');
  const [quantity, setQuantity] = useState(packing?.quantity || '');
  const [weight, setWeight] = useState(packing?.weight || '');
  const [packingTypeId, setPackingTypeId] = useState(
    packing?.packing_type_id || '',
  );

  useMemo(() => {
    setLength(packing?.length || '');
    setWidth(packing?.width || '');
    setHeight(packing?.height || '');
    setQuantity(packing?.quantity || '');
    setWeight(packing?.weight || '');
    setPackingTypeId(packing?.packing_type_id || '');
  }, [packing]);

  // handle packing type change
  const handleTypeChange = useCallback(
    (ov, nv) => {
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

  // Convert numeric values to strings for display in text fields
  const getStringValue = (value) => {
    if (value === 0) return '0';
    return value !== undefined && value !== null ? String(value) : '';
  };

  return (
    <div className={styles.inputsContainer}>
      <Main_TextField
        placeholder="L"
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
        placeholder="W"
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
        placeholder="H"
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
        placeholder="Qty"
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
        placeholder="kg"
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
      <Main_Dropdown
        defaultOptions={packType}
        label="Package Type"
        defaultSelectedOption={packing?.packing_type_id || 1}
        onChange={handleTypeChange}
      />
    </div>
  );
};
export default Sub_PackRow;
