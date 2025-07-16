# Trident Network Explorer

This is a mock blockchain explorer and wallet UI for the Trident Network (TRI). It includes a simple Express backend serving fake blockchain data and a React frontend that displays it.

## Requirements

- Docker and Docker Compose

## Running with Docker Compose

```bash
cd trident-network-explorer
docker-compose up --build
```

The backend will be available at `http://localhost:4000` and the frontend at `http://localhost:3000`.

## Project Structure

- `backend` - Node.js Express API server
- `frontend` - React application

Both services are configured for demonstration only and do not connect to a real blockchain.
