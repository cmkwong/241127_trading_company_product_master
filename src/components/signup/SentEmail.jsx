import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Header from '../common/Texts/Header';
import PrimaryBtn from '../common/Buttons/PrimaryBtn';
import Notice from '../common/Texts/Notice';
import { formatCooldown } from '../../hooks/useCooldown';
import authStyles from './AuthPanel.module.css';
import styles from './SentEmail.module.css';

/**
 * SentEmail
 * Full-card takeover shown after a passwordless magic-link (sign-in or sign-up)
 * has been emailed to the user. Replaces the auth form and explains what to do
 * next, surfaces a "check your Junk/Spam folder" hint, and offers a resend
 * action that is throttled by the parent's cooldown.
 *
 * purpose: 'signin' | 'signup' | 'reset' — drives the copy.
 * email: address the link was sent to.
 * secondsLeft: remaining cooldown seconds (0 = resend allowed).
 * isResending: whether a resend request is currently in flight.
 * onResend: called when the user requests another link.
 * onBack: called to return to the auth form.
 */
const SentEmail = ({
  email,
  purpose = 'signin',
  secondsLeft = 0,
  isResending = false,
  onResend,
  onBack,
}) => {
  const cardRef = useRef(null);
  const isSignup = purpose === 'signup';
  const isReset = purpose === 'reset';

  // The form that previously held focus is gone once this card mounts, so move
  // focus (and screen-reader attention) onto the takeover.
  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  const resendDisabled = isResending || secondsLeft > 0;
  const resendLabel = isResending
    ? 'Sending link…'
    : secondsLeft > 0
      ? `Resend in ${formatCooldown(secondsLeft)}`
      : 'Resend email';

  return (
    <section className={authStyles.loginPanel}>
      <div className={authStyles.loginCard} tabIndex={-1} ref={cardRef}>
        <div className={authStyles.cardHeader}>
          <Header as="h2" size="XL" color="#0c1e36">
            Check your inbox
          </Header>
          <p className={authStyles.cardSubheader}>
            {isSignup
              ? 'We sent your sign-up link by email'
              : isReset
                ? 'We sent your password reset link by email'
                : 'We sent your sign-in link by email'}
          </p>
        </div>

        <div className={styles.sentBlock} aria-live="polite">
          <span className={styles.sentBadge} aria-hidden="true">
            ✉
          </span>
          <div className={styles.sentBody}>
            <p className={styles.sentMessage}>
              {isSignup ? (
                <>
                  We sent a sign-up link to <strong>{email}</strong>.
                </>
              ) : isReset ? (
                <>
                  We sent a password reset link to <strong>{email}</strong>.
                </>
              ) : (
                <>
                  We sent a sign-in link to <strong>{email}</strong>.
                </>
              )}
            </p>
            <p className={styles.sentHint}>
              {isSignup
                ? 'Open the email and click the button to verify your address and create your RIVOLX account.'
                : isReset
                  ? 'Open the email and click the button to choose a new password.'
                  : 'Open the email and click the button to sign in to RIVOLX.'}
            </p>
            <p className={styles.sentExpiry}>
              The link expires in 15 minutes and can only be used once.
            </p>
          </div>
        </div>

        <Notice variant="warning" title="Can't find it?">
          Check your Junk or Spam folder — the email may have been filtered
          there.
        </Notice>

        <PrimaryBtn
          type="button"
          fullWidth
          disabled={resendDisabled}
          onClick={onResend}
        >
          {resendLabel}
        </PrimaryBtn>

        <button type="button" className={styles.backButton} onClick={onBack}>
          {isSignup ? 'Back to sign up' : 'Back to sign in'}
        </button>

        <p className={styles.safetyText}>
          Didn&apos;t request this? You can safely ignore the email.
        </p>
      </div>
    </section>
  );
};

SentEmail.propTypes = {
  email: PropTypes.string,
  purpose: PropTypes.oneOf(['signin', 'signup', 'reset']),
  secondsLeft: PropTypes.number,
  isResending: PropTypes.bool,
  onResend: PropTypes.func,
  onBack: PropTypes.func,
};

export default SentEmail;

