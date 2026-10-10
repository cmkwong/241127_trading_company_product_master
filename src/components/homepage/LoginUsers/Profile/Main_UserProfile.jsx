import Main_InputContainer from '../../../common/Container/Main_InputContainer';
import Main_TextField from '../../../common/InputOptions/TextField/Main_TextField';
import Header from '../../../common/Texts/Header';
import IconUpload from '../../../common/InputOptions/IconUpload/IconUpload';
import {
  upsertEntityData,
  useEntityField,
} from '../../../../store/GeneralContext';
import styles from './Main_UserProfile.module.css';

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_IMAGE_SIZE_MB = 5;

const Main_UserProfile = () => {
  const id = useEntityField('user', 'id');
  const email = useEntityField('user', 'email');
  const firstName = useEntityField('user', 'first_name');
  const lastName = useEntityField('user', 'last_name');
  const displayName = useEntityField('user', 'display_name');
  const companyName = useEntityField('user', 'company_name');
  const website = useEntityField('user', 'website');
  const countryCallingCode = useEntityField('user', 'country_calling_code');
  const phoneNumber = useEntityField('user', 'phone_number');
  const iconUrl = useEntityField('user', 'icon_url');
  const iconName = useEntityField('user', 'icon_name');

  const handleIconSelectFile = (file) => {
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

    const objectUrl = URL.createObjectURL(file);
    upsertEntityData('user', {
      icon_url: objectUrl,
      icon_name: file.name || '',
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.col}>
        <Main_InputContainer
          label="Personal Information"
          description="Manage your profile and personal details."
        >
          <div className={styles.column}>
            <div className={styles.row}>
              <div className={`${styles.col} ${styles.ratio80}`}>
                <div className={styles.row}>
                  <Main_TextField
                    label="First Name"
                    defaultValue={String(firstName || '')}
                    placeholder="First name"
                    onChange={(ov, nv) =>
                      upsertEntityData('user', { first_name: nv })
                    }
                    height={'M'}
                  />

                  <Main_TextField
                    label="Last Name"
                    defaultValue={String(lastName || '')}
                    placeholder="Last name"
                    onChange={(ov, nv) =>
                      upsertEntityData('user', { last_name: nv })
                    }
                    height={'M'}
                  />
                </div>

                <Main_TextField
                  label="Display Name"
                  defaultValue={String(displayName || '')}
                  placeholder="Display name"
                  onChange={(ov, nv) =>
                    upsertEntityData('user', { display_name: nv })
                  }
                  height={'M'}
                />
              </div>
              <div className={styles.ratio20}>
                <IconUpload
                  className={styles.userIcon}
                  inputId={`user-icon-${id || 'new'}`}
                  imageUrl={iconUrl || ''}
                  imageName={iconName || 'user-icon'}
                  onSelectFile={handleIconSelectFile}
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  size="L"
                  title="Select profile image"
                />
              </div>
            </div>
            <Main_TextField
              label="Email"
              defaultValue={String(email || '')}
              disabled
              placeholder="Email"
              height={'M'}
            />
          </div>
        </Main_InputContainer>

        <Main_InputContainer
          label={
            <>
              <Header as="h2" size="L" text="Business Information" />
            </>
          }
        >
          <div className={styles.col}>
            <Main_TextField
              label="Company Name"
              defaultValue={String(companyName || '')}
              placeholder="Company name"
              onChange={(ov, nv) =>
                upsertEntityData('user', { company_name: nv })
              }
              height={'M'}
            />

            <Main_TextField
              label="Website"
              defaultValue={String(website || '')}
              placeholder="https://example.com"
              onChange={(ov, nv) => upsertEntityData('user', { website: nv })}
              height={'M'}
            />
            <div className={styles.row}>
              <div className={styles.ratio20}>
                <Main_TextField
                  label="Country Calling Code"
                  defaultValue={String(countryCallingCode || '')}
                  placeholder="+852"
                  onChange={(ov, nv) =>
                    upsertEntityData('user', { country_calling_code: nv })
                  }
                  height={'M'}
                />
              </div>

              <div className={styles.ratio80}>
                <Main_TextField
                  label="Phone Number"
                  defaultValue={String(phoneNumber || '')}
                  placeholder="Phone number"
                  onChange={(ov, nv) =>
                    upsertEntityData('user', { phone_number: nv })
                  }
                  height={'M'}
                />
              </div>
            </div>
          </div>
        </Main_InputContainer>
      </div>
    </div>
  );
};

export default Main_UserProfile;
