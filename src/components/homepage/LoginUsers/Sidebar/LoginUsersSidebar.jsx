import { useNavigate } from 'react-router-dom';
import styles from './LoginUsersSidebar.module.css';
import FIGMA_ICON_MY_PROFILE from '../../../../assets/figma/top-bar-menus/icon-my-profile.svg';
import FIGMA_ICON_MY_ORDERS from '../../../../assets/figma/top-bar-menus/icon-my-orders.svg';
import FIGMA_ICON_MY_ADDRESS from '../../../../assets/figma/top-bar-menus/icon-my-address.svg';
import FIGMA_ICON_MY_PAYMENT_METHOD from '../../../../assets/figma/top-bar-menus/icon-my-payment-method.svg';

const NAV_ITEMS = [
  {
    key: 'profile',
    label: 'My Profile',
    icon: FIGMA_ICON_MY_PROFILE,
  },
  {
    key: 'rfqs',
    label: 'My RFQs',
    icon: FIGMA_ICON_MY_ORDERS,
  },
  {
    key: 'address',
    label: 'My Address',
    icon: FIGMA_ICON_MY_ADDRESS,
  },
  {
    key: 'payment',
    label: 'Payment Method',
    icon: FIGMA_ICON_MY_PAYMENT_METHOD,
  },
];

const LoginUsersSidebar = ({ activeSection }) => {
  const navigate = useNavigate();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTitle}>My Account</div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`${styles.navItem} ${
              activeSection === item.key ? styles.active : ''
            }`}
            onClick={() => navigate(`/account/${item.key}`)}
          >
            <img
              src={item.icon}
              alt=""
              aria-hidden="true"
              className={styles.icon}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default LoginUsersSidebar;
