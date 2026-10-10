import { useParams } from 'react-router-dom';
import TopBar from '../../common/TopBar/TopBar';
import LoginUsersSidebar from './Sidebar/LoginUsersSidebar';
import LoginUsers_OperationContainer from './Container/LoginUsers_OperationContainer';
import { UserAccountContext_Provider } from '../../../store/UserAccountContext';
import Main_UserProfile from './Profile/Main_UserProfile';
import Main_UserRfqs from './Rfqs/Main_UserRfqs';
import Main_UserAddress from './Address/Main_UserAddress';
import Main_UserPaymentMethod from './Payment/Main_UserPaymentMethod';
import styles from './Main_LoginUsers.module.css';

const SECTION_KEYS = ['profile', 'rfqs', 'address', 'payment'];

const renderSection = (section) => {
  switch (section) {
    case 'rfqs':
      return <Main_UserRfqs />;
    case 'address':
      return <Main_UserAddress />;
    case 'payment':
      return <Main_UserPaymentMethod />;
    case 'profile':
    default:
      return <Main_UserProfile />;
  }
};

const Main_LoginUsers = () => {
  const { section } = useParams();
  const normalized = SECTION_KEYS.includes(section) ? section : 'profile';

  const content = renderSection(normalized);

  return (
    <UserAccountContext_Provider>
      <div className={styles.page}>
        <TopBar />
        <div className={styles.layout}>
          <LoginUsersSidebar activeSection={normalized} />
          <div className={styles.content}>
            {normalized === 'rfqs' ? (
              content
            ) : (
              <LoginUsers_OperationContainer
                showSave
                saveButtonText="Save"
                successMessage="Saved successfully!"
              >
                <div className={styles.sectionBody}>{content}</div>
              </LoginUsers_OperationContainer>
            )}
          </div>
        </div>
      </div>
    </UserAccountContext_Provider>
  );
};

export default Main_LoginUsers;
