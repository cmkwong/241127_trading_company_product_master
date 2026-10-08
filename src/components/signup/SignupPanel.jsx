import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../store/AuthContext';
import { apiGet, apiPost } from '../../utils/crud';
import { sendMagicLink, MAGIC_LINK_COOLDOWN_SECONDS } from '../../utils/emailLink';
import Header from '../common/Texts/Header';
import Main_TextField from '../common/InputOptions/TextField/Main_TextField';
import PrimaryBtn from '../common/Buttons/PrimaryBtn';
import Main_Checkbox from '../common/InputOptions/Checkbox/Main_Checkbox';
import authStyles from './AuthPanel.module.css';
import useCooldown, { formatCooldown } from '../../hooks/useCooldown';
import SentEmail from './SentEmail';
import GOOGLE_LOGO from '../../../public/assets/figma/sign-in-pages/google-icon.svg';
import EMAIL_LOGO from '../../../public/assets/figma/sign-in-pages/email-icon.svg';
import PW_SHOW_ICON from '../../../public/assets/figma/pw-show.svg';
import PW_HIDE_ICON from '../../../public/assets/figma/pw-hide.svg';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const SIGNUP_ENDPOINT =
  'http://localhost:3001/api/v1/trade_business/home/users/signup';
const CHECK_EMAIL_ENDPOINT =
  'http://localhost:3001/api/v1/trade_business/home/users/signup/check-email';

