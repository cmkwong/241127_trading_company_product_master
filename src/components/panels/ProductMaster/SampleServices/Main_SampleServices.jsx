import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_RadioGroup from '../../../common/InputOptions/RadioGroup/Main_RadioGroup';
import Main_EditableTables from '../../../common/Tables/Main_EditableTables';
import {
  upsertEntityData,
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import {
  getVariantTypeId,
  getCapacityLabel,
  getCostComboKey,
} from '../ProductCosts/productCostsUtils';
import styles from './Main_SampleServices.module.css';

const SWATCH_PALETTE = [
  '#3b82f6',
  '#0c1e36',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
  '#64748b',
];

const getColorSwatch = (name) => {
  const text = String(name || '').trim();
  if (!text) return '#e2e8f0';

  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }

  return SWATCH_PALETTE[hash % SWATCH_PALETTE.length];
};

const Main_SampleServices = () => {
  const { currencies, colorType, sizeType, capacityType } = useMasterContext();

  const productId = useEntityField('products', 'id');
  const supported = !!useEntityField('products', 'sampling_service_available');
  const maxQtySample = useEntityField('products', 'max_qty_sample');
  const variantColorsAll = useEntityRows('products', 'product_varient_colors');
  const variantSizesAll = useEntityRows('products', 'product_varient_sizes');
  const variantCapacitiesAll = useEntityRows(
    'products',
    'product_varient_capacities',
  );
  const productCostsAll = useEntityRows('products', 'product_costs');

  const variantColors = useMemo(
    () => (variantColorsAll || []).filter((r) => !r?._delete),
    [variantColorsAll],
  );
  const variantSizes = useMemo(
    () => (variantSizesAll || []).filter((r) => !r?._delete),
    [variantSizesAll],
  );
  const variantCapacities = useMemo(
    () => (variantCapacitiesAll || []).filter((r) => !r?._delete),
    [variantCapacitiesAll],
  );
  const productCosts = useMemo(
    () => (productCostsAll || []).filter((r) => !r?._delete),
    [productCostsAll],
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

  const colorTypeMap = useMemo(
    () =>
      (colorType || []).reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [colorType],
  );
  const sizeTypeMap = useMemo(
    () =>
      (sizeType || []).reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [sizeType],
  );
  const capacityTypeMap = useMemo(
    () =>
      (capacityType || []).reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [capacityType],
  );

  const colorOrderMap = useMemo(
    () =>
      (colorType || []).reduce((acc, item, index) => {
        acc[item.id] = index;
        return acc;
      }, {}),
    [colorType],
  );
  const sizeOrderMap = useMemo(
    () =>
      (sizeType || []).reduce((acc, item, index) => {
        acc[item.id] = index;
        return acc;
      }, {}),
    [sizeType],
  );
  const capacityOrderMap = useMemo(
    () =>
      (capacityType || []).reduce((acc, item, index) => {
        acc[item.id] = index;
        return acc;
      }, {}),
    [capacityType],
  );

  const getColorDisplayName = useCallback(
    (variantRow) => {
      const typeId = getVariantTypeId(variantRow, 'color');
      return (
        colorTypeMap[typeId]?.name ||
        variantRow?.color_name ||
        variantRow?.name ||
        ''
      );
    },
    [colorTypeMap],
  );

  const selectedColorVariants = useMemo(
    () =>
      [...variantColors]
        .filter((row) => !!getVariantTypeId(row, 'color'))
        .sort((a, b) => {
          const aId = getVariantTypeId(a, 'color');
          const bId = getVariantTypeId(b, 'color');
          return (
            (colorOrderMap[aId] ?? Number.MAX_SAFE_INTEGER) -
            (colorOrderMap[bId] ?? Number.MAX_SAFE_INTEGER)
          );
        }),
    [variantColors, colorOrderMap],
  );
  const selectedCapacityVariants = useMemo(
    () =>
      [...variantCapacities]
        .filter((row) => !!getVariantTypeId(row, 'capacity'))
        .sort((a, b) => {
          const aId = getVariantTypeId(a, 'capacity');
          const bId = getVariantTypeId(b, 'capacity');
          return (
            (capacityOrderMap[aId] ?? Number.MAX_SAFE_INTEGER) -
            (capacityOrderMap[bId] ?? Number.MAX_SAFE_INTEGER)
          );
        }),
    [variantCapacities, capacityOrderMap],
  );
  const selectedSizeVariants = useMemo(
    () =>
      [...variantSizes]
        .filter((row) => !!getVariantTypeId(row, 'size'))
        .sort((a, b) => {
          const aId = getVariantTypeId(a, 'size');
          const bId = getVariantTypeId(b, 'size');
          return (
            (sizeOrderMap[aId] ?? Number.MAX_SAFE_INTEGER) -
            (sizeOrderMap[bId] ?? Number.MAX_SAFE_INTEGER)
          );
        }),
    [variantSizes, sizeOrderMap],
  );

  const costMapByCombo = useMemo(() => {
    const map = new Map();
    productCosts.forEach((cost) => {
      const key = getCostComboKey(
        cost.color_type_id,
        cost.capacity_type_id,
        cost.size_type_id,
      );
      map.set(key, cost);
    });
    return map;
  }, [productCosts]);

  const gridRows = useMemo(() => {
    const hasAnySelection =
      selectedColorVariants.length > 0 ||
      selectedCapacityVariants.length > 0 ||
      selectedSizeVariants.length > 0;

    if (!hasAnySelection) {
      return [];
    }

    const colorAxis =
      selectedColorVariants.length > 0 ? selectedColorVariants : [null];
    const capacityAxis =
      selectedCapacityVariants.length > 0 ? selectedCapacityVariants : [null];
    const sizeAxis =
      selectedSizeVariants.length > 0 ? selectedSizeVariants : [null];

    const rows = [];

    colorAxis.forEach((colorVar) => {
      capacityAxis.forEach((capacityVar) => {
        sizeAxis.forEach((sizeVar) => {
          const colorTypeId = colorVar
            ? getVariantTypeId(colorVar, 'color')
            : null;
          const capacityTypeId = capacityVar
            ? getVariantTypeId(capacityVar, 'capacity')
            : null;
          const sizeTypeId = sizeVar ? getVariantTypeId(sizeVar, 'size') : null;

          const comboKey = getCostComboKey(
            colorTypeId,
            capacityTypeId,
            sizeTypeId,
          );
          const found = costMapByCombo.get(comboKey);

          const colorName = colorVar ? getColorDisplayName(colorVar) : '';
          const capacityLabel = capacityVar
            ? getCapacityLabel(
                capacityTypeMap[getVariantTypeId(capacityVar, 'capacity')],
              )
            : '';
          const sizeLabel = sizeVar
            ? sizeTypeMap[getVariantTypeId(sizeVar, 'size')]?.name
            : '';

          const variantLabel = [colorName, capacityLabel, sizeLabel]
            .filter(Boolean)
            .join(' - ');

          rows.push({
            id: found?.id || comboKey,
            comboKey,
            color_type_id: colorTypeId,
            capacity_type_id: capacityTypeId,
            size_type_id: sizeTypeId,
            variantLabel: variantLabel || '-',
            swatchColor: getColorSwatch(colorName),
            sample_currency_id: found?.sample_currency_id ?? '',
            sample_price: found?.sample_price ?? '',
          });
        });
      });
    });

    return rows;
  }, [
    selectedColorVariants,
    selectedCapacityVariants,
    selectedSizeVariants,
    costMapByCombo,
    getColorDisplayName,
    capacityTypeMap,
    sizeTypeMap,
  ]);

  const handleSampleFieldChange = useCallback(
    (row, field, value) => {
      const existing = productCosts.find((cost) => {
        return (
          cost.color_type_id === row.color_type_id &&
          cost.capacity_type_id === row.capacity_type_id &&
          cost.size_type_id === row.size_type_id
        );
      });

      const targetId = existing?.id || uuidv4();

      upsertEntityData('products', {
        product_costs: [
          {
            id: targetId,
            product_id: productId,
            color_type_id: row.color_type_id,
            capacity_type_id: row.capacity_type_id,
            size_type_id: row.size_type_id,
            sample_currency_id:
              field === 'sample_currency_id'
                ? value
                : (existing?.sample_currency_id ??
                  row.sample_currency_id ??
                  ''),
            sample_price:
              field === 'sample_price'
                ? value
                : (existing?.sample_price ?? row.sample_price ?? ''),
          },
        ],
      });
    },
    [productCosts, upsertEntityData, productId],
  );

  // Main_EditableTables emits row *keys* from fill drags, so map them back to
  // rows to reuse the existing handleSampleFieldChange(row, field, value) callback.
  const rowByKey = useMemo(() => {
    const map = new Map();
    (gridRows || []).forEach((row) => map.set(String(row.id), row));
    return map;
  }, [gridRows]);

  const handleCellChange = useCallback(
    (rowKey, columnKey, value) => {
      const row = rowByKey.get(String(rowKey));
      if (row) handleSampleFieldChange(row, columnKey, value);
    },
    [rowByKey, handleSampleFieldChange],
  );

  const columns = useMemo(
    () => [
      {
        key: 'variant',
        label: 'Color-Capacity-Size',
        width: '300px',
        fillable: false,
        getSortValue: (row) => row.variantLabel || '',
        renderCell: (row) => (
          <div className={styles.variantCell}>
            <span
              className={styles.swatch}
              style={{ backgroundColor: row.swatchColor }}
            />
            <span className={styles.variantLabel}>{row.variantLabel}</span>
          </div>
        ),
      },
      {
        key: 'sample_currency_id',
        label: 'Currency',
        width: '200px',
        fillField: 'sample_currency_id',
        getSortValue: (row) => currencyLabelMap[row.sample_currency_id] || '',
        renderCell: (row) => (
          <Main_Dropdown
            size="100%"
            defaultOptions={currencyOptions}
            defaultSelectedOption={row.sample_currency_id || ''}
            onChange={(ov, nv) =>
              handleSampleFieldChange(row, 'sample_currency_id', nv)
            }
          />
        ),
      },
      {
        key: 'sample_price',
        label: 'Sample Price',
        width: '200px',
        fillField: 'sample_price',
        renderCell: (row) => (
          <Main_TextField
            type="number"
            defaultValue={String(row.sample_price ?? '')}
            placeholder="0.00"
            onChange={(ov, nv) =>
              handleSampleFieldChange(row, 'sample_price', nv)
            }
          />
        ),
      },
    ],
    [currencyOptions, currencyLabelMap, handleSampleFieldChange],
  );

  return (
    <Main_InputContainer label="Sample Services">
      <div className={styles.container}>
        <Main_RadioGroup
          options={[
            { value: true, label: 'Supported' },
            { value: false, label: 'Not Supported' },
          ]}
          value={supported}
          onChange={(v) =>
            upsertEntityData('products', { sampling_service_available: v })
          }
          ariaLabel="Sample service availability"
          variant="segment"
          size="100%"
        />

        <p className={styles.infoText}>
          Products and samples share the same logistics. Set up shipping
          templates first, then configure sample services. (Samples charged per
          piece)
        </p>

        {supported && (
          <div className={styles.qtyBlock}>
            <p className={styles.requiredLabel}>* Max Sample Qty per Order</p>
            <div className={styles.qtyInputRow}>
              <Main_TextField
                type="number"
                defaultValue={String(maxQtySample ?? '')}
                placeholder="1"
                onChange={(ov, nv) =>
                  upsertEntityData('products', {
                    max_qty_sample: Number(nv) || 0,
                  })
                }
              />
              <span className={styles.qtySuffix}>Piece/Pieces</span>
            </div>
            <p className={styles.qtyHelper}>
              Maximum samples a buyer can purchase per order. Cannot be changed.
              Recommended to set at minimum order quantity.
            </p>
          </div>
        )}

        {supported && (
          <>
            <p className={styles.sectionTitle}>Sample Price</p>

            <Main_EditableTables
              rows={gridRows}
              columns={columns}
              rowKey="id"
              emptyMessage="Select at least one variant (Color / Capacity / Size) to configure sample prices."
              onCellChange={handleCellChange}
            />
          </>
        )}
      </div>
    </Main_InputContainer>
  );
};

export default Main_SampleServices;
