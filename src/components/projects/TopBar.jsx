import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuthContext } from '../../store/AuthContext';
import styles from './TopBar.module.css';

const TopBar = ({ title, activeView, onViewChange }) => {
  const { token, refreshToken, isLoading, error, clearToken } =
    useAuthContext();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  const handleLoginClick = () => {
    setShowLogin(!showLogin);
    setLoginError(null);
  };

  const handleLogout = () => {
    clearToken();
    setShowLogin(false);
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

  return (
    <div className={styles.topBar}>
      <div className={styles.leftSection}>
        <div className={styles.title}>{title || 'Product Master'}</div>
        <div className={styles.navLinks}>
          <button
            className={`${styles.navBtn} ${
              activeView === 'product' ? styles.active : ''
            }`}
            onClick={() => onViewChange && onViewChange('product')}
          >
            Product Master
          </button>
          <button
            className={`${styles.navBtn} ${
              activeView === 'supplier' ? styles.active : ''
            }`}
            onClick={() => onViewChange && onViewChange('supplier')}
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
