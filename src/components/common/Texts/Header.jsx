import PropTypes from 'prop-types';
import styles from './Header.module.css';

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
};

/**
 * Header Component
 * Accessible, semantic heading with consistent typography.
 *
 * as: h1-h6 — semantic heading level (default h2).
 * size: XL | L | M | S | XS — control font size/weight (default M).
 * color: primary | muted | accent | blue, or any CSS color string.
 * weight: regular | medium | semibold | bold (optional; size default wins).
 * subtitle: optional secondary text line below the heading.
 * icon: optional node rendered before the title text.
 */
const Header = ({
  children,
  text,
  as: Tag = 'h2',
  size = 'M',
  color = 'primary',
  weight,
  align = 'left',
  subtitle,
  icon,
  className = '',
  id,
}) => {
  const normalizedSize = String(size || 'M')
    .trim()
    .toUpperCase();
  const sizeKey = SIZE_MAP[normalizedSize] || 'm';

  const colorClass = COLOR_MAP[color] || '';

  const rootClass = [
    styles.titleWrap,
    styles[`align_${align}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const headingClass = [
    styles.title,
    styles[`size_${sizeKey}`],
    colorClass,
    weight ? styles[`weight_${weight}`] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const customColorStyle = colorClass
    ? undefined
    : { color: typeof color === 'string' ? color : undefined };

  const content = text ?? children;

  return (
    <div className={rootClass} id={id}>
      <Tag className={headingClass} style={customColorStyle}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {content}
      </Tag>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
};

Header.propTypes = {
  children: PropTypes.node,
  text: PropTypes.node,
  as: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
  size: PropTypes.oneOf(['XL', 'L', 'M', 'S', 'XS', 'xl', 'l', 'm', 's', 'xs']),
  color: PropTypes.string,
  weight: PropTypes.oneOf(['regular', 'medium', 'semibold', 'bold']),
  align: PropTypes.oneOf(['left', 'center', 'right']),
  subtitle: PropTypes.node,
  icon: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default Header;
