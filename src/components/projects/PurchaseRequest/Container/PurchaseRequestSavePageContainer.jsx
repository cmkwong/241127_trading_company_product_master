import { useState } from 'react';
import Main_SavePage from '../../../common/SavePage/Main_SavePage';

const PurchaseRequestSavePageContainer = ({
  children,
  onSave,
  dryRunAction,
  saveButtonText = 'Save Purchase Request',
  successMessage = 'Purchase request saved successfully!',
  showSaveButton = true,
  className,
  leftBottomAction,
  leftOfDryRunAction,
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
      setSaveError(error?.message || 'Failed to save purchase request');
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
      leftOfDryRunAction={leftOfDryRunAction}
    >
      {children}
    </Main_SavePage>
  );
};

export default PurchaseRequestSavePageContainer;
