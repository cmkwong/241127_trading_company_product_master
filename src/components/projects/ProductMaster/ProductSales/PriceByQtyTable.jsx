import { useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './PriceByQtyTable.module.css';

const MAX_TIERS = 4;

const PriceByQtyTable = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { currencies } = useMasterContext();

  const productId = pageData?.id || null;
  const rows = useMemo(
    () =>
      (pageData?.product_sale_prices_by_qty || []).filter((r) => !r?._delete),
    [pageData?.product_sale_prices_by_qty],
  );

  const handleFieldChange = useCallback(
    (row, field, value) => {
      upsertProductPageData({
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
          },
        ],
      });
    },
    [upsertProductPageData, productId],
  );

  const handleDelete = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertProductPageData({
        product_sale_prices_by_qty: [{ id: row.id, _delete: true }],
      });
    },
    [upsertProductPageData],
  );

  const handleAddTier = useCallback(() => {
    if (rows.length >= MAX_TIERS) return;
    upsertProductPageData({
      product_sale_prices_by_qty: [
        {
          id: uuidv4(),
          product_id: productId,
          min_order_qty: 1,
          currency_id: '',
          sale_price: '',
        },
      ],
    });
  }, [rows.length, upsertProductPageData, productId]);

  const columns = useMemo(
    () => [
      {
        key: 'min_order_qty',
        label: '* Min Order Qty',
        sortType: 'number',
        fillField: 'min_order_qty',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
            <input
              className={styles.cellInput}
              type="number"
              value={row.min_order_qty ?? ''}
              onChange={(e) =>
                handleFieldChange(row, 'min_order_qty', e.target.value)
              }
              placeholder="0"
            />,
            'min_order_qty',
            rowIndex,
            row.min_order_qty,
          ),
      },
      {
        key: 'currency_id',
        label: 'Currency',
        sortType: 'string',
        fillField: 'currency_id',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
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
            </select>,
            'currency_id',
            rowIndex,
            row.currency_id || '',
          ),
      },
      {
        key: 'sale_price',
        label: '* Unit Price',
        sortType: 'number',
        fillField: 'sale_price',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
            <input
              className={styles.cellInput}
              value={row.sale_price ?? ''}
              onChange={(e) =>
                handleFieldChange(row, 'sale_price', e.target.value)
              }
              placeholder="0.00"
            />,
            'sale_price',
            rowIndex,
            row.sale_price,
          ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        width: '80px',
        minWidth: '80px',
        maxWidth: '80px',
        renderCell: (row) => (
          <button
            type="button"
            className={styles.addTierBtn}
            style={{ color: '#ef4444' }}
            onClick={() => handleDelete(row)}
          >
            Delete
          </button>
        ),
      },
    ],
    [currencies, handleFieldChange, handleDelete],
  );

  return (
    <div className={styles.container}>
      <EditableDataTable
        rows={rows}
        columns={columns}
        rowKey="id"
        emptyMessage="No price tiers yet."
      />
      <div className={styles.addTierRow}>
        <button
          type="button"
          className={styles.addTierBtn}
          disabled={rows.length >= MAX_TIERS}
          onClick={handleAddTier}
        >
          + Add Price Tier
        </button>
        <span className={styles.addTierHint}>
          Max {MAX_TIERS} tiers allowed
        </span>
      </div>
    </div>
  );
};

export default PriceByQtyTable;
