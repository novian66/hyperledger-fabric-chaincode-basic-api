const express = require('express');
const router = express.Router();

// ==========================
// Health Check Endpoint
// ==========================
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Fabric REST API',
    network: 'test-network',
    chaincode: 'basic',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
