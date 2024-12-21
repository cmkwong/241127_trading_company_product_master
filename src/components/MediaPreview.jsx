import styles from './MediaPreview.module.css';
import image_icon from '../assets/blankImage.svg';
import video_icon from '../assets/blankVideo.svg';
import description_icon from '../assets/blankDescription.svg';
import { useState } from 'react';
import MediaUpdate from './MediaUpdate';

const MediaPreview = (props) => {
  let { type, allMedia } = props;

  const [popWindow, setPopWindow] = useState(false);

  // for description text
  const [editorTxt, setEditorTxt] = useState('');

  let icon_path;
  if (type === 'image') {
    icon_path = image_icon;
  } else if (type === 'video') {
    icon_path = video_icon;
  } else if (type === 'description') {
    icon_path = description_icon;
  }

  return (
    <div className={styles.container}>
      <img
        className={styles.clickable}
        onClick={() => {
          setPopWindow(true);
        }}
        src={icon_path}
        alt="Media Upload"
      />
      {popWindow && (
        <MediaUpdate
          setPopWindow={setPopWindow}
          type={type}
          editorTxt={editorTxt}
          setEditorTxt={setEditorTxt}
        />
      )}
    </div>
  );
};

export default MediaPreview;
