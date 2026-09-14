import { useEffect, useMemo, useState } from 'react';
import Main_Dropdown from '../../common/InputOptions/Dropdown/Main_Dropdown';
import Main_Checkbox from '../../common/InputOptions/Checkbox/Main_Checkbox';
import Main_TextField from '../../common/InputOptions/TextField/Main_TextField';
import styles from './Main_DocumentCopy.module.css';

const toSafeString = (value) => String(value ?? '').trim();

const formatNumber = (value, decimals = 2) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const CopyIcon = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
    <rect x="7" y="7" width="9" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const FilterIcon = () => (
  <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
    <path d="M2 3h10M4 7h6M6 11h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Main_DocumentCopy = ({
  open = false,
  onClose = () => {},
  title = 'Copy Line Items from Source Document',
  items = [],
  currencyCode = '',
  targetOptions = [],
  defaultTargetId = '',
  isSubmitting = false,
  onConfirm = () => {},
}) => {
  const [selectedKeys, setSelectedKeys] = useState({});
  const [copyQtyByKey, setCopyQtyByKey] = useState({});
  const [targetId, setTargetId] = useState(defaultTargetId);
  const [showFilter, setShowFilter] = useState(false);
  const [filterText, setFilterText] = useState('');

  // Reset local state whenever the window (re)opens with new items.
  useEffect(() => {
    if (!open) return;
    const nextSelected = {};
    const nextQty = {};
    for (const item of items) {
      nextSelected[item.key] = false;
      nextQty[item.key] = Number(item.qty) || 0;
    }
    setSelectedKeys(nextSelected);
    setCopyQtyByKey(nextQty);
    setTargetId(
      defaultTargetId ||
        (targetOptions.length > 0 ? targetOptions[0].id : ''),
    );
    setShowFilter(false);
    setFilterText('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items]);

  const visibleItems = useMemo(() => {
    const query = filterText.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [
        item.title,
        item.subtitle,
        item.meta,
        ...(Array.isArray(item.detailLines) ? item.detailLines : []),
      ]
        .map((value) => toSafeString(value).toLowerCase())
        .join(' ')
        .includes(query),
    );
  }, [items, filterText]);

  const visibleKeys = useMemo(
    () => new Set(visibleItems.map((item) => item.key)),
    [visibleItems],
  );

  const selectedVisibleCount = useMemo(
    () => visibleItems.filter((item) => selectedKeys[item.key]).length,
    [visibleItems, selectedKeys],
  );

  const allVisibleSelected =
    visibleItems.length > 0 && selectedVisibleCount === visibleItems.length;

  const selectedItems = useMemo(
    () => items.filter((item) => selectedKeys[item.key]),
    [items, selectedKeys],
  );

  const totalSelectedAmount = useMemo(
    () =>
      selectedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [selectedItems],
  );

  const totalCopyQty = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) => sum + (Number(copyQtyByKey[item.key]) || 0),
        0,
      ),
    [selectedItems, copyQtyByKey],
  );

  const toggleSelectAll = () => {
    setSelectedKeys((previous) => {
      const next = { ...previous };
      const nextValue = !allVisibleSelected;
      for (const key of visibleKeys) {
        next[key] = nextValue;
      }
      return next;
    });
  };

  const toggleSelect = (key) => {
    setSelectedKeys((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  const setCopyQty = (key, nextQty) => {
    const item = items.find((candidate) => candidate.key === key);
    const max = Number(item?.qty) || 0;
    const clamped = Math.max(0, Math.min(Number(nextQty) || 0, max));
    setCopyQtyByKey((previous) => ({ ...previous, [key]: clamped }));
  };

  const handleConfirm = () => {
    if (isSubmitting) return;
    const payload = selectedItems.map((item) => ({
      key: item.key,
      id: item.id,
      sourceType: item.sourceType,
      copyQty: Number(copyQtyByKey[item.key]) || 0,
    }));
    onConfirm({ selectedItems: payload, targetDocTypeId: targetId });
  };

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.headerIcon}>
              <CopyIcon />
            </span>
            <span className={styles.headerTitle}>{title}</span>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={toggleSelectAll}
            >
              <span
                className={`${styles.toolbarButtonIcon} ${
                  allVisibleSelected ? styles.toolbarButtonIconActive : ''
                }`}
              >
                {allVisibleSelected ? '\u2212' : ''}
              </span>
              Select All
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => setShowFilter((previous) => !previous)}
            >
              <FilterIcon />
              Filter
            </button>
          </div>
          <span className={styles.toolbarTotal}>
            Total selected: {currencyCode} {formatNumber(totalSelectedAmount)}
          </span>
        </div>

        {showFilter && (
          <div className={styles.filterRow}>
            <Main_TextField
              defaultValue={filterText}
              placeholder="Filter items..."
              onChange={(ov, nv) => setFilterText(nv)}
            />
          </div>
        )}

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colCheck}>
                  <Main_Checkbox
                    checked={allVisibleSelected}
                    indeterminate={
                      !allVisibleSelected && selectedVisibleCount > 0
                    }
                    onChange={toggleSelectAll}
                    ariaLabel="Select all items"
                  />
                </th>
                <th className={styles.colIndex}>#</th>
                <th className={styles.colDescription}>Item Description</th>
                <th className={styles.colQty}>Ordered Qty</th>
                <th className={styles.colQty}>Copy Qty</th>
                <th className={styles.colRate}>Unit Rate</th>
                <th className={styles.colDisc}>Disc %</th>
                <th className={styles.colAmount}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item, index) => {
                const isSelected = !!selectedKeys[item.key];
                const copyQty = Number(copyQtyByKey[item.key]) || 0;
                const qty = Number(item.qty) || 0;
                return (
                  <tr
                    key={item.key}
                    className={isSelected ? styles.rowSelected : ''}
                  >
                    <td className={styles.colCheck}>
                      <Main_Checkbox
                        checked={isSelected}
                        onChange={() => toggleSelect(item.key)}
                        ariaLabel={`Select item ${index + 1}`}
                      />
                    </td>
                    <td className={styles.colIndex}>{index + 1}</td>
                    <td className={styles.colDescription}>
                      <div className={styles.itemTitle}>
                        {item.title || item.id || ''}
                      </div>
                      {item.subtitle ? (
                        <div className={styles.itemSubtitle}>
                          {item.subtitle}
                        </div>
                      ) : null}
                      {item.meta ? (
                        <div className={styles.itemMeta}>{item.meta}</div>
                      ) : null}
                      {Array.isArray(item.detailLines) &&
                      item.detailLines.length > 0 ? (
                        <div className={styles.itemDetails}>
                          {item.detailLines.map((line, lineIndex) => (
                            <div
                              key={`${item.key}-detail-${lineIndex}`}
                              className={styles.itemDetailLine}
                            >
                              {line}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </td>
                    <td className={styles.colQty}>{formatNumber(qty, 0)}</td>
                    <td className={styles.colQty}>
                      <div className={styles.stepper}>
                        <button
                          type="button"
                          className={styles.stepperButton}
                          onClick={() => setCopyQty(item.key, copyQty - 1)}
                          disabled={copyQty <= 0}
                          aria-label="Decrease copy quantity"
                        >
                          {'\u2212'}
                        </button>
                        <span className={styles.stepperValue}>
                          {formatNumber(copyQty, 0)}
                        </span>
                        <button
                          type="button"
                          className={styles.stepperButton}
                          onClick={() => setCopyQty(item.key, copyQty + 1)}
                          disabled={copyQty >= qty}
                          aria-label="Increase copy quantity"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className={styles.colRate}>
                      {item.unitRate != null ? formatNumber(item.unitRate) : ''}
                    </td>
                    <td className={styles.colDisc}>
                      {item.discountPercent != null
                        ? `${formatNumber(item.discountPercent)}%`
                        : ''}
                    </td>
                    <td className={styles.colAmount}>
                      {formatNumber(item.amount)}
                    </td>
                  </tr>
                );
              })}
              {visibleItems.length === 0 && (
                <tr>
                  <td className={styles.emptyState} colSpan={8}>
                    No items to copy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerStats}>
            <div className={styles.footerStat}>
              <span className={styles.footerStatLabel}>Selected Items</span>
              <span className={styles.footerStatValue}>
                {selectedItems.length} / {items.length}
              </span>
            </div>
            <div className={styles.footerStat}>
              <span className={styles.footerStatLabel}>Total Qty to Copy</span>
              <span className={styles.footerStatValue}>{totalCopyQty}</span>
            </div>
          </div>

          <div className={styles.footerActions}>
            <span className={styles.targetLabel}>Target document type</span>
            <div className={styles.targetDropdown}>
              <Main_Dropdown
                defaultOptions={targetOptions}
                defaultSelectedOption={targetId}
                onChange={(ov, nv) => setTargetId(nv)}
              />
            </div>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={handleConfirm}
              disabled={isSubmitting || selectedItems.length === 0}
            >
              {isSubmitting ? 'Copying...' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main_DocumentCopy;


