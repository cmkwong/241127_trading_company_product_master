import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './Main_FileSelector.module.css';
import { useAuthContext } from '../../../store/AuthContext';
import {
  fetchFileBankDirectory,
  fetchFileBankTree,
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
  onError,
}) => {
  const { token } = useAuthContext();

  const [storageMeta, setStorageMeta] = useState(storage);
  const [path, setPath] = useState('/public');
  const [history, setHistory] = useState(['/public']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [entries, setEntries] = useState([]);
  const [folderCount, setFolderCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [hasParent, setHasParent] = useState(false);
  const [parentPath, setParentPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestSeqRef = useRef(0);

  // Initialise when the window opens.
  useEffect(() => {
    if (!isOpen) return;
    const initial = normalizeStartPath(startPath);
    setPath(initial);
    setHistory([initial]);
    setHistoryIndex(0);
    setSelectedPath('');
    setSearchQuery('');
    setViewMode('grid');
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
      setSelectedPath('');
    },
    [history, historyIndex],
  );

  const goBack = useCallback(() => {
    if (historyIndex <= 0) return;
    const index = historyIndex - 1;
    setHistoryIndex(index);
    setPath(history[index]);
    setSelectedPath('');
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const index = historyIndex + 1;
    setHistoryIndex(index);
    setPath(history[index]);
    setSelectedPath('');
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
      setSelectedPath(entry.path);
      onSelect?.(entry);
    },
    [onSelect],
  );

  // Escape to close.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const itemCount = folderCount + fileCount;

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.window}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-label="File Banks"
      >
        <div className={styles.titleBar}>
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
                selectedPath={selectedPath}
                mode={mode}
                onOpenFolder={handleOpenFolder}
                onSelect={handleSelect}
              />
            ) : (
              <Sub_FileSelectorList
                entries={entries}
                selectedPath={selectedPath}
                mode={mode}
                onOpenFolder={handleOpenFolder}
                onSelect={handleSelect}
              />
            ))}
        </div>

        <div className={styles.statusBar}>
          <span className={styles.statusItems}>{itemCount} items</span>
          {selectedPath && (
            <span className={styles.statusSelected}>
              Selected:{' '}
              {getEntryDisplayName(
                entries.find((entry) => entry.path === selectedPath),
              ) || selectedPath.split('/').pop()}
            </span>
          )}
        </div>
      </div>
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
  onError: PropTypes.func,
};

export default Main_FileSelector;
