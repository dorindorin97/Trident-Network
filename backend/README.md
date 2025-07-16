# Trident Explorer Backend

This Express server provides API endpoints for the Trident Network Explorer. It can serve mock data or forward requests to a real Trident node.

See [deploy.md](deploy.md) for Docker Compose deployment instructions.

## Environment Variables

Copy `.env.example` to `.env` and fill in the variables.
Create a `.env` file with the following values:

```
PORT=4000
CHAIN_MODE=mock
TRIDENT_NODE_RPC_URL=http://localhost:8090
FRONTEND_URL=
```

Available variables (defaults shown):

- `PORT` (4000) - port the server listens on.
- `CHAIN_MODE` (`mock`) - use `mock` data or `rpc` to forward to `TRIDENT_NODE_RPC_URL`.
- `TRIDENT_NODE_RPC_URL` (`http://localhost:8090`) - RPC endpoint used when `CHAIN_MODE=rpc`.
- `FRONTEND_URL` (e.g., http://localhost:3000) - allowed CORS origin.

## Quickstart

Install dependencies and start the server:

```bash
cd backend
npm install
npm start
```
After changes run `npm run lint` and `npm run format` to keep code consistent.

The API will be available at `http://localhost:4000`.

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/blocks/latest` | Latest block |
| GET | `/api/v1/blocks` | Paginated block list |
| GET | `/api/v1/blocks/:number` | Block details |
| GET | `/api/v1/transactions/:id` | Transaction details |
| GET | `/api/v1/accounts/:address` | Account info |
| GET | `/api/v1/validators` | Validator list |
| any | other `/api/...` | Returns `404 { "error": "API route not found" }` |

## Development

```
docker compose -f docker-compose.dev.yml up backend
```

The development service mounts the code and runs `npm run dev` for hot reload.
To start frontend and backend together run:

```
docker compose -f docker-compose.dev.yml up
```

## Production

```
docker compose -f docker-compose.prod.yml up backend
```

## CI/CD

GitHub Actions automatically build and publish the Docker image when tags are pushed. See `.github/workflows/backend.yml` for details.
