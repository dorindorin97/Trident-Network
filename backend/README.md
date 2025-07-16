# Trident Explorer Backend

This Express server provides API endpoints for the Trident Network Explorer. It can serve mock data or forward requests to a real Trident node.

See [deploy.md](deploy.md) for Docker Compose deployment instructions.

## Environment Variables

Create a `.env` file with the following values:

```
PORT=4000
CHAIN_MODE=mock
TRIDENT_NODE_RPC_URL=http://localhost:8090
FRONTEND_URL=http://localhost:3000
```

Available variables (defaults shown):

- `PORT` (4000) - port the server listens on.
- `CHAIN_MODE` (`mock`) - use `mock` data or `rpc` to forward to `TRIDENT_NODE_RPC_URL`.
- `TRIDENT_NODE_RPC_URL` (`http://localhost:8090`) - RPC endpoint used when `CHAIN_MODE=rpc`.
- `FRONTEND_URL` (`http://localhost:3000`) - allowed CORS origin.

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
