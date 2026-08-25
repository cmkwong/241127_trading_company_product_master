import Main_RadioGroup from '../../../common/InputOptions/RadioGroup/Main_RadioGroup';
import {
  upsertEntityData,
  useEntityField,
} from '../../../../store/GeneralContext';

const MODES = [
  { value: 'by_qty', label: 'Price by Quantity' },
  { value: 'by_variants', label: 'Price by Varients' },
  { value: 'by_single_price', label: 'Single Price Range' },
];

const PricingModeSwitch = () => {
  const activeMode = useEntityField('products', 'selling_by_mode') || 'by_qty';

  const handleSelect = (value) => {
    upsertEntityData('products', { selling_by_mode: value });
  };

  return (
    <Main_RadioGroup
      options={MODES}
      value={activeMode}
      onChange={handleSelect}
      ariaLabel="Selling by mode"
      variant="segment"
      size="100%"
    />
  );
};

export default PricingModeSwitch;
