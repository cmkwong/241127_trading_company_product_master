import { useCallback, useEffect, useMemo, useState } from 'react';
import EditableDataFormBody from './EditableDataFormBody';
import Frame from '../Layouts/Frame';
import AddNewBtn from '../Buttons/AddNewBtn';
import styles from './EditableDataForm.module.css';

const getDefaultRowKey = (row, index) => row?.id || index;
const COLUMN_SIZE_MAP = {
  S: 90,
  M: 130,
  L: 350,
  XL: 600,
  XXL: 800,
};

const toCssWidth = (value) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return `${value}px`;
  }

  return String(value);
};

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
}) => {
  const [fillDrag, setFillDrag] = useState(null);
  const [fillHoverIndex, setFillHoverIndex] = useState(null);

  const showAddRow = typeof onAddRow === 'function';

  const normalizedColumns = useMemo(() => {
    return columns.map((column) => {
      const normalizedSizeKey = String(column?.size || '')
        .trim()
        .toUpperCase();
      const mappedSize = COLUMN_SIZE_MAP[normalizedSizeKey];

      const resolvedWidth =
        toCssWidth(column?.width) ||
        (mappedSize ? `${mappedSize}px` : undefined);
      const resolvedMinWidth =
        toCssWidth(column?.minWidth) ||
        (mappedSize ? `${mappedSize}px` : undefined);
      const resolvedMaxWidth =
        toCssWidth(column?.maxWidth) ||
        (mappedSize ? `${mappedSize}px` : undefined);

      return {
        ...column,
        width: resolvedWidth,
        minWidth: resolvedMinWidth,
        maxWidth: resolvedMaxWidth,
      };
    });
  }, [columns]);

  const rowSegments = useMemo(() => {
    if (!Array.isArray(normalizedColumns) || normalizedColumns.length === 0) {
      return [];
    }

    const segments = [];
    let currentSegment = [];

    normalizedColumns.forEach((column) => {
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
  }, [normalizedColumns]);

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
