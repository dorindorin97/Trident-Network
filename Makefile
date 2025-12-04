# Makefile for Trident Network Explorer
.PHONY: help install dev build test lint format clean docker-dev docker-prod docker-clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies for both backend and frontend
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Dependencies installed successfully!"

dev: ## Start development environment
	docker compose -f docker-compose.dev.yml up

build: ## Build production Docker images
	docker compose -f docker-compose.prod.yml build

test: ## Run tests for both backend and frontend
	@echo "Running backend tests..."
	cd backend && npm test
	@echo "Running frontend tests..."
	cd frontend && npm test

test-coverage: ## Run tests with coverage
	@echo "Running backend tests with coverage..."
	cd backend && npm test -- --coverage
	@echo "Running frontend tests with coverage..."
	cd frontend && npm test -- --coverage

lint: ## Lint code for both backend and frontend
	@echo "Linting backend..."
	cd backend && npm run lint
	@echo "Linting frontend..."
	cd frontend && npm run lint

lint-fix: ## Auto-fix linting issues
	@echo "Fixing backend linting issues..."
	cd backend && npm run lint -- --fix
	@echo "Fixing frontend linting issues..."
	cd frontend && npm run lint -- --fix

format: ## Format code with Prettier
	@echo "Formatting backend..."
	cd backend && npm run format
	@echo "Formatting frontend..."
	cd frontend && npm run format

clean: ## Clean node_modules and build artifacts
	@echo "Cleaning backend..."
	rm -rf backend/node_modules backend/coverage
	@echo "Cleaning frontend..."
	rm -rf frontend/node_modules frontend/build frontend/coverage
	@echo "Clean complete!"

docker-dev: ## Start development environment with Docker
	docker compose -f docker-compose.dev.yml up

docker-prod: ## Start production environment with Docker
	docker compose -f docker-compose.prod.yml up -d

docker-stop: ## Stop Docker containers
	docker compose -f docker-compose.dev.yml down
	docker compose -f docker-compose.prod.yml down

docker-clean: ## Clean Docker containers, images, and volumes
	docker compose -f docker-compose.dev.yml down -v
	docker compose -f docker-compose.prod.yml down -v
	docker system prune -f

docker-logs: ## View Docker logs
	docker compose logs -f

docker-logs-backend: ## View backend logs
	docker compose logs -f backend

docker-logs-frontend: ## View frontend logs
	docker compose logs -f frontend

dev-backend: ## Start backend in development mode
	cd backend && npm run dev

dev-frontend: ## Start frontend in development mode
	cd frontend && npm start

check: lint test ## Run linting and tests

ci: install lint test ## Run CI checks (install, lint, test)

setup: ## Initial project setup
	@echo "Setting up Trident Network Explorer..."
	cp backend/.env.example backend/.env 2>/dev/null || true
	cp frontend/.env.example frontend/.env 2>/dev/null || true
	$(MAKE) install
	@echo "Setup complete! Edit .env files and run 'make dev' to start."

.DEFAULT_GOAL := help
