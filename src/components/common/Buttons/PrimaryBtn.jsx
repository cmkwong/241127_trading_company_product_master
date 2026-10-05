import PropTypes from 'prop-types';
import styles from './PrimaryBtn.module.css';

/**
 * PrimaryBtn Component
 * Accent (coral) primary action button shared across auth panels and CTAs.
 *
 * text/children: button label.
 * type: native button type (default 'button').
 * onClick: click handler.
 * disabled: disables and dims the button.
 * fullWidth: expands to fill the container width.
 * className: extra classes appended to the root.
 */
const PrimaryBtn = ({
  text,
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
}) => {
  const label = text ?? children;

  return (
    <button
      type={type}
      className={`${styles.primaryBtn} ${
        fullWidth ? styles.fullWidth : ''
      } ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

PrimaryBtn.propTypes = {
  text: PropTypes.node,
  children: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  fullWidth: PropTypes.bool,
};

export default PrimaryBtn;
