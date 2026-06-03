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
  leftBottomAction,
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
      leftBottomAction={leftBottomAction}
    >
      {children}
    </Main_SavePage>
  );
};

const SupplierMasterSavePageContainer = ({
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

export default SupplierMasterSavePageContainer;
