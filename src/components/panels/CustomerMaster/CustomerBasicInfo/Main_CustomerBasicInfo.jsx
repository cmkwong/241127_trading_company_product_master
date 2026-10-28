import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_DateSelector from '../../../common/InputOptions/Date/Main_DateSelector';
import RowLayout from '../../../common/Layouts/RowLayout';
import ColumnLayout from '../../../common/Layouts/ColumnLayout';
import {
  upsertEntityData,
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';
import Main_CustomerTypes from '../Types/Main_CustomerTypes';

const toDateInputValue = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const Main_CustomerBasicInfo = () => {
  const customerId = useEntityField('customer', 'id');
  const customerCode = useEntityField('customer', 'customer_code');
  const customerCodeCompat = useEntityField('customer', 'code');
  const customerName = useEntityField('customer', 'name');
  const customerCreatedAt = useEntityField('customer', 'created_at');
  const customerUpdatedAt = useEntityField('customer', 'updated_at');
  const customerRemark = useEntityField('customer', 'remark');
  const customerNameRows = useEntityRows('customer', 'customer_names');

  const primaryName =
    customerNameRows?.[0]?.name || customerName || customerCode || '';
  return (
    <Main_InputContainer label="Customer Basic Info">
      <RowLayout>
        <ColumnLayout>
          <Main_TextField
            label="Customer ID"
            defaultValue={String(customerId || '')}
            disabled
            placeholder="Auto-generated"
          />

          <Main_TextField
            label="Customer Code"
            defaultValue={customerCode || customerCodeCompat || ''}
            placeholder="C0000-0001"
            onChange={(ov, nv) => {
              upsertEntityData('customer', {
                customer_code: nv,
                code: nv,
              });
            }}
          />

          <Main_TextField
            label="Primary Name (Preview)"
            defaultValue={String(primaryName || '')}
            disabled
            placeholder="From Customer Names section"
          />
          <Main_CustomerTypes />
        </ColumnLayout>

        <ColumnLayout>
          <Main_DateSelector
            label="Created At"
            defaultValue={toDateInputValue(customerCreatedAt)}
            disabled
          />

          <Main_DateSelector
            label="Updated At"
            defaultValue={toDateInputValue(customerUpdatedAt)}
            disabled
          />

          <Main_TextArea
            label="Remark"
            defaultValue={customerRemark || ''}
            placeholder="Customer remark"
            rows={5}
            onChange={(ov, nv) => {
              upsertEntityData('customer', { remark: nv });
            }}
          />
        </ColumnLayout>
      </RowLayout>
    </Main_InputContainer>
  );
};

export default Main_CustomerBasicInfo;
