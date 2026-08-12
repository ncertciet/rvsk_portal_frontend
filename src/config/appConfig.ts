/**
 * Application Configuration
 * 
 * All external URLs and settings are managed through environment variables.
 * Values are read from .env file (Vite injects them at build time).
 * Fallback defaults are provided for development convenience.
 * 
 * NEVER hardcode URLs, credentials, or environment-specific values in components.
 * 
 * NOTE: Auth no longer calls external provider directly.
 * All auth requests go through rvsk-auth-service (Auth Adapter) at /api/v1/auth/*.
 */
export const appConfig = {
  /** Backend API base URL (proxied through Vite in dev, nginx in prod) */
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  },

  /** Schemes service direct URL (used in dev for Vite proxy target) */
  schemes: {
    serviceUrl: import.meta.env.VITE_SCHEMES_SERVICE_URL || 'http://localhost:8082',
  },

  /** Auth service direct URL (used in dev for Vite proxy target) */
  auth: {
    serviceUrl: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8091',
  },
} as const;
