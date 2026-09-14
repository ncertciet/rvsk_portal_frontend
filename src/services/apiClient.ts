import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';
import { appConfig } from '../config/appConfig';

/**
 * Axios HTTP client configured for RVSK backend API calls.
 * - Base URL from environment config
 * - Automatic Bearer token injection from Redux auth state
 * - JSON content type
 * - Response interceptor: on 401 (expired/invalid session), clear auth
 *   and redirect to login (once), so expired sessions are handled centrally.
 */
const apiClient = axios.create({
  baseURL: appConfig.api.baseUrl,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken, user } = store.getState().auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (user?.username) {
    config.headers['X-Username'] = user.username;
  }
  return config;
});

// Guard so we only trigger one logout/redirect even if many calls 401 at once.
let sessionExpiredHandled = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl: string = error?.config?.url || '';

    // Treat 401 as an expired/invalid session — but NOT for the login call
    // itself (a failed login should show "invalid credentials", not redirect).
    const isLoginCall = requestUrl.includes('/auth/login');

    if (status === 401 && !isLoginCall && !sessionExpiredHandled) {
      sessionExpiredHandled = true;
      try {
        store.dispatch(logout());
      } catch {
        // ignore store errors during teardown
      }
      // Redirect to login unless we're already there.
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
