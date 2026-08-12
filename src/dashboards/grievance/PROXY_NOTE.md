# Vite Proxy Configuration

## Current Setup (Unified Portal)

All API endpoints are served by a single **portal** service on port **8091**.
The Vite proxy is configured as a single catch-all rule:

```ts
server: {
  port: 3000,
  proxy: {
    '/api/v1': {
      target: 'http://localhost:8091',
      changeOrigin: true,
    },
  },
},
```

This routes all `/api/v1/*` requests (auth, grievances, forms, users, etc.) to the same backend.

### Production Deployment

In production (behind Nginx/ALB), route all API traffic to the single backend:

```nginx
location /api/v1/ {
  proxy_pass http://rvsk-portal:8091/api/v1/;
}
```
