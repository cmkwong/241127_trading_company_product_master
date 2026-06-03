import { MasterContext_Provider } from '../../../../store/MasterContext';
import { useCustomerContext } from '../../../../store/CustomerContext';
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
    handleCustomerSave,
    getCustomerSaveDryRunData,
    isSaving,
    saveSuccess,
    saveError,
  } = useCustomerContext();

  return (
    <Main_SavePage
      onSave={onSave}
      saveButtonText={saveButtonText}
      successMessage={successMessage}
      showSaveButton={showSaveButton}
      customSaveAction={customSaveAction}
      dryRunAction={getCustomerSaveDryRunData}
      saveAction={handleCustomerSave}
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

const CustomerMasterSavePageContainer = ({
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

export default CustomerMasterSavePageContainer;
