import { useState } from 'react';
import { useUserAccount } from '../../../../store/UserAccountContext';
import styles from './LoginUsers_OperationContainer.module.css';

const OPERATION_VARIANTS = ['primary', 'secondary', 'danger'];

// Builds the class name for an operation's variant.
const variantClass = (variant) =>
  OPERATION_VARIANTS.includes(variant) ? styles[variant] : styles.secondary;

// Builds a single operation button element with a dynamic, renameable label.
const renderOperation = (operation, saving) => {
  const { key, label, onClick, variant = 'secondary', disabled = false } =
    operation;

  const isLoading = variant === 'primary' && saving;

  return (
    <button
      key={key}
      type="button"
      className={`${styles.operationButton} ${variantClass(variant)}`}
      onClick={onClick}
      disabled={disabled || saving}
    >
      {isLoading ? 'Saving...' : label}
    </button>
  );
};

// Generic operation container: a full-height flex column whose scrollable
// content area is provided by `children`, with a persistent bottom footer
// rendering an arbitrary set of left/right operations.
const LoginUsers_OperationContainer = ({
  children,
  operations = [],
  showSave = false,
  saveButtonText = 'Save',
  onSave = null,
  successMessage = 'Saved successfully!',
  className = '',
}) => {
  const {
    handleSave,
    isSaving: contextIsSaving,
    saveSuccess: contextSaveSuccess,
    saveError: contextSaveError,
  } = useUserAccount();

  const [localSaving, setLocalSaving] = useState(false);
  const [localSuccess, setLocalSuccess] = useState(false);
  const [localError, setLocalError] = useState(null);

  const runSave = async () => {
    if (typeof onSave === 'function') {
      setLocalSaving(true);
      setLocalError(null);
      try {
        await onSave();
        setLocalSuccess(true);
        window.setTimeout(() => setLocalSuccess(false), 3000);
      } catch (error) {
        setLocalError(error?.message || 'Failed to save your changes.');
      } finally {
        setLocalSaving(false);
      }
      return;
    }

    await handleSave();
  };

  const saveOperation = showSave
    ? {
        key: 'save',
        label: saveButtonText,
        variant: 'primary',
        side: 'right',
        onClick: runSave,
      }
    : null;

  const allOperations = saveOperation
    ? [saveOperation, ...operations]
    : operations;

  const visibleOperations = allOperations.filter((op) => !op.hidden);

  const leftOperations = visibleOperations.filter(
    (op) => (op.side || 'right') === 'left',
  );
  const rightOperations = visibleOperations.filter(
    (op) => (op.side || 'right') !== 'left',
  );

  const isSaving = typeof onSave === 'function' ? localSaving : contextIsSaving;
  const saveSuccess =
    typeof onSave === 'function' ? localSuccess : contextSaveSuccess;
  const saveError =
    typeof onSave === 'function' ? localError : contextSaveError;

  const hasFooter = visibleOperations.length > 0;

  return (
    <div className={`${styles.operationContainer} ${className}`}>
      <div className={styles.content}>{children}</div>

      {hasFooter && (
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {leftOperations.map((operation) =>
              renderOperation(operation, false),
            )}
          </div>

          <div className={styles.messageContainer}>
            {showSave && saveSuccess && (
              <div className={styles.successMessage}>{successMessage}</div>
            )}
            {showSave && saveError && (
              <div className={styles.errorMessage}>{saveError}</div>
            )}
          </div>

          <div className={styles.footerRight}>
            {rightOperations.map((operation) =>
              renderOperation(operation, isSaving),
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginUsers_OperationContainer;
