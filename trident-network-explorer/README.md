# Trident Network Explorer

This is a mock blockchain explorer and wallet UI for the Trident Network (TRI). It includes a simple Express backend serving fake blockchain data and a React frontend that displays it.

## Requirements

- Docker and Docker Compose

## Running with Docker Compose

```bash
cd trident-network-explorer
docker-compose up --build
```

The backend will be available at `http://localhost:4000` and the frontend at `http://localhost:3000` by default.
Ports and API URLs are configurable via the `.env` file.

## Project Structure

- `backend` - Node.js Express API server
- `frontend` - React application

Both services are configured for demonstration only and do not connect to a real blockchain.

## Pagination

The `/api/v1/blocks` endpoint supports pagination parameters:

```
GET /api/v1/blocks?page=<page>&limit=<limit>
```

Use the **Previous** and **Next** buttons in the UI to navigate through the block history. Each page shows 10 blocks.

## Transaction Lookup

Looking up an address using the Account Lookup form will now display a table of recent transactions including:

- `txId`
- `from`
- `to`
- `amount`
- `timestamp`

## Environment Configuration

Create a `.env` file in `trident-network-explorer/` (already included by default) to control ports and the API base URL:

```
BACKEND_PORT=4000
FRONTEND_PORT=3000
REACT_APP_API_URL=http://localhost:4000
```

Docker Compose automatically loads these variables when bringing up the services.

## Mock Wallet Usage

Navigate to the **Wallet** page from the navigation bar. Enter any string as a
private key and click **Login**. The application derives a deterministic mock
address from the key and stores the key in your browser's local storage. Once
logged in, the wallet page displays your public address, balance and recent
transactions by querying `/api/v1/accounts/<address>`.

Use the **Logout** button in the navigation bar or on the wallet page to clear
the stored credentials. This wallet is implemented entirely on the frontend and
is intended for demonstration purposes only&mdash;no real cryptographic key
management or blockchain interaction occurs.
