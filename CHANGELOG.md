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

### Improved
- Address validation consistency across frontend and backend.
- Backend input validation for query parameters with max limits.
- Docker configurations with multi-stage builds and health checks.
- Error handling and logging throughout the backend.
- Rate limiting with custom error messages.
- Security headers and request body size limits.

### Fixed
- Address regex pattern inconsistency in utils.js.
- Missing validation for pagination parameters.

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


