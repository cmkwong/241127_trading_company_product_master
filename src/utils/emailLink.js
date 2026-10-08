import { apiPost } from './crud';

const NAMES_FOR_SIGN_IN_KEY = 'namesForSignIn';

// Base URL of the trading-company product master server. Matches the literal
// already used elsewhere in the app (SignupPanel.jsx, AuthContext.jsx).
const API_BASE = 'http://localhost:3001/api/v1/trade_business';

const LOGIN_ENDPOINT = `${API_BASE}/panel/auth/sendLoginMagicLink`;
const SIGNUP_ENDPOINT = `${API_BASE}/home/users/signup/send-magic-link`;
const PASSWORD_RESET_REQUEST_ENDPOINT = `${API_BASE}/home/users/password/forgot`;
const PASSWORD_RESET_CONFIRM_ENDPOINT = `${API_BASE}/home/users/password/forgot/confirm`;

// Minimum interval (seconds) the client waits before it will send another
// magic-link. Gives SMTP time to deliver and prevents rapid duplicate requests
// from impatient clicks. Shared by the login/signup panels and the SentEmail
// takeover so the cooldown stays consistent everywhere.
export const MAGIC_LINK_COOLDOWN_SECONDS = 60;

/**
 * Send a passwordless "magic link" to the given email via the server's SMTP
 * relay (no Firebase). The link either logs an existing user in or verifies a
 * brand-new sign-up, depending on whether first/last names are provided.
 *
 * `mode` is inferred as `signup` when a name is present, otherwise `login`.
 * Pass `mode` explicitly to disambiguate.
 */
export const sendMagicLink = async (
  email,
  { firstName, lastName, mode } = {},
) => {
  const trimmedEmail = String(email || '').trim();

  const isSignup =
    mode === 'signup' || (mode !== 'login' && Boolean(firstName || lastName));

  if (isSignup) {
    await apiPost(SIGNUP_ENDPOINT, {
      first_name: String(firstName ?? '').trim(),
      last_name: String(lastName ?? '').trim(),
      email: trimmedEmail,
    });
  } else {
    await apiPost(LOGIN_ENDPOINT, { email: trimmedEmail });
  }

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
 * Send a "forgot password" reset link to the given email via the server's SMTP
 * relay. The server responds `{ sent: true }` whether or not the account
 * exists (or uses a password) to avoid account enumeration.
 * @param {string} email
 */
export const sendPasswordResetLink = async (email) => {
  const trimmedEmail = String(email || '').trim();
  await apiPost(PASSWORD_RESET_REQUEST_ENDPOINT, { email: trimmedEmail });
};

/**
 * Redeem a password-reset token by applying a new password. Resolves with the
 * account email returned by the server (used to complete the login exchange).
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<{ email: string }>}
 */
export const resetPasswordWithToken = async (token, newPassword) => {
  const response = await apiPost(PASSWORD_RESET_CONFIRM_ENDPOINT, {
    token,
    new_password: newPassword,
  });
  return response?.data ?? response;
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

// Captured once per page load. The token is memoized so that React StrictMode's
// double-invoked effects (dev only) don't strip the URL on the first mount and
// then find nothing on the second. A full page load re-initializes the module.
let pendingMagicToken = null;

/**
 * Extract the server-issued magic-link token from the current URL and strip it
 * from the address bar so it isn't leaked or replayed on refresh. Idempotent:
 * subsequent calls return the same token until `clearMagicLinkToken` is called.
 * Returns `{ magicToken }`, or null when the URL carries no token.
 */
export const completeMagicLinkSignIn = () => {
  if (pendingMagicToken) return { magicToken: pendingMagicToken };

  const params = new URLSearchParams(window.location.search);
  const magicToken = params.get('token');

  if (!magicToken) return null;

  pendingMagicToken = magicToken;

  // Drop the sensitive query string while keeping the current history entry.
  window.history.replaceState(
    {},
    '',
    window.location.pathname + window.location.hash,
  );

  return { magicToken };
};

/**
 * Forget the captured token once it has been successfully exchanged, so a later
 * SPA visit to /finishSignUp can't replay a stale token.
 */
export const clearMagicLinkToken = () => {
  pendingMagicToken = null;
};
