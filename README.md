# Trident Network (TRI)

A community-driven Trident Network fork with modified consensus and branding.

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

## License

MIT License
