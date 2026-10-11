import { useCallback, useEffect, useMemo, useState } from 'react';
import EditableDataFormBody from './EditableDataFormBody';
import Frame from '../Layouts/Frame';
import AddNewBtn from '../Buttons/AddNewBtn';
import styles from './EditableDataForm.module.css';

const getDefaultRowKey = (row, index) => row?.id || index;

/**
 * Column definition for a single editable cell.
 *
 * Each row segment (split by `nextRow`) is rendered as a flex container and
 * every column becomes a flex item. Size is controlled with flexbox props
 * instead of fixed widths:
 *   - `flex`        : shorthand e.g. "1 1 220px"
 *   - `flexGrow`    : number
 *   - `flexShrink`  : number
 *   - `flexBasis`   : CSS value (e.g. "220px", "30%", "auto")
 *   - `alignSelf`   : CSS align-self value
 *   - `order`       : number
 *   - `nextRow`     : true to start a new row for this column
 */
const EditableDataForm = ({
  rows = [],
  columns = [],
  rowKey = getDefaultRowKey,
  emptyMessage = 'No data',
  onFillCellChange,
  onAddRow,
  addRowText = 'Add New',
  addRowDisabled = false,
  addRowHint,
  onRemoveRow,
  showRowBadge = false,
  draggableRows = false,
  onRowsReorder,
}) => {
  const [fillDrag, setFillDrag] = useState(null);
  const [fillHoverIndex, setFillHoverIndex] = useState(null);

  const showAddRow = typeof onAddRow === 'function';

  const rowSegments = useMemo(() => {
    if (!Array.isArray(columns) || columns.length === 0) {
      return [];
    }

    const segments = [];
    let currentSegment = [];

    columns.forEach((column) => {
      if (column?.nextRow && currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [column];
        return;
      }

      currentSegment.push(column);
    });

    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    return segments;
  }, [columns]);

  const applyFill = useCallback(() => {
    if (
      !fillDrag ||
      fillHoverIndex === null ||
      fillHoverIndex === undefined ||
      typeof onFillCellChange !== 'function'
    ) {
      return;
    }

    const { field, sourceIndex, value } = fillDrag;
    if (sourceIndex === fillHoverIndex) return;

    const start = Math.min(sourceIndex, fillHoverIndex);
    const end = Math.max(sourceIndex, fillHoverIndex);

    for (let index = start; index <= end; index += 1) {
      if (index === sourceIndex) continue;
      onFillCellChange(rows[index], field, value);
    }
  }, [fillDrag, fillHoverIndex, onFillCellChange, rows]);

  useEffect(() => {
    const handleMouseUp = () => {
      applyFill();
      setFillDrag(null);
      setFillHoverIndex(null);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [applyFill]);

  const startFillDrag = (field, sourceIndex, value, event) => {
    event.preventDefault();
    event.stopPropagation();
    setFillDrag({ field, sourceIndex, value });
    setFillHoverIndex(sourceIndex);
  };

  const handleCellMouseEnter = (field, rowIndex) => {
    if (!fillDrag || fillDrag.field !== field) return;
    setFillHoverIndex(rowIndex);
  };

  const getFillCellClassName = (field, rowIndex) => {
    if (
      !fillDrag ||
      fillHoverIndex === null ||
      fillHoverIndex === undefined ||
      fillDrag.field !== field
    ) {
      return '';
    }

    const start = Math.min(fillDrag.sourceIndex, fillHoverIndex);
    const end = Math.max(fillDrag.sourceIndex, fillHoverIndex);
    const inRange = rowIndex >= start && rowIndex <= end;

    if (!inRange) return '';
    if (rowIndex === fillDrag.sourceIndex) {
      return `${styles.fillPreviewCell} ${styles.fillPreviewSource}`;
    }

    return styles.fillPreviewCell;
  };

  const wrapWithFill = (children, field, rowIndex, value) => (
    <div className={styles.cellControlWrap}>
      {children}
      <button
        type="button"
        className={styles.fillHandle}
        onMouseDown={(event) => startFillDrag(field, rowIndex, value, event)}
        title="Drag to fill"
        aria-label="Drag to fill"
      />
    </div>
  );

  return (
    <div className={styles.formRoot}>
      <Frame
        direction="vertical"
        gap={0}
        className={styles.tableWrap}
        width="fit-content"
        horizontal_padding={'10px'}
        vertical_padding={'10px'}
      >
        <Frame direction="vertical" gap={0} className={styles.dataTable}>
          <EditableDataFormBody
            rows={rows}
            rowGroups={rowSegments}
            rowKey={rowKey}
            emptyMessage={emptyMessage}
            getFillCellClassName={getFillCellClassName}
            handleCellMouseEnter={handleCellMouseEnter}
            wrapWithFill={wrapWithFill}
            onRemoveRow={onRemoveRow}
            showRowBadge={showRowBadge}
            draggableRows={draggableRows}
            onRowsReorder={onRowsReorder}
          />
        </Frame>
      </Frame>

      {showAddRow && (
        <div className={styles.footerRow}>
          <AddNewBtn
            onClick={onAddRow}
            text={addRowText}
            disabled={addRowDisabled}
          />
          {addRowHint ? (
            <span className={styles.addRowHint}>{addRowHint}</span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default EditableDataForm;
