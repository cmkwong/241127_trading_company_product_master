import { useMemo } from 'react';
import EditableDataTable from '../../../common/Table/EditableDataTable';
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

  // Define table columns with memoization to optimize performance
  const columns = useMemo(
    () => [
      {
        key: 'color',
        label: 'Color',
        sortType: 'string',
        getSortValue: (row) => colorTypeMap[row.colorTypeId]?.name || '',
        renderCell: (row) => colorTypeMap[row.colorTypeId]?.name || '-',
      },
      {
        key: 'capacity',
        label: 'Capacity',
        sortType: 'string',
        getSortValue: (row) =>
          getCapacityLabel(capacityTypeMap[row.capacityTypeId]) || '',
        renderCell: (row) =>
          getCapacityLabel(capacityTypeMap[row.capacityTypeId]) || '-',
      },
      {
        key: 'size',
        label: 'Size',
        sortType: 'string',
        getSortValue: (row) => sizeTypeMap[row.sizeTypeId]?.name || '',
        renderCell: (row) => sizeTypeMap[row.sizeTypeId]?.name || '-',
      },
      {
        key: 'unit_cost',
        label: 'Unit Cost',
        sortType: 'number',
        fillField: 'unit_cost',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
            <input
              className={styles.cellInput}
              value={row.unit_cost}
              onChange={(e) =>
                onCostFieldChange(row, 'unit_cost', e.target.value)
              }
              placeholder="Enter value"
            />,
            'unit_cost',
            rowIndex,
            row.unit_cost,
          ),
      },
      {
        key: 'currency_id',
        label: 'Currency ID',
        sortType: 'string',
        getSortValue: (row) => currencyLabelMap[row.currency_id] || '',
        fillField: 'currency_id',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
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
            </select>,
            'currency_id',
            rowIndex,
            row.currency_id || '',
          ),
      },
      {
        key: 'stock_qty',
        label: 'Stock Qty',
        sortType: 'number',
        fillField: 'stock_qty',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
            <input
              className={styles.cellInput}
              value={row.stock_qty}
              onChange={(e) =>
                onCostFieldChange(row, 'stock_qty', e.target.value)
              }
              placeholder="Enter value"
            />,
            'stock_qty',
            rowIndex,
            row.stock_qty,
          ),
      },
      {
        key: 'min_order_qty',
        label: 'MOQ',
        sortType: 'number',
        fillField: 'min_order_qty',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
            <input
              className={styles.cellInput}
              value={row.min_order_qty}
              onChange={(e) =>
                onCostFieldChange(row, 'min_order_qty', e.target.value)
              }
              placeholder="Enter value"
            />,
            'min_order_qty',
            rowIndex,
            row.min_order_qty,
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
    <EditableDataTable
      rows={gridRows}
      columns={columns}
      rowKey="id"
      emptyMessage="Select at least one attribute (Color / Capacity / Size)."
      onFillCellChange={(row, field, value) =>
        onCostFieldChange(row, field, value)
      }
    />
  );
};

export default CostsTable;
