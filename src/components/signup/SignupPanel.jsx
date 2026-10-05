import { useState } from 'react';
import Header from '../common/Texts/Header';
import Main_TextField from '../common/InputOptions/TextField/Main_TextField';
import PrimaryBtn from '../common/Buttons/PrimaryBtn';
import Main_Checkbox from '../common/InputOptions/Checkbox/Main_Checkbox';
import authStyles from './AuthPanel.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const SignupPanel = ({ onLoginClick }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = String(name || '').trim();
    const trimmedEmail = String(email || '').trim();

    const nextErrors = {};
    if (!trimmedName) {
      nextErrors.name = 'Please enter your full name.';
    }
    if (!trimmedEmail) {
      nextErrors.email = 'Please enter your email address.';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
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
    if (!agreedToTerms) {
      nextErrors.terms = 'Please accept the Terms & Privacy Policy.';
    }

    setErrors(nextErrors);
    setSuccessMessage('');

    if (Object.keys(nextErrors).length > 0) return;

    // No registration endpoint exists yet — this is a UI-only flow.
    setSuccessMessage(
      'Account request submitted! A confirmation will follow once registration is live.',
    );
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAgreedToTerms(false);
  };

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

        <Main_TextField
          inputId="signup-name"
          label="Full name"
          size="large"
          defaultValue={name}
          onChange={(_, newValue) => setName(newValue)}
          placeholder="Jane Doe"
          autoComplete="name"
          error={Boolean(errors.name)}
          helperText={errors.name}
        />

        <Main_TextField
          inputId="signup-email"
          label="Work email"
          size="large"
          defaultValue={email}
          onChange={(_, newValue) => setEmail(newValue)}
          placeholder="you@company.com"
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email}
        />

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
              {showPassword ? '🙈' : '👁'}
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
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? '🙈' : '👁'}
            </button>
          }
        />

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
        {errors.terms && <p className={authStyles.fieldError}>{errors.terms}</p>}

        {successMessage && (
          <p className={authStyles.successMessage}>{successMessage}</p>
        )}

        <PrimaryBtn type="submit" fullWidth>
          Create account
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
          <span>Already have an account?</span>
          <button
            type="button"
            className={authStyles.loginLink}
            onClick={onLoginClick}
          >
            Log in
          </button>
        </p>
      </form>
    </section>
  );
};

export default SignupPanel;
