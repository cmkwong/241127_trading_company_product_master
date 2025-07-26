import styles from './VideoPreview.module.css';
import image_icon from '../../assets/blankVideo.svg';
import MediaUpdate from './MediaUpdate';

import { useState } from 'react';
import ClickableIcon from './ClickableIcon';

const VideoPreview = () => {
  const [popWindow, setPopWindow] = useState(false);
  return (
    <div className={styles.container}>
      <ClickableIcon image_icon={image_icon} setPopWindow={setPopWindow} />
      {popWindow && <MediaUpdate setPopWindow={setPopWindow} type="video" />}
    </div>
  );
};

export default VideoPreview;
