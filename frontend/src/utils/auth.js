const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'speakify_user';

const parseJson = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const decodeBase64Url = (value) => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return atob(padded);
  } catch {
    return '';
  }
};

export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const payloadString = decodeBase64Url(parts[1]);
  return parseJson(payloadString);
};

export const getStoredAccessToken = () => localStorage.getItem(TOKEN_STORAGE_KEY) || '';

export const getStoredAuthUser = () => parseJson(localStorage.getItem(USER_STORAGE_KEY));

export const getEmailFromToken = (token) => decodeJwtPayload(token)?.email || '';

export const setAuthSession = ({ accessToken, user } = {}) => {
  if (accessToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else if (user === null) {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const refreshAuthSession = async (apiBaseUrl) => {
  const response = await fetch(`${apiBaseUrl}/api/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',
  });

  const payload = await response.json();
  if (!response.ok || !payload?.success || !payload?.data?.accessToken) {
    throw new Error(payload?.message || 'Could not refresh session');
  }

  setAuthSession({
    accessToken: payload.data.accessToken,
    user: payload.data.user || null,
  });

  return payload.data;
};

