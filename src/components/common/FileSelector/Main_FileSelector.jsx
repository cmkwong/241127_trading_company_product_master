import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './Main_FileSelector.module.css';
import { useAuthContext } from '../../../store/AuthContext';
import {
  fetchFileBankDirectory,
  fetchFileBankTree,
  buildPublicFileUrl,
} from '../../../utils/filePickerUtils';
import {
  normalizeStartPath,
  pushHistory,
  sortEntries,
  getEntryDisplayName,
} from './fileSelectorUtils';
import Sub_FileSelectorBreadcrumb from './Sub_FileSelectorBreadcrumb';
import Sub_FileSelectorList from './Sub_FileSelectorList';
import Sub_FileSelectorGrid from './Sub_FileSelectorGrid';
import Sub_FileSelectorImagePreview from './Sub_FileSelectorImagePreview';
import {
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  SearchIcon,
  ListIcon,
  GridIcon,
  FolderIcon,
} from './FileSelectorIcons';

const IMAGE_MODE = 'image';

// Floating "hover preview" box size (px) — used to clamp it inside the viewport.
const HOVER_PREVIEW_SIZE = 340;
const HOVER_PREVIEW_GAP = 16;

// Minimum amount of the window (px) that must remain visible while dragging so
// it can never be lost entirely off-screen.
const MIN_DRAG_VISIBLE_X = 80;
const MIN_DRAG_VISIBLE_Y = 40;

/**
 * "File Banks" picker window. Browses the server-side `/public/...` image
 * directories and returns the selected entry's existing path so the caller can
 * store it verbatim (no upload / no byte copy).
 */
