const express = require('express');
const app = express();

// ==========================
// Middleware
// ==========================
app.use(express.json());

// ==========================
// Routes
// ==========================
const healthRoutes = require('./routes/health.routes');
const blockchainRoutes = require('./routes/blockchain.routes');
const identityRoutes = require('./routes/identity.routes');
const assetRoutes = require('./routes/asset.routes');


app.use('/api', healthRoutes);
app.use('/api', blockchainRoutes);
app.use('/api', identityRoutes);
app.use('/api', assetRoutes);


// ==========================
// Start Server
// ==========================
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT}`);
});
