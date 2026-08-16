import PropTypes from 'prop-types';
import styles from './Label.module.css';

const SIZE_MAP = {
  XL: 'xl',
  L: 'l',
  M: 'm',
  S: 's',
  XS: 'xs',
};

const COLOR_MAP = {
  primary: 'colorPrimary',
  muted: 'colorMuted',
  accent: 'colorAccent',
  blue: 'colorBlue',
  success: 'colorSuccess',
  error: 'colorError',
};

/**
 * Label Component
 * Accessible form-field label with consistent typography.
 *
 * htmlFor: when provided renders a real <label>, otherwise a <span>.
 * size: XL | L | M | S | XS — control font size/weight (default M).
 * color: primary | muted | accent | blue | success | error, or any CSS color.
 * weight: regular | medium | semibold | bold (optional; size default wins).
 * required: renders a trailing red asterisk.
 * icon: optional node rendered before the label text.
 */
const Label = ({
  children,
  text,
  htmlFor,
  size = 'M',
  color = 'primary',
  weight,
  required = false,
  icon,
  className = '',
  id,
}) => {
  const normalizedSize = String(size || 'M')
    .trim()
    .toUpperCase();
  const sizeKey = SIZE_MAP[normalizedSize] || 'm';

  const colorClass = COLOR_MAP[color] || '';

  const labelClass = [
    styles.label,
    styles[`size_${sizeKey}`],
    colorClass,
    weight ? styles[`weight_${weight}`] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const customColorStyle = colorClass
    ? undefined
    : { color: typeof color === 'string' ? color : undefined };

  const content = text ?? children;

  const inner = (
    <>
      {icon && <span className={styles.icon}>{icon}</span>}
      {content}
      {required && (
        <span className={styles.requiredMark} aria-hidden="true">
          *
        </span>
      )}
    </>
  );

  if (htmlFor) {
    return (
      <label
        htmlFor={htmlFor}
        className={labelClass}
        style={customColorStyle}
        id={id}
      >
        {inner}
      </label>
    );
  }

  return (
    <span className={labelClass} style={customColorStyle} id={id}>
      {inner}
    </span>
  );
};

Label.propTypes = {
  children: PropTypes.node,
  text: PropTypes.node,
  htmlFor: PropTypes.string,
  size: PropTypes.oneOf(['XL', 'L', 'M', 'S', 'XS', 'xl', 'l', 'm', 's', 'xs']),
  color: PropTypes.string,
  weight: PropTypes.oneOf(['regular', 'medium', 'semibold', 'bold']),
  required: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default Label;
