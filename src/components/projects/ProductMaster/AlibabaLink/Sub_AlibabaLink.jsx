import { useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_AlibabaLink.module.css';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';

const Sub_AlibabaLink = forwardRef(
  ({ template_data, alibabaIds, onChange, setRowRef, rowindex }, ref) => {
    // Get the current row data or use template data if it doesn't exist
    const alibabaLink = alibabaIds[rowindex] || { ...template_data };

    const handleValueChange = useCallback(
      ({ value }) => {
        onChange(rowindex, 'value', value);
      },
      [onChange, rowindex]
    );

    const handleLinkChange = useCallback(
      ({ value }) => {
        onChange(rowindex, 'link', value);
      },
      [onChange, rowindex]
    );

    return (
      <div
        className={styles.inputContainer}
        ref={(el) => setRowRef(rowindex, el)}
      >
        <div className={styles.idField}>
          <Main_TextField
            placeholder={'Enter Alibaba ID ...'}
            value={alibabaLink.value || ''}
            onChange={handleValueChange}
          />
        </div>
        <div className={styles.linkField}>
          <Main_TextField
            placeholder={'Enter Link ...'}
            value={alibabaLink.link || ''}
            onChange={handleLinkChange}
          />
        </div>
      </div>
    );
  }
);

Sub_AlibabaLink.propTypes = {
  template_data: PropTypes.object.isRequired,
  alibabaIds: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  setRowRef: PropTypes.func.isRequired,
  rowindex: PropTypes.number,
};

Sub_AlibabaLink.displayName = 'Sub_AlibabaLink';

export default Sub_AlibabaLink;
