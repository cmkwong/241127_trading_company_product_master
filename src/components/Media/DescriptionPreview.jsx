import styles from './DescriptionPreview.module.css';
import image_icon from '../../assets/blankDescription.svg';
import MediaUpdate from './MediaUpdate';

import { useState } from 'react';
import ClickableIcon from './ClickableIcon';

const DescriptionPreview = () => {
  const [popWindow, setPopWindow] = useState(false);

  return (
    <div className={styles.container}>
      <ClickableIcon image_icon={image_icon} setPopWindow={setPopWindow} />
      {popWindow && (
        <MediaUpdate setPopWindow={setPopWindow} type="description" />
      )}
    </div>
  );
};

export default DescriptionPreview;
