import styles from './ImagePreview.module.css';
import image_icon from '../../assets/blankImage.svg';
import MediaUpdate from './MediaUpdate';

import { useState } from 'react';
import ClickableIcon from './ClickableIcon';

const ImagePreview = () => {
  const [popWindow, setPopWindow] = useState(false);
  return (
    <div className={styles.container}>
      <ClickableIcon image_icon={image_icon} setPopWindow={setPopWindow} />
      {popWindow && <MediaUpdate setPopWindow={setPopWindow} type="image" />}
    </div>
  );
};

export default ImagePreview;
