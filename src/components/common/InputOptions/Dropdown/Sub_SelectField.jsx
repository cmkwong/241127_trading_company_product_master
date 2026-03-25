import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './Sub_SelectField.module.css';
import dropdownLogo from '../../../../assets/dropdown.svg';

// Allow options to be either primitive strings or structured { id, name } objects
const isOptionObject = (o) => typeof o === 'object' && o !== null;

const getNameFromOption = (option) =>
  isOptionObject(option) ? option.name : option;

const getIdFromOption = (option) =>
  isOptionObject(option) ? option.id : option;

const isSameOptionValue = (left, right) => {
  if (left === right) return true;
  if (left === undefined || left === null) return false;
  if (right === undefined || right === null) return false;
  return String(left) === String(right);
};

const Sub_SelectField = ({
  id,
  buttonAltText = 'Toggle dropdown menu',
  options = [],
  selectedValue,
  onOptionClick = () => {},
  buttonClassName = '',
  buttonStyle,
  listClassName = '',
  placeholder = 'Select an option',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const buttonRef = useRef(null);
  const firstItemRef = useRef(null);
  const [listStyle, setListStyle] = useState(null);

  const combinedButtonClasses = useMemo(
    () => `${styles.dropdown_btn} ${buttonClassName}`.trim(),
    [buttonClassName],
  );
  const combinedListClasses = useMemo(
    () => `${styles.list_box} ${listClassName}`.trim(),
    [listClassName],
  );

  // Resolve the label presented on the button regardless of option shape
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
      const found = options.find((opt) =>
        isSameOptionValue(getIdFromOption(opt), selectedValue),
      );
      return found ? getNameFromOption(found) : placeholder;
    }
    // For string options
    return options.some((opt) => isSameOptionValue(opt, selectedValue))
      ? selectedValue
      : placeholder;
  }, [options, selectedValue, placeholder]);

  const openDropdown = useCallback(() => setOpen(true), []);
  const closeDropdown = useCallback(() => setOpen(false), []);
  const toggleDropdown = useCallback(() => setOpen((p) => !p), []);

  // Close menu when pointer interaction occurs outside of the container
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      // Capture phase pointerdown to track outside interactions reliably
      if (!containerRef.current) return;
      const clickedInsideContainer = containerRef.current.contains(e.target);
      const clickedInsideList = listRef.current?.contains(e.target);
      if (!clickedInsideContainer && !clickedInsideList) {
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

  useEffect(() => {
    if (!open) {
      setListStyle(null);
      return;
    }

    const updateListPosition = () => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      const estimatedListHeight = 240;
      const spaceBelow = viewportHeight - rect.bottom;
      const openUpward =
        spaceBelow < estimatedListHeight && rect.top > spaceBelow;

      const top = openUpward
        ? Math.max(8, rect.top - estimatedListHeight - 4)
        : rect.bottom + 4;

      setListStyle({
        position: 'fixed',
        left: rect.left,
        top,
        width: rect.width,
        zIndex: 9999,
      });
    };

    updateListPosition();

    window.addEventListener('resize', updateListPosition);
    window.addEventListener('scroll', updateListPosition, true);

    return () => {
      window.removeEventListener('resize', updateListPosition);
      window.removeEventListener('scroll', updateListPosition, true);
    };
  }, [open]);

  // Handle keyboard navigation patterns expected for accessible menus
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
    [toggleDropdown, openDropdown, closeDropdown],
  );

  // Normalize the selected value then notify parent and close the menu
  const handleSelect = useCallback(
    (option) => {
      const value = getIdFromOption(option);
      onOptionClick(value);
      closeDropdown();
    },
    [onOptionClick, closeDropdown],
  );

  return (
    <div className={styles.dropdown_container} ref={containerRef}>
      <button
        id={id}
        ref={buttonRef}
        className={combinedButtonClasses}
        style={buttonStyle}
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

      {open &&
        createPortal(
          <div
            id={`${id}-list`}
            ref={listRef}
            className={combinedListClasses}
            style={listStyle || undefined}
            role="listbox"
            aria-labelledby={id}
          >
            {options.map((option, index) => {
              const value = getIdFromOption(option);
              const name = getNameFromOption(option);
              const isSelected = isSameOptionValue(value, selectedValue);
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
          </div>,
          document.body,
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
    ]),
  ),
  selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onOptionClick: PropTypes.func,
  buttonClassName: PropTypes.string,
  buttonStyle: PropTypes.object,
  listClassName: PropTypes.string,
  placeholder: PropTypes.string,
};

export default Sub_SelectField;
