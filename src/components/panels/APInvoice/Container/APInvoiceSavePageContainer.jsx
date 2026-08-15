import { useState } from 'react';
import Main_SavePage from '../../../common/SavePage/Main_SavePage';

const APInvoiceSavePageContainer = ({
  children,
  onSave,
  dryRunAction,
  saveButtonText = 'Save AP Invoice',
  successMessage = 'AP invoice saved successfully!',
  showSaveButton = true,
  className,
  leftBottomAction,
  onCreate,
  createButtonText,
  showCreateButton,
  onPrint,
  printButtonText,
  isPrinting,
  showPrintButton,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async (externalSaveCallback) => {
    setIsSaving(true);
    setSaveError('');

    try {
      if (typeof externalSaveCallback === 'function') {
        await externalSaveCallback();
      } else if (typeof onSave === 'function') {
        await onSave();
      }

      setSaveSuccess(true);
      window.setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      setSaveError(error?.message || 'Failed to save AP invoice');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Main_SavePage
      onSave={onSave}
      saveAction={handleSave}
      saveButtonText={saveButtonText}
      successMessage={successMessage}
      showSaveButton={showSaveButton}
      dryRunAction={dryRunAction}
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

export default APInvoiceSavePageContainer;
