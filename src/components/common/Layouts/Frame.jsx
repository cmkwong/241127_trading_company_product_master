import PropTypes from 'prop-types';
import styles from './Frame.module.css';

const ALIGNMENTS = {
  'top left': { horizontal: 'flex-start', vertical: 'flex-start' },
  'top center': { horizontal: 'center', vertical: 'flex-start' },
  'top right': { horizontal: 'flex-end', vertical: 'flex-start' },
  left: { horizontal: 'flex-start', vertical: 'center' },
  center: { horizontal: 'center', vertical: 'center' },
  right: { horizontal: 'flex-end', vertical: 'center' },
  'bottom left': { horizontal: 'flex-start', vertical: 'flex-end' },
  'bottom center': { horizontal: 'center', vertical: 'flex-end' },
  'bottom right': { horizontal: 'flex-end', vertical: 'flex-end' },
};

const normalizeAlignment = (alignment) =>
  String(alignment)
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ');

const getDimension = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'number') {
    return `${value}px`;
  }

  const normalizedValue = String(value).trim().toLowerCase();
  if (normalizedValue === 'hug content' || normalizedValue === 'hug') {
    return 'fit-content';
  }

  if (normalizedValue === 'fill container' || normalizedValue === 'fill') {
    return '100%';
  }

  return value;
};

const getSpacing = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  return typeof value === 'number' ? `${value}px` : value;
};

/**
 * Flexible layout wrapper for arranging child elements with CSS flexbox.
 *
 * Example:
 * <Frame
 *   direction="horizontal"
 *   width="fill container"
 *   alignment="center"
 *   gap="auto"
 *   horizontal_padding={24}
 *   vertical_padding={12}
 *   clip_content
 * >
 *   <BackButton />
 *   <SaveButton />
 * </Frame>
 *
 * `direction` supports `vertical` / `column` and `horizontal` / `row`.
 * `width` and `height` accept a number (pixels), a CSS value, `hug content`,
 * or `fill container`. `alignment` accepts the nine visual positions, such as
 * `top left`, `center`, and `bottom right`. Use `gap="auto"` to distribute
 * children across the main axis with `space-between`.
 *
 * Both snake_case (`horizontal_padding`, `clip_content`) and React-style
 * camelCase (`horizontalPadding`, `clipContent`) props are supported.
 */
const Frame = ({
  children,
  direction = 'vertical',
  width = 'fill container',
  height,
  alignment,
  gap = 0,
  horizontal_padding,
  vertical_padding,
  horizontalPadding,
  verticalPadding,
  clip_content,
  clipContent,
  className = '',
  style,
  ...rest
}) => {
  const normalizedDirection = String(direction).trim().toLowerCase();
  const isHorizontal =
    normalizedDirection === 'horizontal' || normalizedDirection === 'row';
  const hasExplicitAlignment = alignment !== undefined && alignment !== null;
  const resolvedAlignment =
    ALIGNMENTS[normalizeAlignment(alignment ?? 'top left')] ??
    ALIGNMENTS['top left'];
  const resolvedHorizontalPadding =
    horizontalPadding ?? horizontal_padding ?? 0;
  const resolvedVerticalPadding = verticalPadding ?? vertical_padding ?? 0;
  const shouldClipContent = clipContent ?? clip_content ?? false;
  const hasAutoGap = String(gap).trim().toLowerCase() === 'auto';

  const layoutStyle = {
    flexDirection: isHorizontal ? 'row' : 'column',
    width: getDimension(width),
    height: getDimension(height),
    justifyContent: hasAutoGap
      ? 'space-between'
      : isHorizontal
        ? resolvedAlignment.horizontal
        : resolvedAlignment.vertical,
    alignItems: isHorizontal
      ? hasExplicitAlignment
        ? resolvedAlignment.vertical
        : 'stretch'
      : hasExplicitAlignment
        ? resolvedAlignment.horizontal
        : 'stretch',
    gap: hasAutoGap ? undefined : getSpacing(gap),
    padding: `${getSpacing(resolvedVerticalPadding)} ${getSpacing(
      resolvedHorizontalPadding,
    )}`,
    overflow: shouldClipContent ? 'hidden' : undefined,
    ...style,
  };

  return (
    <div
      className={`${styles.flow} ${isHorizontal ? styles.horizontal : ''} ${
        hasExplicitAlignment ? styles.hasExplicitAlignment : ''
      } ${className}`.trim()}
      style={layoutStyle}
      {...rest}
    >
      {children}
    </div>
  );
};

Frame.propTypes = {
  children: PropTypes.node,
  direction: PropTypes.oneOf(['vertical', 'horizontal', 'row', 'column']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  alignment: PropTypes.string,
  gap: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  horizontal_padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  vertical_padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  horizontalPadding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  verticalPadding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  clip_content: PropTypes.bool,
  clipContent: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Frame;
