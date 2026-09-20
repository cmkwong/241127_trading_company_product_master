import { Handle, Position } from '@xyflow/react';
import styles from './Main_DocumentFlow.module.css';

const formatDate = (value) => {
  const text = String(value ?? '').trim();
  if (!text) return '';
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;
  return parsed.toISOString().slice(0, 10);
};

const Sub_DocumentNode = ({ data }) => {
  const isSales = data?.kind === 'sales';
  const lines = Array.isArray(data?.lines) ? data.lines : [];

  return (
    <div
      className={`${styles.node} ${isSales ? styles.salesNode : styles.purchaseNode}`}
      title={isSales ? 'Open document' : 'Open purchase request'}
    >
      <div className={styles.header}>
        <Handle
          id="header-in"
          type="target"
          position={Position.Left}
          className={styles.handle}
        />
        <Handle
          id="header-out"
          type="source"
          position={Position.Right}
          className={styles.handle}
        />
        <div className={styles.headerTitle}>{data?.label || 'Document'}</div>
        {data?.referenceId ? (
          <div className={styles.referenceId}>{data.referenceId}</div>
        ) : null}
        <div className={styles.headerMeta}>
          {data?.status ? (
            <span className={styles.statusBadge}>{data.status}</span>
          ) : null}
          {data?.date ? (
            <span className={styles.dateText}>{formatDate(data.date)}</span>
          ) : null}
        </div>
      </div>

      <div className={styles.lines}>
        {lines.map((line, index) => (
          <div
            key={`${line.type}-${line.id || index}`}
            className={styles.lineRow}
          >
            {isSales && (
              <Handle
                id={`in:${line.type}:${line.id}`}
                type="target"
                position={Position.Left}
                className={styles.handle}
              />
            )}
            <span className={styles.lineLabel}>
              {line.label || line.id || `${line.type} item`}
            </span>
            {line.qty != null && line.qty !== '' ? (
              <span className={styles.lineQty}>×{line.qty}</span>
            ) : null}
            {line.price != null ? (
              <span className={styles.linePrice}>
                {line.currency ? `${line.currency} ` : ''}
                {line.price.toFixed(3)}
              </span>
            ) : null}
            <Handle
              id={`out:${line.type}:${line.id}`}
              type="source"
              position={Position.Right}
              className={styles.handle}
            />
          </div>
        ))}
        {lines.length === 0 ? (
          <div className={styles.lineRow}>
            <span className={styles.lineLabel}>No line items</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Sub_DocumentNode;
