import { useState } from 'react';
import styles from './Main_SavePage.module.css';

const isLikelyBase64String = (value) => {
  if (typeof value !== 'string') return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  if (/^data:[^;]+;base64,/i.test(trimmed)) {
    return true;
  }

  if (trimmed.length < 120) {
    return false;
  }

  const normalized = trimmed.replace(/\s+/g, '');
  if (normalized.length % 4 !== 0) {
    return false;
  }

  return /^[A-Za-z0-9+/=]+$/.test(normalized);
};

const getBase64Placeholder = (key, value) => {
  const keyName = String(key || '').toLowerCase();
  const text = typeof value === 'string' ? value : '';

  if (keyName.includes('image') || /^data:image\//i.test(text)) {
    return '[base64_image]';
  }

  return '[base64_file]';
};

const sanitizeDryRunPreview = (input, parentKey = '') => {
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeDryRunPreview(item, parentKey));
  }

  if (input && typeof input === 'object') {
    return Object.entries(input).reduce((acc, [key, value]) => {
      acc[key] = sanitizeDryRunPreview(value, key);
      return acc;
    }, {});
  }

  if (typeof input === 'string') {
    const keyName = String(parentKey || '').toLowerCase();
    const keySaysBase64 = keyName.includes('base64');
    if (keySaysBase64 || isLikelyBase64String(input)) {
      return getBase64Placeholder(parentKey, input);
    }
  }

  return input;
};

const Main_SavePage = ({
  children,
  onSave,
  saveButtonText = 'Save',
  successMessage = 'Data saved successfully!',
  showSaveButton = true,
  customSaveAction = null,
  dryRunAction = null,
  dryRunButtonText = 'Dry Run',
  saveAction = null,
  isSaving = false,
  saveSuccess = false,
  saveError = null,
  className = '',
  leftBottomAction = null,
  onCreate = null,
  createButtonText = 'Add New',
  showCreateButton = false,
  onPrint = null,
  printButtonText = 'Print',
  isPrinting = false,
  showPrintButton = false,
}) => {
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [dryRunError, setDryRunError] = useState('');
  const [dryRunResult, setDryRunResult] = useState(null);
  const [isDryRunModalOpen, setIsDryRunModalOpen] = useState(false);

  const handleSaveClick = () => {
    if (customSaveAction) {
      customSaveAction();
    } else if (typeof saveAction === 'function') {
      saveAction(onSave);
    } else if (typeof onSave === 'function') {
      onSave();
    } else {
      console.warn('No save function provided to Main_SavePage');
    }
  };

  const handleDryRunClick = async () => {
    if (typeof dryRunAction !== 'function') return;

    setIsDryRunning(true);
    setDryRunError('');
    try {
      const result = await dryRunAction();
      setDryRunResult(
        sanitizeDryRunPreview(result || { message: 'No changes detected' }),
      );
      setIsDryRunModalOpen(true);
    } catch (error) {
      setDryRunError(error?.message || 'Dry run failed');
      setDryRunResult(null);
      setIsDryRunModalOpen(true);
    } finally {
      setIsDryRunning(false);
    }
  };

  return (
    <div className={`${styles.savePage} ${className}`}>
      <div className={styles.content}>{children}</div>
      {showSaveButton && (
        <div className={styles.saveActions}>
          <div className={styles.leftActionContainer}>
            {showCreateButton && typeof onCreate === 'function' && (
              <button
                type="button"
                className={styles.createButton}
                onClick={onCreate}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 3v10M3 8h10" />
                </svg>
                {createButtonText}
              </button>
            )}
            {leftBottomAction}
          </div>

          <div className={styles.messageContainer}>
            {saveSuccess && (
              <div className={styles.successMessage}>{successMessage}</div>
            )}
            {saveError && (
              <div className={styles.errorMessage}>{saveError}</div>
            )}
          </div>

          <div className={styles.buttonContainer}>
            {showPrintButton && typeof onPrint === 'function' && (
              <button
                type="button"
                className={styles.printButton}
                onClick={onPrint}
                disabled={isPrinting}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 6V2.5h8V6M4 12.5h8v-4H4v4ZM3 6h10v4H3zM11 7.25h.01" />
                </svg>
                {isPrinting ? 'Preparing...' : printButtonText}
              </button>
            )}
            {typeof dryRunAction === 'function' && (
              <button
                type="button"
                className={styles.dryRunButton}
                onClick={handleDryRunClick}
                disabled={isDryRunning}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="m6 3 7 5-7 5V3Z" fill="currentColor" stroke="none" />
                </svg>
                {isDryRunning ? 'Running...' : dryRunButtonText}
              </button>
            )}
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSaveClick}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : saveButtonText}
            </button>
          </div>
        </div>
      )}

      {isDryRunModalOpen && (
        <div
          className={styles.dryRunModalBackdrop}
          onClick={() => setIsDryRunModalOpen(false)}
        >
          <div
            className={styles.dryRunModalWindow}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.dryRunModalHeader}>
              <div className={styles.dryRunTitle}>Dry Run Preview</div>
              <button
                type="button"
                className={styles.dryRunCloseBtn}
                onClick={() => setIsDryRunModalOpen(false)}
                aria-label="Close dry run preview"
              >
                ✕
              </button>
            </div>

            <div className={styles.dryRunModalBody}>
              {dryRunError ? (
                <div className={styles.errorMessage}>{dryRunError}</div>
              ) : (
                <pre className={styles.dryRunJson}>
                  {JSON.stringify(dryRunResult, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main_SavePage;
