# Changelog

## [Unreleased - 1.1.0]
### Added
- Live block updates via WebSockets or polling. *(experimental)*
- Wallet signing and transaction broadcasting flow.
- Multi-chain/mainnet explorer configuration.
- Admin dashboard with basic analytics.
- Error boundary component for graceful React error handling.
- Response caching with TTL for frequently accessed endpoints.
- Structured JSON logging with configurable log levels.
- Health check endpoints for Docker containers.
- Jest configuration files for better test setup.
- Prettier configuration for consistent code formatting.
- Centralized validator utility module for input validation.
- PropTypes validation for React components (NavBar, CopyButton, WalletPage).
- Comprehensive API documentation (API.md) with examples.
- Development guide (DEVELOPMENT.md) with workflows and best practices.
- Contributing guide (CONTRIBUTING.md) with clear process.
- Request ID middleware for request tracking.
- Copy button with user feedback (shows "Copied!" state).
- Custom React hooks (useApi, usePolling, useDebounce, useLocalStorage, useClickOutside).
- API error handling utilities with custom error classes.
- LoadingSpinner component with configurable sizes.
- Configuration constants file for centralized settings.
- Environment validation on startup.
- Comprehensive test suite for validator utilities.
- Missing translations (Copied!, error messages) in all languages.
- Makefile with common development commands.
- Automated setup script (setup.sh).
- GitHub Actions CI workflow for automated testing.
- Enhanced .gitignore with comprehensive patterns.

### Improved
- Address validation consistency across frontend and backend.
- Backend input validation for query parameters with max limits.
- Docker configurations with multi-stage builds and health checks.
- Docker Compose files with restart policies and health checks.
- Error handling and logging throughout the backend.
- Rate limiting with custom error messages.
- Security headers and request body size limits.
- .dockerignore files for better build efficiency.
- Code organization with centralized validation utilities.
- README.md with quick setup instructions and Makefile commands.
- PropTypes added to frontend package.json dependencies.
- User feedback on copy actions with temporary state.
- i18n translations with better coverage.
- API calls with proper error handling and loading states.
- Development workflow with hot-reload support.

### Fixed
- Address regex pattern inconsistency in utils.js.
- Missing validation for pagination parameters.
- Duplicate validation logic across route handlers.
- Missing clipboard error handling in CopyButton.
- Docker volume mounting for better development experience.

## [1.0.0] - 2024-06-01
### Added
- Documented environment variables across frontend and backend.
- Secure wallet handling with memory-only storage.
- API input validation and block hash search support.
- Spanish translations for the UI.
- UI enhancements: page linking, copy buttons, polling, pagination improvements.
- Responsive design tweaks for mobile.
- Security hardening with Helmet and strict CORS.
- Jest test coverage and GitHub Actions workflows.


