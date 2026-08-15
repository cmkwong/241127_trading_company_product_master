import { useMemo } from 'react';
import Main_Suggest from '../../../common/InputOptions/Suggest/Main_Suggest';
import { normalize } from './attributeUtils';

/**
 * Single-select attribute field.
 * Uses Main_Suggest so the user can either type a free value or pick a
 * suggestion from the combined dropdown/reference list.
 */
const Sub_AttributeSingleField = ({ attributeId, options, value, onSave }) => {
  const suggestions = useMemo(
    () => (options || []).map((option) => option.name),
    [options],
  );

  return (
    <Main_Suggest
      defaultSuggestions={suggestions}
      defaultValue={value || ''}
      placeholder="Select or type a value..."
      autoComplete="off"
      onChange={(ov, nv) => onSave(attributeId, normalize(nv))}
    />
  );
};

export default Sub_AttributeSingleField;
