const WebSocket = require('ws');
const logger = require('./logger');

/**
 * WebSocket manager for real-time updates with rate limiting
 *
 * Features:
 * - Per-client message rate limiting (max messages per second)
 * - Per-client subscription limits
 * - Automatic disconnection of abusive clients
 * - Connection and subscription statistics
 */
class WebSocketManager {
  constructor(server, options = {}) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });
    this.clients = new Set();

    // Rate limiting configuration
    this.maxMessagesPerSecond = options.maxMessagesPerSecond || 10;
    this.maxSubscriptionsPerClient = options.maxSubscriptionsPerClient || 10;
    this.rateLimitWindow = 1000; // 1 second in milliseconds

    // Track client rate limits
    this.clientRateLimits = new Map();
    
    this.wss.on('connection', (ws, req) => {
      const clientId = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
      logger.info('WebSocket client connected', { clientId });

      this.clients.add(ws);

      // Initialize rate limiting for this client
      ws.clientId = clientId;
      ws.subscriptions = new Set();
      this.clientRateLimits.set(clientId, {
        messageCount: 0,
        windowStart: Date.now()
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Trident Network WebSocket',
        timestamp: Date.now()
      }));

      // Handle client messages with rate limiting
      ws.on('message', (message) => {
        try {
          // Check rate limit before processing
          if (!this.checkRateLimit(clientId)) {
            logger.warn('WebSocket rate limit exceeded', { clientId });
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Rate limit exceeded. Maximum ' + this.maxMessagesPerSecond + ' messages per second',
              timestamp: Date.now()
            }));

            // Disconnect abusive client after repeated violations
            if (this.clientRateLimits.get(clientId).violations >= 5) {
              logger.warn('Disconnecting abusive WebSocket client', { clientId });
              ws.close(1008, 'Policy Violation: Rate limit exceeded');
            }
            return;
          }

          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (err) {
          logger.warn('Invalid WebSocket message', { error: err.message });
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        this.clients.delete(ws);
        this.clientRateLimits.delete(clientId);
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
  
  /**
   * Check if client has exceeded rate limit
   * @returns {boolean} True if within limits, false if exceeded
   */
  checkRateLimit(clientId) {
    const limit = this.clientRateLimits.get(clientId);
    if (!limit) return true;

    const now = Date.now();
    const timeSinceWindowStart = now - limit.windowStart;

    if (timeSinceWindowStart >= this.rateLimitWindow) {
      // Reset window
      limit.messageCount = 0;
      limit.windowStart = now;
      limit.violations = 0;
    }

    limit.messageCount++;

    if (limit.messageCount > this.maxMessagesPerSecond) {
      limit.violations = (limit.violations || 0) + 1;
      return false;
    }

    return true;
  }

  handleClientMessage(ws, data) {
    // Handle subscription requests with subscription limit
    if (data.type === 'subscribe') {
      if (data.channel) {
        if (ws.subscriptions.size >= this.maxSubscriptionsPerClient) {
          ws.send(JSON.stringify({
            type: 'error',
            message: `Maximum ${this.maxSubscriptionsPerClient} subscriptions per client`,
            timestamp: Date.now()
          }));
          logger.warn('Subscription limit exceeded', {
            clientId: ws.clientId,
            currentSubscriptions: ws.subscriptions.size
          });
          return;
        }

        ws.subscriptions.add(data.channel);
        ws.send(JSON.stringify({
          type: 'subscribed',
          channel: data.channel,
          timestamp: Date.now()
        }));
        logger.info('Client subscribed', { channel: data.channel, clientId: ws.clientId });
      }
    } else if (data.type === 'unsubscribe') {
      if (data.channel) {
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
   * Get current connection stats including rate limiting
   */
  getStats() {
    const totalClients = this.wss.clients.size;
    const subscriptions = {};
    let violationCount = 0;

    this.wss.clients.forEach((client) => {
      if (client.subscriptions) {
        client.subscriptions.forEach((channel) => {
          subscriptions[channel] = (subscriptions[channel] || 0) + 1;
        });
      }
    });

    // Count rate limit violations
    for (const limit of this.clientRateLimits.values()) {
      violationCount += limit.violations || 0;
    }

    return {
      totalClients,
      subscriptions,
      rateLimiting: {
        maxMessagesPerSecond: this.maxMessagesPerSecond,
        maxSubscriptionsPerClient: this.maxSubscriptionsPerClient,
        violations: violationCount
      }
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
