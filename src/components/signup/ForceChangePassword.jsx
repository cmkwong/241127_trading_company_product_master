import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../common/Texts/Header';
import Main_TextField from '../common/InputOptions/TextField/Main_TextField';
import PrimaryBtn from '../common/Buttons/PrimaryBtn';
import { useAuthContext } from '../../store/AuthContext';
import {
  completeMagicLinkSignIn,
  clearMagicLinkToken,
  resetPasswordWithToken,
} from '../../utils/emailLink';
import authStyles from './AuthPanel.module.css';
import PW_SHOW_ICON from '../../../public/assets/figma/pw-show.svg';
import PW_HIDE_ICON from '../../../public/assets/figma/pw-hide.svg';

const MIN_PASSWORD_LENGTH = 8;

/**
 * ForceChangePassword
 * Redeems a "forgot password" magic link and forces the user to choose a new
 * password before re-entering the app. On success it signs the user back in
 * with the new credentials and, after a short delay, redirects to /home.
 */
const ForceChangePassword = () => {
  const navigate = useNavigate();
  const { refreshToken, isLoading } = useAuthContext();

  const [phase, setPhase] = useState('form'); // form | success | error
  const [magicToken, setMagicToken] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  // Guards against React StrictMode running the effect twice in dev.
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const result = completeMagicLinkSignIn();
    if (!result?.magicToken) {
      setError(
        'This page is used to reset your password. Please request a new link from the sign-in page.',
      );
      setPhase('error');
      return;
    }
    setMagicToken(result.magicToken);
  }, []);

  // After a successful reset, give the user a moment to read the confirmation
  // before redirecting to /home with the fresh login already in place.
  useEffect(() => {
    if (phase !== 'success') return undefined;
    const id = setTimeout(() => navigate('/home', { replace: true }), 3000);
    return () => clearTimeout(id);
  }, [phase, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const nextErrors = {};
    if (!password) {
      nextErrors.password = 'Please enter a new password.';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const result = await resetPasswordWithToken(magicToken, password);
      const email = result?.email;
      if (!email) {
        throw new Error('Reset response did not include an email address.');
      }

      // Log the user in with the new password so they land on /home signed in.
      await refreshToken({ email, password, payload: { rememberMe: true } });

      clearMagicLinkToken();
      setPhase('success');
    } catch {
      setError(
        'Unable to reset your password. The link may have expired — please request a new one.',
      );
    }
  };

  if (phase === 'success') {
    return (
      <section className={authStyles.loginPanel}>
        <div className={authStyles.loginCard}>
          <div className={authStyles.cardHeader}>
            <Header as="h2" size="XL" color="#0c1e36">
              Password updated
            </Header>
            <p className={authStyles.cardSubheader}>
              Your password has been changed. Redirecting you to your account…
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (phase === 'error') {
    return (
      <section className={authStyles.loginPanel}>
        <div className={authStyles.loginCard}>
          <Header as="h2" size="XL" color="#0c1e36">
            Something went wrong
          </Header>
          <p className={authStyles.loginError}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={authStyles.loginPanel}>
      <form className={authStyles.loginCard} onSubmit={handleSubmit}>
        <div className={authStyles.cardHeader}>
          <Header as="h2" size="XL" color="#0c1e36">
            Reset your password
          </Header>
          <p className={authStyles.cardSubheader}>
            Choose a new password for your RIVOLX account.
          </p>
        </div>

        <Main_TextField
          inputId="reset-password"
          label="New password"
          size="large"
          defaultValue={password}
          onChange={(_, newValue) => setPassword(newValue)}
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••••"
          autoComplete="new-password"
          className={authStyles.passwordInput}
          error={Boolean(errors.password)}
          helperText={errors.password}
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

        <Main_TextField
          inputId="reset-confirm-password"
          label="Confirm new password"
          size="large"
          defaultValue={confirmPassword}
          onChange={(_, newValue) => setConfirmPassword(newValue)}
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="••••••••••"
          autoComplete="new-password"
          className={authStyles.passwordInput}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword}
          inputSuffix={
            <button
              type="button"
              className={authStyles.eyeButton}
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              <img
                src={showConfirmPassword ? PW_HIDE_ICON : PW_SHOW_ICON}
                alt=""
                className={authStyles.eyeIcon}
              />
            </button>
          }
        />

        {error && <p className={authStyles.loginError}>{error}</p>}

        <PrimaryBtn type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Updating…' : 'Update password'}
        </PrimaryBtn>
      </form>
    </section>
  );
};

export default ForceChangePassword;
