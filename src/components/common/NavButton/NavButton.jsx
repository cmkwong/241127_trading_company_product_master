import PropTypes from 'prop-types';
import styles from './NavButton.module.css';

/**
 * NavButton Component
 * Accessible, styled navigation button used in the TopBar.
 *
 * active: visually marks the currently selected navigation item.
 * children: label content (string or node).
 */
const NavButton = ({
  active = false,
  onClick,
  children,
  ariaLabel,
  className = '',
  disabled = false,
  title,
}) => {
  const buttonClass = [styles.navBtn, active ? styles.active : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

NavButton.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  title: PropTypes.string,
};

export default NavButton;
