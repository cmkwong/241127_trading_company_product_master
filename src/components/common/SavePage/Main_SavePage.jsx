import { useState } from 'react';
import Button from '../Buttons/Button';
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
  leftOfDryRunAction = null,
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
          <div className={styles.leftActionContainer}>{leftBottomAction}</div>
          <div className={styles.messageContainer}>
            {saveSuccess && (
              <div className={styles.successMessage}>{successMessage}</div>
            )}
            {saveError && (
              <div className={styles.errorMessage}>{saveError}</div>
            )}
          </div>
          <div className={styles.buttonContainer}>
            {leftOfDryRunAction}
            {typeof dryRunAction === 'function' && (
              <Button
                text={isDryRunning ? 'Running...' : dryRunButtonText}
                onClick={handleDryRunClick}
              />
            )}
            <Button
              text={isSaving ? 'Saving...' : saveButtonText}
              onClick={handleSaveClick}
            />
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
