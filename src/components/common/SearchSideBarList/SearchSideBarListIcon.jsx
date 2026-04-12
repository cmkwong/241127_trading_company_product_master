import { useCallback, useEffect, useState } from 'react';
import styles from './SearchSideBarList.module.css';

const SearchSideBarListIcon = ({ url, alt, placeholderIcon }) => {
  const [hoverPreview, setHoverPreview] = useState(null);
  const [hasImageError, setHasImageError] = useState(false);

  const safeUrl = typeof url === 'string' ? url.trim() : '';

  // Reset error state whenever image source changes.
  useEffect(() => {
    setHasImageError(false);
  }, [safeUrl]);

  const handleMouseEnter = useCallback(
    (event) => {
      if (!safeUrl || hasImageError) {
        return;
      }

      setHoverPreview({
        src: safeUrl,
        alt: alt || 'item-icon',
        x: event.clientX + 18,
        y: event.clientY + 18,
      });
    },
    [safeUrl, alt, hasImageError],
  );

  const handleMouseMove = useCallback((event) => {
    setHoverPreview((prev) => {
      if (!prev?.src) {
        return prev;
      }

      return {
        ...prev,
        x: event.clientX + 18,
        y: event.clientY + 18,
      };
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverPreview(null);
  }, []);

  return (
    <>
      <div
        className={styles.itemIcon}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {safeUrl && !hasImageError ? (
          <img
            src={safeUrl}
            alt={alt}
            onError={() => {
              setHasImageError(true);
              setHoverPreview(null);
            }}
          />
        ) : (
          <div className={styles.placeholderIcon}>
            {placeholderIcon || (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            )}
          </div>
        )}
      </div>

      {hoverPreview?.src && (
        <div
          className={styles.hoverImagePreview}
          style={{ left: hoverPreview.x, top: hoverPreview.y }}
        >
          <img
            src={hoverPreview.src}
            alt={hoverPreview.alt || 'hover-preview'}
            className={styles.hoverImagePreviewLarge}
          />
        </div>
      )}
    </>
  );
};

export default SearchSideBarListIcon;
