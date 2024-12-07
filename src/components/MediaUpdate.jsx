import WindowPop from './common/WindowPop';
import styles from './MediaUpdate.module.css';

// import 'primereact/resources/themes/lara-light-indigo/theme.css'; // theme
// import 'primereact/resources/primereact.min.css'; // core css
// import 'primeicons/primeicons.css'; // icons

import { Editor } from 'primereact/editor';

const MediaUpdate = (props) => {
  let { setPopWindow, media } = props;

  return (
    <WindowPop setPopWindow={setPopWindow}>
      <div className={styles.upperContainer}>
        {media === 'description' && (
          <div className={styles.ta}>
            <Editor style={{ height: '580px', overflowY: 'scroll' }} />
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
