import { useCallback, useEffect, useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './Main_Modal.module.css';

const DRAG_MARGIN = 8;

/**
 * Main_Modal
 * Reusable modal shell shared across modules.
 *
 * Provides a consistent backdrop / window / header / body / footer structure,
 * with an optional draggable header (grab the title bar to move the window).
 * Footer and body are pure slots so each consumer owns its own content and
 * styling while inheriting the shared layout and behaviour.
 */
const Main_Modal = ({
  isOpen = true,
  title,
  subtitle,
  onClose,
  children,
  footer,
  footerMessage,
  headerActions,
  size = 'md',
  width,
  height,
  draggable = true,
  bodyScrollable = true,
  closeOnBackdropClick = true,
  showCloseButton = true,
  zIndex = 2000,
  usePortal = true,
  className = '',
  overlayClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  ariaLabel,
}) => {
  const titleId = useId();
  const modalRef = useRef(null);
  const dragStateRef = useRef(null);
  const [position, setPosition] = useState(null);

  // Reset drag position and in-flight drag state whenever the modal (re)opens.
  useEffect(() => {
    if (isOpen) {
      setPosition(null);
      dragStateRef.current = null;
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') onClose();
  }, [onClose]);

  // Close on Escape while open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const handleBackdropClick = (event) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleHeaderPointerDown = (event) => {
    if (!draggable) return;
    // Only respond to the primary mouse button (or touch/pen).
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // Do not start a drag from interactive or explicitly excluded elements.
    if (
      event.target.closest('button, a, input, select, textarea, [data-no-drag]')
    ) {
      return;
    }

    const modal = modalRef.current;
    if (!modal) return;

    const rect = modal.getBoundingClientRect();
    dragStateRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    // Anchor the window at its current (centered) spot so it does not jump.
    setPosition({ left: rect.left, top: rect.top });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleHeaderPointerMove = (event) => {
    if (!dragStateRef.current || !modalRef.current) return;

    const rect = modalRef.current.getBoundingClientRect();
    const maxLeft = Math.max(
      DRAG_MARGIN,
      window.innerWidth - rect.width - DRAG_MARGIN,
    );
    const maxTop = Math.max(
      DRAG_MARGIN,
      window.innerHeight - rect.height - DRAG_MARGIN,
    );

    setPosition({
      left: Math.min(
        Math.max(event.clientX - dragStateRef.current.offsetX, DRAG_MARGIN),
        maxLeft,
      ),
      top: Math.min(
        Math.max(event.clientY - dragStateRef.current.offsetY, DRAG_MARGIN),
        maxTop,
      ),
    });
  };

  const handleHeaderPointerEnd = (event) => {
    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!isOpen) return null;

  const hasHeader =
    Boolean(title) ||
    Boolean(subtitle) ||
    Boolean(headerActions) ||
    showCloseButton;

  const windowStyle = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(position
      ? { left: `${position.left}px`, top: `${position.top}px`, transform: 'none' }
      : {}),
  };

  const sizeClass =
    styles[`size${size.charAt(0).toUpperCase()}${size.slice(1)}`] || '';

  const content = (
    <div
      className={`${styles.overlay} ${overlayClassName}`.trim()}
      style={{ zIndex }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={ariaLabel}
        className={`${styles.window} ${sizeClass} ${className}`.trim()}
        style={windowStyle}
      >
        {hasHeader ? (
          <div
            className={`${styles.header} ${
              draggable ? styles.headerDraggable : ''
            } ${headerClassName}`.trim()}
            onPointerDown={handleHeaderPointerDown}
            onPointerMove={handleHeaderPointerMove}
            onPointerUp={handleHeaderPointerEnd}
            onPointerCancel={handleHeaderPointerEnd}
          >
            <div className={styles.titleBlock}>
              {title ? (
                <div className={styles.title} id={titleId}>
                  {title}
                </div>
              ) : null}
              {subtitle ? (
                <div className={styles.subtitle}>{subtitle}</div>
              ) : null}
            </div>
            <div className={styles.headerRight}>
              {headerActions}
              {showCloseButton ? (
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={handleClose}
                  aria-label="Close"
                >
                  ✕
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className={`${styles.body} ${
            bodyScrollable ? styles.bodyScrollable : ''
          } ${bodyClassName}`.trim()}
        >
          {children}
        </div>

        {footer || footerMessage ? (
          <div className={`${styles.footer} ${footerClassName}`.trim()}>
            {footerMessage ? (
              <span
                className={styles.footerMessage}
                role="status"
                aria-live="polite"
              >
                {footerMessage}
              </span>
            ) : null}
            {footer
              ? footerMessage
                ? <div className={styles.footerSlot}>{footer}</div>
                : footer
              : null}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (!usePortal) return content;

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
};

Main_Modal.propTypes = {
  isOpen: PropTypes.bool,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  onClose: PropTypes.func,
  children: PropTypes.node,
  footer: PropTypes.node,
  footerMessage: PropTypes.node,
  headerActions: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  draggable: PropTypes.bool,
  bodyScrollable: PropTypes.bool,
  closeOnBackdropClick: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  zIndex: PropTypes.number,
  usePortal: PropTypes.bool,
  className: PropTypes.string,
  overlayClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default Main_Modal;
