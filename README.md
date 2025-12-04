# Trident Network Explorer

A modern, feature-rich web explorer for the community-run Trident blockchain. Built with React and Express, providing real-time monitoring of blocks, transactions, accounts, and validators.

**Note:** This explorer operates against the Trident Testnet only.

## ✨ Key Features

### 🔍 **Advanced Search & Navigation**
- Smart search with auto-detection (blocks, transactions, addresses)
- Advanced search modal with comprehensive filters
- Search history with quick access
- Breadcrumb navigation for easy navigation
- Keyboard shortcuts (Ctrl+K, Ctrl+/, Ctrl+,)

### 📊 **Real-Time Monitoring**
- Live block updates via WebSocket
- Network status indicator with latency monitoring
- Performance monitor (FPS, memory usage)
- Loading bar for smooth page transitions
- Auto-refresh with configurable intervals

### 🎨 **Modern UI/UX**
- Dark/Light theme with smooth transitions
- Responsive design for mobile and desktop
- Toast notifications for user feedback
- Scroll-to-top button for long pages
- Skeleton loaders for better perceived performance

### 🌐 **Internationalization**
- Multi-language support (English, Spanish, Portuguese)
- Complete translation coverage
- RTL support ready

### ⚙️ **Customization**
- Comprehensive settings panel
- Theme customization
- Compact mode for dense information
- Animation controls
- Refresh interval configuration

### 📈 **Data Visualization**
- Admin dashboard with charts (recharts)
- Block history chart
- Transaction volume chart
- Validator distribution pie chart
- Export data (CSV/JSON)

### 🔒 **Security & Performance**
- Rate limiting (100 req/15min)
- Input sanitization
- Security headers (helmet)
- Response compression (gzip)
- Smart caching with LRU eviction
- Code splitting with lazy loading

### 📱 **Progressive Web App**
- Installable on mobile/desktop
- Offline-ready manifest
- App shortcuts
- iOS home screen support

## Blockchain Specs

- **Chain ID:** `0x76a81b116bfaa26e`
- **Block Time:** 2 seconds
- **Consensus:** Modified BFT Proof-of-Stake

## Testnet Details

- **RPC Endpoint:** `https://testnet.rpc.trident.network`
- **Explorer API:** `https://testnet-explorer-api.trident.network`
- **Example Addresses:** `TACC1PLACEHOLDER000000000000000000000000`, `TACC2PLACEHOLDER000000000000000000000000`
- **Validators:** `TVAL1PLACEHOLDER000000000000000000000000`, `TVAL2PLACEHOLDER000000000000000000000000`

## Wallet Disclaimer

This explorer is connected to the **Trident Testnet only**. Do not use real assets or private keys.

This explorer connects directly to a Trident RPC node.
`CHAIN_MODE` must be set to `rpc` and mock mode is no longer available.

Local development requires access to a running Trident testnet RPC node.

Keys remain in browser memory and are cleared when the page reloads.

## Environment Variables

Copy `frontend/.env.example` and `backend/.env.example` to create `.env` files. The table below lists all variables.

| Variable (location) | Default | Description |
| ------------------- | ------- | ----------- |
| `PORT` (frontend) | `3000` | Port for the React dev server |
| `PORT` (backend) | `4000` | Port for the API server |
| `REACT_APP_BACKEND_URL` | `https://testnet-explorer-api.trident.network` | API base URL used by the frontend |
| `REACT_APP_APP_TITLE` | `Trident Explorer` | Browser title and branding |
| `REACT_APP_THEME_COLOR` | `#001730` | Primary UI color |
| `REACT_APP_DEFAULT_LANGUAGE` | `en` | Initial language |
| `REACT_APP_DEFAULT_THEME` | `dark` | Initial theme (light or dark) |
| `REACT_APP_REFRESH_INTERVAL` | `10000` | Polling interval in ms for latest block |
| `CHAIN_MODE` | `rpc` | Backend operating mode (must be `rpc`) |
| `TRIDENT_NODE_RPC_URL` | `https://testnet.rpc.trident.network` | Node RPC endpoint when `CHAIN_MODE=rpc` |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin for the API |
| `LOG_LEVEL` (backend) | `info` | Logging level (error, warn, info, debug) |

`REACT_APP_*` variables are baked into the frontend at build time. Rebuild the image or run the dev server again after changing them.

## Quickstart

### Quick Setup (Automated)

```bash
# Clone and setup
git clone https://github.com/dorindorin97/Trident-Network.git
cd Trident-Network
./setup.sh

# Start development
make dev
```

**Having issues?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common problems and solutions.

### Manual Setup

#### Development

```bash
docker compose -f docker-compose.dev.yml up
```

