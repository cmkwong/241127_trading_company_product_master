import { createContext, useState, useContext, useCallback } from 'react';

// Create context for data collection
export const ProductContext = createContext();

// Provider component for save page data
export const ProductContext_Provider = ({ children, initialData = {} }) => {
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
    <ProductContext.Provider
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
    </ProductContext.Provider>
  );
};

// Custom hook to use the save page context
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error(
      'useProductContext must be used within a ProductContext_Provider'
    );
  }
  return context;
};
