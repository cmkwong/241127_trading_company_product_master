import { useCallback } from 'react';
import PropTypes from 'prop-types';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import styles from './Sub_Remark.module.css';

const Sub_Remark = ({ remark, onChange }) => {
  const handleRemarkChange = useCallback(
    (ov, nv) => {
      onChange('remark', nv);
    },
    [onChange],
  );

  return (
    <div className={styles.textarea_container}>
      <Main_TextArea
        textareaId="product-remarks"
        defaultValue={remark || ''}
        onChange={handleRemarkChange}
        placeholder="Enter product remarks..."
        rows={5}
        fullHeight={true}
        maxLength={500}
        resize="none"
        ariaLabel="Product Remarks"
      />
    </div>
  );
};

Sub_Remark.propTypes = {
  remark: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

Sub_Remark.displayName = 'Sub_Remark';

export default Sub_Remark;
