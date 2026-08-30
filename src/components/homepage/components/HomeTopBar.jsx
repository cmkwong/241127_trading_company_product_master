import { useState } from 'react';
import Sub_TextField from '../../common/InputOptions/TextField/Sub_TextField';
import styles from './HomeTopBar.module.css';

const TOP_BANNER_TEXT =
  'Globally sourced from China, Japan, Vietnam, Philippines and Southeast Asia';

const HomeTopBar = () => {
  const [query, setQuery] = useState('');

  return (
    <header className={styles.headerShell}>
      <div className={styles.topBanner}>{TOP_BANNER_TEXT}</div>

      <div className={styles.navBar}>
        <div className={styles.brand}>
          <img
            className={styles.brandIcon}
            src="/assets/brand_logos/RIVOLX_Logos_new_color_pure.svg"
            alt="Rivolx"
          />
          <div className={styles.brandTextWrap}>
            <p className={styles.brandName}>RIVOLX</p>
            <p className={styles.brandTagline}>Your Pets Our Passion</p>
          </div>
        </div>

        <div className={styles.searchRow}>
          <div className={styles.searchInputWrap}>
            <div className={styles.searchIcon} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="M11.4 11.4L15 15M13.2 7.1C13.2 10.47 10.47 13.2 7.1 13.2C3.73 13.2 1 10.47 1 7.1C1 3.73 3.73 1 7.1 1C10.47 1 13.2 3.73 13.2 7.1Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <Sub_TextField
              value={query}
              onInputChange={(_, nextValue) => setQuery(nextValue)}
              placeholder="Search products..."
              className={styles.searchInput}
            />

            <button type="button" className={styles.searchButton}>
              Search
            </button>
          </div>

          <button
            type="button"
            className={styles.imageSearchButton}
            aria-label="Search by image"
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path
                d="M3.5 5.5C3.5 4.4 4.4 3.5 5.5 3.5H14.5C15.6 3.5 16.5 4.4 16.5 5.5V14.5C16.5 15.6 15.6 16.5 14.5 16.5H5.5C4.4 16.5 3.5 15.6 3.5 14.5V5.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="10"
                cy="10"
                r="3.2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="13.6" cy="6.4" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionIcon}
            aria-label="Notifications"
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path
                d="M10 18.2C11.2 18.2 12.1 17.3 12.1 16.1H7.9C7.9 17.3 8.8 18.2 10 18.2ZM16 14.9H4L5.3 13.2V9.3C5.3 6.8 6.9 4.7 9.1 4.1V3.6C9.1 3.1 9.5 2.7 10 2.7C10.5 2.7 10.9 3.1 10.9 3.6V4.1C13.1 4.7 14.7 6.8 14.7 9.3V13.2L16 14.9Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            type="button"
            className={styles.actionIcon}
            aria-label="Shopping cart"
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path
                d="M2.5 3.5H4.3L6 12.1H14.5L16.2 6.2H5.4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="7.4" cy="15.4" r="1.2" fill="currentColor" />
              <circle cx="13.9" cy="15.4" r="1.2" fill="currentColor" />
            </svg>
          </button>

          <button type="button" className={styles.userButton}>
            <img src="/assets/icons/admin_user_icon.svg" alt="User profile" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default HomeTopBar;
