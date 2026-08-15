import { useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './Main_RadioGroup.module.css';

const SIZE_WIDTH = {
  S: 140,
  M: 200,
  L: 260,
  XL: 320,
};

/**
 * Main_RadioGroup Component
 * Accessible radiogroup with radio-dot visuals.
 *
 * options: Array of { value, label } pairs. Values can be strings, numbers,
 *          or booleans (selection uses strict equality).
 * variant: 'toggle' (simple flex row) or 'segment' (segmented control).
 * size: S | M | L | XL | 100% — controls the overall group width. Segment
 *       cells are split equally across that width.
 */
const Main_RadioGroup = ({
  options = [],
  value,
  onChange = () => {},
  ariaLabel = 'Options',
  variant = 'toggle',
  size = 'M',
  disabled = false,
  name,
}) => {
  const isSegment = variant === 'segment';

  const normalizedSize = useMemo(() => {
    const candidate = String(size || 'M')
      .trim()
      .toUpperCase();
    if (SIZE_WIDTH[candidate]) return candidate;
    if (['100%', 'FULL', 'FULLWIDTH'].includes(candidate)) return '100%';
    return 'M';
  }, [size]);

  const resolvedWidth = useMemo(
    () =>
      normalizedSize === '100%' ? '100%' : `${SIZE_WIDTH[normalizedSize]}px`,
    [normalizedSize],
  );

  const groupStyle = useMemo(
    () => ({ width: resolvedWidth, maxWidth: '100%' }),
    [resolvedWidth],
  );

  const groupClassName = useMemo(
    () =>
      `${styles.radioGroup} ${isSegment ? styles.segment : styles.toggle}`.trim(),
    [isSegment],
  );

  return (
    <div
      className={groupClassName}
      style={groupStyle}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const optionValue = option?.value;
        const isActive = optionValue === value;

        return (
          <button
            key={String(optionValue)}
            type="button"
            role="radio"
            aria-checked={isActive}
            name={name}
            disabled={disabled}
            className={`${styles.item} ${isSegment ? styles.segmentItem : ''} ${
              isActive ? styles.active : ''
            }`.trim()}
            onClick={() => onChange(optionValue)}
          >
            <span
              className={`${styles.radio} ${
                isSegment ? styles.segmentRadio : ''
              }`.trim()}
            >
              <span
                className={
                  isActive ? styles.radioInner : styles.inactiveRadioInner
                }
              />
            </span>
            {option?.label}
          </button>
        );
      })}
    </div>
  );
};

Main_RadioGroup.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
      ]).isRequired,
      label: PropTypes.node.isRequired,
    }),
  ),
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]),
  onChange: PropTypes.func,
  ariaLabel: PropTypes.string,
  variant: PropTypes.oneOf(['toggle', 'segment']),
  size: PropTypes.oneOf([
    'S',
    'M',
    'L',
    'XL',
    '100%',
    'FULL',
    'FULLWIDTH',
    's',
    'm',
    'l',
    'xl',
    'full',
    'fullwidth',
  ]),
  disabled: PropTypes.bool,
  name: PropTypes.string,
};

export default Main_RadioGroup;
