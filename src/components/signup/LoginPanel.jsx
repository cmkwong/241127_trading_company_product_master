import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../common/Texts/Header';
import Main_TextField from '../common/InputOptions/TextField/Main_TextField';
import PrimaryBtn from '../common/Buttons/PrimaryBtn';
import Main_Checkbox from '../common/InputOptions/Checkbox/Main_Checkbox';
import { useAuthContext } from '../../store/AuthContext';
import authStyles from './AuthPanel.module.css';
import {
  sendMagicLink,
  sendPasswordResetLink,
  MAGIC_LINK_COOLDOWN_SECONDS,
} from '../../utils/emailLink';
import useCooldown, { formatCooldown } from '../../hooks/useCooldown';
import SentEmail from './SentEmail';
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
  const [magicLinkSentTo, setMagicLinkSentTo] = useState('');
  const [magicLinkError, setMagicLinkError] = useState('');
  const [loginMode, setLoginMode] = useState('password');
  const [forgotView, setForgotView] = useState(false);
  const [resetSentTo, setResetSentTo] = useState('');
  const [resetError, setResetError] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const { secondsLeft, isCoolingDown, start } = useCooldown(
    MAGIC_LINK_COOLDOWN_SECONDS * 1000,
  );

  const {
    secondsLeft: resetSecondsLeft,
    isCoolingDown: resetIsCoolingDown,
    start: startReset,
  } = useCooldown(MAGIC_LINK_COOLDOWN_SECONDS * 1000);

  const toggleLoginMode = () => {
    setLoginMode((prev) => (prev === 'password' ? 'emailLink' : 'password'));
    setLoginError('');
    setMagicLinkSentTo('');
    setMagicLinkError('');
  };

  const handleEmailLinkLogin = async () => {
    setMagicLinkError('');

    if (isSendingLink || isCoolingDown) return;

    const trimmedEmail = String(email || '').trim();
    if (!trimmedEmail) {
      setMagicLinkError('Please enter your email address.');
      return;
    }

    setIsSendingLink(true);
    try {
      await sendMagicLink(trimmedEmail);
      setMagicLinkSentTo(trimmedEmail);
      start();
    } catch (err) {
      setMagicLinkError(
        String(err?.message || '') || 'Unable to send the sign-in link.',
      );
    } finally {
      setIsSendingLink(false);
    }
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    setResetError('');

    const trimmedEmail = String(email || '').trim();
    if (!trimmedEmail) {
      setResetError('Please enter your email address.');
      return;
    }

    if (isSendingReset || resetIsCoolingDown) return;

    setIsSendingReset(true);
    try {
      await sendPasswordResetLink(trimmedEmail);
      setResetSentTo(trimmedEmail);
      startReset();
    } catch {
      setResetError('Unable to send the reset link. Please try again.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const openForgotView = () => {
    setForgotView(true);
    setResetSentTo('');
    setResetError('');
  };

  const closeForgotView = () => {
    setForgotView(false);
    setResetSentTo('');
    setResetError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError('');

    if (loginMode === 'emailLink') {
      await handleEmailLinkLogin();
      return;
    }

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

  if (resetSentTo) {
    return (
      <SentEmail
        purpose="reset"
        email={resetSentTo}
        secondsLeft={resetSecondsLeft}
        isResending={isSendingReset}
        onResend={handleForgotPasswordSubmit}
        onBack={closeForgotView}
      />
    );
  }

  if (forgotView) {
    return (
      <section className={authStyles.loginPanel} data-node-id="forgot-password">
        <form
          className={authStyles.loginCard}
          onSubmit={handleForgotPasswordSubmit}
        >
          <div className={authStyles.cardHeader}>
            <Header as="h2" size="XL" color="#0c1e36">
              Forgot password?
            </Header>
            <p className={authStyles.cardSubheader}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <Main_TextField
            inputId="forgot-email"
            label="Email address"
            size="large"
            defaultValue={email}
            onChange={(_, newValue) => setEmail(newValue)}
            placeholder="admin@rivolx.com"
            autoComplete="email"
          />

          {resetError && <p className={authStyles.loginError}>{resetError}</p>}

          <PrimaryBtn
            type="submit"
            fullWidth
            disabled={isSendingReset || resetIsCoolingDown}
          >
            {isSendingReset
              ? 'Sending link…'
              : resetIsCoolingDown
                ? `Resend in ${formatCooldown(resetSecondsLeft)}`
                : 'Send reset link'}
          </PrimaryBtn>

          <p className={authStyles.bottomText}>
            <button
              type="button"
              className={authStyles.signupLink}
              onClick={closeForgotView}
            >
              Back to sign in
            </button>
          </p>
        </form>
      </section>
    );
  }

  if (magicLinkSentTo) {
    return (
      <SentEmail
        purpose="signin"
        email={magicLinkSentTo}
        secondsLeft={secondsLeft}
        isResending={isSendingLink}
        onResend={handleEmailLinkLogin}
        onBack={() => {
          setMagicLinkSentTo('');
          setMagicLinkError('');
        }}
      />
    );
  }

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

        {loginMode === 'password' && (
          <>
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
                label={
                  <span className={authStyles.rememberText}>Remember me</span>
                }
                className={authStyles.rememberCheckbox}
              />
              <button
                type="button"
                className={authStyles.forgotButton}
                onClick={openForgotView}
              >
                Forgot password?
              </button>
            </div>
          </>
        )}

        {loginError && <p className={authStyles.loginError}>{loginError}</p>}

        <PrimaryBtn
          type="submit"
          fullWidth
          disabled={
            loginMode === 'emailLink'
              ? isSendingLink || isCoolingDown
              : isLoading
          }
        >
          {loginMode === 'emailLink'
            ? isSendingLink
              ? 'Sending link…'
              : isCoolingDown
                ? `Resend in ${formatCooldown(secondsLeft)}`
                : 'Log In'
            : isLoading
              ? 'Logging in...'
              : 'Log In'}
        </PrimaryBtn>

        {loginMode === 'password' && (
          <div className={authStyles.dividerRow}>
            <span className={authStyles.dividerLine} />
            <span className={authStyles.dividerText}>or continue with</span>
            <span className={authStyles.dividerLine} />
          </div>
        )}

        <button
          type="button"
          className={authStyles.googleButton}
          onClick={toggleLoginMode}
          disabled={isSendingLink || isLoading}
        >
          {loginMode === 'password' && (
            <img src={EMAIL_LOGO} alt="" className={authStyles.googleIcon} />
          )}
          <span>
            {loginMode === 'password' ? 'Login with Email' : 'Use Password'}
          </span>
        </button>

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
