const fs = require('fs');
const path = require('path');
const { Wallets } = require('fabric-network');

async function main() {
  // ===============================
  // 1. Import identity Org2
  // ===============================
  const mspPath = path.resolve(
    __dirname,
    '../fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/users/User1@org2.example.com/msp'
  );

  const certPath = path.join(mspPath, 'signcerts');
  const keyPath = path.join(mspPath, 'keystore');

  const certFile = fs.readdirSync(certPath)[0];
  const keyFile = fs.readdirSync(keyPath)[0];

  const certificate = fs.readFileSync(path.join(certPath, certFile)).toString();
  const privateKey = fs.readFileSync(path.join(keyPath, keyFile)).toString();

  const walletPath = path.join(__dirname, 'wallet/org2');
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  await wallet.put('appUser', {
    credentials: { certificate, privateKey },
    mspId: 'Org2MSP',
    type: 'X.509',
  });

  console.log('✅ Org2 identity imported');

  // ===============================
  // 2. Export connection-org2.json
  // ===============================
  const srcConnection = path.resolve(
    __dirname,
    '../fabric-samples/test-network/organizations/peerOrganizations/org2.example.com/connection-org2.json'
  );

  const dstDir = path.join(__dirname, 'connection');
  const dstConnection = path.join(dstDir, 'connection-org2.json');

  if (!fs.existsSync(dstDir)) {
    fs.mkdirSync(dstDir);
  }

  fs.copyFileSync(srcConnection, dstConnection);

  console.log('✅ connection-org2.json copied to /connection');
}

main();
