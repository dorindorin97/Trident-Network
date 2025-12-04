# Quick Setup Reference Card

## 🚀 One-Line Setup

```bash
git clone https://github.com/dorindorin97/Trident-Network.git && cd Trident-Network && ./setup.sh && make dev
```

---

## 📋 Step-by-Step Setup

### 1. Prerequisites
```bash
# Verify Node.js (18+) and npm are installed
node -v  # Should be v18.0.0 or higher
npm -v   # Should be v8.0.0 or higher
```

### 2. Clone Repository
```bash
git clone https://github.com/dorindorin97/Trident-Network.git
cd Trident-Network
```

### 3. Run Setup Script
```bash
chmod +x setup.sh
./setup.sh
```

### 4. Start Development
```bash
# Option A: Docker (recommended)
docker compose -f docker-compose.dev.yml up

# Option B: Local development (2 terminals)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm start

# Option C: Makefile
make dev
```

---

## 🌐 Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Health Check:** http://localhost:4000/api/health

---

## ⚙️ Configuration

### Backend (.env)
```bash
cp backend/.env.example backend/.env
# Edit: PORT, TRIDENT_NODE_RPC_URL, LOG_LEVEL
```

### Frontend (.env)
```bash
cp frontend/.env.example frontend/.env
# Edit: REACT_APP_BACKEND_URL, REACT_APP_THEME_COLOR
```

---

## 🛠️ Common Commands

```bash
# Install dependencies
make install

# Run tests
make test

# Lint code
make lint

# Format code
make format

# Clean build artifacts
make clean

# View Docker logs
make docker-logs

# Run CI checks
make ci
```

---

## 🐛 Troubleshooting

### Issue: npm dependency conflicts
```bash
cd frontend
npm install --legacy-peer-deps
```

### Issue: Port already in use
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 4000 (backend)
lsof -ti:4000 | xargs kill -9
```

### Issue: Permission denied
```bash
chmod +x setup.sh
```

### Issue: Docker not found
```bash
# Docker is optional - use local development instead
cd backend && npm run dev  # Terminal 1
cd frontend && npm start   # Terminal 2
```

**More help:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📚 Documentation Quick Links

- [README.md](README.md) - Project overview
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [API.md](API.md) - API documentation
- [USER_GUIDE.md](USER_GUIDE.md) - User guide
- [FEATURES.md](FEATURES.md) - Feature inventory
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problem solving
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide

---

## 🎯 Quick Test

After setup, verify everything works:

```bash
# Test backend
curl http://localhost:4000/api/health

# Expected response:
# {"status":"ok","timestamp":"...","service":"Trident Explorer API"}

# Test frontend
# Open browser: http://localhost:3000
# Should see: Trident Network Explorer homepage
```

---

## 🔧 Production Build

```bash
# Build for production
docker compose -f docker-compose.prod.yml build

# Start production
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

---

## ⌨️ Keyboard Shortcuts (in app)

- `Ctrl+K` or `/` - Open search
- `Ctrl+,` - Open settings
- `Ctrl+B` - Toggle compact mode
- `Ctrl+Shift+D` - Toggle theme
- `Escape` - Close modals

---

## 📱 Progressive Web App

After starting the app:

1. Open http://localhost:3000 in Chrome/Edge
2. Click install icon in address bar
3. Add to home screen

---

## 🔐 Security Notes

⚠️ **This is for TESTNET only** - Do not use real assets
⚠️ Private keys are stored in browser memory only
⚠️ Keys are cleared on page reload

---

## 🌍 Supported Languages

- English (en) - Default
- Spanish (es)
- Portuguese (pt) - Partial

Change language: Settings → Language

---

## 🎨 Themes

- Dark (default)
- Light

Change theme: Settings → Theme or `Ctrl+Shift+D`

---

## 📊 Features Highlights

✅ Real-time updates via WebSocket
✅ Advanced search with filters
✅ Data export (CSV/JSON)
✅ Admin dashboard
✅ Performance monitoring
✅ Network status indicator
✅ Mobile responsive
✅ PWA installable
✅ Multi-language support
✅ Keyboard shortcuts

**See [FEATURES.md](FEATURES.md) for complete list (45+ features)**

---

## 💡 Pro Tips

1. **Enable Auto-refresh** - Settings → Auto-refresh → Adjust interval
2. **Compact Mode** - Settings → Display → Compact mode (more data on screen)
3. **Keyboard Navigation** - Use `Ctrl+K` for quick search
4. **Export Data** - Click export buttons on validator/transaction lists
5. **Monitor Performance** - Settings → Show Performance Monitor

---

## 🚨 Getting Help

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [DEVELOPMENT.md](DEVELOPMENT.md)
3. Create issue: https://github.com/dorindorin97/Trident-Network/issues
4. Include: OS, Node version, error logs

---

**Last Updated:** December 4, 2025  
**Version:** 1.1.0-beta
