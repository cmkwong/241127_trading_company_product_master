import { getCapacityLabel } from './productCostsUtils';
import styles from './CostsTable.module.css';

const CostsTable = ({
  gridRows,
  colorTypeMap,
  capacityTypeMap,
  sizeTypeMap,
  onCostFieldChange,
}) => {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.costTable}>
        <thead>
          <tr>
            <th>Color</th>
            <th>Capacity</th>
            <th>Size</th>
            <th>Unit Cost</th>
            <th>Currency ID</th>
            <th>MOQ</th>
          </tr>
        </thead>
        <tbody>
          {gridRows.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.emptyRow}>
                Select at least one attribute (Color / Capacity / Size).
              </td>
            </tr>
          ) : (
            gridRows.map((row) => (
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
                  <input
                    className={styles.cellInput}
                    value={row.currency_id}
                    onChange={(e) =>
                      onCostFieldChange(row, 'currency_id', e.target.value)
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
