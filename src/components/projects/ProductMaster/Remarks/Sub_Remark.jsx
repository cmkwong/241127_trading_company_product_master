import { useCallback } from 'react';
import PropTypes from 'prop-types';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';

const Sub_Remark = ({ remark, onChange }) => {
  const handleRemarkChange = useCallback(
    (ov, nv) => {
      onChange('remark', nv);
    },
    [onChange],
  );

  return (
    <div>
      <Main_TextArea
        textareaId="product-remarks"
        defaultValue={remark || ''}
        onChange={handleRemarkChange}
        placeholder="Enter product remarks..."
        rows={5}
        maxLength={500}
        resize="vertical"
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
