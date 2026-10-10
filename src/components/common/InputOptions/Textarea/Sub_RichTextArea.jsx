import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import styles from './Sub_RichTextArea.module.css';

const DEFAULT_TOOLBAR = [
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
];

const getPlainLength = (text) => String(text || '').replace(/\n$/, '').length;

/**
 * Rich-text editor built on Quill (snow theme).
 * Emits HTML via `onValueChange(html)`.
 */
const Sub_RichTextArea = ({
  id,
  value = '',
  onValueChange,
  placeholder = '',
  maxLength,
  fullHeight = false,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  ariaLabel,
  ariaDescribedBy,
  toolbar = DEFAULT_TOOLBAR,
}) => {
  const mountRef = useRef(null);
  const quillRef = useRef(null);
  const htmlRef = useRef(null);
  const [plainLength, setPlainLength] = useState(0);

  // Keep the latest onChange callback without re-initializing the editor.
  const onValueChangeRef = useRef(onValueChange);
  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  // Initialize Quill exactly once per mount.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || quillRef.current) return undefined;

    const quill = new Quill(mount, {
      theme: 'snow',
      placeholder: placeholder || '',
      modules: {
        toolbar: toolbar === false ? false : toolbar,
      },
    });

    quillRef.current = quill;

    if (id && quill.root) {
      quill.root.id = id;
    }

    quill.on('text-change', () => {
      const html = quill.root.innerHTML;

      if (typeof maxLength === 'number') {
        const currentLength = getPlainLength(quill.getText());
        if (currentLength > maxLength) {
          // Revert to the last accepted HTML and keep the editor within limit.
          quill.setContents(
            quill.clipboard.convert({ html: htmlRef.current || '' }),
            'silent',
          );
          setPlainLength(getPlainLength(quill.getText()));
          return;
        }
        setPlainLength(currentLength);
      } else {
        setPlainLength(getPlainLength(quill.getText()));
      }

      if (htmlRef.current === html) return;
      htmlRef.current = html;
      onValueChangeRef.current(html);
    });

    if (autoFocus) {
      quill.focus();
    }

    return () => {
      // Quill's snow theme inserts the toolbar as a sibling of the mount node,
      // so it isn't covered by `mount.innerHTML = ''`. Remove it explicitly to
      // avoid duplicate toolbars under StrictMode's double-invoke.
      const quill = quillRef.current;
      const toolbar = quill?.getModule?.('toolbar')?.container;
      if (toolbar?.parentNode) {
        toolbar.parentNode.removeChild(toolbar);
      }
      quillRef.current = null;
      htmlRef.current = null;
      if (mount) {
        mount.innerHTML = '';
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync externally-driven value changes (e.g. defaultValue updates).
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    const normalized = value || '';
    if (htmlRef.current === normalized) return;

    const hadFocus = typeof quill.hasFocus === 'function' && quill.hasFocus();
    const selection = quill.getSelection();

    quill.setContents(quill.clipboard.convert({ html: normalized }), 'silent');
    htmlRef.current = normalized;
    setPlainLength(getPlainLength(quill.getText()));

    if (hadFocus && selection) {
      quill.setSelection(selection.index, selection.length, 'silent');
    }
  }, [value]);

  // Reflect disabled/readOnly into Quill's editing state.
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    quill.enable(!(disabled || readOnly));
  }, [disabled, readOnly]);

  // Keep the snow placeholder in sync if it changes after mount.
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || !quill.root) return;
    quill.root.dataset.placeholder = placeholder || '';
  }, [placeholder]);

  // Reflect aria attributes onto the actual contenteditable (.ql-editor)
  // rather than the outer mount container.
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || !quill.root) return;
    if (ariaLabel != null) quill.root.setAttribute('aria-label', ariaLabel);
    else quill.root.removeAttribute('aria-label');
    if (ariaDescribedBy != null) {
      quill.root.setAttribute('aria-describedby', ariaDescribedBy);
    } else {
      quill.root.removeAttribute('aria-describedby');
    }
  }, [ariaLabel, ariaDescribedBy]);

  return (
    <div
      className={`${styles.fieldContainer} ${
        fullHeight ? styles.fullHeight : ''
      } ${disabled || readOnly ? styles.isDisabled : ''}`}
    >
      <div
        ref={mountRef}
        className={`${styles.editorMount} ${
          fullHeight ? styles.editorFullHeight : ''
        }`}
      />
      {typeof maxLength === 'number' && (
        <div className={styles.counter}>
          {plainLength} / {maxLength}
        </div>
      )}
    </div>
  );
};

Sub_RichTextArea.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  onValueChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  fullHeight: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  toolbar: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
};

export default Sub_RichTextArea;
