# Trident Network (TRI)

A community-driven Trident Network fork with modified consensus and branding.
## Release

Version 1.0.0 - 2024-06-01


## Specifications
- **Block Time:** 2 seconds
- **Total Supply:** 1,000,000,000 TRI
- **Chain ID:** 0x76a81b116bfaa26e

## Quick Start

### Build Locally
```bash
# Requires Docker
docker build -t trident-network:latest .
```

### Launch Local Devnet
```bash
docker-compose up
```


Copy frontend/.env.example to frontend/.env and backend/.env.example to backend/.env before starting services.

### Environment Variables

Frontend `.env`:
```
REACT_APP_BACKEND_URL=http://localhost:4000
REACT_APP_APP_TITLE=Trident Explorer
REACT_APP_THEME_COLOR=#001730
REACT_APP_DEFAULT_LANGUAGE=en
REACT_APP_DEFAULT_THEME=dark
REACT_APP_REFRESH_INTERVAL=10000
```

> **Note**: `REACT_APP_*` variables are injected at build time. To change the backend
URL or other frontend settings you must rebuild the React app or its Docker image.

Backend `.env`:
```
PORT=4000
CHAIN_MODE=mock
TRIDENT_NODE_RPC_URL=http://localhost:8090
FRONTEND_URL=http://localhost:3000
```

`CHAIN_MODE=mock` serves a static in-memory blockchain for demos. Set
`CHAIN_MODE=rpc` and provide `TRIDENT_NODE_RPC_URL` to connect to a real node.

### Run Explorer Locally
```bash
# requires Docker
docker compose -f docker-compose.dev.yml up
```

This starts the backend on port 4000 and the React frontend on port 3000 using mock data.

The explorer includes dark/light themes and English/Portuguese translations. Your preferences are saved in local storage.

The search bar accepts block numbers, transaction hashes and account addresses and will navigate to the appropriate detail page.

### API Endpoints

The backend exposes the following routes:

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/blocks/latest` | Latest block |
| GET | `/api/v1/blocks` | Paginated block list |
| GET | `/api/v1/blocks/:number` | Block details |
| GET | `/api/v1/transactions/:id` | Transaction details |
| GET | `/api/v1/accounts/:address` | Account info |
| GET | `/api/v1/validators` | Validator list |

### Deploy with Docker Compose
```bash
docker compose -f docker-compose.prod.yml up -d
```
This uses the Dockerfiles in `frontend/` and `backend/` to build production images.

### Production Checklist

- Set environment variables in `frontend/.env` and `backend/.env`.
- Ensure `FRONTEND_URL` is configured for CORS and matches your deployed domain.
- Build images: `docker compose -f docker-compose.prod.yml build`.
- Run services: `docker compose -f docker-compose.prod.yml up -d`.
- Verify frontend on port 80 and backend on port 4000.

## Wallet Usage
This explorer includes a wallet page for signing transactions. **Private keys are never stored on disk or transmitted to the backend**. Keys exist only in browser memory and are cleared on refresh. Use caution and test accounts when interacting with the wallet.

### Security Disclaimer
The built-in wallet is intended for demonstration purposes. Always verify the URL and use disposable accounts. The project maintainers are not responsible for lost funds.
 

## License

MIT License
