import PropTypes from 'prop-types';
import styles from './Sub_FileList.module.css';
import Sub_FileItem from './Sub_FileItem';

/**
 * Sub_FileList Component
 * Displays a list of uploaded files
 */
const Sub_FileList = ({ files, onRemoveFile, disabled }) => {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className={styles.fileListContainer}>
      <h4 className={styles.fileListTitle}>Uploaded Files ({files.length})</h4>
      <ul className={styles.fileList}>
        {files.map((file) => (
          <Sub_FileItem
            key={file.id}
            file={file}
            onRemove={onRemoveFile}
            disabled={disabled}
          />
        ))}
      </ul>
    </div>
  );
};

Sub_FileList.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      type: PropTypes.string,
      id: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default Sub_FileList;
