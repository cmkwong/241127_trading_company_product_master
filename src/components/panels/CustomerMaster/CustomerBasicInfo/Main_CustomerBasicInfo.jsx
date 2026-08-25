import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_DateSelector from '../../../common/InputOptions/Date/Main_DateSelector';
import SplitLayout from '../../../common/Layouts/SplitLayout';
import VerticalLayout from '../../../common/Layouts/VerticalLayout';
import {
  upsertEntityData,
  useEntityField,
  useEntityRows,
} from '../../../../store/GeneralContext';

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
      <SplitLayout>
        <VerticalLayout>
          <Main_InputContainer label="Customer ID">
            <Main_TextField
              defaultValue={String(customerId || '')}
              disabled
              placeholder="Auto-generated"
            />
          </Main_InputContainer>

          <Main_InputContainer label="Customer Code">
            <Main_TextField
              defaultValue={customerCode || customerCodeCompat || ''}
              placeholder="C0000-0001"
              onChange={(ov, nv) => {
                upsertEntityData('customer', {
                  customer_code: nv,
                  code: nv,
                });
              }}
            />
          </Main_InputContainer>

          <Main_InputContainer label="Primary Name (Preview)">
            <Main_TextField
              defaultValue={String(primaryName || '')}
              disabled
              placeholder="From Customer Names section"
            />
          </Main_InputContainer>
        </VerticalLayout>

        <VerticalLayout>
          <Main_InputContainer label="Created At">
            <Main_DateSelector
              defaultValue={toDateInputValue(customerCreatedAt)}
              disabled
            />
          </Main_InputContainer>

          <Main_InputContainer label="Updated At">
            <Main_DateSelector
              defaultValue={toDateInputValue(customerUpdatedAt)}
              disabled
            />
          </Main_InputContainer>

          <Main_InputContainer label="Remark">
            <Main_TextArea
              defaultValue={customerRemark || ''}
              placeholder="Customer remark"
              rows={5}
              onChange={(ov, nv) => {
                upsertEntityData('customer', { remark: nv });
              }}
            />
          </Main_InputContainer>
        </VerticalLayout>
      </SplitLayout>
    </Main_InputContainer>
  );
};

export default Main_CustomerBasicInfo;
