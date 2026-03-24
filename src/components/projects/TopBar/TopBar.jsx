import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuthContext } from '../../../store/AuthContext';
import { ProductContext } from '../../../store/ProductContext';
import { SupplierContext } from '../../../store/SupplierContext';
import { canProceedWithRecordSwitch } from '../../../utils/contextDataUtils';
import styles from './TopBar.module.css';

const TopBar = ({ title, activeView, onViewChange }) => {
  const { token, refreshToken, isLoading, error, clearToken } =
    useAuthContext();
  const productContext = useContext(ProductContext);
  const supplierContext = useContext(SupplierContext);
  const refreshProductList = productContext?.refreshProductList;
  const refreshSupplierList = supplierContext?.refreshSupplierList;
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(!showLogin);
    setLoginError(null);
  };

  const handleLogout = () => {
    clearToken();
    setShowLogin(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeView === 'product') {
        if (typeof refreshProductList === 'function') {
          await refreshProductList();
        }
      } else {
        if (typeof refreshSupplierList === 'function') {
          await refreshSupplierList();
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);

    // Create a body object with the input credentials
    const credentials = {
      username,
      password,
      payload: '', // Optional payload if your API needs it
    };

    try {
      // Use the new AuthContext capability to pass manual credentials
      await refreshToken(credentials);
      // Removed setShowLogin(false) so the user can see validation or result if needed,
      // but usually closing it on success is fine.
      // However user might want "input username and password", so let's keep it standard.
      setShowLogin(false);
    } catch (err) {
      setLoginError('Login failed. Check console or credentials.');
      console.error(err);
    }
  };

  const handleViewSwitch = (nextView) => {
    if (!onViewChange || nextView === activeView) {
      return;
    }

    const currentContext =
      activeView === 'product' ? productContext : supplierContext;

    const canSwitch = canProceedWithRecordSwitch({
      hasRecordId: !!currentContext?.pageData?.id,
      isDataUnchanged:
        typeof currentContext?.isDataUnchanged === 'function'
          ? currentContext.isDataUnchanged()
          : true,
    });

    if (!canSwitch) {
      return;
    }

    onViewChange(nextView);
  };

  return (
    <div className={styles.topBar}>
      <div className={styles.leftSection}>
        <div className={styles.titleWrap}>
          <div className={styles.title}>{title || 'Product Master'}</div>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh list"
            aria-label="Refresh list"
          >
            <svg
              className={`${styles.refreshIcon} ${isRefreshing ? styles.spinning : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36M20.49 15a9 9 0 01-14.85 3.36" />
            </svg>
          </button>
        </div>
        <div className={styles.navLinks}>
          <button
            className={`${styles.navBtn} ${
              activeView === 'product' ? styles.active : ''
            }`}
            onClick={() => handleViewSwitch('product')}
          >
            Product Master
          </button>
          <button
            className={`${styles.navBtn} ${
              activeView === 'supplier' ? styles.active : ''
            }`}
            onClick={() => handleViewSwitch('supplier')}
          >
            Supplier Master
          </button>
        </div>
      </div>

      <div className={styles.authContainer}>
        {token ? (
          <div className={styles.loggedIn}>
            <span className={styles.status}>Logged In</span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className={styles.loggedOut}>
            <button className={styles.loginBtn} onClick={handleLoginClick}>
              {showLogin ? 'Close' : 'Login'}
            </button>

            {showLogin && (
              <div className={styles.loginDropdown}>
                <form onSubmit={handleSubmit} className={styles.loginForm}>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.input}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitBtn}
                  >
                    {isLoading ? 'Logging in...' : 'Submit'}
                  </button>
                  {error && <div className={styles.error}>Auth Error</div>}
                  {loginError && (
                    <div className={styles.error}>{loginError}</div>
                  )}
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

TopBar.propTypes = {
  title: PropTypes.string,
  activeView: PropTypes.string,
  onViewChange: PropTypes.func,
};

export default TopBar;
