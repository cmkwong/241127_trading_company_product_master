import { useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Main_EditableTables from '../../../common/Tables/Main_EditableTables';
import {
  upsertEntityData,
  useEntityRows,
  useEntityField,
} from '../../../../store/GeneralContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_DeliveryDates.module.css';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';

const MAX_RANGES = 3;
const DEFAULT_UNIT_LABEL = 'Pcs';

const Main_DeliveryDates = () => {
  const { sellingUnitType } = useMasterContext();

  const productId = useEntityField('products', 'id');
  const sellingUnitTypeId = useEntityField('products', 'selling_unit_type_id');
  const allDeliveryDates = useEntityRows('products', 'product_delivery_dates');

  const rows = useMemo(
    () => (allDeliveryDates || []).filter((r) => !r?._delete),
    [allDeliveryDates],
  );

  const unitLabel = useMemo(() => {
    const selected = (sellingUnitType || []).find(
      (unit) => unit?.id === sellingUnitTypeId,
    );
    return selected?.name || DEFAULT_UNIT_LABEL;
  }, [sellingUnitType, sellingUnitTypeId]);

  const sortedTiers = useMemo(() => {
    return [...rows]
      .filter((row) => Number(row?.min_order_qty) > 0)
      .sort((a, b) => Number(a.min_order_qty) - Number(b.min_order_qty));
  }, [rows]);

  const previewRows = useMemo(() => {
    const result = [];

    sortedTiers.forEach((tier, index) => {
      const min = Number(tier.min_order_qty);
      const prev =
        index === 0 ? 1 : Number(sortedTiers[index - 1].min_order_qty) + 1;
      const rangeLabel = `${prev} ~ ${min}`;

      const days = Number(tier.delivery_day);
      const valueLabel = Number.isNaN(days) ? '—' : `${days} Days`;

      result.push({ id: tier.id, rangeLabel, valueLabel, negotiated: false });
    });

    if (sortedTiers.length > 0) {
      const lastMin = Number(sortedTiers[sortedTiers.length - 1].min_order_qty);
      result.push({
        id: 'tail',
        rangeLabel: `≥ ${lastMin + 1}`,
        valueLabel: null,
        negotiated: true,
      });
    }

    return result;
  }, [sortedTiers]);

  const handleFieldChange = useCallback(
    (row, field, value) => {
      upsertEntityData('products', {
        product_delivery_dates: [
          {
            id: row?.id || uuidv4(),
            product_id: productId,
            min_order_qty:
              field === 'min_order_qty'
                ? Number(value) || 0
                : (row?.min_order_qty ?? 0),
            delivery_day:
              field === 'delivery_day'
                ? Number(value) || 0
                : (row?.delivery_day ?? 0),
          },
        ],
      });
    },
    [upsertEntityData, productId],
  );

  const handleDelete = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertEntityData('products', {
        product_delivery_dates: [{ id: row.id, _delete: true }],
      });
    },
    [upsertEntityData],
  );

  const handleAddRange = useCallback(() => {
    if (rows.length >= MAX_RANGES) return;
    upsertEntityData('products', {
      product_delivery_dates: [
        {
          id: uuidv4(),
          product_id: productId,
          min_order_qty: 0,
          delivery_day: 0,
        },
      ],
    });
  }, [rows.length, upsertEntityData, productId]);

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

  const columns = useMemo(
    () => [
      {
        key: 'min_order_qty',
        label: '* Quantity (Pcs)',
        width: '160px',
        fillField: 'min_order_qty',
        getSortValue: (row) => Number(row?.min_order_qty) || 0,
        renderCell: (row) => (
          <div className={styles.qtyCell}>
            <span className={styles.qtyPrefix}>≤</span>
            <input
              className={styles.cellInput}
              type="number"
              value={row.min_order_qty ?? ''}
              onChange={(e) =>
                handleFieldChange(row, 'min_order_qty', e.target.value)
              }
              placeholder="0"
            />
          </div>
        ),
      },
      {
        key: 'delivery_day',
        label: '* Est. Lead Time (Days)',
        width: '160px',
        fillField: 'delivery_day',
        getSortValue: (row) => Number(row?.delivery_day) || 0,
        renderCell: (row) => (
          <input
            className={styles.cellInput}
            type="number"
            value={row.delivery_day ?? ''}
            onChange={(e) =>
              handleFieldChange(row, 'delivery_day', e.target.value)
            }
            placeholder="0"
          />
        ),
      },
    ],
    [handleFieldChange],
  );

  return (
    <Main_InputContainer label="Delivery Dates">
      <div className={styles.layout}>
        <div className={styles.left}>
          <Main_EditableTables
            rows={rows}
            columns={columns}
            rowKey="id"
            emptyMessage="No delivery ranges yet."
            onCellChange={handleCellChange}
            onDeleteRow={handleDelete}
            onAddRow={handleAddRange}
            addRowText="Add Quantity Range"
            addRowDisabled={rows.length >= MAX_RANGES}
            addRowHint={`Max ${MAX_RANGES} ranges allowed`}
          />
        </div>

        {previewRows.length > 0 && (
          <div className={styles.previewPanel}>
            <p className={styles.previewTitle}>Preview (Unit: {unitLabel})</p>
            {previewRows.map((tier) => (
              <div key={tier.id} className={styles.previewRow}>
                <span className={styles.previewRange}>{tier.rangeLabel}</span>
                {tier.negotiated ? (
                  <span className={styles.previewBadge}>To be negotiated</span>
                ) : (
                  <span className={styles.previewValue}>{tier.valueLabel}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Main_InputContainer>
  );
};

export default Main_DeliveryDates;
