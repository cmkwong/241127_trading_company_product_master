import styles from './ImageBox.module.css';
import checked_icon from '../../assets/image_checked.svg';
import { useState } from 'react';

const ImageBox = (props) => {
  const { image, checked, mediaOnClick } = props;

  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={styles.mediaBox}
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(event) => mediaOnClick(image.id, checked)}
    >
      {checked && <img className={styles.checked} src={checked_icon} />}
      {hovered && <div className={styles.hoverBorder} />}
      <img src={`/products/${image.filename}`} />
    </div>
  );
};

export default ImageBox;
