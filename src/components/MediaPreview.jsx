import styles from './MediaPreview.module.css';
import image_icon from '../assets/blankImage.svg';
import video_icon from '../assets/blankVideo.svg';
import { useState } from 'react';
import MediaUpdate from './MediaUpdate';

const MediaPreview = (props) => {
  let { media } = props;

  const [popWindow, setPopWindow] = useState(false);

  let icon_path;
  if (media === 'image') {
    icon_path = image_icon;
  } else {
    icon_path = video_icon;
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
      {popWindow && <MediaUpdate setPopWindow={setPopWindow} media={media} />}
    </div>
  );
};

export default MediaPreview;
