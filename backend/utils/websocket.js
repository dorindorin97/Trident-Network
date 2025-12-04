const WebSocket = require('ws');
const logger = require('./logger');

/**
 * WebSocket manager for real-time updates
 */
class WebSocketManager {
  constructor(server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });
    this.clients = new Set();
    
    this.wss.on('connection', (ws, req) => {
      const clientId = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
      logger.info('WebSocket client connected', { clientId });
      
      this.clients.add(ws);
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Trident Network WebSocket',
        timestamp: Date.now()
      }));
      
      // Handle client messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (err) {
          logger.warn('Invalid WebSocket message', { error: err.message });
        }
      });
      
      // Handle disconnect
      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info('WebSocket client disconnected', { clientId });
      });
      
      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket error', { clientId, error: error.message });
      });
      
      // Ping/pong for keep-alive
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });
    });
    
    // Setup heartbeat to detect dead connections
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
    
    logger.info('WebSocket server initialized');
  }
  
  handleClientMessage(ws, data) {
    // Handle subscription requests
    if (data.type === 'subscribe') {
      ws.subscriptions = ws.subscriptions || new Set();
      
      if (data.channel) {
        ws.subscriptions.add(data.channel);
        ws.send(JSON.stringify({
          type: 'subscribed',
          channel: data.channel,
          timestamp: Date.now()
        }));
        logger.info('Client subscribed', { channel: data.channel });
      }
    } else if (data.type === 'unsubscribe') {
      if (ws.subscriptions && data.channel) {
        ws.subscriptions.delete(data.channel);
        ws.send(JSON.stringify({
          type: 'unsubscribed',
          channel: data.channel,
          timestamp: Date.now()
        }));
      }
    }
  }
  
  /**
   * Broadcast new block to all subscribed clients
   */
  broadcastNewBlock(blockData) {
    const message = JSON.stringify({
      type: 'new_block',
      data: blockData,
      timestamp: Date.now()
    });
    
    this.broadcast(message, 'blocks');
  }
  
  /**
   * Broadcast new transaction to all subscribed clients
   */
  broadcastNewTransaction(txData) {
    const message = JSON.stringify({
      type: 'new_transaction',
      data: txData,
      timestamp: Date.now()
    });
    
    this.broadcast(message, 'transactions');
  }
  
  /**
   * Broadcast validator status update
   */
  broadcastValidatorUpdate(validatorData) {
    const message = JSON.stringify({
      type: 'validator_update',
      data: validatorData,
      timestamp: Date.now()
    });
    
    this.broadcast(message, 'validators');
  }
  
  /**
   * Broadcast message to all clients or specific channel
   */
  broadcast(message, channel = null) {
    let sentCount = 0;
    
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // If channel specified, only send to subscribed clients
        if (channel) {
          if (client.subscriptions && client.subscriptions.has(channel)) {
            client.send(message);
            sentCount++;
          }
        } else {
          client.send(message);
          sentCount++;
        }
      }
    });
    
    if (sentCount > 0) {
      logger.debug('WebSocket broadcast', { channel, recipients: sentCount });
    }
  }
  
  /**
   * Get current connection stats
   */
  getStats() {
    const totalClients = this.wss.clients.size;
    const subscriptions = {};
    
    this.wss.clients.forEach((client) => {
      if (client.subscriptions) {
        client.subscriptions.forEach((channel) => {
          subscriptions[channel] = (subscriptions[channel] || 0) + 1;
        });
      }
    });
    
    return {
      totalClients,
      subscriptions
    };
  }
  
  /**
   * Close the WebSocket server
   */
  close() {
    clearInterval(this.heartbeatInterval);
    this.wss.close(() => {
      logger.info('WebSocket server closed');
    });
  }
}

module.exports = WebSocketManager;
