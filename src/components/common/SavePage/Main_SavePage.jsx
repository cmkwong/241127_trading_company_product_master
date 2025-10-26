import { createContext, useState, useContext, useCallback } from 'react';
import Button from '../../common/Button';
import styles from './Main_SavePage.module.css';

// Create context for data collection
export const SavePageContext = createContext();

// Provider component for save page data
export const SavePageProvider = ({ children, initialData = {} }) => {
  const [pageData, setPageData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Function to update specific field in the data
  const updateData = useCallback((field, value) => {
    setPageData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  }, []);

  // Function to update multiple fields at once
  const updateMultipleData = useCallback((dataObject) => {
    setPageData((prevData) => ({
      ...prevData,
      ...dataObject,
    }));
  }, []);

  // Function to handle save action
  const handleSave = useCallback(
    async (onSave) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        // If onSave callback is provided, call it with the current data
        if (typeof onSave === 'function') {
          await onSave(pageData);
        }

        setSaveSuccess(true);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } catch (error) {
        console.error('Error saving data:', error);
        setSaveError(error.message || 'Failed to save data');
      } finally {
        setIsSaving(false);
      }
    },
    [pageData]
  );

  // Get all collected data
  const getAllData = useCallback(() => {
    return pageData;
  }, [pageData]);

  return (
    <SavePageContext.Provider
      value={{
        pageData,
        updateData,
        updateMultipleData,
        handleSave,
        getAllData,
        isSaving,
        saveSuccess,
        saveError,
      }}
    >
      {children}
    </SavePageContext.Provider>
  );
};

// Custom hook to use the save page context
export const useSavePageData = () => {
  const context = useContext(SavePageContext);
  if (!context) {
    throw new Error('useSavePageData must be used within a SavePageProvider');
  }
  return context;
};

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
  const { handleSave, isSaving, saveSuccess, saveError } = useSavePageData();

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
    <SavePageProvider initialData={initialData}>
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
    </SavePageProvider>
  );
};

export default SavePageWithProvider;
