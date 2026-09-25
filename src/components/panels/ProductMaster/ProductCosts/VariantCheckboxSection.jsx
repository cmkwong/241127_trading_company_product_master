import { useState } from 'react';
import styles from './VariantCheckboxSection.module.css';
import AddNewBtn from '../../../common/Buttons/AddNewBtn';
import Label from '../../../common/Texts/Label';

const VariantCheckboxSection = ({
  title,
  options,
  selectedIds,
  getLabel,
  onToggle,
  onAddNew,
  onEditCommit,
  canEdit = true,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');

  const startEdit = (item, e) => {
    // Keep the nested label from toggling the checkbox when the pencil is clicked.
    e.preventDefault();
    e.stopPropagation();
    setEditingId(item.id);
    setDraft(getLabel(item));
  };

  const commitEdit = () => {
    if (editingId === null) return;

    const item = options.find((o) => o.id === editingId);
    const newText = draft.trim();
    const original = item ? getLabel(item).trim() : '';

    setEditingId(null);
    setDraft('');

    if (!item || !newText || newText === original) return;

    onEditCommit?.(item, newText);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft('');
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancelEdit();
    }
  };

  return (
    <div className={styles.controlBlock}>
      <div className={styles.groupHeader}>
        <div className={styles.titleWrap}>
          <div className={styles.groupTitle}>{title}</div>
          <div className={styles.countBadge}>{options.length}</div>
        </div>

        <AddNewBtn
          onClick={onAddNew}
          ariaLabel={`Add new ${title.toLowerCase()}`}
          title={`Add New ${title}`}
        />
      </div>

      <div className={styles.checkboxWrap}>
        {options.map((item) => {
          const checked = selectedIds.includes(item.id);
          const isEditing = editingId === item.id;
          return (
            <Label
              htmlFor={`checkbox-${item.id}`}
              key={item.id}
              className={`${styles.checkboxItem} ${checked ? styles.checked : ''}`}
            >
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={checked}
                onChange={(e) => onToggle(item.id, e.target.checked)}
              />

              {isEditing ? (
                <input
                  type="text"
                  className={styles.editInput}
                  value={draft}
                  autoFocus
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={handleEditKeyDown}
                  onClick={(e) => e.preventDefault()}
                  aria-label={`Edit ${getLabel(item)}`}
                />
              ) : (
                <span className={styles.checkboxLabel}>{getLabel(item)}</span>
              )}

              {canEdit && !isEditing && (
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={(e) => startEdit(item, e)}
                  title={`Edit ${getLabel(item)}`}
                  aria-label={`Edit ${getLabel(item)}`}
                >
                  <svg
                    className={styles.editIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 20h4L19.5 8.5a2.121 2.121 0 0 0-3-3L5 17v3z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.5 6.5l3 3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>
              )}
            </Label>
          );
        })}

        {options.length === 0 && (
          <div className={styles.emptyHint}>No options yet. Click Add New.</div>
        )}
      </div>
    </div>
  );
};

export default VariantCheckboxSection;
