const express = require('express');
const router = express.Router();

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// --------------------------
// Org configuration (data-driven)
// --------------------------
const ORG_CONFIG = {
  org1: {
    mspId: 'Org1MSP',
    walletPath: path.resolve(__dirname, '../wallet/org1'),
    ccpPath: path.resolve(__dirname, '../connection/connection-org1.json'),
  },
  org2: {
    mspId: 'Org2MSP',
    walletPath: path.resolve(__dirname, '../wallet/org2'),
    ccpPath: path.resolve(__dirname, '../connection/connection-org2.json'),
  },
};

// ==========================
// GET /api/identity
// ==========================
router.get('/identity', async (req, res) => {
  const orgName = (req.header('X-Org-Name') || 'org1').toLowerCase();
  const cfg = ORG_CONFIG[orgName];

  if (!cfg) {
    return res.status(400).json({ status: 'error', message: 'Unknown org' });
  }

  let gateway;
  try {
    // Load connection profile
    const ccp = JSON.parse(fs.readFileSync(cfg.ccpPath, 'utf8'));

    // Load wallet
    const wallet = await Wallets.newFileSystemWallet(cfg.walletPath);

    // Ensure identity exists
    const identity = await wallet.get('appUser');
    if (!identity) {
      return res.status(404).json({
        status: 'error',
        message: 'Identity appUser not found in wallet',
      });
    }

    // Connect gateway (no transaction)
    gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get network just to validate channel access
    await gateway.getNetwork('mychannel');

    // Respond identity details
    res.json({
      status: 'ok',
      identity: 'appUser',
      mspId: identity.mspId || cfg.mspId,
      organization: orgName,
      type: identity.type,
      channel: 'mychannel',
    });

  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  } finally {
    if (gateway) gateway.disconnect();
  }
});

module.exports = router;
