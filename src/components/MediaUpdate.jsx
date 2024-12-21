import { useRef, useState } from 'react';
import WindowPop from './common/WindowPop';
import styles from './MediaUpdate.module.css';

import { Editor } from 'primereact/editor';
import ImageBox from './ImageBox';
import { useProductDatasContext } from '../store/ProductDatasContext';
import { useProductDataRowContext } from '../store/ProductDataRowContext';

const MediaUpdate = (props) => {
  let { setPopWindow, type, editorTxt, setEditorTxt } = props;

  const { product_id, media } = useProductDataRowContext();

  const { dispatchProductDatas, allMedia } = useProductDatasContext();

  const mediaOnClick = (id, checked) => {
    if (checked) {
      dispatchProductDatas({
        type: 'uncheckSelectedMedia',
        product_id: product_id,
        payload: { id },
      });
    } else {
      dispatchProductDatas({
        type: 'checkSelectedMedia',
        product_id: product_id,
        payload: { id },
      });
    }
  };

  const editor_ref = useRef(null);
  return (
    <WindowPop setPopWindow={setPopWindow}>
      <div className={styles.upperContainer}>
        {(type === 'video' || type === 'image') && (
          <div className={styles.mediaTable}>
            {allMedia.map(
              (image, i) =>
                image.media_type === type && (
                  <ImageBox
                    key={image.id}
                    image={image}
                    checked={media.includes(image.id)}
                    mediaOnClick={mediaOnClick}
                  />
                )
            )}
          </div>
        )}
        {type === 'description' && (
          <div className={styles.ta}>
            <Editor
              ref={editor_ref}
              value={editorTxt}
              onTextChange={() =>
                setEditorTxt(editor_ref.current.getContent().outerHTML)
              }
              onClick={() => console.log(editorTxt)}
              style={{ height: '580px', overflowY: 'scroll' }}
            />
          </div>
        )}
      </div>
      <div className={styles.lowerContainer}>
        {(type === 'video' || type === 'image') && (
          <input type="file" multiple />
        )}
      </div>
    </WindowPop>
  );
};

export default MediaUpdate;
