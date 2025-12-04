# WebSocket API Documentation

## Overview

The Trident Network Explorer backend now includes WebSocket support for real-time updates. This allows clients to receive instant notifications about new blocks, transactions, and validator updates without polling.

## Connection

**Endpoint:** `ws://your-server:4000/ws` (or `wss://` for secure connections)

### Example Connection (JavaScript)

```javascript
const ws = new WebSocket('ws://localhost:4000/ws');

ws.onopen = () => {
  console.log('Connected to Trident Network WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from WebSocket');
};
```

## Message Types

### Client to Server

#### Subscribe to Channel

```json
{
  "type": "subscribe",
  "channel": "blocks"
}
```

**Available Channels:**
- `blocks` - New block notifications
- `transactions` - New transaction notifications
- `validators` - Validator status updates

**Response:**
```json
{
  "type": "subscribed",
  "channel": "blocks",
  "timestamp": 1638360000000
}
```

#### Unsubscribe from Channel

```json
{
  "type": "unsubscribe",
  "channel": "blocks"
}
```

**Response:**
```json
{
  "type": "unsubscribed",
  "channel": "blocks",
  "timestamp": 1638360000000
}
```

### Server to Client

#### Connection Established

```json
{
  "type": "connected",
  "message": "Connected to Trident Network WebSocket",
  "timestamp": 1638360000000
}
```

#### New Block

```json
{
  "type": "new_block",
  "data": {
    "number": 12345,
    "hash": "0xabc123...",
    "validator": "T1abc123...",
    "timestamp": "2024-12-04T12:00:00Z",
    "transactions": [...]
  },
  "timestamp": 1638360000000
}
```

#### New Transaction

```json
{
  "type": "new_transaction",
  "data": {
    "txId": "0xdef456...",
    "from": "T1sender...",
    "to": "T1receiver...",
    "amount": "100",
    "timestamp": "2024-12-04T12:00:00Z"
  },
  "timestamp": 1638360000000
}
```

#### Validator Update

```json
{
  "type": "validator_update",
  "data": {
    "address": "T1validator...",
    "power": 1000,
    "status": "active"
  },
  "timestamp": 1638360000000
}
```

## Features

### Automatic Reconnection

Implement automatic reconnection in your client:

```javascript
let ws;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function connect() {
  ws = new WebSocket('ws://localhost:4000/ws');
  
  ws.onopen = () => {
    console.log('Connected');
    reconnectAttempts = 0;
    
    // Resubscribe to channels
    ws.send(JSON.stringify({ type: 'subscribe', channel: 'blocks' }));
  };
  
  ws.onclose = () => {
    console.log('Disconnected');
    
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(connect, delay);
    }
  };
}

connect();
```

### Heartbeat/Ping-Pong

The server automatically sends ping frames every 30 seconds to detect dead connections. Modern browsers handle this automatically.

### Multiple Subscriptions

You can subscribe to multiple channels:

```javascript
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'subscribe', channel: 'blocks' }));
  ws.send(JSON.stringify({ type: 'subscribe', channel: 'transactions' }));
  ws.send(JSON.stringify({ type: 'subscribe', channel: 'validators' }));
};
```

## React Hook Example

```javascript
import { useEffect, useState } from 'react';

function useWebSocket(url, channels = []) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setConnected(true);
      channels.forEach(channel => {
        ws.send(JSON.stringify({ type: 'subscribe', channel }));
      });
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setData(message);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [url, channels]);

  return { data, connected };
}

// Usage
function MyComponent() {
  const { data, connected } = useWebSocket('ws://localhost:4000/ws', ['blocks']);
  
  if (!connected) return <div>Connecting...</div>;
  
  return (
    <div>
      {data?.type === 'new_block' && (
        <div>New block: {data.data.number}</div>
      )}
    </div>
  );
}
```

## Broadcasting from Backend

To broadcast updates from your backend code:

```javascript
// Assuming wsManager is available via app.locals.wsManager

// Broadcast new block
app.locals.wsManager.broadcastNewBlock({
  number: 12345,
  hash: '0xabc...',
  validator: 'T1abc...',
  timestamp: new Date().toISOString(),
  transactions: []
});

// Broadcast new transaction
app.locals.wsManager.broadcastNewTransaction({
  txId: '0xdef...',
  from: 'T1sender...',
  to: 'T1receiver...',
  amount: '100',
  timestamp: new Date().toISOString()
});

// Broadcast validator update
app.locals.wsManager.broadcastValidatorUpdate({
  address: 'T1validator...',
  power: 1000,
  status: 'active'
});
```

## Security Considerations

1. **Rate Limiting**: The WebSocket server doesn't currently implement rate limiting. Consider adding it for production.

2. **Authentication**: No authentication is required. For production, implement token-based auth:
   ```javascript
   ws.onopen = () => {
     ws.send(JSON.stringify({
       type: 'authenticate',
       token: 'your-jwt-token'
     }));
   };
   ```

3. **Input Validation**: All client messages are validated. Invalid JSON is rejected.

4. **Connection Limits**: Consider implementing per-IP connection limits for production.

## Troubleshooting

### Connection Refused
- Check that the backend is running on the correct port
- Verify firewall settings
- Check that WebSocket path is `/ws`

### Messages Not Received
- Verify you've subscribed to the correct channel
- Check browser console for errors
- Ensure WebSocket connection is open (`readyState === 1`)

### Frequent Disconnections
- Check network stability
- Implement reconnection logic
- Monitor server logs for errors

## Performance

- The server uses ping/pong heartbeats every 30 seconds
- Dead connections are automatically terminated
- Broadcasts are only sent to subscribed clients
- No message queuing - messages sent to connected clients only

## Monitoring

Get WebSocket statistics from the admin API:

```bash
curl http://localhost:4000/api/v1/admin/metrics
```

Response includes:
```json
{
  "websocket": {
    "totalClients": 5,
    "subscriptions": {
      "blocks": 3,
      "transactions": 2,
      "validators": 1
    }
  }
}
```
