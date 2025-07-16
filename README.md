# Trident Network Explorer

A web explorer for the community-run Trident blockchain. The project provides a React frontend and an Express API server for inspecting blocks, transactions and accounts.

## Blockchain Specs

- **Chain ID:** `0x76a81b116bfaa26e`
- **Block Time:** 2 seconds
- **Consensus:** Modified BFT Proof-of-Stake

## Wallet Disclaimer

The explorer includes a simple in-browser wallet. It is for demonstration only. **Do not use real private keys.**

- `CHAIN_MODE=mock` – backend serves mock data and no real signing occurs.
- `CHAIN_MODE=rpc` – backend connects to a full node via `TRIDENT_NODE_RPC_URL`.

Keys remain in browser memory and are cleared when the page reloads.

## Environment Variables

Copy `frontend/.env.example` and `backend/.env.example` to create `.env` files. The table below lists all variables.

| Variable (location) | Default | Description |
| ------------------- | ------- | ----------- |
| `PORT` (frontend) | `3000` | Port for the React dev server |
| `PORT` (backend) | `4000` | Port for the API server |
| `REACT_APP_BACKEND_URL` | `http://localhost:4000` | API base URL used by the frontend |
| `REACT_APP_APP_TITLE` | `Trident Explorer` | Browser title and branding |
| `REACT_APP_THEME_COLOR` | `#001730` | Primary UI color |
| `REACT_APP_DEFAULT_LANGUAGE` | `en` | Initial language |
| `REACT_APP_DEFAULT_THEME` | `dark` | Initial theme (light or dark) |
| `REACT_APP_REFRESH_INTERVAL` | `10000` | Polling interval in ms for latest block |
| `CHAIN_MODE` | `mock` | `mock` serves local data, `rpc` forwards requests |
| `TRIDENT_NODE_RPC_URL` | `http://localhost:8090` | Node RPC endpoint when `CHAIN_MODE=rpc` |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin for the API |

`REACT_APP_*` variables are baked into the frontend at build time. Rebuild the image or run the dev server again after changing them.

## Quickstart

### Development

```bash
docker compose -f docker-compose.dev.yml up
```

The command above starts the backend on port 4000 and the React app on port 3000 using mock data.

### Production

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Images are built from `frontend/` and `backend/`. Ensure your `.env` files contain the correct values before building.

## API Reference

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/blocks/latest` | Latest block |
| GET | `/api/v1/blocks` | Paginated block list |
| GET | `/api/v1/blocks/:number` | Block details |
| GET | `/api/v1/transactions/:id` | Transaction details |
| GET | `/api/v1/accounts/:address` | Account info |
| GET | `/api/v1/validators` | Validator list |

Non‑listed routes under `/api` return `404`.

## CI/CD

GitHub Actions run automated checks on pushes to `main` and `work`. Separate workflows build and publish Docker images when a release tag is published.

- `build.yml` – lints, tests and builds both projects on push.
- `frontend.yml` – builds and pushes the frontend image on release.
- `backend.yml` – builds and pushes the backend image on release.

## License

MIT License
