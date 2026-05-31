import Main_InputContainer from '../../../common/InputOptions/InputContainer/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_DateSelector from '../../../common/InputOptions/Date/Main_DateSelector';
import SplitLayout from '../../../common/Layouts/SplitLayout';
import VerticalLayout from '../../../common/Layouts/VerticalLayout';
import { useCustomerContext } from '../../../../store/CustomerContext';

const toDateInputValue = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const Main_CustomerBasicInfo = () => {
  const { pageData, upsertCustomerPageData } = useCustomerContext();

  const primaryName =
    pageData?.customer_names?.[0]?.name ||
    pageData?.name ||
    pageData?.customer_code ||
    '';

  return (
    <Main_InputContainer label="Customer Basic Info">
      <SplitLayout>
        <VerticalLayout>
          <Main_InputContainer label="Customer ID">
            <Main_TextField
              defaultValue={String(pageData?.id || '')}
              disabled
              placeholder="Auto-generated"
            />
          </Main_InputContainer>

          <Main_InputContainer label="Customer Code">
            <Main_TextField
              defaultValue={pageData?.customer_code || pageData?.code || ''}
              placeholder="C0000-0001"
              onChange={(ov, nv) => {
                upsertCustomerPageData({ customer_code: nv });
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
              defaultValue={toDateInputValue(pageData?.created_at)}
              disabled
            />
          </Main_InputContainer>

          <Main_InputContainer label="Updated At">
            <Main_DateSelector
              defaultValue={toDateInputValue(pageData?.updated_at)}
              disabled
            />
          </Main_InputContainer>

          <Main_InputContainer label="Remark">
            <Main_TextArea
              defaultValue={pageData?.remark || ''}
              placeholder="Customer remark"
              rows={5}
              onChange={(ov, nv) => {
                upsertCustomerPageData({ remark: nv });
              }}
            />
          </Main_InputContainer>
        </VerticalLayout>
      </SplitLayout>
    </Main_InputContainer>
  );
};

export default Main_CustomerBasicInfo;
