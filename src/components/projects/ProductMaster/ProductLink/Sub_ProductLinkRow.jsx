import { useCallback, useEffect, useState } from 'react';
import Main_DateSelector from '../../../common/InputOptions/Date/Main_DateSelector';
import Main_FileUploads from '../../../common/InputOptions/FileUploads/Main_FileUploads';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import styles from './Sub_ProductLinkRow.module.css';
import { useProductContext } from '../../../../store/ProductContext';

const Sub_ProductLinkRow = (props) => {
  const { product_links, rowindex } = props; // Destructure any additional props if needed
  const productLink = product_links[rowindex];

  const [link, setLink] = useState(productLink?.link || '');
  const [remark, setRemark] = useState(productLink?.remark || '');
  const [updated_at, setUpdated_at] = useState(productLink?.updated_at || '');
  const [images, setImages] = useState([]);

  const { pageData, upsertProductPageData } = useProductContext(); // Access product context if needed for additional functionality

  // assign data
  useEffect(() => {
    setLink(productLink?.link || '');
    setRemark(productLink?.remark || '');
    setUpdated_at(productLink?.updated_at || '');
    // set the image also
    if (productLink && productLink.product_link_images) {
      setImages(
        productLink.product_link_images.map((img) => {
          return {
            id: img.id,
            url: img.image_url,
            name: img.image_name,
          };
        }),
      );
    } else {
      setImages([]);
    }
  }, [productLink]);

  // handle link change
  const handleLinkChange = useCallback(
    (ov, nv) => {
      upsertProductPageData({
        product_links: [
          {
            id: productLink?.id,
            product_id: pageData.id,
            link: nv,
          },
        ],
      });
    },
    [productLink?.id, upsertProductPageData, pageData?.id],
  );

  // handle remark change
  const handleRemarkChange = useCallback(
    (ov, nv) => {
      upsertProductPageData({
        product_links: [
          {
            id: productLink?.id,
            product_id: pageData.id,
            remark: nv,
          },
        ],
      });
    },
    [productLink?.id, upsertProductPageData, pageData?.id],
  );

  const handleDateChange = useCallback(
    (ov, nv) => {
      upsertProductPageData({
        product_links: [
          {
            id: productLink?.id,
            product_id: pageData.id,
            updated_at: nv,
          },
        ],
      });
    },
    [productLink?.id, upsertProductPageData, pageData?.id],
  );

  // handle image changes
  const handleImageChange = useCallback(
    (ov, nv) => {
      if (ov.length > nv.length) {
        // Image removed
        const removedImages = ov.filter((o) => !nv.some((n) => n.id === o.id));
        upsertProductPageData({
          product_links: [
            {
              id: productLink?.id,
              product_id: pageData.id,
              product_link_images: removedImages.map((img) => ({
                id: img.id,
                _delete: true,
              })),
            },
          ],
        });
      }
      if (ov.length < nv.length) {
        // added image
        const addedImages = nv.filter((n) => !ov.some((o) => o.id === n.id));
        // Image added or changed
        upsertProductPageData({
          product_links: [
            {
              id: productLink?.id,
              product_id: pageData.id,
              product_link_images: addedImages.map((img) => ({
                id: img.id,
                image_url: img.url,
                image_name: img.name,
              })),
            },
          ],
        });
      }
    },
    [productLink?.id, upsertProductPageData, pageData?.id],
  );

  // Handle image upload errors
  const handleImageError = useCallback((error) => {
    console.error('Image upload error:', error);
  }, []);

  return (
    <div className={styles.rowContainer}>
      <Main_TextField
        placeholder={'Link'}
        defaultValue={link || ''}
        onChange={handleLinkChange}
      />
      <div className={styles.contentRow}>
        <div className={styles.inputsColumn}>
          <Main_FileUploads
            mode="image"
            onError={handleImageError}
            onChange={handleImageChange}
            defaultImages={images}
          />
          <Main_TextArea
            label={'Remark'}
            defaultValue={remark || ''}
            onChange={handleRemarkChange}
            mode="image"
          />
          <Main_DateSelector
            defaultValue={updated_at || ''}
            onChange={handleDateChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Sub_ProductLinkRow;
