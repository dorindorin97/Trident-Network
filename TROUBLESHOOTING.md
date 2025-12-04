# Troubleshooting Guide

This guide covers common issues you might encounter while setting up or running the Trident Network Explorer.

## Table of Contents

- [Setup Issues](#setup-issues)
- [Dependency Issues](#dependency-issues)
- [Runtime Issues](#runtime-issues)
- [Docker Issues](#docker-issues)
- [Build Issues](#build-issues)
- [Network Issues](#network-issues)

---

## Setup Issues

### Issue: `./setup.sh` fails with permission denied

**Solution:**
```bash
chmod +x setup.sh
./setup.sh
```

### Issue: Node.js version is too old

**Error:** `Node.js version is too old (need 18+)`

**Solution:**
1. Install Node.js 18+ from https://nodejs.org
2. Or use nvm (Node Version Manager):
   ```bash
   nvm install 18
   nvm use 18
   ```

### Issue: npm not found

**Solution:**
npm comes with Node.js. Reinstall Node.js from https://nodejs.org

---

## Dependency Issues

### Issue: npm peer dependency conflicts

**Error:** `ERESOLVE could not resolve` or `Conflicting peer dependency`

**Solution 1 (Recommended):**
The setup script now automatically uses `--legacy-peer-deps`. If you're installing manually:
```bash
cd frontend
npm install --legacy-peer-deps
```

**Solution 2:**
Use the `.npmrc` file (already configured):
```bash
# frontend/.npmrc already contains:
legacy-peer-deps=true
```

**Solution 3 (Force):**
```bash
cd frontend
npm install --force
```

### Issue: TypeScript version conflicts

**Error:** `peerOptional typescript@"^3.2.1 || ^4" from react-scripts@5.0.1`

**Explanation:**
- `react-scripts@5.0.1` expects TypeScript v3-4
- We use TypeScript v5.9.3 (newer)
- This is a peer dependency warning, not a breaking issue

**Solution:**
The `--legacy-peer-deps` flag handles this. If you need to manually fix:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: jest version conflicts

**Error:** `peer jest@"^27.0.0 || ^28.0.0" from jest-watch-typeahead`

**Explanation:**
- `jest-watch-typeahead` expects Jest v27-28
- We use Jest v29 (newer)
- The `--legacy-peer-deps` flag handles this

**Solution:**
Already handled by the setup script. No action needed.

---

## Runtime Issues

### Issue: Backend fails to start

**Error:** `Error: Cannot find module ...`

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Frontend fails to start

**Error:** `Module not found: Can't resolve ...`

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm start
```

### Issue: Port already in use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution 1 - Kill the process:**
```bash
# For frontend (port 3000)
lsof -ti:3000 | xargs kill -9

# For backend (port 4000)
lsof -ti:4000 | xargs kill -9
```

**Solution 2 - Use different ports:**
```bash
# Frontend
PORT=3001 npm start

# Backend
PORT=4001 npm run dev
```

### Issue: API connection refused

**Error:** `Failed to fetch` or `Network request failed`

**Solution:**
1. Check backend is running: `curl http://localhost:4000/api/health`
2. Check `frontend/.env` has correct `REACT_APP_API_URL`
3. Restart both servers

---

## Docker Issues

### Issue: Docker command not found

**Solution:**
Docker is optional for development. You can run locally:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start
```

Or install Docker:
- Mac: https://docs.docker.com/desktop/mac/install/
- Linux: https://docs.docker.com/engine/install/
- Windows: https://docs.docker.com/desktop/windows/install/

### Issue: Docker compose fails to start

**Error:** `ERROR: for backend  Cannot start service backend: ...`

**Solution:**
```bash
# Stop all containers
docker compose -f docker-compose.dev.yml down

# Remove volumes
docker compose -f docker-compose.dev.yml down -v

# Rebuild and start
docker compose -f docker-compose.dev.yml up --build
```

### Issue: Port conflicts in Docker

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**
```bash
# Find and stop the process using the port
docker ps
docker stop <container_id>

# Or change ports in docker-compose.dev.yml
```

---

## Build Issues

### Issue: Frontend build fails

**Error:** `npm run build` fails

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json build
npm install --legacy-peer-deps
npm run build
```

### Issue: Backend build fails

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Out of memory during build

**Error:** `JavaScript heap out of memory`

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## Network Issues

### Issue: Cannot connect to blockchain node

**Error:** `ECONNREFUSED` when accessing blockchain API

**Solution:**
1. Check `backend/.env` has correct `BLOCKCHAIN_RPC_URL`
2. Verify blockchain node is running
3. Test connection: `curl http://localhost:26657/status`

### Issue: WebSocket connection fails

**Error:** `WebSocket connection failed`

**Solution:**
1. Check backend WebSocket server is running
2. Verify `WS_PORT` in `backend/.env`
3. Check firewall/proxy settings

### Issue: CORS errors

**Error:** `Access to fetch ... has been blocked by CORS policy`

**Solution:**
1. Check `CORS_ORIGIN` in `backend/.env`
2. For development, use: `CORS_ORIGIN=http://localhost:3000`
3. For production, set to your domain

---

## Performance Issues

### Issue: Slow page loads

**Solution:**
1. Enable caching in `backend/.env`: `ENABLE_CACHE=true`
2. Increase cache size: `CACHE_MAX_SIZE=200`
3. Enable compression: `ENABLE_COMPRESSION=true`

### Issue: High memory usage

**Solution:**
1. Reduce cache size in `backend/.env`
2. Decrease WebSocket update frequency
3. Enable compact mode in frontend settings

---

## Testing Issues

### Issue: Tests fail after installation

**Solution:**
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Issue: Jest configuration errors

**Solution:**
Check `jest.config.js` exists in both backend and frontend directories.

---

## Clean Installation

If all else fails, perform a clean installation:

```bash
# 1. Clean everything
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf frontend/build

# 2. Run setup script
./setup.sh

# 3. If setup script fails, install manually
cd backend && npm install
cd ../frontend && npm install --legacy-peer-deps
```

---

## Getting Help

If you're still experiencing issues:

1. **Check the logs:**
   ```bash
   # Backend logs
   cd backend && npm run dev

   # Frontend logs
   cd frontend && npm start
   ```

2. **Enable debug mode:**
   ```bash
   # backend/.env
   LOG_LEVEL=debug
   ```

3. **Check system requirements:**
   - Node.js 18+
   - npm 8+
   - 4GB RAM minimum
   - 2GB disk space

4. **Create an issue:**
   - Visit: https://github.com/dorindorin97/Trident-Network/issues
   - Include: OS, Node version, error messages, logs

5. **Review documentation:**
   - [README.md](README.md) - Project overview
   - [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
   - [API.md](API.md) - API documentation
   - [USER_GUIDE.md](USER_GUIDE.md) - User guide

---

## Common Error Messages

### `ENOENT: no such file or directory`
**Solution:** Run `./setup.sh` to create required files

### `MODULE_NOT_FOUND`
**Solution:** Run `npm install` in the appropriate directory

### `EADDRINUSE`
**Solution:** Kill the process using the port (see [Port already in use](#issue-port-already-in-use))

### `ECONNREFUSED`
**Solution:** Check the backend server is running

### `CORS policy`
**Solution:** Check `CORS_ORIGIN` in `backend/.env`

### `JavaScript heap out of memory`
**Solution:** Increase Node.js memory limit (see [Out of memory during build](#issue-out-of-memory-during-build))

---

## Platform-Specific Issues

### macOS

**Issue:** `gyp: No Xcode or CLT version detected`
```bash
xcode-select --install
```

### Linux

**Issue:** `EACCES: permission denied`
```bash
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER .
```

### Windows

**Issue:** PowerShell script execution disabled
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Issue:** Line ending issues with `setup.sh`
```bash
# Use Git Bash or WSL
dos2unix setup.sh
./setup.sh
```

---

## Additional Resources

- **Node.js Documentation:** https://nodejs.org/docs
- **React Documentation:** https://react.dev
- **Express Documentation:** https://expressjs.com
- **Docker Documentation:** https://docs.docker.com
- **npm Documentation:** https://docs.npmjs.com

---

**Last Updated:** December 4, 2025
