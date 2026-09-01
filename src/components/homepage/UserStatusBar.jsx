import Header from '../common/Texts/Header';
import Label from '../common/Texts/Label';
import styles from './UserStatusBar.module.css';

const renderShortcutIcon = (icon) => {
  if (icon === 'cart') {
    return (
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
    );
  }

  if (icon === 'heart') {
    return (
      <svg viewBox="0 0 20 20" fill="none">
        <path
          d="M10 16.4L4.2 10.8C2.8 9.4 2.8 7 4.2 5.6C5.6 4.2 8 4.2 9.4 5.6L10 6.2L10.6 5.6C12 4.2 14.4 4.2 15.8 5.6C17.2 7 17.2 9.4 15.8 10.8L10 16.4Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === 'doc') {
    return (
      <svg viewBox="0 0 20 20" fill="none">
        <path
          d="M6 2.8H12.5L16 6.3V17.2H6V2.8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M9 9.2H13" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 12H13" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 6V10L12.7 11.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

const UserStatusBar = ({ shortcuts, stats }) => {
  return (
    <section className={styles.userStatusBar}>
      <div className={styles.profileBlock}>
        <div>
          <Header as="h3" size="S" color="#0c1e36" weight="semibold">
            Welcome back, GlobalBuyer_420
          </Header>
          <p className={styles.accountHint}>Verified B2B Business Account</p>
        </div>
        <span className={styles.memberBadge}>V2 Member</span>
      </div>

      <div className={styles.shortcutsRow}>
        {shortcuts.map((item) => (
          <button key={item.id} type="button" className={styles.shortcutButton}>
            <span className={styles.shortcutIcon}>
              {renderShortcutIcon(item.icon)}
            </span>
            <Label size="XS" weight="medium" className={styles.shortcutLabel}>
              {item.label}
            </Label>
          </button>
        ))}
      </div>

      <div className={styles.statsRow}>
        {stats.map((item) => (
          <div key={item.id} className={styles.statCard}>
            <p className={styles.statValue}>{item.value}</p>
            <p className={styles.statLabel}>{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UserStatusBar;
