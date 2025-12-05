const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { ERROR_CODES } = require('../utils/error-codes');
const { createErrorHandlingWrapper } = require('../utils/error-classifier');
const { setCacheHeaders } = require('../constants/cache-headers');

module.exports = fetchRpc => {
  router.get('/v1/validators', createErrorHandlingWrapper(
    async (req, res) => {
      const data = await fetchRpc('/validators');
      setCacheHeaders(res, 'ACTIVE_DATA');
      return res.json(data);
    },
    {
      endpoint: '/v1/validators',
      defaultNotFoundCode: 'SERVICE_UNAVAILABLE'
    }
  ));

  return router;
};
