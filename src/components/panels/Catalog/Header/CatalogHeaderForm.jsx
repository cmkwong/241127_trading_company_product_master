import { useCallback } from 'react';
import styles from './CatalogHeaderForm.module.css';
import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import {
  upsertEntityData,
  useEntityField,
} from '../../../../store/GeneralContext';

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : '—';
};

const CatalogHeaderForm = () => {
  const catalogName = useEntityField('catalogs', 'catalog_name');
  const displayHeader = useEntityField('catalogs', 'display_header');
  const remark = useEntityField('catalogs', 'remark');
  const id = useEntityField('catalogs', 'id');
  const createdAt = useEntityField('catalogs', 'created_at');
  const updatedAt = useEntityField('catalogs', 'updated_at');

  const handleNameChange = useCallback(
    (ov, nv) => upsertEntityData('catalogs', { catalog_name: nv }),
    [],
  );
  const handleHeaderChange = useCallback(
    (ov, nv) => upsertEntityData('catalogs', { display_header: nv }),
    [],
  );
  const handleRemarkChange = useCallback(
    (ov, nv) => upsertEntityData('catalogs', { remark: nv }),
    [],
  );

  return (
    <Main_InputContainer label="Catalog Header">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          alignItems: 'start',
        }}
      >
        <Main_TextField
          inputId="catalog-name"
          label="Name"
          placeholder="Catalog name"
          defaultValue={catalogName || ''}
          onChange={handleNameChange}
        />
        <Main_TextField
          inputId="catalog-display-header"
          label="Display Header"
          placeholder="Header text to display on print"
          defaultValue={displayHeader || ''}
          onChange={handleHeaderChange}
        />
      </div>

      <div style={{ marginTop: '12px' }}>
        <Main_TextArea
          textareaId="catalog-remark"
          label="Remark"
          placeholder="Additional notes for this catalog"
          defaultValue={remark || ''}
          rows={3}
          onChange={handleRemarkChange}
        />
      </div>

      <div className={styles.catalogHeaderInfo}>
        <span>ID: {id || '—'}</span>
        <span>Created: {formatDate(createdAt)}</span>
        <span>Updated: {formatDate(updatedAt)}</span>
      </div>
    </Main_InputContainer>
  );
};

export default CatalogHeaderForm;
