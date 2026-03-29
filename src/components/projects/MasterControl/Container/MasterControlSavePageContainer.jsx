import Main_SavePage from '../../../common/SavePage/Main_SavePage';

const MasterControlSavePageContainer = ({
  children,
  onSave,
  saveButtonText,
  successMessage,
  showSaveButton,
  customSaveAction,
  dryRunAction,
  className,
  isSaving = false,
  saveSuccess = false,
  saveError = null,
}) => {
  return (
    <Main_SavePage
      onSave={onSave}
      saveButtonText={saveButtonText}
      successMessage={successMessage}
      showSaveButton={showSaveButton}
      customSaveAction={customSaveAction}
      dryRunAction={dryRunAction}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
      saveError={saveError}
      className={className}
    >
      {children}
    </Main_SavePage>
  );
};

export default MasterControlSavePageContainer;
