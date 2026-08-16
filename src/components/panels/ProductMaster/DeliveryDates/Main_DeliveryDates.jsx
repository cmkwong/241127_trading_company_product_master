import { useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import EditableDataTable from '../../../common/Table/EditableDataTable';
import { useProductContext } from '../../../../store/ProductContext';
import { useMasterContext } from '../../../../store/MasterContext';
import styles from './Main_DeliveryDates.module.css';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import DeleteBtn from '../../../common/Buttons/DeleteBtn';

const MAX_RANGES = 3;
const DEFAULT_UNIT_LABEL = 'Pcs';

const Main_DeliveryDates = () => {
  const { pageData, upsertProductPageData } = useProductContext();
  const { sellingUnitType } = useMasterContext();

  const productId = pageData?.id || null;
  const rows = useMemo(
    () => (pageData?.product_delivery_dates || []).filter((r) => !r?._delete),
    [pageData?.product_delivery_dates],
  );

  const unitLabel = useMemo(() => {
    const selected = (sellingUnitType || []).find(
      (unit) => unit?.id === pageData?.selling_unit_type_id,
    );
    return selected?.name || DEFAULT_UNIT_LABEL;
  }, [sellingUnitType, pageData?.selling_unit_type_id]);

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

      result.push({
        id: tier.id,
        rangeLabel,
        valueLabel,
        negotiated: false,
      });
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
      upsertProductPageData({
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
    [upsertProductPageData, productId],
  );

  const handleDelete = useCallback(
    (row) => {
      if (!row?.id) return;
      upsertProductPageData({
        product_delivery_dates: [{ id: row.id, _delete: true }],
      });
    },
    [upsertProductPageData],
  );

  const handleAddRange = useCallback(() => {
    if (rows.length >= MAX_RANGES) return;
    upsertProductPageData({
      product_delivery_dates: [
        {
          id: uuidv4(),
          product_id: productId,
          min_order_qty: 0,
          delivery_day: 0,
        },
      ],
    });
  }, [rows.length, upsertProductPageData, productId]);

  const columns = useMemo(
    () => [
      {
        key: 'min_order_qty',
        label: '* Quantity (Pcs)',
        sortType: 'number',
        fillField: 'min_order_qty',
        minWidth: '160px',
        maxWidth: '320px',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
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
            </div>,
            'min_order_qty',
            rowIndex,
            row.min_order_qty,
          ),
      },
      {
        key: 'delivery_day',
        label: '* Est. Lead Time (Days)',
        sortType: 'number',
        fillField: 'delivery_day',
        minWidth: '160px',
        maxWidth: '320px',
        renderCell: (row, { rowIndex, wrapWithFill }) =>
          wrapWithFill(
            <input
              className={styles.cellInput}
              type="number"
              value={row.delivery_day ?? ''}
              onChange={(e) =>
                handleFieldChange(row, 'delivery_day', e.target.value)
              }
              placeholder="0"
            />,
            'delivery_day',
            rowIndex,
            row.delivery_day,
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
          <DeleteBtn text="Delete" onClick={() => handleDelete(row)} />
        ),
      },
    ],
    [handleFieldChange, handleDelete],
  );

  return (
    <Main_InputContainer label="Delivery Dates">
      <div className={styles.layout}>
        <div className={styles.left}>
          <EditableDataTable
            rows={rows}
            columns={columns}
            rowKey="id"
            emptyMessage="No delivery ranges yet."
            onFillCellChange={(row, field, value) =>
              handleFieldChange(row, field, value)
            }
          />
          <div className={styles.addRow}>
            <button
              type="button"
              className={styles.addBtn}
              disabled={rows.length >= MAX_RANGES}
              onClick={handleAddRange}
            >
              + Add Quantity Range
            </button>
            <span className={styles.addHint}>
              Max {MAX_RANGES} ranges allowed
            </span>
          </div>
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
