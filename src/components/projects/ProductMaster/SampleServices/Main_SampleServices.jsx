import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_Dropdown from '../../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_RadioGroup from '../../../common/InputOptions/RadioGroup/Main_RadioGroup';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useProductContext } from '../../../../store/ProductContext';
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
  const { pageData, upsertProductPageData } = useProductContext();
  const { currencies, colorType, sizeType, capacityType } = useMasterContext();

  const productId = pageData?.id || null;

  const variantColors = useMemo(
    () => (pageData?.product_varient_colors || []).filter((r) => !r?._delete),
    [pageData?.product_varient_colors],
  );
  const variantSizes = useMemo(
    () => (pageData?.product_varient_sizes || []).filter((r) => !r?._delete),
    [pageData?.product_varient_sizes],
  );
  const variantCapacities = useMemo(
    () =>
      (pageData?.product_varient_capacities || []).filter((r) => !r?._delete),
    [pageData?.product_varient_capacities],
  );
  const productCosts = useMemo(
    () => (pageData?.product_costs || []).filter((r) => !r?._delete),
    [pageData?.product_costs],
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
        cost.product_varient_color_id,
        cost.product_varient_capacity_id,
        cost.product_varient_size_id,
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
          const comboKey = getCostComboKey(
            colorVar?.id,
            capacityVar?.id,
            sizeVar?.id,
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
            product_varient_color_id: colorVar?.id || null,
            product_varient_capacity_id: capacityVar?.id || null,
            product_varient_size_id: sizeVar?.id || null,
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
          cost.product_varient_color_id === row.product_varient_color_id &&
          cost.product_varient_capacity_id ===
            row.product_varient_capacity_id &&
          cost.product_varient_size_id === row.product_varient_size_id
        );
      });

      const targetId = existing?.id || uuidv4();

      upsertProductPageData({
        product_costs: [
          {
            id: targetId,
            product_id: productId,
            product_varient_color_id: row.product_varient_color_id,
            product_varient_capacity_id: row.product_varient_capacity_id,
            product_varient_size_id: row.product_varient_size_id,
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
    [productCosts, upsertProductPageData, productId],
  );

  const columns = useMemo(
    () => [
      {
        key: 'variant',
        label: 'Color-Capacity-Size',
        sortType: 'string',
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
        sortType: 'string',
        getSortValue: (row) => currencyLabelMap[row.sample_currency_id] || '',
        fillField: 'sample_currency_id',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
            <Main_Dropdown
              size="100%"
              defaultOptions={currencyOptions}
              defaultSelectedOption={row.sample_currency_id || ''}
              onChange={(ov, nv) =>
                handleSampleFieldChange(row, 'sample_currency_id', nv)
              }
            />,
            'sample_currency_id',
            rowIndex,
            row.sample_currency_id || '',
          ),
      },
      {
        key: 'sample_price',
        label: 'Sample Price',
        sortType: 'number',
        fillField: 'sample_price',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
            <Main_TextField
              type="number"
              defaultValue={String(row.sample_price ?? '')}
              placeholder="0.00"
              onChange={(ov, nv) =>
                handleSampleFieldChange(row, 'sample_price', nv)
              }
            />,
            'sample_price',
            rowIndex,
            row.sample_price ?? '',
          ),
      },
    ],
    [currencyOptions, currencyLabelMap, handleSampleFieldChange],
  );

  const supported = !!pageData?.sampling_service_available;

  return (
    <Main_InputContainer label="Sample Service">
      <div className={styles.container}>
        <Main_RadioGroup
          options={[
            { value: true, label: 'Supported' },
            { value: false, label: 'Not Supported' },
          ]}
          value={supported}
          onChange={(v) =>
            upsertProductPageData({ sampling_service_available: v })
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
                defaultValue={String(pageData?.max_qty_sample ?? '')}
                placeholder="1"
                onChange={(ov, nv) =>
                  upsertProductPageData({
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

            <EditableDataTable
              rows={gridRows}
              columns={columns}
              rowKey="id"
              emptyMessage="Select at least one variant (Color / Capacity / Size) to configure sample prices."
              onFillCellChange={(row, field, value) =>
                handleSampleFieldChange(row, field, value)
              }
            />
          </>
        )}
      </div>
    </Main_InputContainer>
  );
};

export default Main_SampleServices;
