import axios from 'axios';
import { store } from '../store';
import { appConfig } from '../config/appConfig';

/**
 * Axios HTTP client configured for RVSK backend API calls.
 * - Base URL from environment config
 * - Automatic Bearer token injection from Redux auth state
 * - JSON content type
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

export default apiClient;
