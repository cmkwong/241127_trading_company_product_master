import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import Main_Modal from '../Modal/Main_Modal';
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

  const requestSeqRef = useRef(0);

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

  // Escape / backdrop / close-button: collapse any open close-up first, then
  // close the window. (Escape and backdrop are handled by Main_Modal.)
  const handleRequestClose = useCallback(() => {
    if (previewEntry) {
      setPreviewEntry(null);
      return;
    }
    onClose?.();
  }, [previewEntry, onClose]);

  const itemCount = folderCount + fileCount;

  if (!isOpen) return null;

  return (
    <>
      <Main_Modal
        title={
          <span className={styles.titleLeft}>
            <FolderIcon size={16} className={styles.titleIcon} />
            <span className={styles.titleText}>File Banks</span>
          </span>
        }
        onClose={handleRequestClose}
        width="min(1200px, 94vw)"
        height="min(680px, 90vh)"
        zIndex={2000}
        draggable
        bodyScrollable={false}
        showCloseButton={false}
        headerActions={
          <button
            type="button"
            className={styles.titleClose}
            onClick={handleRequestClose}
            aria-label="Close"
          >
            <CloseIcon size={16} />
          </button>
        }
        className={styles.modalWindow}
        overlayClassName={styles.modalOverlay}
        headerClassName={styles.modalHeader}
        footerClassName={styles.footerReset}
        footer={
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
                  onClick={handleRequestClose}
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
        }
        ariaLabel="File Banks"
      >
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

        {previewEntry && (
          <Sub_FileSelectorImagePreview
            entry={previewEntry}
            onCollapse={() => setPreviewEntry(null)}
          />
        )}
      </Main_Modal>

      {hoverPreview &&
        createPortal(
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
          </div>,
          document.body,
        )}
    </>
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
