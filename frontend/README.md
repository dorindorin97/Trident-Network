# Trident Explorer Frontend

React application for browsing Trident Network data.

## Environment Variables

Create a `.env` file with:

```
PORT=3000
REACT_APP_API_URL=http://localhost:4000
```

`REACT_APP_API_URL` should point to the backend service.

## Development

```
docker compose -f docker-compose.dev.yml up frontend
```

This runs the React development server with hot reload.

## Production

```
docker compose -f docker-compose.prod.yml up frontend
```

The production service uses the optimized build served by Nginx.

## CI/CD

When tags are pushed, GitHub Actions builds and publishes the Docker image. See `.github/workflows/frontend.yml` for details.
