import Main_SavePage from '../../../common/SavePage/Main_SavePage';
import { useCatalogContext } from '../../../../store/CatalogContext';

const CatalogSavePageContainer = ({
  children,
  onSave,
  saveButtonText = 'Save',
  successMessage = 'Catalog saved successfully!',
  showSaveButton = true,
  className,
  leftBottomAction,
  onCreate,
  createButtonText = 'Add Catalog',
  showCreateButton = false,
  onPrint,
  printButtonText = 'Print',
  isPrinting = false,
  showPrintButton = false,
}) => {
  const {
    handleCatalogSave,
    getCatalogSaveDryRunData,
    isSaving,
    saveSuccess,
    saveError,
  } = useCatalogContext();

  return (
    <Main_SavePage
      onSave={onSave}
      saveButtonText={saveButtonText}
      successMessage={successMessage}
      showSaveButton={showSaveButton}
      dryRunAction={getCatalogSaveDryRunData}
      saveAction={handleCatalogSave}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
      saveError={saveError}
      className={className}
      leftBottomAction={leftBottomAction}
      onCreate={onCreate}
      createButtonText={createButtonText}
      showCreateButton={showCreateButton}
      onPrint={onPrint}
      printButtonText={printButtonText}
      isPrinting={isPrinting}
      showPrintButton={showPrintButton}
    >
      {children}
    </Main_SavePage>
  );
};

export default CatalogSavePageContainer;
