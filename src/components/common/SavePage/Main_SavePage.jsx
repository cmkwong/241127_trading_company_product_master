import {
  ProductContext_Provider,
  useProductContext,
} from '../../../store/ProductContext';
import Button from '../../common/Button';
import styles from './Main_SavePage.module.css';

const Main_SavePage = ({
  children,
  onSave,
  initialData = {},
  saveButtonText = 'Save',
  successMessage = 'Data saved successfully!',
  showSaveButton = true,
  customSaveAction = null,
  className = '',
}) => {
  const { handleSave, isSaving, saveSuccess, saveError } = useProductContext();

  const handleSaveClick = () => {
    if (customSaveAction) {
      customSaveAction();
    } else {
      handleSave(onSave);
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

// Compound component that includes the provider
const SavePageWithProvider = ({
  children,
  initialData = {},
  onSave,
  saveButtonText,
  successMessage,
  showSaveButton,
  customSaveAction,
  className,
}) => {
  return (
    <ProductContext_Provider initialData={initialData}>
      <Main_SavePage
        onSave={onSave}
        saveButtonText={saveButtonText}
        successMessage={successMessage}
        showSaveButton={showSaveButton}
        customSaveAction={customSaveAction}
        className={className}
      >
        {children}
      </Main_SavePage>
    </ProductContext_Provider>
  );
};

export default SavePageWithProvider;