const SignupPanel = ({ onLoginClick }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [magicLinkSentTo, setMagicLinkSentTo] = useState('');
  const [magicLinkError, setMagicLinkError] = useState('');
  const [signupMode, setSignupMode] = useState('password');
  const [loginLinkPulse, setLoginLinkPulse] = useState(0);

  const { secondsLeft, isCoolingDown, start } = useCooldown(
    MAGIC_LINK_COOLDOWN_SECONDS * 1000,
  );

  const { refreshToken } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const flagDuplicateEmail = () => {
    setErrors((prev) => ({
      ...prev,
      email: 'An account with this email already exists.',
    }));
    // Increment to retrigger the "Login" button blink on every duplicate attempt.
    setLoginLinkPulse((n) => n + 1);
  };

  const toggleSignupMode = () => {
    setSignupMode((prev) => (prev === 'password' ? 'emailLink' : 'password'));
    setErrors({});
    setSubmitError('');
    setSuccessMessage('');
    setMagicLinkSentTo('');
    setMagicLinkError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setMagicLinkError('');

    const trimmedFirstName = String(firstName || '').trim();
    const trimmedLastName = String(lastName || '').trim();
    const trimmedEmail = String(email || '').trim();

    const nextErrors = {};
    if (!trimmedFirstName) {
      nextErrors.firstName = 'Please enter your first name.';
    }
    if (!trimmedLastName) {
      nextErrors.lastName = 'Please enter your last name.';
    }
    if (!trimmedEmail) {
      nextErrors.email = 'Please enter your email address.';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (signupMode === 'password') {
      if (!password) {
        nextErrors.password = 'Please choose a password.';
      } else if (password.length < MIN_PASSWORD_LENGTH) {
        nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
      }
      if (!confirmPassword) {
        nextErrors.confirmPassword = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    if (!agreedToTerms) {
      nextErrors.terms = 'Please accept the Terms & Privacy Policy.';
    }

    setErrors(nextErrors);
    setSuccessMessage('');

    if (Object.keys(nextErrors).length > 0) return;

    // Pre-flight duplicate-email check shared by both sign-up flows. Runs
    // before the account is created (password mode) or the verify email is
    // sent (email-link mode).
    try {
      const check = await apiGet(CHECK_EMAIL_ENDPOINT, {
        params: { email: trimmedEmail },
      });
      if (check?.data?.exists) {
        flagDuplicateEmail();
        return;
      }
    } catch {
      setSubmitError(
        'Unable to verify your email right now. Please try again.',
      );
      return;
    }

    // Email-link (passwordless) sign-up: send the server-generated magic link
    // via SMTP. The first/last name are remembered so /finishSignUp can
    // pre-fill them.
    if (signupMode === 'emailLink') {
      if (isSendingLink || isCoolingDown) return;

      setIsSendingLink(true);
      try {
        await sendMagicLink(trimmedEmail, {
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
        });
        setMagicLinkSentTo(trimmedEmail);
        start();
      } catch (err) {
        setMagicLinkError(
          String(err?.message || '') || 'Unable to send the sign-up link.',
        );
      } finally {
        setIsSendingLink(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost(SIGNUP_ENDPOINT, {
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        email: trimmedEmail,
        password,
        display_name: `${trimmedFirstName} ${trimmedLastName}`.trim(),
      });

      // Follow the login-success flow: exchange the just-created credentials
      // for the app JWT so the user is logged in immediately, then land on the
      // same destination the login panel uses.
      setSuccessMessage('Account created! Signing you in…');
      try {
        await refreshToken({
          email: trimmedEmail,
          password,
          payload: { rememberMe: true },
        });
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAgreedToTerms(false);
        navigate(location.state?.from || '/panel/product_master', {
          replace: true,
        });
      } catch {
        // The account was created, but the auto-login token exchange failed.
        // Don't strand the user — ask them to log in manually.
        setSuccessMessage('Account created! Please log in.');
      }
    } catch (err) {
      const message = String(err?.message || '');
      if (/already exists/i.test(message)) {
        flagDuplicateEmail();
      } else {
        setSubmitError('Unable to create your account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (magicLinkSentTo) {
    return (
      <SentEmail
        purpose="signup"
        email={magicLinkSentTo}
        secondsLeft={secondsLeft}
        isResending={isSendingLink}
        onResend={handleSubmit}
        onBack={() => {
          setMagicLinkSentTo('');
          setMagicLinkError('');
        }}
      />
    );
  }

  return (
    <section className={authStyles.loginPanel} data-node-id="853:29">
      <form className={authStyles.loginCard} onSubmit={handleSubmit} noValidate>
        <div className={authStyles.cardHeader}>
          <Header as="h2" size="XL" color="#0c1e36">
            Create your account
          </Header>
          <p className={authStyles.cardSubheader}>
            Join RIVOLX to start managing your pet store.
          </p>
        </div>

        <div className={authStyles.nameSection}>
          <Main_TextField
            inputId="first-name"
            label="First name"
            size="large"
            defaultValue={firstName}
            onChange={(_, newValue) => setFirstName(newValue)}
            placeholder="Jane"
            autoComplete="name"
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
          />

          <Main_TextField
            inputId="last-name"
            label="Last name"
            size="large"
            defaultValue={lastName}
            onChange={(_, newValue) => setLastName(newValue)}
            placeholder="Doe"
            autoComplete="family-name"
            error={Boolean(errors.lastName)}
            helperText={errors.lastName}
          />
        </div>
        <Main_TextField
          inputId="signup-email"
          label="Email"
          size="large"
          defaultValue={email}
          onChange={(_, newValue) => {
            setEmail(newValue);
            if (loginLinkPulse) setLoginLinkPulse(0);
          }}
          placeholder="you@company.com"
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email}
        />

        {signupMode === 'password' && (
          <>
            <Main_TextField
              inputId="signup-password"
              label="Password"
              size="large"
              defaultValue={password}
              onChange={(_, newValue) => setPassword(newValue)}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
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
              inputId="signup-confirm-password"
              label="Confirm password"
              size="large"
              defaultValue={confirmPassword}
              onChange={(_, newValue) => setConfirmPassword(newValue)}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
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
          </>
        )}

        <div className={authStyles.termsRow}>
          <Main_Checkbox
            checked={agreedToTerms}
            onChange={(checked) => setAgreedToTerms(checked)}
            size="S"
            label={
              <span className={authStyles.termsText}>
                I agree to the Terms &amp; Privacy Policy
              </span>
            }
            className={authStyles.rememberCheckbox}
          />
        </div>
        {errors.terms && (
          <p className={authStyles.fieldError}>{errors.terms}</p>
        )}

        {successMessage && (
          <p className={authStyles.successMessage}>{successMessage}</p>
        )}

        {submitError && <p className={authStyles.loginError}>{submitError}</p>}

        <PrimaryBtn
          type="submit"
          fullWidth
          disabled={
            signupMode === 'emailLink'
              ? isSendingLink || isCoolingDown
              : isSubmitting
          }
        >
          {signupMode === 'emailLink'
            ? isSendingLink
              ? 'Sending link…'
              : isCoolingDown
                ? `Resend in ${formatCooldown(secondsLeft)}`
                : 'Create account'
            : isSubmitting
              ? 'Creating account...'
              : 'Create account'}
        </PrimaryBtn>

        <div className={authStyles.dividerRow}>
          <span className={authStyles.dividerLine} />
          <span className={authStyles.dividerText}>or continue with just</span>
          <span className={authStyles.dividerLine} />
        </div>

        <div className={authStyles.alternativeAuths}>
          <div className={authStyles.ButtonHolder}>
            <button type="button" className={authStyles.googleButton}>
              <img src={GOOGLE_LOGO} alt="" className={authStyles.googleIcon} />
              <span>Google</span>
            </button>
          </div>

          <div className={authStyles.ButtonHolder}>
            <button
              type="button"
              className={authStyles.googleButton}
              onClick={toggleSignupMode}
            >
              <img src={EMAIL_LOGO} alt="" className={authStyles.googleIcon} />
              <span>{signupMode === 'password' ? 'Email' : 'Password'}</span>
            </button>
          </div>
        </div>

        {magicLinkError && (
          <p className={authStyles.loginError}>{magicLinkError}</p>
        )}

        <p className={authStyles.bottomText}>
          <span>Already have an account?</span>
          <button
            type="button"
            key={loginLinkPulse}
            className={`${authStyles.loginLink}${loginLinkPulse ? ` ${authStyles.loginLinkAttention}` : ''}`}
            onClick={() => {
              setLoginLinkPulse(0);
              onLoginClick?.();
            }}
          >
            Login
          </button>
        </p>
      </form>
    </section>
  );
};

export default SignupPanel;
