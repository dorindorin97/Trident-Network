# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

### Backend
- **Helmet.js**: Security headers protection
- **CORS**: Strict origin validation
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All user inputs are validated and sanitized
- **Request Size Limits**: JSON payloads limited to 10KB
- **Structured Logging**: All errors and suspicious activity logged
- **Request ID Tracking**: Each request has unique ID for tracing

### Frontend
- **Error Boundaries**: Graceful error handling prevents crashes
- **XSS Protection**: React's built-in escaping
- **Testnet Only**: Clear warnings about testnet usage
- **No Private Key Storage**: Keys only in memory, cleared on reload

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@trident.network or open a private security advisory on GitHub.

**Please do not:**
- Open public GitHub issues for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We aim to respond to security reports within 48 hours and will keep you updated on the remediation progress.

## Security Best Practices for Deployment

1. **Environment Variables**: Never commit `.env` files to version control
2. **HTTPS**: Always use HTTPS in production
3. **Secrets Management**: Use proper secrets management (e.g., AWS Secrets Manager, HashiCorp Vault)
4. **Network Security**: Run containers in isolated networks
5. **Updates**: Keep dependencies updated regularly
6. **Monitoring**: Enable logging and monitoring in production
7. **Backups**: Regular backups of critical data
8. **Access Control**: Limit access to production environments

## Known Limitations

- This explorer connects to testnet only
- Private keys are stored in browser memory (not suitable for production use)
- No authentication system for API endpoints
- Cache is in-memory and will be lost on container restart
