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
REACT_APP_DEFAULT_LANGUAGE=en
REACT_APP_DEFAULT_THEME=dark
```

Available variables (defaults shown):

- `PORT` (3000) - port for the React dev server.
- `REACT_APP_API_URL` (`http://localhost:4000`) - backend API base URL.
- `REACT_APP_APP_TITLE` (`Trident Explorer`) - page title and branding text.
- `REACT_APP_THEME_COLOR` (`#001730`) - primary theme color.
- `REACT_APP_DEFAULT_LANGUAGE` (`en`) - initial UI language.
- `REACT_APP_DEFAULT_THEME` (`dark`) - initial theme mode.

### Multi-language Support

The interface uses `react-i18next` with English and Portuguese translations built-in.
Use the language selector in the navbar to switch languages. The chosen language
is saved in local storage.

### Customizing Defaults

Set `REACT_APP_DEFAULT_LANGUAGE` and `REACT_APP_DEFAULT_THEME` in your `.env`
to change the default language or theme on first load. Users can override these
values via the navbar controls and their preferences are persisted locally.

## Development

```
docker compose -f docker-compose.dev.yml up frontend
```

This runs the React development server with hot reload. To start both frontend and backend together run:

```
docker compose -f docker-compose.dev.yml up
```

## Production

```
docker compose -f docker-compose.prod.yml up frontend
```

The production service uses the optimized build served by Nginx.

## CI/CD

When tags are pushed, GitHub Actions builds and publishes the Docker image. See `.github/workflows/frontend.yml` for details.
