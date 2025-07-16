# Deployment Guide - Backend

## Running Locally with Docker Compose
1. Ensure Docker and Docker Compose are installed.
2. Create `.env` in `backend/` with required variables.
3. Run:
   ```bash
   docker compose -f docker-compose.dev.yml up backend
   ```
   This starts the backend in development mode with hot reload.

## Deploying to a VPS
1. Install Docker and Docker Compose on the server.
2. Copy your `.env` file and `docker-compose.prod.yml` to the server.
3. Pull the published images and start services:
   ```bash
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d backend
   ```

## Sample docker-compose.prod.yml
```yaml
version: '3'
services:
  backend:
    image: yourdockerhub/trident-backend:latest
    env_file:
      - ./backend/.env
    ports:
      - "4000:4000"
  frontend:
    image: yourdockerhub/trident-frontend:latest
    env_file:
      - ./frontend/.env
    ports:
      - "80:80"
    depends_on:
      - backend
```
