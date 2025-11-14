import { useCallback } from 'react';
import styles from './Main_ProductLink.module.css';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_ProductLinkRow from './Sub_ProductLinkRow';
import { useProductContext } from '../../../../store/ProductContext';
import useRowData from '../../../../hooks/useRowData';

const Main_ProductLink = () => {
  const { pageData, updateData } = useProductContext();

  const template_data = {
    link: '',
    images: [],
    remark: '',
    date: new Date().toISOString().split('T')[0],
  };

  // Use the custom hook to manage product links
  const {
    rowData: productLinks,
    rowIds,
    rowRef,
    setRowRef,
    handleRowIdsChange,
    handleRowAdd,
    handleRowRemove,
    handleFieldChange: handleProductLinkChange,
  } = useRowData({
    data: pageData.productLinks,
    updateData,
    dataKey: 'productLinks',
    template: template_data,
    idPrefix: 'product-link',
  });

  return (
    <Main_InputContainer label="Product Links">
      <ControlRowBtn
        rowIds={rowIds}
        setRowIds={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_ProductLinkRow
          template_data={template_data}
          productLinks={productLinks}
          onChange={handleProductLinkChange}
          setRowRef={setRowRef}
        />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_ProductLink;
