# Trident Network Explorer - Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for containerized development)
- Git

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dorindorin97/Trident-Network.git
   cd Trident-Network
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

## Development Workflows

### Option 1: Local Development (without Docker)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:4000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on http://localhost:3000

### Option 2: Docker Development

```bash
docker compose -f docker-compose.dev.yml up
```

This starts both services with hot-reload enabled.

## Project Structure

```
Trident-Network/
├── backend/
│   ├── routes/           # API route handlers
│   ├── utils/            # Utility functions (cache, logger, validator)
│   ├── tests/            # Backend tests
│   ├── server.js         # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── locales/      # i18n translations
│   │   ├── App.js        # Main app component
│   │   └── utils.js      # Frontend utilities
│   ├── public/           # Static assets
│   ├── tests/            # Frontend tests
│   └── package.json
├── config/               # Blockchain configuration
├── kubernetes/           # K8s deployment configs
└── docker-compose.*.yml  # Docker compose files
```

## Available Scripts

### Backend

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests with Jest
npm run lint       # Lint code with ESLint
npm run format     # Format code with Prettier
```

### Frontend

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests with Jest
npm run lint       # Lint code with ESLint
npm run format     # Format code with Prettier
```

## Code Style

This project uses:
- **ESLint** for linting
- **Prettier** for code formatting
- **PropTypes** for React component type checking

Configuration files:
- `.eslintrc.json` - ESLint configuration
- `.prettierrc.json` - Prettier configuration

### Running Linters

```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint -- --fix

# Format all files
npm run format
```

## Testing

### Backend Tests

```bash
cd backend
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Frontend Tests

```bash
cd frontend
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## API Development

### Adding a New Endpoint

1. **Create route handler** in `backend/routes/`
   ```javascript
   const express = require('express');
   const router = express.Router();
   const validator = require('../utils/validator');
   
   module.exports = fetchRpc => {
     router.get('/v1/myendpoint/:id', async (req, res) => {
       // Validate input
       if (!validator.isValidId(req.params.id)) {
         return res.status(400).json({ error: 'Invalid ID' });
       }
       
       try {
         const data = await fetchRpc(`/myendpoint/${req.params.id}`);
         return res.json(data);
       } catch (err) {
         return res.status(503).json({ error: 'Service unavailable' });
       }
     });
     
     return router;
   };
   ```

2. **Register route** in `backend/server.js`
   ```javascript
   app.use('/api', require('./routes/myroute')(fetchRpc));
   ```

3. **Add validation** in `backend/utils/validator.js` if needed

4. **Update API documentation** in `API.md`

5. **Write tests** in `backend/tests/`

## Frontend Development

### Adding a New Component

1. **Create component** in `frontend/src/components/`
   ```javascript
   import React from 'react';
   import PropTypes from 'prop-types';
   
   function MyComponent({ prop1, prop2 }) {
     return (
       <div>
         {/* Component content */}
       </div>
     );
   }
   
   MyComponent.propTypes = {
     prop1: PropTypes.string.isRequired,
     prop2: PropTypes.number
   };
   
   export default MyComponent;
   ```

2. **Add translations** in `frontend/src/locales/*.json`

3. **Import and use** in parent component or route

4. **Write tests** in `frontend/tests/`

## Debugging

### Backend Debugging

1. **Enable debug logging**
   ```bash
   LOG_LEVEL=debug npm run dev
   ```

2. **View structured logs**
   All logs are output as JSON for easy parsing

3. **Request tracing**
   Each request gets an `X-Request-ID` header for tracking

### Frontend Debugging

1. **React DevTools**
   Install React DevTools browser extension

2. **Console Logs**
   Check browser console for errors and warnings

3. **Network Tab**
   Monitor API requests in browser DevTools

## Docker Development

### Building Images

```bash
# Backend
docker build -t trident-backend ./backend

# Frontend
docker build -t trident-frontend \
  --build-arg REACT_APP_BACKEND_URL=http://localhost:4000 \
  ./frontend
```

### Running Containers

```bash
# Development
docker compose -f docker-compose.dev.yml up

# Production
docker compose -f docker-compose.prod.yml up -d
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
```

## Performance Optimization

### Backend

1. **Caching**: Response caching is enabled by default
   - Latest blocks: 5s TTL
   - Other endpoints: 30s TTL

2. **Rate Limiting**: 100 requests per 15 minutes per IP

3. **Compression**: Consider adding compression middleware for production

### Frontend

1. **Code Splitting**: React lazy loading for routes
2. **Bundle Analysis**: Use `npm run build` and analyze bundle size
3. **Image Optimization**: Optimize static assets in `public/`

## Common Issues

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # or :4000

# Kill process
kill -9 <PID>
```

### Module Not Found

```bash
# Clear caches and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Docker Build Fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker compose build --no-cache
```

## Contributing

1. Create a feature branch
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make changes and commit
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

3. Run tests and linting
   ```bash
   npm test
   npm run lint
   ```

4. Push and create PR
   ```bash
   git push origin feature/my-feature
   ```

## Security

- Never commit `.env` files
- Review [SECURITY.md](./SECURITY.md) before deploying
- Keep dependencies updated with `npm audit`
- Use environment variables for sensitive data

## Resources

- [API Documentation](./API.md)
- [Security Policy](./SECURITY.md)
- [Changelog](./CHANGELOG.md)
- [Roadmap](./ROADMAP.md)

## Support

- GitHub Issues: https://github.com/dorindorin97/Trident-Network/issues
- Documentation: See README.md and API.md
