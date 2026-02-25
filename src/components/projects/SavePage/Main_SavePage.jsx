import Button from '../../common/Button';
import styles from './Main_SavePage.module.css';

const Main_SavePage = ({
  children,
  onSave,
  saveButtonText = 'Save',
  successMessage = 'Data saved successfully!',
  showSaveButton = true,
  customSaveAction = null,
  saveAction = null,
  isSaving = false,
  saveSuccess = false,
  saveError = null,
  className = '',
}) => {
  // Handle save button click
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

  return (
    <div className={`${styles.savePage} ${className}`}>
      <div className={styles.content}>{children}</div>
      {showSaveButton && (
        <div className={styles.saveActions}>
          <div className={styles.messageContainer}>
            {saveSuccess && (
              <div className={styles.successMessage}>{successMessage}</div>
            )}
            {saveError && (
              <div className={styles.errorMessage}>{saveError}</div>
            )}
          </div>
          <div className={styles.buttonContainer}>
            <Button
              text={isSaving ? 'Saving...' : saveButtonText}
              onClick={handleSaveClick}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Main_SavePage;
