import PropTypes from 'prop-types';
import styles from './Main_FileUploads.module.css';

const Sub_FileUploadsHeader = ({
  label,
  canOpenSequenceEditor,
  onOpenSequenceEditor,
  showDownloadButton,
  isDownloading,
  onDownload,
}) => {
  return (
    <div className={styles.headerRow}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.headerActions}>
        {showDownloadButton && (
          <button
            type="button"
            className={styles.sequenceEditorIconBtn}
            onClick={onDownload}
            title={isDownloading ? 'Downloading...' : 'Download'}
            aria-label={isDownloading ? 'Downloading...' : 'Download'}
            disabled={isDownloading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5 20h14v-2H5v2zm7-18v9.17l3.59-3.58L17 9l-5 5-5-5 1.41-1.41L11 11.17V2h1z" />
            </svg>
          </button>
        )}

        {canOpenSequenceEditor && (
          <button
            type="button"
            className={styles.sequenceEditorIconBtn}
            onClick={onOpenSequenceEditor}
            title="Open sequence editor"
            aria-label="Open sequence editor"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58zM20.71 7.04a1.003 1.003 0 000-1.42L18.37 3.29a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

Sub_FileUploadsHeader.propTypes = {
  label: PropTypes.string,
  canOpenSequenceEditor: PropTypes.bool.isRequired,
  onOpenSequenceEditor: PropTypes.func.isRequired,
  showDownloadButton: PropTypes.bool,
  isDownloading: PropTypes.bool,
  onDownload: PropTypes.func,
};

export default Sub_FileUploadsHeader;
