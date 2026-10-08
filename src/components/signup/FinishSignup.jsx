import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../common/Texts/Header';
import Main_TextField from '../common/InputOptions/TextField/Main_TextField';
import PrimaryBtn from '../common/Buttons/PrimaryBtn';
import { useAuthContext } from '../../store/AuthContext';
import {
  completeMagicLinkSignIn,
  getPendingSignupNames,
  clearPendingSignupNames,
  clearMagicLinkToken,
} from '../../utils/emailLink';
import authStyles from './AuthPanel.module.css';

/**
 * Completes the server-issued magic-link (nodemailer/SMTP) flow.
 *
 * On mount it extracts the token from the URL and exchanges it for the app's
 * own JWT. A returning user is logged straight in; a brand-new user gets a
 * "finish your profile" name form (the backend answers NAMES_REQUIRED until
 * first_name/last_name are provided).
 */
const FinishSignup = () => {
  const navigate = useNavigate();
  const { loginWithMagicLinkToken, isLoading } = useAuthContext();

  const [phase, setPhase] = useState('loading'); // loading | names | error
  const [magicToken, setMagicToken] = useState(null);
  const [pendingNames] = useState(() => getPendingSignupNames());
  const [firstName, setFirstName] = useState(pendingNames?.first_name || '');
  const [lastName, setLastName] = useState(pendingNames?.last_name || '');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  // Guards against React StrictMode running the effect twice in dev, which would
  // otherwise fire a duplicate token exchange on the remount.
  const ranOnce = useRef(false);

  useEffect(() => {
    // Run once. React StrictMode double-invokes effects in dev; a cleanup/cancel
    // flag here would discard the first (and only) run's async work, leaving the
    // page stuck at "loading". The idempotent token capture in emailLink.js
    // already makes the read safe to repeat.
    if (ranOnce.current) return;
    ranOnce.current = true;

    (async () => {
      try {
        const result = completeMagicLinkSignIn();

        if (!result?.magicToken) {
          setError(
            'This page is used to finish signing in via the email link. Please request a new link from the sign-in page.',
          );
          setPhase('error');
          return;
        }

        setMagicToken(result.magicToken);
        const outcome = await loginWithMagicLinkToken(result.magicToken);

        if (outcome === 'NAMES_REQUIRED') {
          setPhase('names');
        } else {
          clearMagicLinkToken();
          clearPendingSignupNames();
          navigate('/home', { replace: true });
        }
      } catch {
        setError('Unable to complete sign-in. Please try again.');
        setPhase('error');
      }
    })();
  }, [loginWithMagicLinkToken, navigate]);

  const handleFinish = async (event) => {
    event.preventDefault();
    setError('');

    const nextErrors = {};
    if (!String(firstName || '').trim()) {
      nextErrors.firstName = 'Please enter your first name.';
    }
    if (!String(lastName || '').trim()) {
      nextErrors.lastName = 'Please enter your last name.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await loginWithMagicLinkToken(magicToken, firstName, lastName);
      clearMagicLinkToken();
      clearPendingSignupNames();
      navigate('/home', { replace: true });
    } catch {
      setError('Unable to finish sign-up. Please try again.');
    }
  };

  if (phase === 'loading') {
    return (
      <section className={authStyles.loginPanel}>
        <div className={authStyles.loginCard}>
          <Header as="h2" size="XL" color="#0c1e36">
            Finishing sign-in…
          </Header>
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
      <form className={authStyles.loginCard} onSubmit={handleFinish}>
        <div className={authStyles.cardHeader}>
          <Header as="h2" size="XL" color="#0c1e36">
            Finish creating your account
          </Header>
          <p className={authStyles.cardSubheader}>
            Just one more step — tell us your name.
          </p>
        </div>

        <Main_TextField
          inputId="finish-first-name"
          label="First name"
          size="large"
          defaultValue={firstName}
          onChange={(_, newValue) => setFirstName(newValue)}
          placeholder="John"
          autoComplete="given-name"
          error={Boolean(errors.firstName)}
          helperText={errors.firstName}
        />

        <Main_TextField
          inputId="finish-last-name"
          label="Last name"
          size="large"
          defaultValue={lastName}
          onChange={(_, newValue) => setLastName(newValue)}
          placeholder="Doe"
          autoComplete="family-name"
          error={Boolean(errors.lastName)}
          helperText={errors.lastName}
        />

        {error && <p className={authStyles.loginError}>{error}</p>}

        <PrimaryBtn type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Finishing…' : 'Continue'}
        </PrimaryBtn>
      </form>
    </section>
  );
};

export default FinishSignup;
