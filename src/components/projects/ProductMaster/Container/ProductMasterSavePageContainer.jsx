import { MasterContext_Provider } from '../../../../store/MasterContext';
import { useProductContext } from '../../../../store/ProductContext';
import Main_SavePage from '../../../common/SavePage/Main_SavePage';

const SavePageContextBridge = ({
  children,
  onSave,
  saveButtonText,
  successMessage,
  showSaveButton,
  customSaveAction,
  className,
}) => {
  const {
    handleProductSave,
    getProductSaveDryRunData,
    isSaving,
    saveSuccess,
    saveError,
  } = useProductContext();

  return (
    <Main_SavePage
      onSave={onSave}
      saveButtonText={saveButtonText}
      successMessage={successMessage}
      showSaveButton={showSaveButton}
      customSaveAction={customSaveAction}
      dryRunAction={getProductSaveDryRunData}
      saveAction={handleProductSave}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
      saveError={saveError}
      className={className}
    >
      {children}
    </Main_SavePage>
  );
};

// Compound component that includes the provider
const ProductMasterSavePageContainer = ({
  children,
  onSave,
  saveButtonText,
  successMessage,
  showSaveButton,
  customSaveAction,
  className,
}) => {
  return (
    <MasterContext_Provider>
      <SavePageContextBridge
        onSave={onSave}
        saveButtonText={saveButtonText}
        successMessage={successMessage}
        showSaveButton={showSaveButton}
        customSaveAction={customSaveAction}
        className={className}
      >
        {children}
      </SavePageContextBridge>
    </MasterContext_Provider>
  );
};

export default ProductMasterSavePageContainer;
