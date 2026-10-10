import { apiDelete, apiPatch, apiPost } from '../../../../utils/crud';
import { HOME_API_BASE } from '../../utils/homeApi';

export const USERS_DATA_BASE = `${HOME_API_BASE}/users/data`;

export const updateSelfProfile = (token, users) =>
  apiPatch(`${USERS_DATA_BASE}/self`, { data: { users } }, { token });

export const createSelfRfq = (token, user_rfqs) =>
  apiPost(`${USERS_DATA_BASE}/self/rfqs`, { data: { user_rfqs } }, { token });

export const updateSelfRfq = (token, user_rfqs) =>
  apiPatch(
    `${USERS_DATA_BASE}/self/rfqs/ids`,
    { data: { user_rfqs } },
    { token },
  );

export const deleteSelfRfq = (token, id) =>
  apiDelete(`${USERS_DATA_BASE}/self/rfqs/ids`, {
    token,
    body: { data: { user_rfqs: [{ id }] } },
  });
