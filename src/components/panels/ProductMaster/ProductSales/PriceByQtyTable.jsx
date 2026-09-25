import { useMemo, useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_EditableTables from '../../../common/Tables/Main_EditableTables';
import {
  upsertEntityData,
  useEntityRows,
  useEntityField,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import {
  buildCurrencyCodeById,
  buildExchangeRateMap,
  buildNormalizedCurrencies,
} from '../../SalesQuotation/utils/quotationTotals';
import {
  selectExchangeRateRow,
  toNumberOrNull,
} from '../ProductCosts/productCostsUtils';
import styles from './PriceByQtyTable.module.css';

const MAX_TIERS = 4;
const DEFAULT_UNIT_LABEL = 'Pcs';

const PriceByQtyTable = () => {
  const { currencies, sellingUnitType, fetchMasterData, exchangeRateHkd } =
    useMasterContext();

  const productId = useEntityField('products', 'id');
  const sellingUnitTypeId = useEntityField('products', 'selling_unit_type_id');
  const allTiers = useEntityRows('products', 'product_sale_prices_by_qty');
  const productCostsAll = useEntityRows('products', 'product_costs');

  const rows = useMemo(
    () => (allTiers || []).filter((r) => !r?._delete),
    [allTiers],
  );

  const productCosts = useMemo(
    () => (productCostsAll || []).filter((r) => !r?._delete),
    [productCostsAll],
  );

  const [rateDate, setRateDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [costCurrencyId, setCostCurrencyId] = useState('');
  const [costCurrencyTouched, setCostCurrencyTouched] = useState(false);
  const [costValue, setCostValue] = useState('');
  const [costTouched, setCostTouched] = useState(false);
  const [maxMultiplier, setMaxMultiplier] = useState('');
  const [minMultiplier, setMinMultiplier] = useState('');
  const [priceMessage, setPriceMessage] = useState('');

  useEffect(() => {
    fetchMasterData('master_exchange_rate_hkd');
  }, [fetchMasterData]);

  const normalizedCurrencies = useMemo(
    () => buildNormalizedCurrencies(currencies),
    [currencies],
  );

  const currencyCodeById = useMemo(
    () => buildCurrencyCodeById(normalizedCurrencies),
    [normalizedCurrencies],
  );

  const defaultCostCurrencyId = useMemo(() => {
    const list = currencies || [];
    const cny = list.find((currency) => {
      const code = String(currency?.code || '').toUpperCase();
      return code === 'CNY' || code === 'RMB';
    });
    return cny?.id || list[0]?.id || '';
  }, [currencies]);

  useEffect(() => {
    if (!costCurrencyTouched && defaultCostCurrencyId) {
      setCostCurrencyId(defaultCostCurrencyId);
    }
  }, [costCurrencyTouched, defaultCostCurrencyId]);

  const defaultCost = useMemo(() => {
    const values = productCosts
      .map((cost) => toNumberOrNull(cost?.unit_cost))
      .filter((value) => value !== null);
    return values.length > 0 ? Math.max(...values) : '';
  }, [productCosts]);

  useEffect(() => {
    if (!costTouched && defaultCost !== '') {
      setCostValue(String(defaultCost));
    }
  }, [costTouched, defaultCost]);

  const currencyLabelMap = useMemo(
    () =>
      (currencies || []).reduce((acc, currency) => {
        acc[currency.id] =
          currency?.code || currency?.name || currency?.label || currency?.id;
        return acc;
      }, {}),
    [currencies],
  );

  const unitLabel = useMemo(() => {
    const selected = (sellingUnitType || []).find(
      (unit) => unit?.id === sellingUnitTypeId,
    );
    return selected?.name || DEFAULT_UNIT_LABEL;
  }, [sellingUnitType, sellingUnitTypeId]);

  const previewTiers = useMemo(() => {
    return [...rows]
      .filter((row) => Number(row?.min_order_qty) > 0)
      .sort((a, b) => Number(a.min_order_qty) - Number(b.min_order_qty));
  }, [rows]);

  const previewRows = useMemo(() => {
    return previewTiers.map((tier, index) => {
      const min = Number(tier.min_order_qty);
      const isLast = index === previewTiers.length - 1;
      const nextMin = isLast
        ? null
        : Number(previewTiers[index + 1].min_order_qty);

      const rangeLabel = isLast ? `≥ ${min}` : `${min} ~ ${nextMin - 1}`;

      const currencyCode = currencyLabelMap[tier.currency_id] || '';
      const price = tier?.sale_price ?? '';
      const priceLabel =
        currencyCode || price ? `${currencyCode} ${price}`.trim() : '—';

      return { id: tier.id, rangeLabel, priceLabel };
    });
  }, [previewTiers, currencyLabelMap]);

  const rateDisplay = useMemo(() => {
    const costCode = (currencyCodeById[costCurrencyId] || '').toUpperCase();
    if (!costCode) return '';

    const rateRow = selectExchangeRateRow(exchangeRateHkd, rateDate);
    const rateMap = buildExchangeRateMap(rateRow || {});
    const costRate = Number(rateMap[costCode]);
    if (!Number.isFinite(costRate) || costRate <= 0) return '';

    const salesCodes = [];
    previewTiers.forEach((tier) => {
      const code = (currencyCodeById[tier.currency_id] || '').toUpperCase();
      if (code && !salesCodes.includes(code)) salesCodes.push(code);
    });

    if (salesCodes.length === 0) return '';

    return salesCodes
      .map((salesCode) => {
        const salesRate = Number(rateMap[salesCode]);
        if (!Number.isFinite(salesRate) || salesRate <= 0) {
          return `${costCode}/${salesCode} n/a`;
        }
        return `${costCode}/${salesCode} ${(costRate / salesRate).toFixed(4)}`;
      })
      .join(' | ');
  }, [
    currencyCodeById,
    costCurrencyId,
    exchangeRateHkd,
    rateDate,
    previewTiers,
  ]);

  const handleFieldChange = useCallback(
    (row, field, value) => {
      upsertEntityData('products', {
        product_sale_prices_by_qty: [
          {
            id: row?.id || uuidv4(),
            product_id: productId,
            min_order_qty:
              field === 'min_order_qty'
                ? Number(value) || 0
                : (row?.min_order_qty ?? 0),
            currency_id:
              field === 'currency_id' ? value : (row?.currency_id ?? ''),
            sale_price:
              field === 'sale_price' ? value : (row?.sale_price ?? ''),
            sales_multiplier:
              field === 'sales_multiplier'
                ? value
                : (row?.sales_multiplier ?? ''),
          },
        ],
      });
    },
    [upsertEntityData, productId],
  );

  // Main_EditableTables emits row *keys* from fill drags, so map them back to
  // rows to reuse the existing handleFieldChange(row, field, value) callback.
  const rowByKey = useMemo(() => {
    const map = new Map();
    (rows || []).forEach((row) => map.set(String(row.id), row));
    return map;
  }, [rows]);

  const handleCellChange = useCallback(
    (rowKey, columnKey, value) => {
      const row = rowByKey.get(String(rowKey));
      if (row) handleFieldChange(row, columnKey, value);
    },
    [rowByKey, handleFieldChange],
  );

  const handleDelete = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertEntityData('products', {
        product_sale_prices_by_qty: [{ id: row.id, _delete: true }],
      });
    },
    [upsertEntityData],
  );

  const handleAddTier = useCallback(() => {
    if (rows.length >= MAX_TIERS) return;
    upsertEntityData('products', {
      product_sale_prices_by_qty: [
        {
          id: uuidv4(),
          product_id: productId,
          min_order_qty: 10,
          currency_id: '',
          sale_price: '',
        },
      ],
    });
  }, [rows.length, upsertEntityData, productId]);

  const handleGetSalesPrice = useCallback(() => {
    if (previewTiers.length === 0) {
      setPriceMessage('Add at least one price tier first');
      return;
    }

    const cost = toNumberOrNull(costValue);
    const maxMul = toNumberOrNull(maxMultiplier);
    const minMul = toNumberOrNull(minMultiplier);

    if (cost === null || maxMul === null || minMul === null) {
      setPriceMessage('Enter cost, max multiplier and min multiplier');
      return;
    }

    const costCode = (currencyCodeById[costCurrencyId] || '').toUpperCase();
    if (!costCode) {
      setPriceMessage('Select a cost currency');
      return;
    }

    const rateRow = selectExchangeRateRow(exchangeRateHkd, rateDate);
    const rateMap = buildExchangeRateMap(rateRow || {});
    const costRate = Number(rateMap[costCode]);
    if (!Number.isFinite(costRate) || costRate <= 0) {
      setPriceMessage(`No exchange rate for ${costCode}`);
      return;
    }

    const step =
      previewTiers.length > 1
        ? (maxMul - minMul) / (previewTiers.length - 1)
        : 0;

    const updates = [];
    const skipped = [];

    previewTiers.forEach((tier, index) => {
      const multiplier = maxMul - index * step;
      const tierCode = (
        currencyCodeById[tier.currency_id] || costCode
      ).toUpperCase();
      const tierRate = Number(rateMap[tierCode]);

      if (!Number.isFinite(tierRate) || tierRate <= 0) {
        skipped.push(tier);
        return;
      }

      const conversion = tierRate / costRate;
      const salePrice = Number((cost * multiplier * conversion).toFixed(3));

      updates.push({
        id: tier.id || uuidv4(),
        product_id: productId,
        min_order_qty: tier.min_order_qty ?? 0,
        currency_id: tier.currency_id ?? '',
        sales_multiplier: Number(multiplier.toFixed(3)),
        sale_price: salePrice,
      });
    });

    if (updates.length > 0) {
      upsertEntityData('products', { product_sale_prices_by_qty: updates });
    }

    setPriceMessage(
      skipped.length > 0
        ? `${updates.length} updated, ${skipped.length} skipped (missing currency/rate)`
        : `${updates.length} sales price(s) calculated`,
    );
  }, [
    previewTiers,
    costValue,
    maxMultiplier,
    minMultiplier,
    exchangeRateHkd,
    rateDate,
    currencyCodeById,
    costCurrencyId,
    productId,
    upsertEntityData,
  ]);

  const columns = useMemo(
    () => [
      {
        key: 'min_order_qty',
        label: '* Min Order Qty',
        fillField: 'min_order_qty',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            type="number"
            value={row.min_order_qty ?? ''}
            onChange={(e) =>
              handleFieldChange(row, 'min_order_qty', e.target.value)
            }
            placeholder="0"
          />
        ),
      },
      {
        key: 'currency_id',
        label: 'Currency',
        fillField: 'currency_id',
        getSortValue: (row) => currencyLabelMap[row.currency_id] || '',
        renderCell: (row) => (
          <select
            className={styles.cellInput}
            value={row.currency_id || ''}
            onChange={(e) =>
              handleFieldChange(row, 'currency_id', e.target.value)
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
        label: 'Multiplier',
        fillField: 'sales_multiplier',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.sales_multiplier ?? ''}
            onChange={(e) =>
              handleFieldChange(row, 'sales_multiplier', e.target.value)
            }
            placeholder="k"
          />
        ),
      },
      {
        key: 'sale_price',
        label: '* Sales Price',
        fillField: 'sale_price',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.sale_price ?? ''}
            onChange={(e) =>
              handleFieldChange(row, 'sale_price', e.target.value)
            }
            placeholder="0.00"
          />
        ),
      },
    ],
    [currencies, currencyLabelMap, handleFieldChange],
  );

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <input
          type="date"
          className={styles.control}
          value={rateDate}
          onChange={(e) => setRateDate(e.target.value)}
        />
        <select
          className={styles.control}
          value={costCurrencyId}
          onChange={(e) => {
            setCostCurrencyTouched(true);
            setCostCurrencyId(e.target.value);
          }}
        >
          <option value="">Cost currency</option>
          {(currencies || []).map((currency) => (
            <option key={currency.id} value={currency.id}>
              {currency?.code || currency?.name || currency?.id}
            </option>
          ))}
        </select>
        <input
          type="number"
          className={styles.control}
          value={costValue}
          onChange={(e) => {
            setCostTouched(true);
            setCostValue(e.target.value);
          }}
          placeholder="Cost"
        />
        <input
          type="number"
          className={styles.control}
          value={maxMultiplier}
          onChange={(e) => setMaxMultiplier(e.target.value)}
          placeholder="Max multiplier"
        />
        <input
          type="number"
          className={styles.control}
          value={minMultiplier}
          onChange={(e) => setMinMultiplier(e.target.value)}
          placeholder="Min multiplier"
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
          title="Sales currency / Cost currency"
        >
          {rateDisplay ? `Rate: ${rateDisplay}` : 'Rate: \u2014'}
        </span>
        {priceMessage ? (
          <span className={styles.message}>{priceMessage}</span>
        ) : null}
      </div>

      <div className={styles.mainRow}>
        <div className={styles.tableSection}>
          <Main_EditableTables
            rows={rows}
            columns={columns}
            rowKey="id"
            emptyMessage="No price tiers yet."
            onCellChange={handleCellChange}
            onAddRow={handleAddTier}
            addRowText="Add Price Tier"
            addRowDisabled={rows.length >= MAX_TIERS}
            addRowHint={`Max ${MAX_TIERS} tiers allowed`}
            onDeleteRow={handleDelete}
          />
        </div>

        {previewRows.length > 0 && (
          <div className={styles.previewPanel}>
            <p className={styles.previewTitle}>Preview (Unit: {unitLabel})</p>
            {previewRows.map((tier) => (
              <div key={tier.id} className={styles.previewRow}>
                <span className={styles.previewRange}>{tier.rangeLabel}</span>
                <span className={styles.previewPrice}>{tier.priceLabel}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceByQtyTable;
