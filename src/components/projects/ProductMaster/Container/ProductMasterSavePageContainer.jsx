import { MasterContext_Provider } from '../../../../store/MasterContext';
import {
  ProductContext_Provider,
  useProductContext,
} from '../../../../store/ProductContext';
import Main_SavePage from '../../SavePage/Main_SavePage';

const SavePageContextBridge = ({
  children,
  onSave,
  saveButtonText,
  successMessage,
  showSaveButton,
  customSaveAction,
  className,
}) => {
  const { handleProductSave, isSaving, saveSuccess, saveError } =
    useProductContext();

  return (
    <Main_SavePage
      onSave={onSave}
      saveButtonText={saveButtonText}
      successMessage={successMessage}
      showSaveButton={showSaveButton}
      customSaveAction={customSaveAction}
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
  initialData = {},
  onSave,
  saveButtonText,
  successMessage,
  showSaveButton,
  customSaveAction,
  className,
}) => {
  return (
    <MasterContext_Provider>
      <ProductContext_Provider initialData={initialData}>
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
      </ProductContext_Provider>
    </MasterContext_Provider>
  );
};

export default ProductMasterSavePageContainer;
