# Trident Network Explorer - User Guide

Welcome to the Trident Network Explorer! This guide will help you navigate and use all the features available in the explorer.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Navigation](#navigation)
3. [Features](#features)
4. [Settings](#settings)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Troubleshooting](#troubleshooting)

---

## Getting Started

The Trident Network Explorer is a web-based tool for exploring the Trident blockchain. It allows you to view blocks, transactions, accounts, and validators in real-time.

### Important Notes

- **Testnet Only**: This explorer connects to the Trident Testnet. Do not use real assets or production private keys.
- **Browser Compatibility**: Works best in modern browsers (Chrome, Firefox, Edge, Safari).
- **Data Refresh**: The explorer automatically refreshes data every 5-10 seconds, depending on your settings.

---

## Navigation

### Main Menu

Located at the top of the page, the navigation bar provides quick access to:

- **Home**: Latest block information and quick stats
- **Blocks**: Complete block history with pagination
- **Validators**: List of network validators with status and voting power
- **Account Lookup**: Search for account balances and transactions
- **Wallet**: Login with a private key to view your wallet (testnet only)
- **Admin**: System metrics and cache statistics (for administrators)

### Search Bar

The search bar (accessible with `Ctrl+K`) allows you to search for:

- **Block Numbers**: Enter a number (e.g., `12345`)
- **Block Hashes**: Enter a hash starting with `0x`
- **Transaction IDs**: Enter a transaction hash
- **Account Addresses**: Enter an address starting with `T`

**Search History**: Your recent searches are saved and can be accessed by clicking the search bar.

---

## Features

### 1. Block Explorer

**View the latest block**: The home page displays the most recent block with:
- Block number
- Hash
- Timestamp
- Validator
- Transaction count

**Block history**: Click "Block History" to see a paginated list of all blocks.

**Block details**: Click any block number or hash to view:
- Complete block information
- All transactions in the block
- Validator details
- Timestamp and hash

### 2. Transaction Viewer

**Transaction list**: View transactions within blocks or account pages.

**Transaction details**: Click any transaction ID to see:
- Sender and receiver addresses
- Amount transferred
- Timestamp
- Block number
- Transaction status

**Transaction filtering**: On account pages, filter transactions by:
- Date range (from/to)
- Amount range (min/max)
- Transaction type (sent/received/all)

### 3. Account Lookup

**Search accounts**: Enter an account address to view:
- Current balance
- Transaction history
- Paginated transaction list

**Account page features**:
- Copy address to clipboard
- QR code generation for the address
- Transaction filtering and pagination
- Export transactions (CSV/JSON)

### 4. Validator Information

**Validator list**: View all network validators with:
- Address and status (active/inactive)
- Voting power
- Uptime percentage
- Sort by power, status, or address
- Filter by active/inactive status

**Export validators**: Download validator data as CSV or JSON.

### 5. Admin Dashboard

**System metrics**:
- Cache statistics (hits, misses, size)
- Request metrics by endpoint
- System uptime
- Connected WebSocket clients

**Data visualization**:
- Block height chart (last 10 blocks)
- Transaction volume chart
- Validator distribution pie chart

**Cache management**: Clear the cache manually (requires confirmation).

### 6. Real-Time Updates

**WebSocket connection**: The explorer maintains a WebSocket connection for real-time updates:
- Block updates appear automatically
- Connection status shown in the status indicator
- Reconnects automatically if disconnected

**Connection status**: Check the WebSocket status indicator (top-right) to see:
- 🟢 Connected: Real-time updates active
- 🟡 Connecting: Attempting to connect
- 🔴 Disconnected: No real-time updates

### 7. Export Features

Export data in multiple formats:

**CSV Export**:
- Transactions: ID, From, To, Amount, Timestamp
- Validators: Address, Status, Power, Uptime

**JSON Export**:
- Complete data with all fields
- Machine-readable format for integration

### 8. Multi-Language Support

Available languages:
- **English** (en)
- **Español** (es)
- **Português** (pt)

Change language in Settings or the language selector.

### 9. Theme System

**Dark Mode** (default):
- Optimized for low-light environments
- Reduced eye strain

**Light Mode**:
- High contrast for bright environments
- Better readability in daylight

Toggle with `Ctrl+/` or in Settings.

---

## Settings

Access settings by clicking the ⚙️ icon or pressing `Ctrl+,`.

### Appearance Settings

**Theme**: Choose between Dark and Light mode.

**Language**: Select your preferred language (English, Spanish, Portuguese).

**Compact Mode**: Reduce spacing for more content on screen.

**Enable Animations**: Toggle animations (disable for better performance on slower devices).

### Data & Updates Settings

**Auto-refresh Data**: Enable/disable automatic data refreshing.

**Refresh Interval**: Set how often data refreshes:
- 3 seconds (fastest, more network usage)
- 5 seconds (recommended)
- 10 seconds
- 30 seconds
- 1 minute (slowest, less network usage)

### Developer Settings

**Show Performance Monitor**: Display FPS and memory usage (development only, requires page reload).

### Reset Settings

**Reset to Defaults**: Restore all settings to their default values (requires confirmation).

---

## Keyboard Shortcuts

Enhance your productivity with these keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Focus search bar |
| `Ctrl+/` | Toggle dark/light theme |
| `Ctrl+,` | Open settings panel |
| `Esc` | Close search history or blur search |

---

## Troubleshooting

### Common Issues

**Issue**: "Service unavailable" error

**Solutions**:
- Check your internet connection
- Verify the backend server is running
- Check the Network Status indicator (bottom-right)
- Try refreshing the page

---

**Issue**: Data not updating in real-time

**Solutions**:
- Check WebSocket connection status (top-right indicator)
- Ensure auto-refresh is enabled in Settings
- Check your firewall/antivirus isn't blocking WebSocket connections
- Try refreshing the page

---

**Issue**: Search not finding results

**Solutions**:
- Verify the format of your search query:
  - Blocks: Numbers only (e.g., `12345`)
  - Addresses: Start with `T` (e.g., `TACC1...`)
  - Transactions: Hex hash (e.g., `0xabc123...`)
- Check for typos in the address/hash
- Ensure the resource exists on the testnet

---

**Issue**: Slow performance

**Solutions**:
- Disable animations in Settings
- Enable Compact Mode in Settings
- Close other browser tabs
- Disable Performance Monitor if enabled
- Increase refresh interval in Settings

---

**Issue**: Export not working

**Solutions**:
- Ensure pop-ups aren't blocked in your browser
- Check browser download settings
- Try a different browser
- Ensure you have write permissions to your download folder

---

### Network Status Indicator

The Network Status indicator (bottom-right corner) shows:

- 🟢 **Fast** (< 500ms): Excellent connection
- 🟡 **Normal** (500-1000ms): Good connection
- 🟠 **Slow** (> 1000ms): High latency, may experience delays
- 🔴 **Offline**: No connection to backend

Click the indicator to see detailed network information:
- Current status
- Latency in milliseconds
- Last check timestamp
- Failed check count (if any)

---

## Support & Resources

### Documentation

- **API Documentation**: See `API.md` for endpoint details
- **Development Guide**: See `DEVELOPMENT.md` for contributing
- **Security Policy**: See `SECURITY.md` for reporting vulnerabilities

### Links

- **GitHub Repository**: [github.com/dorindorin97/Trident-Network](https://github.com/dorindorin97/Trident-Network)
- **Report Issues**: Use GitHub Issues for bug reports
- **Contributing**: See `CONTRIBUTING.md` for guidelines

### Testnet Information

- **Chain ID**: `0x76a81b116bfaa26e`
- **Block Time**: 2 seconds
- **Consensus**: Modified BFT Proof-of-Stake
- **RPC Endpoint**: `https://testnet.rpc.trident.network`

---

## Safety & Security

### Wallet Usage

⚠️ **IMPORTANT**: This explorer is connected to the Trident **TESTNET ONLY**.

- **Never use real private keys or assets**
- Keys are stored in browser memory only (not on servers)
- Keys are cleared when you close or refresh the page
- Use only test accounts for wallet features
- Do not share private keys with anyone

### Data Privacy

- The explorer does not collect or store personal information
- Search history is stored locally in your browser
- Settings are stored locally in your browser
- No tracking or analytics are performed

---

## Tips & Best Practices

1. **Bookmark frequently used addresses**: Use your browser's bookmark feature for quick access to specific accounts.

2. **Use keyboard shortcuts**: Master `Ctrl+K` for search, `Ctrl+/` for theme toggle, and `Ctrl+,` for settings.

3. **Optimize refresh interval**: Balance between real-time updates and network usage:
   - Active monitoring: 3-5 seconds
   - Casual browsing: 10-30 seconds
   - Background tab: 1 minute

4. **Export data regularly**: If you're tracking specific accounts or validators, export data periodically for your records.

5. **Enable compact mode**: If viewing on smaller screens or need to see more data at once.

6. **Use filters effectively**: On account pages, use transaction filters to find specific transactions quickly.

7. **Check network status**: Before reporting issues, check the Network Status indicator to ensure connectivity.

8. **Clear browser cache**: If experiencing display issues, clear your browser cache and reload.

---

## Feature Highlights

### Recently Added Features

✅ **Settings Panel**: Comprehensive user preferences management

✅ **Network Status**: Real-time connection health monitoring

✅ **Loading Bar**: Visual feedback during page transitions

✅ **Performance Monitor**: Development tool for tracking FPS and memory

✅ **WebSocket Status**: Real-time connection indicator

✅ **Footer**: Network information and useful links

✅ **Enhanced Error Handling**: Better error messages with retry options

✅ **Toast Notifications**: Non-intrusive feedback for actions

✅ **Search History**: Quick access to recent searches

---

Thank you for using the Trident Network Explorer! 

For questions, issues, or contributions, visit our [GitHub repository](https://github.com/dorindorin97/Trident-Network).
