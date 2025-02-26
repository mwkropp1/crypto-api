# Cryptocurrency Portfolio API

A RESTful API for managing cryptocurrency portfolios.

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/mwkropp1/crypto-api.git

# Install dependencies
cd crypto-api
npm install
```

### Environment Setup

Import provided .env file to replace placeholder values

### Environment Variables

```plaintext
DB_PORT=3306
DB_HOST=host
DB_USER=user
DB_PASSWORD=password
DB_NAME=crypto
JWT_SECRET=your_jwt_secret
COINCAP_API_URL=https://api.coincap.io/v2
PORT=3000
```

## API Documentation

### Authentication Endpoints

| Method | Endpoint              | Description       |
| ------ | --------------------- | ----------------- |
| POST   | /api/v1/auth/register | Register new user |
| POST   | /api/v1/auth/login    | Login user        |

#### Register User

```json
POST /api/v1/auth/register
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login User

```json
POST /api/v1/auth/login
{
  "email": "string",
  "password": "string"
}
```

A script in the provided Postman collection will attach that token from the login response to the collection and will use it for any protected routes (/wallet/\*)

### Asset Endpoints

| Method | Endpoint                   | Description                 |
| ------ | -------------------------- | --------------------------- |
| GET    | /api/v1/assets             | List all assets             |
| GET    | /api/v1/assets/:id         | Get asset details           |
| GET    | /api/v1/assets/:id/convert | Convert asset amount to USD |

#### Query Parameters for Assets (/api/v1/assets) Endpoint

```plaintext
limit: number (default: 20)
offset: number (default: 0)
sort: string (rank, name, priceUsd, any other field in the CoinCap response)
order: string (asc, desc)
minPrice: number (to filter)
maxPrice: number
id: string (bitcoin,ethereum) can be multiple comma separated
symbol: string (BTC)
```

### Wallet Endpoints

| Method | Endpoint                                    | Description        |
| ------ | ------------------------------------------- | ------------------ |
| POST   | /api/v1/wallets                             | Create wallet      |
| GET    | /api/v1/wallets                             | List user wallets  |
| GET    | /api/v1/wallets/:walletId                   | Get wallet details |
| POST   | /api/v1/wallets/:walletId/holdings          | Add holding        |
| PUT    | /api/v1/wallets/:walletId/holdings/:assetId | Update holding     |
| DELETE | /api/v1/wallets/:walletId/holdings/:assetId | Delete holding     |
| GET    | /api/v1/wallets/:walletId/holdings          | List holdings      |
| GET    | /api/v1/wallets/:walletId/value             | Get wallet value   |
| GET    | /api/v1/wallets/:walletId/gains-losses      | Get gains/losses   |

#### Create Wallet

```json
POST /api/v1/wallets
{
  "name": "string"
}
```

#### Add Holding

```json
POST /api/v1/wallets/:walletId/holdings
{
  "assetId": "string",
  "amount": "number"
}
```

#### Update Holding

```json
PUT /api/v1/wallets/:walletId/holdings/:assetId
{
  "amount": "number"
}
```

## Development

```bash
# Start development server with hot reload
npm run start:dev

# Start server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

crypto-api.postman_collection.json has been provided to interact with the api
