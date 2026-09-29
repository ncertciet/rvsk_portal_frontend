// /**
//  * Application Configuration
//  *
//  * All external URLs and settings are managed through environment variables.
//  * Values are read from .env file (Vite injects them at build time).
//  * Fallback defaults are provided for development convenience.
//  *
//  * NEVER hardcode URLs, credentials, or environment-specific values in components.
//  *
//  * NOTE: Auth no longer calls external provider directly.
//  * All auth requests go through rvsk-auth-service (Auth Adapter) at /api/v1/auth/*.
//  */
// export const appConfig = {
//   /** Backend API base URL (proxied through Vite in dev, nginx in prod) */
//   api: {
//     baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
//   },

//   /** Schemes service direct URL (used in dev for Vite proxy target) */
//   schemes: {
//     serviceUrl: import.meta.env.VITE_SCHEMES_SERVICE_URL || 'http://localhost:8082',
//   },

//   /** Auth service direct URL (used in dev for Vite proxy target) */
//   auth: {
//     serviceUrl: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8091',
//   },
// } as const;

export const appConfig = {
  environment: import.meta.env.VITE_APP_ENV || "LOCAL",

  api: {
    // Main RVSK Portal API
    baseUrl: import.meta.env.VITE_API_BASE_URL || "/api/v1",

    // Individual backend services
    portal:
      import.meta.env.VITE_PORTAL_API_URL || "http://localhost:8091/api/v1",

    sixA: import.meta.env.VITE_6A_API_URL || "http://localhost:8083/api/v1",

    schemes:
      import.meta.env.VITE_SCHEMES_API_URL || "http://localhost:8082/api/v1",
  },

  schemes: {
    serviceUrl:
      import.meta.env.VITE_SCHEMES_SERVICE_URL || "http://localhost:8082",
  },

  auth: {
    serviceUrl:
      import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8091",
  },

  externalAuth: {
    loginUrl:
      import.meta.env.VITE_AUTH_LOGIN_URL ||
      "https://api-nvsk.diksha.gov.in/auth/login",

    refreshUrl:
      import.meta.env.VITE_AUTH_REFRESH_URL ||
      "https://api-nvsk.diksha.gov.in/auth/refresh",
  },
} as const;

console.log("======================================");
console.log("RVSK Application Configuration");
console.log("======================================");
console.log("Environment:", appConfig.environment);
console.log("Portal API:", appConfig.api.portal);
console.log("6A API:", appConfig.api.sixA);
console.log("Schemes API:", appConfig.api.schemes);
console.log("======================================");
