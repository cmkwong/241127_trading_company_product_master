import styles from './MediaPreview.module.css';
import image_icon from '../assets/blankImage.svg';
import video_icon from '../assets/blankVideo.svg';
import { useEffect, useRef, useState } from 'react';
import MediaUpload from './MediaUpload';

const MediaPreview = (props) => {
  let { media } = props;

  const [openWindow, setOpenWindow] = useState(false);

  let icon_path;
  if (media === 'image') {
    icon_path = image_icon;
  } else {
    icon_path = video_icon;
  }
  // create the global click handler. After component unmounted, remove the handler
  // https://tekolio.com/how-to-detect-a-click-outside-of-a-react-component-using-hooks/#google_vignette
  const region_ref = useRef(null);
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  });

  const handleOutsideClick = (e) => {
    if (region_ref.current && !region_ref.current.contains(e.target)) {
      setOpenWindow(false);
    }
  };

  return (
    <div className={styles.container}>
      <img
        className={styles.clickable}
        onClick={() => {
          setOpenWindow(true);
        }}
        src={icon_path}
        alt="Media Upload"
      />
      {openWindow && (
        <div ref={region_ref}>
          <MediaUpload media={media} />
        </div>
      )}
    </div>
  );
};

export default MediaPreview;
