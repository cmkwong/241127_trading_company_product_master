import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../common/Texts/Header';
import Main_TextField from '../common/InputOptions/TextField/Main_TextField';
import PrimaryBtn from '../common/Buttons/PrimaryBtn';
import Main_Checkbox from '../common/InputOptions/Checkbox/Main_Checkbox';
import { useAuthContext } from '../../store/AuthContext';
import authStyles from './AuthPanel.module.css';

const LoginPanel = ({ onSignupClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
      navigate(location.state?.from || '/panel/product_master', {
        replace: true,
      });
    } catch {
      setLoginError(
        'Login failed. Please check your credentials and try again.',
      );
    }
  };

  return (
    <section className={authStyles.loginPanel} data-node-id="853:29">
      <form className={authStyles.loginCard} onSubmit={handleSubmit}>
        <div className={authStyles.cardHeader}>
          <Header as="h2" size="XL" color="#0c1e36">
            Welcome back
          </Header>
          <p className={authStyles.cardSubheader}>
            Sign in to your RIVOLX admin account
          </p>
        </div>

        <Main_TextField
          inputId="signin-email"
          label="Email address"
          size="large"
          defaultValue={email}
          onChange={(_, newValue) => setEmail(newValue)}
          placeholder="admin@rivolx.com"
          autoComplete="username"
        />

        <Main_TextField
          inputId="signin-password"
          label="Password"
          size="large"
          defaultValue={password}
          onChange={(_, newValue) => setPassword(newValue)}
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••••"
          autoComplete="current-password"
          className={authStyles.passwordInput}
          inputSuffix={
            <button
              type="button"
              className={authStyles.eyeButton}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          }
        />

        <div className={authStyles.authRow}>
          <Main_Checkbox
            checked={rememberMe}
            onChange={(checked) => setRememberMe(checked)}
            size="S"
            label={<span className={authStyles.rememberText}>Remember me</span>}
            className={authStyles.rememberCheckbox}
          />
          <button type="button" className={authStyles.forgotButton}>
            Forgot password?
          </button>
        </div>

        {loginError && <p className={authStyles.loginError}>{loginError}</p>}

        <PrimaryBtn type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </PrimaryBtn>

        <div className={authStyles.dividerRow}>
          <span className={authStyles.dividerLine} />
          <span className={authStyles.dividerText}>or continue with</span>
          <span className={authStyles.dividerLine} />
        </div>

        <button type="button" className={authStyles.googleButton}>
          Google
        </button>

        <p className={authStyles.bottomText}>
          <span>Don&apos;t have an account?</span>
          <button
            type="button"
            className={authStyles.signupLink}
            onClick={onSignupClick}
          >
            Sign up
          </button>
        </p>
      </form>
    </section>
  );
};

export default LoginPanel;
