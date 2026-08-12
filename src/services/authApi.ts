import apiClient from './apiClient';

/**
 * Authentication API service.
 * Routes through rvsk-auth-service (self-contained JWT auth).
 * Supports local bcrypt authentication with JWT token issuance.
 */
export const authApi = {
  /**
   * Login with local JWT authentication.
   * Backend verifies credentials against portal_users (bcrypt) and issues JWT tokens.
   * @param username - User's username
   * @param password - User's password
   * @returns Response with accessToken, refreshToken, user (from portal_users)
   */
  login: async (username: string, password: string) => {
    return apiClient.post('/auth/login', { username, password });
  },

  /**
   * Register a new user (Super_Admin only).
   */
  register: async (data: {
    username: string;
    password: string;
    displayName?: string;
    role: string;
    stateCode?: string;
    districtCode?: string;
  }) => {
    return apiClient.post('/auth/register', data);
  },

  /**
   * Refresh access token using refresh token.
   */
  refreshToken: async (refreshToken: string) => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  /**
   * Change password for the currently authenticated user.
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiClient.post('/auth/change-password', { currentPassword, newPassword });
  },

  /**
   * Admin resets a user's password (Super_Admin only).
   */
  resetPassword: async (userId: string, newPassword: string) => {
    return apiClient.post('/auth/reset-password', { userId, newPassword });
  },

  /**
   * Logout: notifies backend to update session state.
   */
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Get current user profile from portal_users.
   */
  me: async () => {
    return apiClient.get('/auth/me');
  },

  /**
   * Validate token + check portal_users authorization.
   */
  validate: async (token: string, username: string) => {
    return apiClient.post('/auth/validate', { token, username });
  },
};
