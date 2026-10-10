import { useNavigate } from 'react-router-dom';
import styles from './LoginUsersSidebar.module.css';

const NAV_ITEMS = [
  {
    key: 'profile',
    label: 'My Profile',
    icon: '/assets/figma/top-bar-menus/icon-my-profile.svg',
  },
  {
    key: 'rfqs',
    label: 'My RFQs',
    icon: '/assets/figma/top-bar-menus/icon-my-orders.svg',
  },
  {
    key: 'address',
    label: 'My Address',
    icon: '/assets/figma/top-bar-menus/icon-my-address.svg',
  },
  {
    key: 'payment',
    label: 'Payment Method',
    icon: '/assets/figma/top-bar-menus/icon-my-payment-method.svg',
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
            <img src={item.icon} alt="" aria-hidden="true" className={styles.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default LoginUsersSidebar;
