import { useCallback, useMemo } from 'react';
import Main_EditableTables from '../../../common/Tables/Main_EditableTables';
import { getCapacityLabel } from './productCostsUtils';
import styles from './CostsTable.module.css';

const CostsTable = ({
  gridRows,
  colorTypeMap,
  capacityTypeMap,
  sizeTypeMap,
  currencyOptions = [],
  onCostFieldChange,
}) => {
  // Create a mapping of currency IDs to their display labels for easy lookup
  const currencyLabelMap = useMemo(
    () =>
      (currencyOptions || []).reduce((acc, currency) => {
        acc[currency.id] =
          currency?.code || currency?.name || currency?.label || currency?.id;
        return acc;
      }, {}),
    [currencyOptions],
  );

  // Main_EditableTables emits row *keys* from fill drags, so map them back to
  // rows to reuse the existing onCostFieldChange(row, field, value) callback.
  const rowByKey = useMemo(() => {
    const map = new Map();
    (gridRows || []).forEach((row) => map.set(String(row.id), row));
    return map;
  }, [gridRows]);

  const handleCellChange = useCallback(
    (rowKey, columnKey, value) => {
      const row = rowByKey.get(String(rowKey));
      if (row) onCostFieldChange(row, columnKey, value);
    },
    [rowByKey, onCostFieldChange],
  );

  // Define table columns with memoization to optimize performance
  const columns = useMemo(
    () => [
      {
        key: 'color',
        label: 'Color',
        fillable: false,
        getSortValue: (row) => colorTypeMap[row.colorTypeId]?.name || '',
        renderCell: (row) => colorTypeMap[row.colorTypeId]?.name || '-',
      },
      {
        key: 'capacity',
        label: 'Capacity',
        fillable: false,
        getSortValue: (row) =>
          getCapacityLabel(capacityTypeMap[row.capacityTypeId]) || '',
        renderCell: (row) =>
          getCapacityLabel(capacityTypeMap[row.capacityTypeId]) || '-',
      },
      {
        key: 'size',
        label: 'Size',
        fillable: false,
        getSortValue: (row) => sizeTypeMap[row.sizeTypeId]?.name || '',
        renderCell: (row) => sizeTypeMap[row.sizeTypeId]?.name || '-',
      },
      {
        key: 'currency_id',
        label: 'Currency ID',
        fillField: 'currency_id',
        getSortValue: (row) => currencyLabelMap[row.currency_id] || '',
        renderCell: (row) => (
          <select
            className={styles.cellInput}
            value={row.currency_id || ''}
            onChange={(e) =>
              onCostFieldChange(row, 'currency_id', e.target.value)
            }
          >
            <option value="">Select currency</option>
            {currencyOptions.map((currency) => {
              const displayLabel =
                currency?.code ||
                currency?.name ||
                currency?.label ||
                currency?.id;

              return (
                <option key={currency.id} value={currency.id}>
                  {displayLabel}
                </option>
              );
            })}
          </select>
        ),
      },
      {
        key: 'unit_cost',
        label: 'Unit Cost',
        fillField: 'unit_cost',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.unit_cost}
            onChange={(e) =>
              onCostFieldChange(row, 'unit_cost', e.target.value)
            }
            placeholder="Enter value"
          />
        ),
      },

      {
        key: 'stock_qty',
        label: 'Stock Qty',
        fillField: 'stock_qty',
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            value={row.stock_qty}
            onChange={(e) =>
              onCostFieldChange(row, 'stock_qty', e.target.value)
            }
            placeholder="Enter value"
          />
        ),
      },
    ],
    [
      colorTypeMap,
      capacityTypeMap,
      sizeTypeMap,
      onCostFieldChange,
      currencyOptions,
      currencyLabelMap,
    ],
  );

  return (
    <Main_EditableTables
      rows={gridRows}
      columns={columns}
      rowKey="id"
      emptyMessage="Select at least one attribute (Color / Capacity / Size)."
      onCellChange={handleCellChange}
    />
  );
};

export default CostsTable;
