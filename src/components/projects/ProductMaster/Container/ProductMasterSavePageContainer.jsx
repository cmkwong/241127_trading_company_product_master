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
  leftBottomAction,
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
      leftBottomAction={leftBottomAction}
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
  leftBottomAction,
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
        leftBottomAction={leftBottomAction}
      >
        {children}
      </SavePageContextBridge>
    </MasterContext_Provider>
  );
};

export default ProductMasterSavePageContainer;
