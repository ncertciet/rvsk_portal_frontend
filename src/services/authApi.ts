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

  // ==================== Forgot-password OTP (RVSK-AUTH-PWDRESET-004) ====================
  // Public, self-service recovery. The user identifies by USERNAME; the backend
  // validates it exists (returns "User doesn't exist" otherwise) and emails the
  // OTP to the account's address. The backend is authoritative for expiry,
  // cooldown, attempt-cap and single-use. Never persist the OTP or reset token.

  /**
   * Step 1 — validate the username and request an OTP. Rejects with
   * "User doesn't exist" when the username is not found.
   */
  forgotPasswordRequestOtp: async (username: string) => {
    return apiClient.post('/auth/forgot-password/request-otp', { username });
  },

  /**
   * Step 2 — verify the OTP. On success returns { resetToken } (one-time,
   * short-lived) which authorizes the reset step. Keep it in memory only.
   */
  forgotPasswordVerifyOtp: async (username: string, otp: string) => {
    return apiClient.post('/auth/forgot-password/verify-otp', { username, otp });
  },

  /**
   * Resend an OTP (subject to the server-side cooldown).
   */
  forgotPasswordResendOtp: async (username: string) => {
    return apiClient.post('/auth/forgot-password/resend-otp', { username });
  },

  /**
   * Step 3 — set a new password using the reset token from Step 2.
   */
  forgotPasswordReset: async (
    resetToken: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    return apiClient.post('/auth/forgot-password/reset', {
      resetToken,
      newPassword,
      confirmPassword,
    });
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
