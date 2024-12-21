import { useRef, useState } from 'react';
import WindowPop from './common/WindowPop';
import styles from './MediaUpdate.module.css';

import { Editor } from 'primereact/editor';
import ImageBox from './ImageBox';

const MediaUpdate = (props) => {
  let { setPopWindow, media, editorTxt, setEditorTxt, allMedia } = props;

  const editor_ref = useRef(null);

  return (
    <WindowPop setPopWindow={setPopWindow}>
      <div className={styles.upperContainer}>
        {(media === 'video' || media === 'image') && (
          <div className={styles.mediaTable}>
            {allMedia.map(
              (image, i) =>
                image.media_type === media && (
                  <ImageBox key={i} image={image} checked={true} />
                )
            )}
          </div>
        )}
        {media === 'description' && (
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
        {(media === 'video' || media === 'image') && (
          <input type="file" multiple />
        )}
      </div>
    </WindowPop>
  );
};

export default MediaUpdate;
