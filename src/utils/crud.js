// Basic CRUD functions for interacting with a JSON API.
// All functions throw if the request fails. Consumers should handle errors.
const defaultHeaders = {
  'Content-Type': 'application/json',
};

const buildHeaders = (token, extraHeaders = {}) => {
  const headers = { ...defaultHeaders, ...extraHeaders };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const apiGet = async (url, { token, headers, params, ...options } = {}) => {
  let requestUrl = url;

  if (params) {
    const queryParams = new URLSearchParams(params).toString();
    const separator = requestUrl.includes('?') ? '&' : '?';
    requestUrl = `${requestUrl}${separator}${queryParams}`;
  }

  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: buildHeaders(token, headers),
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GET ${requestUrl} failed: ${response.status} ${errorText}`);
  }
  return response.json();
};

export const apiCreate = async (
  url,
  body,
  { token, headers, ...options } = {},
) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(token, headers),
    body: JSON.stringify(body),
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`POST ${url} failed: ${response.status} ${errorText}`);
  }
  return response.json();
};

export const apiUpdate = async (
  url,
  body,
  { token, headers, ...options } = {},
) => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: buildHeaders(token, headers),
    body: JSON.stringify(body),
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PUT ${url} failed: ${response.status} ${errorText}`);
  }
  return response.json();
};

export const apiDelete = async (url, { token, headers, ...options } = {}) => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: buildHeaders(token, headers),
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DELETE ${url} failed: ${response.status} ${errorText}`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};
