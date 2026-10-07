import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../common/Texts/Header';
import Main_TextField from '../common/InputOptions/TextField/Main_TextField';
import PrimaryBtn from '../common/Buttons/PrimaryBtn';
import Main_Checkbox from '../common/InputOptions/Checkbox/Main_Checkbox';
import { useAuthContext } from '../../store/AuthContext';
import authStyles from './AuthPanel.module.css';
import { sendMagicLink } from '../../utils/emailLink';
import EMAIL_LOGO from '../../../public/assets/figma/sign-in-pages/email-icon.svg';
import PW_SHOW_ICON from '../../../public/assets/figma/pw-show.svg';
import PW_HIDE_ICON from '../../../public/assets/figma/pw-hide.svg';

const LoginPanel = ({ onSignupClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshToken, isLoading } = useAuthContext();
  const [email, setEmail] = useState('admin@rivolx.com');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [magicLinkMessage, setMagicLinkMessage] = useState('');
  const [magicLinkError, setMagicLinkError] = useState('');

  const handleEmailLinkLogin = async () => {
    setMagicLinkMessage('');
    setMagicLinkError('');

    const trimmedEmail = String(email || '').trim();
    if (!trimmedEmail) {
      setMagicLinkError('Please enter your email address.');
      return;
    }

    setIsSendingLink(true);
    try {
      await sendMagicLink(trimmedEmail);
      setMagicLinkMessage('We emailed you a sign-in link. Check your inbox.');
    } catch (err) {
      setMagicLinkError(
        String(err?.message || '') || 'Unable to send the sign-in link.',
      );
    } finally {
      setIsSendingLink(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError('');

    const trimmedEmail = String(email || '').trim();
    if (!trimmedEmail || !password) {
      setLoginError('Please enter both email and password.');
      return;
    }

    try {
      await refreshToken({
        email: trimmedEmail,
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
          autoComplete="email"
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
              <img
                src={showPassword ? PW_HIDE_ICON : PW_SHOW_ICON}
                alt=""
                className={authStyles.eyeIcon}
              />
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

        <button
          type="button"
          className={authStyles.googleButton}
          onClick={handleEmailLinkLogin}
          disabled={isSendingLink}
        >
          <img src={EMAIL_LOGO} alt="" className={authStyles.googleIcon} />
          <span>{isSendingLink ? 'Sending link…' : 'Log in with Email'}</span>
        </button>

        {magicLinkMessage && (
          <p className={authStyles.successMessage}>{magicLinkMessage}</p>
        )}
        {magicLinkError && (
          <p className={authStyles.loginError}>{magicLinkError}</p>
        )}

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
