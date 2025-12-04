# Trident Network Explorer API Documentation

## Base URL
- **Development**: `http://localhost:4000/api`
- **Production**: `https://testnet-explorer-api.trident.network/api`

## Authentication
No authentication required. All endpoints are public.

## Rate Limiting
- **100 requests** per 15 minutes per IP address
- Rate limit headers included in responses

## Common Response Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (RPC node error)

---

## Endpoints

### Health Check

#### `GET /v1/health`
Check API health status and get server information.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-04T10:30:00.000Z",
  "uptime": 3600.5,
  "version": "1.1.0-beta"
}
```

---

### Blocks

#### `GET /v1/blocks/latest`
Get the most recent block.

**Response 200:**
```json
{
  "number": 12345,
  "hash": "0x1a2b3c4d5e6f7890",
  "validator": "TVAL1PLACEHOLDER000000000000000000000",
  "timestamp": "2025-12-04T10:29:58.000Z",
  "transactions": [
    {
      "txId": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "from": "TACC1PLACEHOLDER000000000000000000000",
      "to": "TACC2PLACEHOLDER000000000000000000000",
      "amount": "100.50",
      "timestamp": "2025-12-04T10:29:58.000Z"
    }
  ]
}
```

#### `GET /v1/blocks`
Get paginated list of blocks.

**Query Parameters:**
- `page` (optional, default: 1) - Page number (min: 1)
- `limit` (optional, default: 10) - Items per page (min: 1, max: 100)

**Example:** `/v1/blocks?page=2&limit=20`

**Response 200:**
```json
{
  "blocks": [
    {
      "number": 12344,
      "hash": "0x9876543210abcdef",
      "validator": "TVAL2PLACEHOLDER000000000000000000000",
      "timestamp": "2025-12-04T10:29:56.000Z",
      "txCount": 5
    }
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 12345
  }
}
```

**Error 400:**
```json
{
  "error": "Invalid pagination parameters"
}
```

#### `GET /v1/blocks/:number`
Get block by number.

**Parameters:**
- `number` - Block number (integer, 0 to MAX_SAFE_INTEGER)

**Example:** `/v1/blocks/12345`

**Response 200:** Same as `/v1/blocks/latest`

**Error 400:**
```json
{
  "error": "Invalid block number"
}
```

#### `GET /v1/blocks/hash/:hash`
Get block by hash.

**Parameters:**
- `hash` - Block hash (format: `0x` followed by 16 hex characters)

**Example:** `/v1/blocks/hash/0x1a2b3c4d5e6f7890`

**Response 200:** Same as `/v1/blocks/latest`

**Error 400:**
```json
{
  "error": "Invalid block hash"
}
```

---

### Transactions

#### `GET /v1/transactions/:id`
Get transaction details by ID.

**Parameters:**
- `id` - Transaction ID (64 hex characters, with or without `0x` prefix)

**Example:** `/v1/transactions/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890`

**Response 200:**
```json
{
  "txId": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "from": "TACC1PLACEHOLDER000000000000000000000",
  "to": "TACC2PLACEHOLDER000000000000000000000",
  "amount": "100.50",
  "fee": "0.001",
  "timestamp": "2025-12-04T10:29:58.000Z",
  "blockNumber": 12345,
  "status": "confirmed"
}
```

**Error 400:**
```json
{
  "error": "Invalid transaction id"
}
```

---

### Accounts

#### `GET /v1/accounts/:address`
Get account details and transaction history.

**Parameters:**
- `address` - Account address (format: `T` followed by 39 alphanumeric characters)

**Example:** `/v1/accounts/TACC1PLACEHOLDER000000000000000000000`

**Response 200:**
```json
{
  "address": "TACC1PLACEHOLDER000000000000000000000",
  "balance": "1000.50",
  "transactions": [
    {
      "txId": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "from": "TACC1PLACEHOLDER000000000000000000000",
      "to": "TACC2PLACEHOLDER000000000000000000000",
      "amount": "100.50",
      "timestamp": "2025-12-04T10:29:58.000Z"
    }
  ]
}
```

**Error 400:**
```json
{
  "error": "Invalid address"
}
```

---

### Validators

#### `GET /v1/validators`
Get list of active validators.

**Response 200:**
```json
{
  "validators": [
    {
      "address": "TVAL1PLACEHOLDER000000000000000000000",
      "stake": "10000.00",
      "commission": "5.0",
      "status": "active",
      "blocksProduced": 1234
    },
    {
      "address": "TVAL2PLACEHOLDER000000000000000000000",
      "stake": "15000.00",
      "commission": "3.5",
      "status": "active",
      "blocksProduced": 2345
    }
  ]
}
```

---

## Caching

The API implements response caching:
- `/blocks/latest` - 5 second TTL
- Other endpoints - 30 second TTL

Cache can be bypassed by RPC node, not client-controlled.

## Headers

### Request Headers
- `X-Request-ID` (optional) - Custom request ID for tracking

### Response Headers
- `X-Request-ID` - Request ID for tracking (generated if not provided)
- `X-RateLimit-Limit` - Rate limit maximum
- `X-RateLimit-Remaining` - Remaining requests in current window
- `X-RateLimit-Reset` - Time when rate limit resets

## Error Handling

All errors follow consistent format:

```json
{
  "error": "Error message description"
}
```

### Common Error Messages
- `"API route not found"` - Invalid endpoint
- `"Invalid pagination parameters"` - Bad page/limit values
- `"Invalid block number"` - Block number out of range or malformed
- `"Invalid block hash"` - Hash format incorrect
- `"Invalid transaction id"` - Transaction ID format incorrect
- `"Invalid address"` - Address format incorrect
- `"Service unavailable"` - RPC node unreachable
- `"Too many requests, please try again later"` - Rate limit exceeded

## Examples

### cURL

```bash
# Get latest block
curl -X GET http://localhost:4000/api/v1/blocks/latest

# Get blocks with pagination
curl -X GET "http://localhost:4000/api/v1/blocks?page=1&limit=10"

# Get specific block
curl -X GET http://localhost:4000/api/v1/blocks/12345

# Get transaction
curl -X GET http://localhost:4000/api/v1/transactions/0xabcd...

# Get account
curl -X GET http://localhost:4000/api/v1/accounts/TACC1PLACEHOLDER...

# Get validators
curl -X GET http://localhost:4000/api/v1/validators

# Health check
curl -X GET http://localhost:4000/api/v1/health
```

### JavaScript (Fetch)

```javascript
// Get latest block
const response = await fetch('http://localhost:4000/api/v1/blocks/latest');
const data = await response.json();

// Get blocks with pagination
const response = await fetch('http://localhost:4000/api/v1/blocks?page=1&limit=10');
const data = await response.json();

// With error handling
try {
  const response = await fetch('http://localhost:4000/api/v1/blocks/12345');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error('Error fetching block:', error);
}
```

## Best Practices

1. **Pagination**: Always use reasonable `limit` values (max 100)
2. **Error Handling**: Always check response status codes
3. **Rate Limiting**: Implement exponential backoff for rate limit errors
4. **Caching**: Cache responses on client side when appropriate
5. **Request IDs**: Include `X-Request-ID` header for debugging

## Support

For API issues or questions:
- GitHub Issues: https://github.com/dorindorin97/Trident-Network/issues
- Security Issues: See SECURITY.md
