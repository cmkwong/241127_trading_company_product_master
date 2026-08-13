import { useState, useRef, useCallback, useEffect } from 'react';
import Main_TagInputField from '../../../common/InputOptions/Tagging/Main_TagInputField';
import { normalize } from './attributeUtils';

/**
 * Multiple-selection (tagging) attribute field.
 *
 * Main_TagInputField works with option "ids". We build option ids as the
 * lowercased value, but map each id back to its original-cased name so the
 * stored value keeps whatever case was displayed/typed.
 */
const Sub_AttributeTagField = ({ attributeId, options, values, onSave }) => {
  const [selectedIds, setSelectedIds] = useState(values || []);
  const idToValueRef = useRef(new Map());
  const selectedIdsRef = useRef(values || []);

  useEffect(() => {
    setSelectedIds(values || []);
  }, [values]);

  useEffect(() => {
    const map = new Map();
    (options || []).forEach((option) => {
      map.set(option.id, option.name);
    });
    idToValueRef.current = map;
  }, [options]);

  const resolveIds = useCallback((ids) => {
    const resolved = [];
    (ids || []).forEach((id) => {
      const value = idToValueRef.current.get(id);
      if (value != null) {
        resolved.push(value);
      }
    });
    return resolved;
  }, []);

  const handleChange = useCallback(
    (ov, nv) => {
      const nextIds = Array.isArray(nv) ? nv : [];
      selectedIdsRef.current = nextIds;

      const resolved = resolveIds(nextIds);
      if (resolved.length === nextIds.length) {
        onSave(attributeId, resolved);
      }
      // Otherwise a new free-form value was just added and its uuid cannot be
      // resolved yet; onAddNewOption will finish the job.
    },
    [attributeId, onSave, resolveIds],
  );

  const handleAddNewOption = useCallback(
    (newOption) => {
      const value = normalize(newOption?.name);
      if (!value) return;

      idToValueRef.current.set(newOption.id, value);

      const resolved = resolveIds(selectedIdsRef.current);
      if (resolved.length === selectedIdsRef.current.length) {
        onSave(attributeId, resolved);
      }
    },
    [attributeId, onSave, resolveIds],
  );

  return (
    <Main_TagInputField
      defaultOptions={options || []}
      defaultSelectedOptions={selectedIds}
      onChange={handleChange}
      onAddNewOption={handleAddNewOption}
      canAddNewOptions={true}
      placeholder="Select or type values..."
    />
  );
};

export default Sub_AttributeTagField;
