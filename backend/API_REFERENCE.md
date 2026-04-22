# Wealth Checker API Reference — Phase 1

Base URL: `http://localhost:3000`

## Authentication Endpoints

### POST /api/auth/signup
Register new user

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid123",
      "email": "user@example.com",
      "createdAt": "2024-04-22T10:00:00Z"
    },
    "message": "Signup berhasil! Silakan login."
  }
}
```

---

### POST /api/auth/[...nextauth] (NextAuth)
Login, logout, callback handling (handled by NextAuth.js)

Credentials Provider:
- Email
- Password

---

### GET /api/auth/session
Get current user session

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid123",
      "email": "user@example.com"
    }
  }
}
```

---

## Account Endpoints

### GET /api/accounts
List all user accounts

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "acc123",
        "name": "Rekening Utama",
        "type": "DEBIT",
        "balance": "5000000",
        "currency": "IDR",
        "createdAt": "2024-04-22T10:00:00Z",
        "updatedAt": "2024-04-22T10:00:00Z"
      }
    ],
    "count": 1
  }
}
```

---

### POST /api/accounts
Create new account

**Body:**
```json
{
  "name": "Tabungan",
  "type": "SAVINGS"
}
```

**Types:** `DEBIT`, `KREDIT`, `SAVINGS`, `INVESTMENT`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "account": {
      "id": "acc456",
      "name": "Tabungan",
      "type": "SAVINGS",
      "balance": "0",
      "currency": "IDR",
      "createdAt": "2024-04-22T11:00:00Z",
      "updatedAt": "2024-04-22T11:00:00Z"
    },
    "message": "Akun berhasil dibuat"
  }
}
```

---

### GET /api/accounts/:id
Get account detail

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "account": { ... }
  }
}
```

---

### PUT /api/accounts/:id
Update account

**Body:**
```json
{
  "name": "Tabungan Baru",
  "type": "INVESTMENT"
}
```

---

### DELETE /api/accounts/:id
Delete account (only if no transactions)

---

## Transaction Endpoints

### GET /api/transactions
List transactions with filters

**Query Parameters:**
- `accountId` (optional)
- `type` (optional): `INCOME`, `EXPENSE`, `ASSET`, `DEBT`
- `startDate` (optional): ISO datetime
- `endDate` (optional): ISO datetime
- `page` (optional): Default 1
- `limit` (optional): Default 50

**Example:**
```
GET /api/transactions?accountId=acc123&type=INCOME&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "tx123",
        "accountId": "acc123",
        "type": "INCOME",
        "category": "Gaji",
        "amount": "5000000",
        "description": "Gaji bulan April",
        "date": "2024-04-22T10:00:00Z",
        "createdAt": "2024-04-22T10:00:00Z",
        "updatedAt": "2024-04-22T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

### POST /api/transactions
Create transaction

**Body:**
```json
{
  "accountId": "acc123",
  "type": "INCOME",
  "category": "Gaji",
  "amount": "5000000",
  "description": "Gaji bulan April",
  "date": "2024-04-22T10:00:00Z"
}
```

**Types:** `INCOME`, `EXPENSE`, `ASSET`, `DEBT`

**Note:** Account balance updated automatically based on type:
- `INCOME`, `ASSET`: Balance increases
- `EXPENSE`, `DEBT`: Balance decreases

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "transaction": { ... },
    "message": "Transaksi berhasil dibuat"
  }
}
```

---

### PUT /api/transactions/:id
Update transaction

**Body:** (all optional)
```json
{
  "type": "EXPENSE",
  "category": "Makan & Minum",
  "amount": "100000",
  "description": "Makan siang",
  "date": "2024-04-22T12:00:00Z"
}
```

**Note:** Balance recalculated if amount or type changes

---

### DELETE /api/transactions/:id
Delete transaction

**Note:** Balance reversed automatically

---

## Transfer Endpoints

### POST /api/accounts/:id/transfer
Transfer money between accounts (atomic transaction)

**Body:**
```json
{
  "toAccountId": "acc456",
  "amount": "1000000",
  "description": "Transfer ke tabungan"
}
```

**Validations:**
- Both accounts must belong to user
- Cannot transfer to same account
- Sufficient balance required

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "transfer": {
      "id": "transfer123",
      "fromAccountId": "acc123",
      "toAccountId": "acc456",
      "amount": "1000000",
      "description": "Transfer ke tabungan",
      "date": "2024-04-22T10:00:00Z"
    },
    "message": "Transfer Rp 1000000 berhasil"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "data": null,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "data": null,
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "success": false,
  "data": null,
  "error": "Akun tidak ditemukan"
}
```

### 409 Conflict
```json
{
  "success": false,
  "data": null,
  "error": "Email sudah terdaftar"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "data": null,
  "error": "Gagal membuat akun"
}
```

---

## Testing with cURL

### 1. Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### 2. Create Account
```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Rekening Utama",
    "type": "DEBIT"
  }'
```

### 3. Create Transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "accountId": "YOUR_ACCOUNT_ID",
    "type": "INCOME",
    "category": "Gaji",
    "amount": "5000000",
    "date": "2024-04-22T10:00:00Z"
  }'
```

---

## Database Schema

See `prisma/schema.prisma` for full schema details.

**Core Tables:**
- `users` — User accounts
- `accounts` — Bank accounts (DEBIT/KREDIT/SAVINGS/INVESTMENT)
- `transactions` — Income/Expense/Asset/Debt records
- `transfers` — Inter-account transfers

---

## Notes

- All amounts are stored as `Decimal` (string in API) for precision
- Timestamps are ISO 8601 format
- Balance updates are atomic (use Prisma `$transaction`)
- All protected routes require valid session
- Session is JWT-based via NextAuth.js