The command above starts the backend on port 4000 and the React app on port 3000 using `CHAIN_MODE=rpc`.

### Production

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Images are built from `frontend/` and `backend/`. Ensure your `.env` files contain the correct values before building.

## Available Commands

The project includes a Makefile for common development tasks:

```bash
make help          # Show all available commands
make install       # Install all dependencies
make dev           # Start development environment with Docker
make test          # Run all tests
make lint          # Lint all code
make format        # Format all code with Prettier
make clean         # Clean node_modules and build artifacts
make docker-logs   # View Docker logs
make ci            # Run CI checks (install, lint, test)
```

See `make help` for complete list of commands.

## API Reference

See [API.md](./API.md) for comprehensive API documentation including:
- All endpoints with parameters
- Request/response examples
- Error codes and handling
- Rate limiting details
- Code examples in cURL and JavaScript

Additional Documentation:
- **[WebSocket API](./WEBSOCKET_API.md)** - Real-time updates via WebSocket
- **[Export Features](./EXPORT_FEATURES.md)** - CSV/JSON export functionality
- **[Admin API](./ADMIN_API.md)** - Admin endpoints for monitoring

Quick reference:

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/blocks/latest` | Latest block |
| GET | `/api/v1/blocks` | Paginated block list |
| GET | `/api/v1/blocks/:number` | Block details |
| GET | `/api/v1/transactions/:id` | Transaction details |
| GET | `/api/v1/accounts/:address` | Account info |
| GET | `/api/v1/validators` | Validator list |
| GET | `/api/v1/admin/cache/stats` | Cache statistics (admin) |
| DELETE | `/api/v1/admin/cache` | Clear cache (admin) |
| GET | `/api/v1/admin/metrics` | System metrics (admin) |
| WebSocket | `/ws` | Real-time updates |

Non‑listed routes under `/api` return `404`.

## New Features (v1.1.0)

### ✅ Real-Time Updates
- **WebSocket Support**: Live block, transaction, and validator updates
- Subscribe to specific channels (blocks, transactions, validators)
- Auto-reconnection and heartbeat monitoring
- See [WEBSOCKET_API.md](./WEBSOCKET_API.md) for details

### ✅ Data Export
- **CSV Export**: Download validator lists and transaction data
- **JSON Export**: Full data export with formatting
- One-click export from UI
- See [EXPORT_FEATURES.md](./EXPORT_FEATURES.md) for details

### ✅ Admin Dashboard
- **System Health Monitoring**: Real-time status and uptime
- **Cache Statistics**: Hit rate, size, and performance metrics
- **Request Metrics**: Total requests and endpoint analytics
- **WebSocket Monitoring**: Connected clients and subscriptions
- Auto-refresh every 10 seconds

### ✅ Enhanced UI/UX
- **Pagination**: Configurable items per page for block transactions
- **Sorting & Filtering**: Sort validators by power/status, filter by active/inactive
- **Search Bar**: Global search with auto-detection (block/tx/account)
- **Status Badges**: Visual indicators for validator status
- **Mobile Responsive**: Improved mobile layout

### ✅ Security & Performance
- **Zero Vulnerabilities**: All npm security issues resolved
- **Request/Response Logging**: Enhanced debugging capabilities
- **Compression**: Gzip compression for 60-80% bandwidth reduction
- **Retry Logic**: Exponential backoff for transient failures
- **Input Sanitization**: XSS and injection prevention

## Upcoming Features (v1.2.0)

- **Wallet signing** and transaction broadcasting
- **Multi-chain support** for connecting to different networks
- **Advanced analytics** with charts and graphs
- **Email notifications** for specific events
- **API authentication** for admin endpoints

## CI/CD

GitHub Actions run automated checks on pushes to `main` and `work`. Separate workflows build and publish Docker images when a release tag is published.

- `build.yml` – lints, tests and builds both projects on push.
- `frontend.yml` – builds and pushes the frontend image on release.
- `backend.yml` – builds and pushes the backend image on release.

## Documentation

- **[API Documentation](./API.md)** - Complete API reference with examples
- **[WebSocket API](./WEBSOCKET_API.md)** - Real-time updates documentation
- **[Export Features](./EXPORT_FEATURES.md)** - CSV/JSON export guide
- **[Admin API](./ADMIN_API.md)** - Admin endpoints for monitoring
- **[User Guide](./USER_GUIDE.md)** - End-user documentation with keyboard shortcuts
- **[Features Guide](./FEATURES.md)** - Complete feature inventory (45+ features)
- **[Development Guide](./DEVELOPMENT.md)** - Setup, workflows, and best practices
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project
- **[Security Policy](./SECURITY.md)** - Security features and reporting vulnerabilities
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Changelog](./CHANGELOG.md)** - Version history and changes

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License
