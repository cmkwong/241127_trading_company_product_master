import { useCallback, useEffect, useState } from 'react';
import styles from './Main_ProductLink.module.css';
import ControlRowBtn from '../../../common/ControlRowBtn';
import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Sub_ProductLinkRow from './Sub_ProductLinkRow';
import { useProductContext } from '../../../../store/ProductContext';
import { v4 as uuidv4 } from 'uuid';

const Main_ProductLink = () => {
  const { pageData, upsertProductPageData } = useProductContext();

  const [rowIds, setRowIds] = useState(
    pageData.product_links?.map((link) => link.id) || [],
  );

  useEffect(() => {
    if (pageData.product_links) {
      setRowIds(pageData.product_links.map((link) => link.id));
    } else {
      setRowIds([]);
    }
  }, [pageData.product_links]);

  const handleRowIdsChange = useCallback(() => {}, []);

  // Handle adding a new product link row
  const handleRowAdd = useCallback(() => {
    const newId = uuidv4();
    const newLink = {
      id: newId,
      product_id: pageData.id,
      link: '',
      remark: '',
      product_link_images: [],
    };
    upsertProductPageData({
      product_links: [newLink],
    });
    setRowIds((prevIds) => [...prevIds, newId]);
  }, [pageData.id, upsertProductPageData]);

  // Handle removing a product link row
  const handleRowRemove = useCallback(
    (id) => {
      upsertProductPageData({
        product_links: [
          {
            id: id,
            _delete: true,
          },
        ],
      });
      setRowIds((prevIds) => prevIds.filter((prevId) => prevId !== id));
    },
    [upsertProductPageData],
  );

  return (
    <Main_InputContainer label="Product Links">
      <ControlRowBtn
        rowIds={rowIds}
        onRowIdsChange={handleRowIdsChange}
        onRowAdd={handleRowAdd}
        onRowRemove={handleRowRemove}
      >
        <Sub_ProductLinkRow product_links={pageData.product_links || []} />
      </ControlRowBtn>
    </Main_InputContainer>
  );
};

export default Main_ProductLink;
