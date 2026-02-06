

# 🚀 Hyperledger Fabric REST API – Chaincode Basic

REST API berbasis **Node.js + Express** untuk berinteraksi dengan **chaincode `basic`** pada **Hyperledger Fabric**.  
Dirancang untuk **pembelajaran, workshop, dan studi kasus supply chain** (read/write ledger, world state, audit trail).

---

## 📌 Ringkasan

| Item | Detail |
|---|---|
| Blockchain | Hyperledger Fabric |
| Chaincode | `basic` |
| Channel | `mychannel` |
| Identity | `appUser` |
| Multi-Org | `org1`, `org2` |
| Akses | REST API (Postman) |

---

## 🟢 Prasyarat Sebelum Eksekusi

### Fabric test-network sudah berjalan

```bash
cd fabric-samples/test-network
./network.sh up createChannel -ca
```

Artinya:

* CA aktif
* Org1 & Org2 terbentuk
* User default `User1@orgX.example.com` tersedia

---

## Pastikan Chaincode `basic` Sudah Dijalankan

Jalankan:

```bash
./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-go -ccl go
```

---

## Pastikan Chaincode Benar-Benar Aktif

Jalankan:

```bash
peer chaincode query \
  -C mychannel \
  -n basic \
  -c '{"function":"GetAllAssets","Args":[]}'
```

---

## Import Identity Org1

```bash
node importOrg1Identity.js
```

## Import Identity Org2

```bash
node importOrg2Identity.js
```

---


## Wallet siap

```
wallet/
├── org1/
│   └── appUser.id
└── org2/
    └── appUser.id
```

---

## Connection profile siap

```
connection/
├── connection-org1.json
└── connection-org2.json
```


---
## 🌐 Base URL

```text
http://localhost:3000/api
````

---

## 🧾 Header Wajib (Multi-Organization)

Semua endpoint blockchain **WAJIB** menyertakan header berikut:

```http
X-Org-Name: org1
```

atau

```http
X-Org-Name: org2
```

---

## 🧭 Daftar Isi

* [Health Check](#-health-check)
* [Blockchain Status](#-blockchain-status)
* [Identity](#-identity)
* [Asset Management](#-asset-management-chaincode-basic)

  * [Create Asset](#1️⃣-create-asset)
  * [Read Asset](#2️⃣-read-asset)
  * [Get All Assets](#3️⃣-get-all-assets)
  * [Update Asset](#4️⃣-update-asset)
  * [Transfer Asset](#5️⃣-transfer-asset)
  * [Delete Asset](#6️⃣-delete-asset)
  * [Asset History](#7️⃣-asset-history-audit-trail)
* [Alur Demo Workshop](#-alur-demo-workshop-disarankan)
* [Referensi Resmi](#-referensi-resmi)
* [Lisensi](#-lisensi)

---

## 🩺 Health Check

### GET `/api/health`

**Tujuan**
Memastikan REST API berjalan (tanpa mengakses blockchain).

**Request**

```http
GET /api/health
```

**Response**

```json
{
  "status": "ok",
  "service": "Fabric REST API",
  "network": "test-network",
  "chaincode": "basic",
  "timestamp": "2026-02-06T03:10:12Z"
}
```

---

## 🔗 Blockchain Status

### GET `/api/blockchain/status`

**Tujuan**
Validasi koneksi ke **network, channel, dan chaincode**.

**Headers**

```http
X-Org-Name: org1
```

**Response**

```json
{
  "status": "connected",
  "org": "Org1MSP",
  "channel": "mychannel",
  "chaincode": "basic"
}
```

---

## 🆔 Identity

### GET `/api/identity`

**Tujuan**
Menampilkan identitas Fabric (`appUser`) yang digunakan API.

**Headers**

```http
X-Org-Name: org1
```

**Response**

```json
{
  "status": "ok",
  "identity": "appUser",
  "mspId": "Org1MSP",
  "organization": "org1",
  "type": "X.509",
  "channel": "mychannel"
}
```

---

## 📦 Asset Management (Chaincode `basic`)

### 1️⃣ Create Asset

**Endpoint**

```http
POST /api/assets
```

**Headers**

```http
Content-Type: application/json
X-Org-Name: org1
```

**Body**

```json
{
  "id": "asset101",
  "color": "blue",
  "size": 10,
  "owner": "HatcheryCorp",
  "appraisedValue": 5000
}
```

---

### 2️⃣ Read Asset

**Endpoint**

```http
GET /api/assets/{id}
```

**Contoh**

```http
GET /api/assets/asset101
X-Org-Name: org2
```

---

### 3️⃣ Get All Assets

**Endpoint**

```http
GET /api/assets
```

---

### 4️⃣ Update Asset

**Endpoint**

```http
PUT /api/assets/{id}
```

**Headers**

```http
Content-Type: application/json
X-Org-Name: org1
```

**Body**

```json
{
  "color": "green",
  "size": 12,
  "owner": "FarmGroup",
  "appraisedValue": 7000
}
```

---

### 5️⃣ Transfer Asset

**Endpoint**

```http
POST /api/assets/transfer
```

**Headers**

```http
Content-Type: application/json
X-Org-Name: org1
```

**Body**

```json
{
  "id": "asset101",
  "newOwner": "DistributorCorp"
}
```

---

### 6️⃣ Delete Asset

**Endpoint**

```http
DELETE /api/assets/{id}
```

**Contoh**

```http
DELETE /api/assets/asset101
X-Org-Name: org2
```

> 📌 **Catatan**
> Asset terhapus dari **world state**, namun **riwayat transaksi tetap ada di ledger**.

---

### 7️⃣ Asset History (Audit Trail)

**Endpoint**

```http
GET /api/assets/{id}/history
```

**Contoh**

```http
GET /api/assets/asset101/history
X-Org-Name: org1
```

**Response**

```json
{
  "status": "success",
  "assetId": "asset101",
  "history": [
    {
      "txId": "abc123",
      "timestamp": "2026-02-06T02:01:00Z",
      "isDelete": false,
      "value": {}
    },
    {
      "txId": "def456",
      "timestamp": "2026-02-06T02:10:00Z",
      "isDelete": true,
      "value": null
    }
  ]
}
```

---

## 🎓 Alur Demo Workshop (Disarankan)

1. Health Check
2. Blockchain Status
3. Identity
4. Create Asset
5. Read Asset
6. Update / Transfer Asset
7. Delete Asset
8. Asset History (Audit Proof)

---

## 📚 Referensi Resmi

* [https://hyperledger-fabric.readthedocs.io/](https://hyperledger-fabric.readthedocs.io/)
* [https://hyperledger-fabric.readthedocs.io/en/latest/developapps/](https://hyperledger-fabric.readthedocs.io/en/latest/developapps/)
* [https://hyperledger-fabric.readthedocs.io/en/latest/ledger/](https://hyperledger-fabric.readthedocs.io/en/latest/ledger/)

---

## 🏷️ Lisensi

**Educational & Workshop Use Only**


