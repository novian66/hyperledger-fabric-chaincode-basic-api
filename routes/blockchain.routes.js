const express = require('express');
const router = express.Router();

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// ==========================
// Blockchain Status Endpoint
// ==========================
router.get('/blockchain/status', async (req, res) => {
  const org = (req.header('X-Org-Name') || 'org1').toLowerCase();

  const config = {
    org1: {
      mspId: 'Org1MSP',
      walletPath: 'wallet/org1',
      ccp: 'connection/connection-org1.json',
    },
    org2: {
      mspId: 'Org2MSP',
      walletPath: 'wallet/org2',
      ccp: 'connection/connection-org2.json',
    },
  };

  if (!config[org]) {
    return res.status(400).json({ error: 'Unknown org' });
  }

  let gateway;
  try {
    const ccp = JSON.parse(fs.readFileSync(config[org].ccp, 'utf8'));
    const wallet = await Wallets.newFileSystemWallet(config[org].walletPath);

    gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork('mychannel');
    network.getContract('basic');

    res.json({
      status: 'connected',
      org: config[org].mspId,
      channel: 'mychannel',
      chaincode: 'basic',
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    if (gateway) gateway.disconnect();
  }
});


module.exports = router;
