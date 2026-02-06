const express = require('express');
const router = express.Router();

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// --------------------------
// Org configuration
// --------------------------
const ORG_CONFIG = {
  org1: {
    walletPath: path.resolve(__dirname, '../wallet/org1'),
    ccpPath: path.resolve(__dirname, '../connection/connection-org1.json'),
  },
  org2: {
    walletPath: path.resolve(__dirname, '../wallet/org2'),
    ccpPath: path.resolve(__dirname, '../connection/connection-org2.json'),
  },
};

// ==========================
// POST /api/assets
// ==========================
router.post('/assets', async (req, res) => {
  const orgName = (req.header('X-Org-Name') || 'org1').toLowerCase();
  const cfg = ORG_CONFIG[orgName];

  if (!cfg) {
    return res.status(400).json({ status: 'error', message: 'Unknown org' });
  }

  const { id, color, size, owner, appraisedValue } = req.body;

  // ---- Basic validation ----
  if (!id || !color || size === undefined || !owner || appraisedValue === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required asset fields',
    });
  }

  let gateway;
  try {
    // Load connection profile
    const ccp = JSON.parse(fs.readFileSync(cfg.ccpPath, 'utf8'));

    // Load wallet
    const wallet = await Wallets.newFileSystemWallet(cfg.walletPath);

    // Check identity
    const identity = await wallet.get('appUser');
    if (!identity) {
      return res.status(404).json({
        status: 'error',
        message: 'Identity appUser not found in wallet',
      });
    }

    // Connect gateway
    gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get network & contract
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('basic');

    // ---- Submit transaction ----
    await contract.submitTransaction(
      'CreateAsset',
      id,
      color,
      size.toString(),
      owner,
      appraisedValue.toString()
    );

    // ---- Success ----
    res.status(201).json({
      status: 'success',
      message: 'Asset created',
      assetId: id,
      submittedByOrg: orgName,
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

// ==========================
// GET /api/assets/:id
// ==========================
router.get('/assets/:id', async (req, res) => {
  const orgName = (req.header('X-Org-Name') || 'org1').toLowerCase();
  const cfg = ORG_CONFIG[orgName];

  if (!cfg) {
    return res.status(400).json({ status: 'error', message: 'Unknown org' });
  }

  const assetId = req.params.id;
  let gateway;

  try {
    // Load connection profile
    const ccp = JSON.parse(fs.readFileSync(cfg.ccpPath, 'utf8'));

    // Load wallet
    const wallet = await Wallets.newFileSystemWallet(cfg.walletPath);

    // Check identity
    const identity = await wallet.get('appUser');
    if (!identity) {
      return res.status(404).json({
        status: 'error',
        message: 'Identity appUser not found in wallet',
      });
    }

    // Connect gateway
    gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get network & contract
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('basic');

    // ---- Evaluate transaction (READ ONLY) ----
    const result = await contract.evaluateTransaction('ReadAsset', assetId);
    const asset = JSON.parse(result.toString());

    // ---- Success ----
    res.json({
      status: 'success',
      asset,
      queriedByOrg: orgName,
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

// ==========================
// POST /api/assets/transfer
// ==========================
router.post('/assets/transfer', async (req, res) => {
  const orgName = (req.header('X-Org-Name') || 'org1').toLowerCase();
  const cfg = ORG_CONFIG[orgName];

  if (!cfg) {
    return res.status(400).json({ status: 'error', message: 'Unknown org' });
  }

  const { id, newOwner } = req.body;

  // ---- Basic validation ----
  if (!id || !newOwner) {
    return res.status(400).json({
      status: 'error',
      message: 'id and newOwner are required',
    });
  }

  let gateway;
  try {
    // Load connection profile
    const ccp = JSON.parse(fs.readFileSync(cfg.ccpPath, 'utf8'));

    // Load wallet
    const wallet = await Wallets.newFileSystemWallet(cfg.walletPath);

    // Check identity
    const identity = await wallet.get('appUser');
    if (!identity) {
      return res.status(404).json({
        status: 'error',
        message: 'Identity appUser not found in wallet',
      });
    }

    // Connect gateway
    gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get network & contract
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('basic');

    // ---- Submit transaction (WRITE) ----
    await contract.submitTransaction('TransferAsset', id, newOwner);

    // ---- Success ----
    res.json({
      status: 'success',
      message: 'Asset transferred',
      assetId: id,
      newOwner,
      submittedByOrg: orgName,
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

// ==========================
// GET /api/assets (GetAllAssets)
// ==========================
router.get('/assets', async (req, res) => {
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

    // Check identity
    const identity = await wallet.get('appUser');
    if (!identity) {
      return res.status(404).json({
        status: 'error',
        message: 'Identity appUser not found in wallet',
      });
    }

    // Connect gateway
    gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get network & contract
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('basic');

    // ---- Evaluate transaction (READ ONLY) ----
    const result = await contract.evaluateTransaction('GetAllAssets');
    const assets = JSON.parse(result.toString());

    // ---- Success ----
    res.json({
      status: 'success',
      count: assets.length,
      assets,
      queriedByOrg: orgName,
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


// ==========================
// GET /api/assets/:id/history
// ==========================
router.get('/assets/:id/history', async (req, res) => {
  const orgName = (req.header('X-Org-Name') || 'org1').toLowerCase();
  const cfg = ORG_CONFIG[orgName];

  if (!cfg) {
    return res.status(400).json({
      status: 'error',
      message: 'Unknown org'
    });
  }

  const assetId = req.params.id;
  let gateway;

  try {
    // Load connection profile
    const ccp = JSON.parse(fs.readFileSync(cfg.ccpPath, 'utf8'));

    // Load wallet
    const wallet = await Wallets.newFileSystemWallet(cfg.walletPath);

    // Check identity
    const identity = await wallet.get('appUser');
    if (!identity) {
      return res.status(404).json({
        status: 'error',
        message: 'Identity appUser not found in wallet'
      });
    }

    // Connect gateway
    gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true }
    });

    // Get network & contract
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('basic');

    // 🔍 Call chaincode history function
    const result = await contract.evaluateTransaction(
      'GetAssetHistory',
      assetId
    );

    const history = JSON.parse(result.toString());

    res.json({
      status: 'success',
      assetId,
      history,
      queriedByOrg: orgName
    });

  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  } finally {
    if (gateway) gateway.disconnect();
  }
});



// ==========================
// PUT /api/assets/:id (UpdateAsset)
// ==========================
router.put('/assets/:id', async (req, res) => {
  const orgName = (req.header('X-Org-Name') || 'org1').toLowerCase();
  const cfg = ORG_CONFIG[orgName];

  if (!cfg) {
    return res.status(400).json({ status: 'error', message: 'Unknown org' });
  }

  const assetId = req.params.id;
  const { color, size, owner, appraisedValue } = req.body;

  // ---- Basic validation ----
  if (
    color === undefined ||
    size === undefined ||
    owner === undefined ||
    appraisedValue === undefined
  ) {
    return res.status(400).json({
      status: 'error',
      message: 'color, size, owner, appraisedValue are required',
    });
  }

  let gateway;
  try {
    const ccp = JSON.parse(fs.readFileSync(cfg.ccpPath, 'utf8'));
    const wallet = await Wallets.newFileSystemWallet(cfg.walletPath);

    const identity = await wallet.get('appUser');
    if (!identity) {
      return res.status(404).json({
        status: 'error',
        message: 'Identity appUser not found in wallet',
      });
    }

    gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('basic');

    // ---- Submit UpdateAsset ----
    await contract.submitTransaction(
      'UpdateAsset',
      assetId,
      color,
      size.toString(),
      owner,
      appraisedValue.toString()
    );

    res.json({
      status: 'success',
      message: 'Asset updated',
      assetId,
      updatedByOrg: orgName,
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


// ==========================
// DELETE /api/assets/:id (DeleteAsset)
// ==========================
router.delete('/assets/:id', async (req, res) => {
  const orgName = (req.header('X-Org-Name') || 'org1').toLowerCase();
  const cfg = ORG_CONFIG[orgName];

  if (!cfg) {
    return res.status(400).json({ status: 'error', message: 'Unknown org' });
  }

  const assetId = req.params.id;
  let gateway;

  try {
    const ccp = JSON.parse(fs.readFileSync(cfg.ccpPath, 'utf8'));
    const wallet = await Wallets.newFileSystemWallet(cfg.walletPath);

    const identity = await wallet.get('appUser');
    if (!identity) {
      return res.status(404).json({
        status: 'error',
        message: 'Identity appUser not found in wallet',
      });
    }

    gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('basic');

    // ---- Submit DeleteAsset ----
    await contract.submitTransaction('DeleteAsset', assetId);

    res.json({
      status: 'success',
      message: 'Asset deleted',
      assetId,
      deletedByOrg: orgName,
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
