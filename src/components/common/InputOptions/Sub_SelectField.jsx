import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Sub_SelectField.module.css';
import dropdownLogo from '../../../assets/dropdown.svg';

const isOptionObject = (o) => typeof o === 'object' && o !== null;

const getNameFromOption = (option) =>
  isOptionObject(option) ? option.name : option;

const getIdFromOption = (option) =>
  isOptionObject(option) ? option.id : option;

const Sub_SelectField = ({
  id,
  buttonAltText = 'Toggle dropdown menu',
  options = [],
  selectedValue,
  onOptionClick = () => {},
  buttonClassName = '',
  listClassName = '',
  placeholder = 'Select an option',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const firstItemRef = useRef(null);

  const combinedButtonClasses = useMemo(
    () => `${styles.dropdown_btn} ${buttonClassName}`.trim(),
    [buttonClassName]
  );
  const combinedListClasses = useMemo(
    () => `${styles.list_box} ${listClassName}`.trim(),
    [listClassName]
  );

  const displayText = useMemo(() => {
    if (
      selectedValue === undefined ||
      selectedValue === null ||
      selectedValue === ''
    ) {
      return placeholder;
    }
    // Match by id/value for object options
    if (options.length && options.some(isOptionObject)) {
      const found = options.find(
        (opt) => getIdFromOption(opt) === selectedValue
      );
      return found ? getNameFromOption(found) : placeholder;
    }
    // For string options
    return options.includes(selectedValue) ? selectedValue : placeholder;
  }, [options, selectedValue, placeholder]);

  const openDropdown = useCallback(() => setOpen(true), []);
  const closeDropdown = useCallback(() => setOpen(false), []);
  const toggleDropdown = useCallback(() => setOpen((p) => !p), []);

  // Outside click close
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      // Capture phase pointerdown to track outside interactions reliably
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('touchstart', onPointerDown, true);
    };
  }, [open]);

  // Keyboard handling on button
  const onButtonKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        openDropdown();
        // focus first item after next paint
        requestAnimationFrame(() => {
          firstItemRef.current?.focus();
        });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
      }
    },
    [toggleDropdown, openDropdown, closeDropdown]
  );

  const handleSelect = useCallback(
    (option) => {
      const value = getIdFromOption(option);
      onOptionClick(value);
      closeDropdown();
    },
    [onOptionClick, closeDropdown]
  );

  return (
    <div className={styles.dropdown_container} ref={containerRef}>
      <button
        id={id}
        className={combinedButtonClasses}
        onClick={toggleDropdown}
        onKeyDown={onButtonKeyDown}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
      >
        <span className={styles.selected_text}>{displayText}</span>
        <img
          src={dropdownLogo}
          alt={buttonAltText}
          className={styles.dropdown_icon}
        />
      </button>

      {open && (
        <div
          id={`${id}-list`}
          className={combinedListClasses}
          role="listbox"
          aria-labelledby={id}
        >
          {options.map((option, index) => {
            const value = getIdFromOption(option);
            const name = getNameFromOption(option);
            const isSelected = value === selectedValue;
            const ref = index === 0 ? firstItemRef : undefined;

            return (
              <div
                key={String(value)}
                ref={ref}
                className={`${styles.list_item} ${
                  isSelected ? styles.selected : ''
                }`}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleSelect(option)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(option);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    closeDropdown();
                  }
                }}
              >
                {name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

Sub_SelectField.propTypes = {
  id: PropTypes.string.isRequired,
  buttonAltText: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        name: PropTypes.string.isRequired,
      }),
    ])
  ),
  selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onOptionClick: PropTypes.func,
  buttonClassName: PropTypes.string,
  listClassName: PropTypes.string,
  placeholder: PropTypes.string,
};

export default Sub_SelectField;
