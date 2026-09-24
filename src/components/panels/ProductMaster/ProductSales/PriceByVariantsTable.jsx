import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
  selectExchangeRateRow,
  toNumberOrNull,
} from '../ProductCosts/productCostsUtils';
import {
  buildCurrencyCodeById,
  buildExchangeRateMap,
  buildNormalizedCurrencies,
} from '../../SalesQuotation/utils/quotationTotals';
import styles from './PriceByVariantsTable.module.css';

const PriceByVariantsTable = () => {
  const { fetchMasterData, currencies, exchangeRateHkd } = useMasterContext();

  const [masterColors, setMasterColors] = useState([]);
  const [masterSizes, setMasterSizes] = useState([]);
  const [masterCapacities, setMasterCapacities] = useState([]);
  const [rateDate, setRateDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [priceMessage, setPriceMessage] = useState('');

  const refreshMasters = useCallback(async () => {
    const [colors, sizes, capacities] = await Promise.all([
      fetchMasterData('master_color_types'),
      fetchMasterData('master_size_types'),
      fetchMasterData('master_capacity_types'),
    ]);

    setMasterColors(Array.isArray(colors) ? colors : []);
    setMasterSizes(Array.isArray(sizes) ? sizes : []);
    setMasterCapacities(Array.isArray(capacities) ? capacities : []);
  }, [fetchMasterData]);

  useEffect(() => {
    refreshMasters();
  }, [refreshMasters]);

  useEffect(() => {
    fetchMasterData('master_exchange_rate_hkd');
  }, [fetchMasterData]);

  const productId = useEntityField('products', 'id');
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

  const colorTypeMap = useMemo(
    () =>
      masterColors.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [masterColors],
  );
  const sizeTypeMap = useMemo(
    () =>
      masterSizes.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [masterSizes],
  );
  const capacityTypeMap = useMemo(
    () =>
      masterCapacities.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [masterCapacities],
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

  const normalizedCurrencies = useMemo(
    () => buildNormalizedCurrencies(currencies),
    [currencies],
  );

  const currencyCodeById = useMemo(
    () => buildCurrencyCodeById(normalizedCurrencies),
    [normalizedCurrencies],
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

  const colorOrderMap = useMemo(
    () =>
      masterColors.reduce((acc, item, index) => {
        acc[item.id] = index;
        return acc;
      }, {}),
    [masterColors],
  );
  const sizeOrderMap = useMemo(
    () =>
      masterSizes.reduce((acc, item, index) => {
        acc[item.id] = index;
        return acc;
      }, {}),
    [masterSizes],
  );
  const capacityOrderMap = useMemo(
    () =>
      masterCapacities.reduce((acc, item, index) => {
        acc[item.id] = index;
        return acc;
      }, {}),
    [masterCapacities],
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

          rows.push({
            id: found?.id || comboKey,
            comboKey,
            product_varient_color_id: colorVar?.id || null,
            product_varient_capacity_id: capacityVar?.id || null,
            product_varient_size_id: sizeVar?.id || null,
            colorLabel: colorVar ? getColorDisplayName(colorVar) : '-',
            capacityLabel: capacityVar
              ? getCapacityLabel(
                  capacityTypeMap[getVariantTypeId(capacityVar, 'capacity')],
                )
              : '-',
            sizeLabel: sizeVar
              ? sizeTypeMap[getVariantTypeId(sizeVar, 'size')]?.name
              : '-',
            unit_cost: found?.unit_cost ?? '',
            currency_id: found?.currency_id ?? '',
            sales_price: found?.sales_price ?? '',
            sales_currency_id: found?.sales_currency_id ?? '',
            sales_multiplier: found?.sales_multiplier ?? '',
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

  const handleSalesFieldChange = useCallback(
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

      upsertEntityData('products', {
        product_costs: [
          {
            id: targetId,
            product_id: productId,
            product_varient_size_id: row.product_varient_size_id,
            product_varient_color_id: row.product_varient_color_id,
            product_varient_capacity_id: row.product_varient_capacity_id,
            sales_price:
              field === 'sales_price'
                ? value
                : (existing?.sales_price ?? row.sales_price ?? ''),
            sales_currency_id:
              field === 'sales_currency_id'
                ? value
                : (existing?.sales_currency_id ?? row.sales_currency_id ?? ''),
            currency_id: existing?.currency_id ?? row.currency_id ?? '',
            unit_cost: existing?.unit_cost ?? row.unit_cost ?? '',
            sales_multiplier:
              field === 'sales_multiplier'
                ? value
                : (existing?.sales_multiplier ?? row.sales_multiplier ?? ''),
          },
        ],
      });
    },
    [productCosts, upsertEntityData, productId],
  );

  const handleGetSalesPrice = useCallback(() => {
    const rateRow = selectExchangeRateRow(exchangeRateHkd, rateDate);
    const rateMap = buildExchangeRateMap(rateRow || {});

    const updates = [];
    const skipped = [];

    (gridRows || []).forEach((row) => {
      const costCode = (currencyCodeById[row.currency_id] || '').toUpperCase();
      const salesCode = (
        currencyCodeById[row.sales_currency_id] || ''
      ).toUpperCase();
      const unitCost = toNumberOrNull(row.unit_cost);
      const multiplier = toNumberOrNull(row.sales_multiplier);

      if (!costCode || !salesCode || unitCost === null || multiplier === null) {
        skipped.push(row);
        return;
      }

      const sourceRate = Number(rateMap[costCode]);
      const targetRate = Number(rateMap[salesCode]);
      if (
        !Number.isFinite(sourceRate) ||
        sourceRate <= 0 ||
        !Number.isFinite(targetRate) ||
        targetRate <= 0
      ) {
        skipped.push(row);
        return;
      }

      const convertedCost = (unitCost / sourceRate) * targetRate;
      const salesPrice = Number((convertedCost * multiplier).toFixed(3));

      const existing = productCosts.find((cost) => {
        return (
          cost.product_varient_color_id === row.product_varient_color_id &&
          cost.product_varient_capacity_id ===
            row.product_varient_capacity_id &&
          cost.product_varient_size_id === row.product_varient_size_id
        );
      });

      updates.push({
        id: existing?.id || uuidv4(),
        product_id: productId,
        product_varient_size_id: row.product_varient_size_id,
        product_varient_color_id: row.product_varient_color_id,
        product_varient_capacity_id: row.product_varient_capacity_id,
        currency_id: existing?.currency_id ?? row.currency_id ?? '',
        unit_cost: existing?.unit_cost ?? row.unit_cost ?? '',
        sales_currency_id: row.sales_currency_id ?? '',
        sales_multiplier: row.sales_multiplier ?? '',
        sales_price: salesPrice,
      });
    });

    if (updates.length > 0) {
      upsertEntityData('products', { product_costs: updates });
    }

    setPriceMessage(
      skipped.length > 0
        ? `${updates.length} updated, ${skipped.length} skipped (missing cost/currency/rate)`
        : `${updates.length} sales price(s) calculated`,
    );
  }, [
    gridRows,
    productCosts,
    exchangeRateHkd,
    rateDate,
    currencyCodeById,
    productId,
    upsertEntityData,
  ]);

  const rateDisplay = useMemo(() => {
    const rateRow = selectExchangeRateRow(exchangeRateHkd, rateDate);
    const rateMap = buildExchangeRateMap(rateRow || {});

    const pairs = [];
    (gridRows || []).forEach((row) => {
      const costCode = (currencyCodeById[row.currency_id] || '').toUpperCase();
      const salesCode = (
        currencyCodeById[row.sales_currency_id] || ''
      ).toUpperCase();
      if (!costCode || !salesCode) return;
      if (
        !pairs.some(
          (p) => p.costCode === costCode && p.salesCode === salesCode,
        )
      ) {
        pairs.push({ costCode, salesCode });
      }
    });

    if (pairs.length === 0) return '';

    return pairs
      .map(({ costCode, salesCode }) => {
        const costRate = Number(rateMap[costCode]);
        const salesRate = Number(rateMap[salesCode]);
        if (
          !Number.isFinite(costRate) ||
          costRate <= 0 ||
          !Number.isFinite(salesRate) ||
          salesRate <= 0
        ) {
          return `${costCode}/${salesCode} n/a`;
        }
        return `${costCode}/${salesCode} ${(costRate / salesRate).toFixed(4)}`;
      })
      .join(' | ');
  }, [gridRows, currencyCodeById, exchangeRateHkd, rateDate]);

  // Main_EditableTables emits row *keys* from fill drags, so map them back to
  // rows to reuse the existing handleSalesFieldChange(row, field, value) callback.
  const rowByKey = useMemo(() => {
    const map = new Map();
    (gridRows || []).forEach((row) => map.set(String(row.id), row));
    return map;
  }, [gridRows]);

  const handleCellChange = useCallback(
    (rowKey, columnKey, value) => {
      const row = rowByKey.get(String(rowKey));
      if (row) handleSalesFieldChange(row, columnKey, value);
    },
    [rowByKey, handleSalesFieldChange],
  );

  const columns = useMemo(
    () => [
      {
        key: 'color',
        label: 'Color',
        fillable: false,
        getSortValue: (row) => row.colorLabel || '',
        renderCell: (row) => row.colorLabel || '-',
      },
      {
        key: 'capacity',
        label: 'Capacity',
        fillable: false,
        getSortValue: (row) => row.capacityLabel || '',
        renderCell: (row) => row.capacityLabel || '-',
      },
      {
        key: 'size',
        label: 'Size',
        fillable: false,
        getSortValue: (row) => row.sizeLabel || '',
        renderCell: (row) => row.sizeLabel || '-',
      },
      {
        key: 'sales_currency_id',
        label: 'Sales Currency',
        fillField: 'sales_currency_id',
        getSortValue: (row) => currencyLabelMap[row.sales_currency_id] || '',
        renderCell: (row) => (
          <select
            className={styles.cellInput}
            value={row.sales_currency_id || ''}
            onChange={(e) =>
              handleSalesFieldChange(row, 'sales_currency_id', e.target.value)
            }
          >
            <option value="">Select currency</option>
            {(currencies || []).map((currency) => (
              <option key={currency.id} value={currency.id}>
                {currency?.code || currency?.name || currency?.id}
              </option>
            ))}
          </select>
        ),
      },
      {
        key: 'sales_multiplier',
        label: 'Multiple',
        fillField: 'sales_multiplier',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.sales_multiplier}
            onChange={(e) =>
              handleSalesFieldChange(row, 'sales_multiplier', e.target.value)
            }
            placeholder="1.00"
          />
        ),
      },
      {
        key: 'sales_price',
        label: 'Sales Price',
        fillField: 'sales_price',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.sales_price}
            onChange={(e) =>
              handleSalesFieldChange(row, 'sales_price', e.target.value)
            }
            placeholder="Enter value"
          />
        ),
      },
    ],
    [currencyLabelMap, currencies, handleSalesFieldChange],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        {priceMessage ? (
          <span className={styles.message}>{priceMessage}</span>
        ) : null}
        <input
          type="date"
          className={styles.dateInput}
          value={rateDate}
          onChange={(e) => setRateDate(e.target.value)}
        />
        <button
          type="button"
          className={styles.getPriceBtn}
          onClick={handleGetSalesPrice}
        >
          Get Sales Price
        </button>
        <span
          className={styles.rateDisplay}
          title="Cost currency / Sales currency"
        >
          {rateDisplay ? `Rate: ${rateDisplay}` : 'Rate: \u2014'}
        </span>
      </div>
      <Main_EditableTables
        rows={gridRows}
        columns={columns}
        rowKey="id"
        emptyMessage="Select at least one variant (Color / Capacity / Size)."
        onCellChange={handleCellChange}
      />
    </div>
  );
};

export default PriceByVariantsTable;
