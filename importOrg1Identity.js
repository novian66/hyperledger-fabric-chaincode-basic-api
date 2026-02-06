const fs = require('fs');
const path = require('path');
const { Wallets } = require('fabric-network');

async function main() {
  // ===============================
  // 1. Import identity Org1
  // ===============================
  const mspPath = path.resolve(
    __dirname,
    '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp'
  );

  const certPath = path.join(mspPath, 'signcerts');
  const keyPath = path.join(mspPath, 'keystore');

  const certFile = fs.readdirSync(certPath)[0];
  const keyFile = fs.readdirSync(keyPath)[0];

  const certificate = fs.readFileSync(path.join(certPath, certFile)).toString();
  const privateKey = fs.readFileSync(path.join(keyPath, keyFile)).toString();

  const walletPath = path.join(__dirname, 'wallet/org1');
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  await wallet.put('appUser', {
    credentials: { certificate, privateKey },
    mspId: 'Org1MSP',
    type: 'X.509',
  });

  console.log('✅ Org1 identity imported');

  // ===============================
  // 2. Export connection-org1.json
  // ===============================
  const srcConnection = path.resolve(
    __dirname,
    '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
  );

  const dstDir = path.join(__dirname, 'connection');
  const dstConnection = path.join(dstDir, 'connection-org1.json');

  if (!fs.existsSync(dstDir)) {
    fs.mkdirSync(dstDir);
  }

  fs.copyFileSync(srcConnection, dstConnection);

  console.log('✅ connection-org1.json copied to /connection');
}

main();
