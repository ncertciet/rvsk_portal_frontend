# RVSK 2.0 Frontend - React 18 + TypeScript

## Development With the Test Backend

Configure `.env`:

```dotenv
VITE_API_BASE_URL=/api/v1
VITE_PORTAL_API_URL=https://rvsk.diksha.gov.in/rvsk/portal
VITE_6A_API_URL=https://rvsk.diksha.gov.in/rvsk/6a
VITE_SCHEMES_API_URL=https://rvsk.diksha.gov.in/rvsk/schemes
```

Run `npm install` and `npm run dev`. Restart Vite after changing `.env`.

The development proxy sends `/api/v1/schemes`, `/api/v1/master`, and
`/api/v1/reports` to the schemes backend; `/api/v1/attendance` and
`/api/v1/accreditation` to the 6A backend; and other `/api/v1` requests to
the portal backend. It preserves the `/api/v1` endpoint path under each
configured backend URL. Browser requests remain same-origin through Vite.
When a backend variable is unset, its proxy falls back to the local service.

These proxy settings apply only to `npm run dev`. Production deployments
use `nginx.conf`, which currently targets internal backend containers;
the three environment variables do not change Nginx routing.
