# Integration Guide - Session 8 Improvements

This guide helps you integrate the new utilities into your existing codebase.

## Backend Integration

### 1. Update server.js initialization
The `server.js` has been updated to use environment variable validation. Ensure your `.env` file has:

```bash
CHAIN_MODE=rpc
TRIDENT_NODE_RPC_URL=http://localhost:8545  # or your RPC endpoint
PORT=4000
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info
ENABLE_CACHE=true
CACHE_MAX_SIZE=1000
ENABLE_COMPRESSION=true
```

### 2. Using validation in routes

**Example in routes/validators.js:**
```javascript
const { validatePagination } = require('../utils/validation-rules');
const { ApiError } = require('../utils/error-codes');

router.get('/v1/validators', async (req, res) => {
  try {
    const { limit, offset } = validatePagination(req.query.limit, req.query.offset);
    // ... fetch data
  } catch (error) {
    throw new ApiError('INVALID_PAGINATION', { message: error.message });
  }
});
```

### 3. Response validation

**Example:**
```javascript
const { validateResponse } = require('../utils/response-schemas');

app.get('/api/v1/validators', async (req, res) => {
  const data = await fetchRpc('/validators');
  const { valid, errors } = validateResponse(data, 'validators');
  
  if (!valid) {
    logger.warn('Invalid response format', { errors });
  }
  
  return res.json(data);
});
```

### 4. Using request deduplicator

**Example:**
```javascript
const RequestDeduplicator = require('./utils/request-deduplicator');
const deduplicator = new RequestDeduplicator();

async function fetchValidators() {
  return deduplicator.deduplicate(async () => {
    return await fetchRpc('/validators');
  });
}
```

---

## Frontend Integration

### 1. Wrap App with AppContextProvider

**In src/index.js:**
```javascript
import { AppContextProvider } from './context/AppContext';

ReactDOM.render(
  <AppContextProvider>
    <App />
  </AppContextProvider>,
  document.getElementById('root')
);
```

### 2. Use form components

**Replace manual forms with FormComponents:**
```javascript
import { FormInput, FormButton, FormSelect } from './components/FormComponents';
import './components/FormComponents.css';

export function SearchForm() {
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  return (
    <form>
      <FormInput
        label="Search"
        name="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        error={error}
        placeholder="Enter address, block, or transaction"
      />
      <FormButton type="submit" label="Search" />
    </form>
  );
}
```

### 3. Use context hooks

**Replace prop drilling with hooks:**
```javascript
import { useTheme, useNotification } from './context/AppContext';

export function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useNotification();

  const handleSave = async () => {
    try {
      // ... save logic
      showToast('Saved successfully!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={handleSave}>Save</button>
    </>
  );
}
```

### 4. Track performance

**In components:**
```javascript
import performanceMonitor from './utils/performanceMonitor';

export function DataList() {
  const startTime = performance.now();

  useEffect(() => {
    // Fetch data
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        const duration = performance.now() - startTime;
        performanceMonitor.recordApiCall('/api/data', duration, 200, JSON.stringify(data).length);
      });
  }, []);

  const renderStart = performance.now();
  // ... render component
  const renderTime = performance.now() - renderStart;
  performanceMonitor.recordComponentRender('DataList', renderTime);
}
```

---

## Configuration Files

### Backend .env
```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Chain Configuration
CHAIN_MODE=rpc
TRIDENT_NODE_RPC_URL=http://localhost:8545

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info

# Caching
ENABLE_CACHE=true
CACHE_MAX_SIZE=1000

# Compression
ENABLE_COMPRESSION=true
```

### Frontend .env
```bash
REACT_APP_BACKEND_URL=http://localhost:4000
REACT_APP_APP_TITLE=Trident Explorer
REACT_APP_DEFAULT_THEME=dark
REACT_APP_DEFAULT_LANGUAGE=en
```

---

## Common Use Cases

### Validating User Input
```javascript
import { validateAddress, validateAmount } from './utils/validation-rules';

function validateForm(address, amount) {
  const errors = {};
  
  try {
    validateAddress(address);
  } catch (e) {
    errors.address = e.message;
  }
  
  try {
    validateAmount(amount);
  } catch (e) {
    errors.amount = e.message;
  }
  
  return errors;
}
```

### Error Handling
```javascript
import { ApiError, getErrorCode } from './utils/error-codes';

app.get('/api/data', async (req, res, next) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (error) {
    const code = getErrorCode(error);
    const apiError = new ApiError(code);
    res.status(apiError.status).json(apiError.toJSON());
  }
});
```

### Global State Management
```javascript
// In any component:
import { useAppContext } from './context/AppContext';

function MyComponent() {
  const { setLoading, setError, showToast } = useAppContext();

  const handleAction = async () => {
    setLoading(true);
    try {
      const result = await doSomething();
      showToast('Success!', 'success');
    } catch (error) {
      setError(error.message);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return <button onClick={handleAction}>Do Action</button>;
}
```

---

## Testing New Utilities

### Test Validation Rules
```javascript
const { validateAddress } = require('./utils/validation-rules');

describe('Validation Rules', () => {
  test('validates correct address', () => {
    expect(() => validateAddress('T1234567890abcdefghij1234567890ab')).not.toThrow();
  });

  test('rejects invalid address', () => {
    expect(() => validateAddress('0x123')).toThrow();
  });
});
```

### Test Response Schemas
```javascript
const { validateResponse } = require('./utils/response-schemas');

test('validates validators response', () => {
  const data = [{ address: 'T...', votingPower: 100 }];
  const { valid } = validateResponse(data, 'validators');
  expect(valid).toBe(true);
});
```

---

## Performance Monitoring Dashboard

You can view performance metrics in the Admin Dashboard:

```
GET /api/v1/admin/metrics
```

Returns:
```json
{
  "totalRequests": 150,
  "uptime": 3600,
  "requestsPerSecond": "0.04",
  "cacheStats": {
    "entries": 45,
    "hitRate": 0.78,
    "uptime": 3600
  },
  "deduplicationStats": {
    "pendingRequests": 2
  }
}
```

---

## Troubleshooting

### Environment Variables Not Validated
Ensure `.env` file exists and contains all required variables. Check logs for specific validation errors.

### Form Components Not Styling
Import the CSS file: `import './components/FormComponents.css'`

### Context Not Available
Wrap your app with `AppContextProvider` at the top level.

### Performance Monitor Not Recording
Ensure you're calling `performanceMonitor.record*()` methods at the right time.

---

## Next Steps

1. Gradually migrate existing code to use new validation rules
2. Replace manual form elements with FormComponents
3. Implement AppContext for state management
4. Add performance monitoring to critical components
5. Validate all API responses using schemas

For more details, see [SESSION_8_IMPROVEMENTS.md](./SESSION_8_IMPROVEMENTS.md)
