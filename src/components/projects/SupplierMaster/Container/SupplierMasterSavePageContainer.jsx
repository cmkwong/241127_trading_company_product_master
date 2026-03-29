import { MasterContext_Provider } from '../../../../store/MasterContext';
import { useSupplierContext } from '../../../../store/SupplierContext';
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
    handleSupplierSave,
    getSupplierSaveDryRunData,
    isSaving,
    saveSuccess,
    saveError,
  } = useSupplierContext();

  return (
    <Main_SavePage
      onSave={onSave}
      saveButtonText={saveButtonText}
      successMessage={successMessage}
      showSaveButton={showSaveButton}
      customSaveAction={customSaveAction}
      dryRunAction={getSupplierSaveDryRunData}
      saveAction={handleSupplierSave}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
      saveError={saveError}
      className={className}
    >
      {children}
    </Main_SavePage>
  );
};

const SupplierMasterSavePageContainer = ({
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

export default SupplierMasterSavePageContainer;