const Main_FileSelector = ({
  isOpen,
  onClose,
  startPath = '',
  mode = 'image',
  storage = null,
  onSelect,
  onSelectMultiple,
  allowMultiple = false,
  onError,
}) => {
  const { token } = useAuthContext();

  const [storageMeta, setStorageMeta] = useState(storage);
  const [path, setPath] = useState('/public');
  const [history, setHistory] = useState(['/public']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [entries, setEntries] = useState([]);
  const [folderCount, setFolderCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [hasParent, setHasParent] = useState(false);
  const [parentPath, setParentPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewEntry, setPreviewEntry] = useState(null);
  const [hoverPreview, setHoverPreview] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const requestSeqRef = useRef(0);
  const windowRef = useRef(null);
  const dragStateRef = useRef(null);

  // Initialise when the window opens.
  useEffect(() => {
    if (!isOpen) return;
    const initial = normalizeStartPath(startPath);
    setPath(initial);
    setHistory([initial]);
    setHistoryIndex(0);
    setSelectedPaths([]);
    setMultiSelect(allowMultiple);
    setSearchQuery('');
    setViewMode('grid');
    setPreviewEntry(null);
    setHoverPreview(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    if (!storage) {
      fetchFileBankTree({ token })
        .then((tree) => setStorageMeta(tree.storage))
        .catch(() => {
          /* storage labels are optional; ignore */
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, startPath]);

  const loadDirectory = useCallback(
    async (targetPath) => {
      const seq = ++requestSeqRef.current;
      setLoading(true);
      setError('');
      try {
        const data = await fetchFileBankDirectory({
          path: targetPath,
          token,
          imagesOnly: mode === IMAGE_MODE,
          search: searchQuery,
        });
        if (seq !== requestSeqRef.current) return;
        setEntries(sortEntries(data.entries));
        setFolderCount(data.folderCount);
        setFileCount(data.fileCount);
        setHasParent(data.hasParent);
        setParentPath(data.parentPath);
        setPath(data.path || targetPath);
      } catch (err) {
        if (seq !== requestSeqRef.current) return;
        console.error('Failed to load file-bank directory', err);
        setError('Could not load this folder.');
        onError?.(err);
      } finally {
        if (seq === requestSeqRef.current) setLoading(false);
      }
    },
    [token, mode, searchQuery, onError],
  );

  // (Re)load whenever the path or search changes.
  useEffect(() => {
    if (!isOpen) return;
    setPreviewEntry(null);
    setHoverPreview(null);
    loadDirectory(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, path, searchQuery]);

  const navigateTo = useCallback(
    (nextPath) => {
      const { history: nextHistory, index } = pushHistory(
        history,
        historyIndex,
        nextPath,
      );
      setHistory(nextHistory);
      setHistoryIndex(index);
      setPath(nextPath);
      setSelectedPaths([]);
    },
    [history, historyIndex],
  );

  const goBack = useCallback(() => {
    if (historyIndex <= 0) return;
    const index = historyIndex - 1;
    setHistoryIndex(index);
    setPath(history[index]);
    setSelectedPaths([]);
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const index = historyIndex + 1;
    setHistoryIndex(index);
    setPath(history[index]);
    setSelectedPaths([]);
  }, [history, historyIndex]);

  const goUp = useCallback(() => {
    if (hasParent && parentPath) navigateTo(parentPath);
  }, [hasParent, parentPath, navigateTo]);

  const handleOpenFolder = useCallback(
    (entry) => {
      if (entry?.type === 'folder') navigateTo(entry.path);
    },
    [navigateTo],
  );

  const handleSelect = useCallback(
    (entry) => {
      // Single-select: pick immediately and let the caller close the window
      // (the pre-existing click-to-confirm behaviour).
      if (!multiSelect) {
        setSelectedPaths([entry.path]);
        onSelect?.(entry);
        return;
      }
      // Multi-select: toggle the entry in/out of the working set; the user
      // confirms the whole selection via the bottom-right Confirm button.
      setSelectedPaths((prev) =>
        prev.includes(entry.path)
          ? prev.filter((path) => path !== entry.path)
          : [...prev, entry.path],
      );
    },
    [multiSelect, onSelect],
  );

  const handleToggleMultiSelect = useCallback((next) => {
    setMultiSelect(next);
    // Turning multi-select off collapses any pending selection back to a single
    // (last-picked) entry so single-click behaviour stays unambiguous.
    if (!next) {
      setSelectedPaths((prev) => (prev.length ? [prev[prev.length - 1]] : []));
    }
  }, []);

  const handleConfirm = useCallback(() => {
    const selected = selectedPaths
      .map((path) => entries.find((entry) => entry.path === path))
      .filter(Boolean);
    if (selected.length === 0) return;
    if (multiSelect && typeof onSelectMultiple === 'function') {
      onSelectMultiple(selected);
    } else {
      onSelect?.(selected[0]);
    }
  }, [selectedPaths, entries, multiSelect, onSelect, onSelectMultiple]);

  // --- Floating "hover preview" (cursor-following enlarged image) -----------
  const positionHoverPreview = useCallback((clientX, clientY) => {
    const size = HOVER_PREVIEW_SIZE;
    const gap = HOVER_PREVIEW_GAP;
    let x = clientX + gap;
    let y = clientY + gap;
    const maxX = window.innerWidth - size - gap;
    const maxY = window.innerHeight - size - gap;
    // Flip to the left / above when near the right / bottom edge.
    if (x > maxX) x = clientX - size - gap;
    if (y > maxY) y = clientY - size - gap;
    // Final clamp keeps the box fully inside the viewport.
    return {
      x: Math.max(gap, Math.min(x, maxX)),
      y: Math.max(gap, Math.min(y, maxY)),
    };
  }, []);

  const handleHoverImage = useCallback(
    (event, entry) => {
      if (!entry?.isImage) return;
      setHoverPreview({
        entry,
        ...positionHoverPreview(event.clientX, event.clientY),
      });
    },
    [positionHoverPreview],
  );

  const handleHoverImageMove = useCallback(
    (event) => {
      setHoverPreview((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ...positionHoverPreview(event.clientX, event.clientY),
        };
      });
    },
    [positionHoverPreview],
  );

  const handleHoverImageLeave = useCallback(() => {
    setHoverPreview(null);
  }, []);

  // Suppress the hover preview while the full-window close-up is open.
  useEffect(() => {
    if (previewEntry) setHoverPreview(null);
  }, [previewEntry]);

  // --- Draggable window (grab the title bar to move) -------------------------
  const handleTitleBarMouseDown = useCallback(
    (event) => {
      if (event.button !== 0) return;
      // Let the close button (and any future buttons) keep normal behaviour.
      if (event.target.closest?.('button')) return;
      const rect = windowRef.current?.getBoundingClientRect();
      if (!rect) return;
      event.preventDefault();
      dragStateRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: dragOffset.x,
        originY: dragOffset.y,
        minX: -(rect.left + rect.width - MIN_DRAG_VISIBLE_X),
        maxX: window.innerWidth - rect.left - MIN_DRAG_VISIBLE_X,
        minY: -(rect.top + rect.height - MIN_DRAG_VISIBLE_Y),
        maxY: window.innerHeight - rect.top - MIN_DRAG_VISIBLE_Y,
      };
      setIsDragging(true);
    },
    [dragOffset],
  );

  useEffect(() => {
    if (!isDragging) return undefined;
    const onMove = (event) => {
      const drag = dragStateRef.current;
      if (!drag) return;
      const nextX = Math.min(
        Math.max(drag.originX + event.clientX - drag.startX, drag.minX),
        drag.maxX,
      );
      const nextY = Math.min(
        Math.max(drag.originY + event.clientY - drag.startY, drag.minY),
        drag.maxY,
      );
      setDragOffset({ x: nextX, y: nextY });
    };
    const onUp = () => {
      dragStateRef.current = null;
      setIsDragging(false);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  // Escape to close.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (previewEntry) {
        setPreviewEntry(null);
        return;
      }
      onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, previewEntry]);

  const itemCount = folderCount + fileCount;

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        ref={windowRef}
        className={`${styles.window} ${isDragging ? styles.windowDragging : ''}`}
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
        }}
        role="dialog"
        aria-label="File Banks"
      >
        <div
          className={`${styles.titleBar} ${isDragging ? styles.titleBarDragging : ''}`}
          onMouseDown={handleTitleBarMouseDown}
        >
          <div className={styles.titleLeft}>
            <FolderIcon size={16} className={styles.titleIcon} />
            <span className={styles.titleText}>File Banks</span>
          </div>
          <button
            type="button"
            className={styles.titleClose}
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className={styles.navBar}>
          {allowMultiple && (
            <label
              className={styles.selectToggle}
              title="Select several files before confirming"
            >
              <input
                type="checkbox"
                className={styles.selectToggleInput}
                checked={multiSelect}
                onChange={(event) =>
                  handleToggleMultiSelect(event.target.checked)
                }
              />
              <span>Multiple selection</span>
            </label>
          )}
          {allowMultiple && <span className={styles.navDivider} />}
          <div className={styles.navHistory}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={goBack}
              disabled={historyIndex <= 0}
              title="Back"
              aria-label="Back"
            >
              <ChevronLeftIcon size={16} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={goForward}
              disabled={historyIndex >= history.length - 1}
              title="Forward"
              aria-label="Forward"
            >
              <ChevronRightIcon size={16} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={goUp}
              disabled={!hasParent}
              title="Up"
              aria-label="Up"
            >
              <ArrowUpIcon size={16} />
            </button>
          </div>

          <Sub_FileSelectorBreadcrumb
            publicPath={path}
            storage={storageMeta}
            onNavigate={navigateTo}
            onRefresh={() => loadDirectory(path)}
            disabled={loading}
          />

          <div className={styles.searchBox}>
            <SearchIcon size={14} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              spellCheck={false}
            />
          </div>

          <div className={styles.viewSwitch}>
            <button
              type="button"
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
              aria-label="List view"
            >
              <ListIcon size={16} />
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
              aria-label="Grid view"
            >
              <GridIcon size={16} />
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {loading && <p className={styles.message}>Loading…</p>}
          {!loading && error && <p className={styles.message}>{error}</p>}
          {!loading && !error && itemCount === 0 && (
            <p className={styles.message}>This folder is empty.</p>
          )}
          {!loading &&
            !error &&
            itemCount > 0 &&
            (viewMode === 'grid' ? (
              <Sub_FileSelectorGrid
                entries={entries}
                selectedPaths={selectedPaths}
                mode={mode}
                onOpenFolder={handleOpenFolder}
                onSelect={handleSelect}
                onExpandImage={setPreviewEntry}
                onHoverImage={handleHoverImage}
                onHoverImageMove={handleHoverImageMove}
                onHoverImageLeave={handleHoverImageLeave}
              />
            ) : (
              <Sub_FileSelectorList
                entries={entries}
                selectedPaths={selectedPaths}
                mode={mode}
                onOpenFolder={handleOpenFolder}
                onSelect={handleSelect}
                onHoverImage={handleHoverImage}
                onHoverImageMove={handleHoverImageMove}
                onHoverImageLeave={handleHoverImageLeave}
              />
            ))}
        </div>

        <div className={styles.statusBar}>
          <span className={styles.statusLeft}>
            <span className={styles.statusItems}>{itemCount} items</span>
            {multiSelect && selectedPaths.length > 0 && (
              <span className={styles.statusSelected}>
                {selectedPaths.length} selected
              </span>
            )}
          </span>
          {allowMultiple ? (
            <span className={styles.statusActions}>
              <button
                type="button"
                className={styles.statusBtn}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.statusBtn} ${styles.statusBtnPrimary}`}
                onClick={handleConfirm}
                disabled={selectedPaths.length === 0}
              >
                Confirm
                {selectedPaths.length > 0 ? ` (${selectedPaths.length})` : ''}
              </button>
            </span>
          ) : (
            <span className={styles.statusSelected}>
              {selectedPaths[0]
                ? `Selected: ${
                    getEntryDisplayName(
                      entries.find((entry) => entry.path === selectedPaths[0]),
                    ) || selectedPaths[0].split('/').pop()
                  }`
                : ''}
            </span>
          )}
        </div>

        {previewEntry && (
          <Sub_FileSelectorImagePreview
            entry={previewEntry}
            onCollapse={() => setPreviewEntry(null)}
          />
        )}
      </div>

      {hoverPreview && (
        <div
          className={styles.hoverPreview}
          style={{ left: hoverPreview.x, top: hoverPreview.y }}
          aria-hidden="true"
        >
          <img
            src={buildPublicFileUrl(hoverPreview.entry.path)}
            alt={getEntryDisplayName(hoverPreview.entry)}
            className={styles.hoverPreviewImage}
          />
        </div>
      )}
    </div>,
    document.body,
  );
};
Main_FileSelector.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  startPath: PropTypes.string,
  mode: PropTypes.oneOf(['image', 'file']),
  storage: PropTypes.object,
  onSelect: PropTypes.func,
  onSelectMultiple: PropTypes.func,
  allowMultiple: PropTypes.bool,
  onError: PropTypes.func,
};

export default Main_FileSelector;
