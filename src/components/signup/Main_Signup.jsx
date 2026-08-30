import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../common/Texts/Header';
import Label from '../common/Texts/Label';
import Sub_TextField from '../common/InputOptions/TextField/Sub_TextField';
import Main_Checkbox from '../common/InputOptions/Checkbox/Main_Checkbox';
import { useAuthContext } from '../../store/AuthContext';
import styles from './Main_Signup.module.css';

const FEATURE_ITEMS = [
  { icon: '📦', text: 'Product & supplier management' },
  { icon: '💰', text: 'Sales quotation & pricing' },
  { icon: '🚚', text: 'Shipping & logistics tracking' },
  { icon: '📊', text: 'Purchase request workflows' },
];

const Main_Signup = () => {
  const navigate = useNavigate();
  const { refreshToken, isLoading } = useAuthContext();
  const [email, setEmail] = useState('admin@rivolx.com');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError('');

    const username = String(email || '').trim();
    if (!username || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }

    try {
      await refreshToken({
        username,
        password,
        payload: { rememberMe },
      });
      navigate('/panel/product_master', { replace: true });
    } catch {
      setLoginError(
        'Login failed. Please check your credentials and try again.',
      );
    }
  };

  return (
    <div className={styles.signupPage} data-node-id="853:2">
      <section className={styles.brandingPanel} data-node-id="853:3">
        <div className={styles.brandTopBlock}>
          <div className={styles.logoRow} data-node-id="853:4">
            <div className={styles.logoIconWrap}>
              <img
                src="/assets/brand_logos/watermark_pure_logo.png"
                alt="Rivolx paw logo"
                className={styles.logoIcon}
              />
            </div>
            <p className={styles.logoWordmark}>RIVOLX</p>
          </div>

          <div className={styles.brandContent} data-node-id="853:8">
            <Header
              as="h1"
              size="XL"
              className={styles.brandHeading}
              color="#ffffff"
            >
              Manage your pet store
              <br />
              with confidence.
            </Header>

            <p className={styles.brandLead}>
              The all-in-one B2B marketplace platform for pet product sourcing,
              quotations, and supplier management.
            </p>

            <ul className={styles.featureList}>
              {FEATURE_ITEMS.map((item) => (
                <li key={item.text} className={styles.featureItem}>
                  <span className={styles.featureBadge} aria-hidden="true">
                    {item.icon}
                  </span>
                  <Label
                    className={styles.featureText}
                    size="S"
                    weight="medium"
                  >
                    {item.text}
                  </Label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className={styles.brandCopyright}>
          © 2025 RIVOLX. All rights reserved.
        </p>
      </section>

      <section className={styles.loginPanel} data-node-id="853:29">
        <form className={styles.loginCard} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <Header as="h2" size="XL" color="#0c1e36">
              Welcome back
            </Header>
            <p className={styles.cardSubheader}>
              Sign in to your RIVOLX admin account
            </p>
          </div>

          <div className={styles.fieldGroup}>
            <Label
              htmlFor="signin-email"
              size="S"
              weight="medium"
              color="#0c1e36"
            >
              Email address
            </Label>
            <Sub_TextField
              id="signin-email"
              value={email}
              onInputChange={(_, newValue) => setEmail(newValue)}
              placeholder="admin@rivolx.com"
              autoComplete="username"
              className={styles.textInput}
            />
          </div>

          <div className={styles.fieldGroup}>
            <Label
              htmlFor="signin-password"
              size="S"
              weight="medium"
              color="#0c1e36"
            >
              Password
            </Label>
            <div className={styles.passwordField}>
              <Sub_TextField
                id="signin-password"
                value={password}
                onInputChange={(_, newValue) => setPassword(newValue)}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                autoComplete="current-password"
                className={`${styles.textInput} ${styles.passwordInput}`}
              />
              <button
                type="button"
                className={styles.eyeButton}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div className={styles.authRow}>
            <Main_Checkbox
              checked={rememberMe}
              onChange={(checked) => setRememberMe(checked)}
              size="S"
              label={<span className={styles.rememberText}>Remember me</span>}
              className={styles.rememberCheckbox}
            />
            <button type="button" className={styles.forgotButton}>
              Forgot password?
            </button>
          </div>

          {loginError && <p className={styles.loginError}>{loginError}</p>}

          <button
            type="submit"
            className={styles.signInButton}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className={styles.dividerRow}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>or continue with</span>
            <span className={styles.dividerLine} />
          </div>

          <button type="button" className={styles.googleButton}>
            Google
          </button>

          <p className={styles.bottomText}>
            <span>Don&apos;t have an account?</span>
            <button type="button" className={styles.signupLink}>
              Sign up
            </button>
          </p>
        </form>
      </section>
    </div>
  );
};

export default Main_Signup;
