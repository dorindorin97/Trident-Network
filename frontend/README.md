# Trident Explorer Frontend

React application for browsing Trident Network data.

See [deploy.md](deploy.md) for Docker Compose deployment instructions.

## Environment Variables

Create a `.env` file with:

```
PORT=3000
REACT_APP_API_URL=http://localhost:4000
REACT_APP_APP_TITLE=Trident Explorer
REACT_APP_THEME_COLOR=#001730
```

Available variables (defaults shown):

- `PORT` (3000) - port for the React dev server.
- `REACT_APP_API_URL` (`http://localhost:4000`) - backend API base URL.
- `REACT_APP_APP_TITLE` (`Trident Explorer`) - page title and branding text.
- `REACT_APP_THEME_COLOR` (`#001730`) - primary theme color.

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
