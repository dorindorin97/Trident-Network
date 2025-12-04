#!/bin/bash

# Trident Network Explorer - Quick Setup Script
set -e

echo "================================"
echo "Trident Network Explorer Setup"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "  Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version is too old (need 18+)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) detected${NC}"
else
    echo -e "${YELLOW}! Docker not found (optional for development)${NC}"
fi

echo ""

# Setup environment files
echo "Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
else
    echo -e "${YELLOW}! backend/.env already exists${NC}"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${YELLOW}! frontend/.env already exists${NC}"
fi

echo ""

# Install dependencies
echo "Installing dependencies..."
echo ""

echo "Installing backend dependencies..."
cd backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
cd ..

echo ""

echo "Installing frontend dependencies..."
cd frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..

echo ""
echo "================================"
echo -e "${GREEN}Setup completed successfully!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Review and edit configuration files:"
echo "   - backend/.env"
echo "   - frontend/.env"
echo ""
echo "2. Start development servers:"
echo ""
echo "   Option A - Using Docker (recommended):"
echo "   $ docker compose -f docker-compose.dev.yml up"
echo ""
echo "   Option B - Local development:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm start"
echo ""
echo "   Option C - Using Makefile:"
echo "   $ make dev"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:4000"
echo "   - API Health: http://localhost:4000/api/health"
echo ""
echo "For more information, see:"
echo "   - README.md - Project overview"
echo "   - DEVELOPMENT.md - Development guide"
echo "   - API.md - API documentation"
echo ""
