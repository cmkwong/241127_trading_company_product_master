import { useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';

const Sub_Remark = forwardRef(({ remark, onChange }, ref) => {
  const handleRemarkChange = useCallback(
    ({ value }) => {
      onChange('remark', value);
    },
    [onChange]
  );

  return (
    <div ref={ref}>
      <Main_TextArea
        textareaId="product-remarks"
        value={remark || ''}
        onChange={handleRemarkChange}
        placeholder="Enter product remarks..."
        rows={5}
        maxLength={500}
        resize="vertical"
        ariaLabel="Product Remarks"
      />
    </div>
  );
});

Sub_Remark.propTypes = {
  remark: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

Sub_Remark.displayName = 'Sub_Remark';

export default Sub_Remark;
