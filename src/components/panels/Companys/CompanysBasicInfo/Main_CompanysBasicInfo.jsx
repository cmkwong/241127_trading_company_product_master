import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Main_TextArea from '../../../common/InputOptions/Textarea/Main_TextArea';
import Main_DateSelector from '../../../common/InputOptions/Date/Main_DateSelector';
import IconUpload from '../../../common/InputOptions/IconUpload/IconUpload';
import RowLayout from '../../../common/Layouts/RowLayout';
import ColumnLayout from '../../../common/Layouts/ColumnLayout';
import { objectUrlToDataUri } from '../../../../utils/objectUrlUtils';
import {
  upsertEntityData,
  useEntityField,
} from '../../../../store/GeneralContext';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_IMAGE_SIZE_MB = 5;

const toDateInputValue = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const Main_CompanysBasicInfo = () => {
  const companyId = useEntityField('company', 'id');
  const companyName = useEntityField('company', 'name');
  const companyRemark = useEntityField('company', 'remark');
  const companyCreatedAt = useEntityField('company', 'created_at');
  const companyUpdatedAt = useEntityField('company', 'updated_at');
  const iconUrl = useEntityField('company', 'icon_url');
  const iconName = useEntityField('company', 'icon_name');

  const handleIconSelectFile = async (file) => {
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      console.error(
        `Image upload error: unsupported image type (${file.type})`,
      );
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      console.error(
        `Image upload error: file exceeds maximum size of ${MAX_IMAGE_SIZE_MB}MB`,
      );
      return;
    }

    try {
      const base64Image = await objectUrlToDataUri(file);
      upsertEntityData('company', {
        icon_url: base64Image,
        icon_name: file.name || '',
        base64_image: base64Image,
      });
    } catch (error) {
      console.error('Failed to process company icon:', error);
    }
  };

  return (
    <Main_InputContainer label="Company Basic Info">
      <RowLayout>
        <ColumnLayout>
          <IconUpload
            inputId="company-icon"
            imageUrl={iconUrl}
            imageName={iconName}
            title="Upload company logo"
            size="L"
            onSelectFile={handleIconSelectFile}
          />

          <Main_TextField
            label="Company ID"
            defaultValue={String(companyId || '')}
            disabled
            placeholder="Auto-generated"
          />

          <Main_TextField
            label="Company Name"
            defaultValue={companyName || ''}
            placeholder="Company Name"
            required
            onChange={(ov, nv) => {
              upsertEntityData('company', { name: nv });
            }}
          />
        </ColumnLayout>

        <ColumnLayout>
          <Main_DateSelector
            label="Created At"
            defaultValue={toDateInputValue(companyCreatedAt)}
            disabled
          />

          <Main_DateSelector
            label="Updated At"
            defaultValue={toDateInputValue(companyUpdatedAt)}
            disabled
          />
        </ColumnLayout>
      </RowLayout>

      <Main_TextArea
        label="Remark"
        defaultValue={companyRemark || ''}
        placeholder="Company remark"
        rows={4}
        onChange={(ov, nv) => {
          upsertEntityData('company', { remark: nv });
        }}
      />
    </Main_InputContainer>
  );
};

export default Main_CompanysBasicInfo;
