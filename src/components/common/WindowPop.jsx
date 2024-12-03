import styles from './WindowPop.module.css';
import { useRef, useEffect } from 'react';

const WindowPop = ({ children, setPopWindow }) => {
  // create the global click handler for listening the outside clicked
  // After component unmounted, remove the handler
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
      setPopWindow(false);
    }
  };

  return (
    <div className={styles.container} ref={region_ref}>
      {children}
    </div>
  );
};

export default WindowPop;
