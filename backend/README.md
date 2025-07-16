# Trident Explorer Backend

This Express server provides API endpoints for the Trident Network Explorer. It can serve mock data or forward requests to a real Trident node.

## Environment Variables

Create a `.env` file with the following values:

```
PORT=4000
CHAIN_MODE=mock
TRIDENT_NODE_RPC_URL=http://localhost:8090
```

- `CHAIN_MODE` controls where data is sourced from. Use `mock` for built‑in demo data or `rpc` to forward requests to the URL specified by `TRIDENT_NODE_RPC_URL`.

## Development

```
docker compose -f docker-compose.dev.yml up backend
```

The development service mounts the code and runs `npm run dev` for hot reload.

## Production

```
docker compose -f docker-compose.prod.yml up backend
```

## CI/CD

GitHub Actions automatically build and publish the Docker image when tags are pushed. See `.github/workflows/backend.yml` for details.
