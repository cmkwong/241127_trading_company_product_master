import { useMemo, useState } from 'react';
import { getCapacityLabel } from './productCostsUtils';
import styles from './CostsTable.module.css';

const SORTABLE_COLUMNS = [
  { key: 'color', label: 'Color', type: 'string' },
  { key: 'capacity', label: 'Capacity', type: 'string' },
  { key: 'size', label: 'Size', type: 'string' },
  { key: 'unit_cost', label: 'Unit Cost', type: 'number' },
  { key: 'currency_id', label: 'Currency ID', type: 'string' },
  { key: 'stock_qty', label: 'Stock Qty', type: 'number' },
  { key: 'min_order_qty', label: 'MOQ', type: 'number' },
];

const CostsTable = ({
  gridRows,
  colorTypeMap,
  capacityTypeMap,
  sizeTypeMap,
  currencyOptions = [],
  onCostFieldChange,
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  const currencyLabelMap = useMemo(
    () =>
      (currencyOptions || []).reduce((acc, currency) => {
        acc[currency.id] =
          currency?.code || currency?.name || currency?.label || currency?.id;
        return acc;
      }, {}),
    [currencyOptions],
  );

  const getSortValue = useMemo(
    () => (row, key) => {
      switch (key) {
        case 'color':
          return colorTypeMap[row.colorTypeId]?.name || '';
        case 'capacity':
          return getCapacityLabel(capacityTypeMap[row.capacityTypeId]) || '';
        case 'size':
          return sizeTypeMap[row.sizeTypeId]?.name || '';
        case 'currency_id':
          return currencyLabelMap[row.currency_id] || '';
        default:
          return row[key] ?? '';
      }
    },
    [colorTypeMap, capacityTypeMap, sizeTypeMap, currencyLabelMap],
  );

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) {
      return gridRows;
    }

    const column = SORTABLE_COLUMNS.find((item) => item.key === sortConfig.key);
    if (!column) {
      return gridRows;
    }

    const dir = sortConfig.direction === 'asc' ? 1 : -1;

    return [...gridRows].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);

      if (column.type === 'number') {
        const aNum = Number(aValue);
        const bNum = Number(bValue);

        if (Number.isNaN(aNum) && Number.isNaN(bNum)) return 0;
        if (Number.isNaN(aNum)) return 1;
        if (Number.isNaN(bNum)) return -1;
        return (aNum - bNum) * dir;
      }

      return String(aValue).localeCompare(String(bValue)) * dir;
    });
  }, [gridRows, sortConfig, getSortValue]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }

      return {
        key,
        direction: 'asc',
      };
    });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className={styles.tableWrap}>
      <table className={styles.costTable}>
        <thead>
          <tr>
            {SORTABLE_COLUMNS.map((column) => (
              <th key={column.key}>
                <button
                  type="button"
                  className={styles.sortButton}
                  onClick={() => handleSort(column.key)}
                >
                  {column.label}
                  <span className={styles.sortIndicator}>
                    {getSortIndicator(column.key)}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gridRows.length === 0 ? (
            <tr>
              <td colSpan={7} className={styles.emptyRow}>
                Select at least one attribute (Color / Capacity / Size).
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr key={row.id}>
                <td>{colorTypeMap[row.colorTypeId]?.name || '-'}</td>
                <td>
                  {getCapacityLabel(capacityTypeMap[row.capacityTypeId]) || '-'}
                </td>
                <td>{sizeTypeMap[row.sizeTypeId]?.name || '-'}</td>
                <td>
                  <input
                    className={styles.cellInput}
                    value={row.unit_cost}
                    onChange={(e) =>
                      onCostFieldChange(row, 'unit_cost', e.target.value)
                    }
                    placeholder="Enter value"
                  />
                </td>
                <td>
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
                </td>
                <td>
                  <input
                    className={styles.cellInput}
                    value={row.stock_qty}
                    onChange={(e) =>
                      onCostFieldChange(row, 'stock_qty', e.target.value)
                    }
                    placeholder="Enter value"
                  />
                </td>
                <td>
                  <input
                    className={styles.cellInput}
                    value={row.min_order_qty}
                    onChange={(e) =>
                      onCostFieldChange(row, 'min_order_qty', e.target.value)
                    }
                    placeholder="Enter value"
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CostsTable;
