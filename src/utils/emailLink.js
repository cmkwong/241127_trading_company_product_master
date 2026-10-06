import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';
const NAMES_FOR_SIGN_IN_KEY = 'namesForSignIn';

// The URL the magic link should land on. Defaults to this app's /finishSignUp.
export const getEmailLinkUrl = () => {
  const configured = import.meta.env.VITE_FIREBASE_EMAIL_LINK_URL;
  if (configured) return configured;
  return `${window.location.origin}/finishSignUp`;
};

export const buildActionCodeSettings = () => ({
  url: getEmailLinkUrl(),
  handleCodeInApp: true,
});

/**
 * Send a passwordless sign-in link to the given email. The email is remembered
 * locally so the /finishSignUp page can complete the sign-in flow.
 */
export const sendMagicLink = async (email, { firstName, lastName } = {}) => {
  const auth = getFirebaseAuth();
  await sendSignInLinkToEmail(auth, email, buildActionCodeSettings());
  window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
  if (firstName || lastName) {
    window.localStorage.setItem(
      NAMES_FOR_SIGN_IN_KEY,
      JSON.stringify({
        first_name: String(firstName ?? '').trim(),
        last_name: String(lastName ?? '').trim(),
      }),
    );
  }
};

/**
 * Read the pending first/last name captured when the sign-up link was sent.
 * Returns `{ first_name, last_name }` or null when none was stored.
 */
export const getPendingSignupNames = () => {
  try {
    const raw = window.localStorage.getItem(NAMES_FOR_SIGN_IN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Clear the pending sign-up names after they have been consumed.
 */
export const clearPendingSignupNames = () => {
  window.localStorage.removeItem(NAMES_FOR_SIGN_IN_KEY);
};

/**
 * Complete the email-link sign-in from the current URL. Returns
 * { idToken, email } on success, or null when the current URL is not a valid
 * email sign-in link.
 */
export const completeMagicLinkSignIn = async () => {
  const auth = getFirebaseAuth();

  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return null;
  }

  let email = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);
  if (!email) {
    email = window.prompt(
      'Please provide your email address to finish signing in.',
    );
  }
  if (!email) return null;

  try {
    const result = await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
    const idToken = await result.user.getIdToken();
    return { idToken, email: result.user.email };
  } catch {
    throw new Error(
      'Unable to complete email sign-in. Please request a new link.',
    );
  }
};
