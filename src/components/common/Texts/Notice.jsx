import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Notice.module.css';

const VARIANT_CLASS = {
  info: 'variantInfo',
  success: 'variantSuccess',
  warning: 'variantWarning',
  error: 'variantError',
  neutral: 'variantNeutral',
};

const DEFAULT_ICONS = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
};

/**
 * Notice Component
 * Inline alert/message with variant styling and optional dismiss.
 *
 * variant: info | success | warning | error | neutral.
 * title: optional bold heading line.
 * icon: icon node; pass `false` to hide (default uses a variant glyph).
 * dismissible: adds a close button that hides the notice.
 */
const Notice = ({
  children,
  text,
  variant = 'info',
  title,
  icon,
  dismissible = false,
  onDismiss,
  className = '',
  role,
}) => {
  const [dismissed, setDismissed] = useState(false);

  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.info;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  };

  if (dismissed) {
    return null;
  }

  const content = text ?? children;
  const resolvedIcon = icon === false ? null : (icon ?? DEFAULT_ICONS[variant]);

  return (
    <div
      className={`${styles.notice} ${variantClass} ${className}`.trim()}
      role={role || (variant === 'error' ? 'alert' : 'status')}
    >
      {resolvedIcon != null && (
        <span className={styles.icon} aria-hidden="true">
          {resolvedIcon}
        </span>
      )}
      <div className={styles.body}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{content}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          className={styles.dismissBtn}
          onClick={handleDismiss}
          aria-label="Dismiss notice"
          title="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

Notice.propTypes = {
  children: PropTypes.node,
  text: PropTypes.node,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'neutral']),
  title: PropTypes.node,
  icon: PropTypes.node,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
  role: PropTypes.string,
};

export default Notice;
