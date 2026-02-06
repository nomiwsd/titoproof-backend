# TitoProof Backend

A production-ready Node.js + TypeScript backend for website ownership verification and proof generation. The foundation of the TitoProof verification infrastructure.

## 🚨 Quick Links

- **🇵🇰 Roman Urdu Mein Mukammal Tafseel**: [`PROJECT_DOCUMENTATION_URDU.md`](PROJECT_DOCUMENTATION_URDU.md)
- **⚡ 5-Minute Deployment**: [`QUICK_DEPLOY_GUIDE.md`](QUICK_DEPLOY_GUIDE.md)
- **🔧 Fix "Cannot find module" Error**: [`RENDER_FIX_GUIDE.md`](RENDER_FIX_GUIDE.md)
- **🧪 API Testing Guide**: [`API_TESTING_GUIDE.md`](API_TESTING_GUIDE.md)
- **📚 All Documentation**: [`DOCUMENTATION_INDEX.md`](DOCUMENTATION_INDEX.md)

## Features

- ✅ **Verification Methods**
  - DNS TXT record verification
  - HTML meta tag verification
  - Email domain validation

- ✅ **Proof System**
  - Generate verification tokens (24-hour expiration)
  - Create tamper-proof proof objects
  - SHA-256 hash generation for proof integrity
  - Structured proof storage

- ✅ **Public API**
  - RESTful endpoints for token generation and verification
  - Email domain verification against verified websites
  - Public verification status pages
  - Comprehensive API documentation

- ✅ **Production Ready**
  - TypeScript for type safety
  - Clean, well-documented code
  - Error handling and validation
  - Extensible architecture for future proof engines
  - In-memory database (easily upgradeable to PostgreSQL, MongoDB, etc.)

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the server
npm start
```

### Development

```bash
# Start with auto-reload
npm run dev
```

The server will start at `http://localhost:3000`

## API Documentation

### Root Endpoint
```
GET /
```
Returns API documentation and available endpoints.

### Health Check
```
GET /health
```
Returns server health status.

### Generate Verification Token
```
POST /api/verify/generate-token
```

**Request:**
```json
{
  "domain": "example.com",
  "methods": ["DNS_TXT", "HTML_META"]  // optional, defaults to both
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "titoproof_<uuid>_<timestamp>",
    "domain": "example.com",
    "methods": ["DNS_TXT", "HTML_META"],
    "expiresAt": "2026-02-06T10:30:00.000Z",
    "createdAt": "2026-02-05T10:30:00.000Z",
    "setupInstructions": {
      "DNS_TXT": "To verify ownership of example.com via DNS...",
      "HTML_META": "To verify ownership of example.com via HTML meta tag..."
    }
  }
}
```

### Verify Domain Ownership
```
POST /api/verify/verify-domain
```

**Request:**
```json
{
  "domain": "example.com",
  "method": "DNS_TXT",
  "token": "titoproof_<uuid>_<timestamp>"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "domain": "example.com",
    "method": "DNS_TXT",
    "token": "titoproof_...",
    "verified": true,
    "hash": "sha256_hash",
    "timestamp": "2026-02-05T10:30:00.000Z",
    "metadata": {
      "recordName": "_titoproof.example.com",
      "foundRecords": ["titoproof_..."]
    }
  }
}
```

### Get Verification Status
```
GET /api/verify/status/:domain
```

**Response (Verified):**
```json
{
  "verified": true,
  "data": {
    "id": "uuid",
    "domain": "example.com",
    "method": "DNS_TXT",
    "token": "titoproof_...",
    "verified": true,
    "hash": "sha256_hash",
    "timestamp": "2026-02-05T10:30:00.000Z"
  }
}
```

**Response (Not Verified):**
```json
{
  "verified": false,
  "message": "Domain not verified"
}
```

### Verify Email Domain
```
POST /api/verify/email-domain
```

**Request:**
```json
{
  "email": "user@example.com",
  "domain": "example.com"
}
```

**Response (Match):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "emailDomain": "example.com",
    "verifiedDomain": "example.com",
    "proof": { /* proof object */ }
  }
}
```

### Public Verification Result Page
```
GET /verify/:domain
```

**Response (Verified):**
```json
{
  "verified": true,
  "domain": "example.com",
  "verificationMethod": "DNS TXT Record",
  "verifiedAt": "2026-02-05T10:30:00.000Z",
  "formattedDate": "February 5, 2026, 10:30:00 AM UTC",
  "proofId": "uuid",
  "proofHash": "sha256_hash",
  "details": {
    "method": "DNS_TXT",
    "timestamp": "2026-02-05T10:30:00.000Z",
    "metadata": {}
  }
}
```

## Verification Methods

### DNS TXT Record

**Setup Instructions:**
1. Access your domain's DNS settings (registrar's dashboard)
2. Add a TXT record with:
   - Name: `_titoproof.example.com`
   - Value: `titoproof_<token>`
3. Wait for DNS propagation (5-30 minutes typically)
4. Call the verification endpoint

**Common Registrars:**
- GoDaddy: DNS Management > Add Record > Type: TXT
- Cloudflare: DNS > Add Record > Type: TXT
- Route53: Create Record Set > Type: TXT

### HTML Meta Tag

**Setup Instructions:**
1. Add this line to your website's `<head>` section:
   ```html
   <meta name="titoproof-token" content="titoproof_<token>" />
   ```
2. Ensure the meta tag is accessible at:
   - `https://example.com`
   - or `http://example.com`
3. Call the verification endpoint

**Example:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <meta name="titoproof-token" content="titoproof_12345..." />
</head>
<body>
  <h1>Welcome</h1>
</body>
</html>
```

## Project Structure

```
titoproof-backend/
├── src/
│   ├── engines/              # Verification engines
│   │   ├── dns.ts           # DNS TXT verification
│   │   ├── html.ts          # HTML meta tag verification
│   │   └── email.ts         # Email domain verification
│   ├── routes/              # API routes
│   │   ├── api.ts           # Private API endpoints
│   │   └── public.ts        # Public verification pages
│   ├── app.ts               # Express server configuration
│   ├── index.ts             # Entry point
│   ├── types.ts             # TypeScript type definitions
│   ├── database.ts          # In-memory database
│   ├── utils.ts             # Utility functions
│   └── verificationService.ts  # Core verification logic
├── package.json
├── tsconfig.json
└── README.md
```

## Extending with More Proof Engines

The architecture is designed to be easily extensible. To add a new proof engine:

1. **Create a new engine file** in `src/engines/`:
   ```typescript
   // src/engines/newmethod.ts
   export async function verifyNewMethod(
     domain: string,
     token: string
   ): Promise<{ verified: boolean; [key: string]: any }> {
     // Your verification logic
     return { verified: true };
   }
   ```

2. **Add the method type** to `src/types.ts`:
   ```typescript
   export type VerificationMethod = 'DNS_TXT' | 'HTML_META' | 'NEW_METHOD';
   ```

3. **Add handling** in `src/verificationService.ts`:
   ```typescript
   if (request.method === 'NEW_METHOD') {
     verificationResult = await verifyNewMethod(request.domain, request.token);
   }
   ```

4. **Add API endpoint** in `src/routes/api.ts` if needed for setup instructions.

## Database Migration

The current implementation uses an in-memory database. To migrate to PostgreSQL:

1. Replace `src/database.ts` with PostgreSQL implementation
2. The interface remains the same, so no changes needed to business logic
3. Example:
   ```typescript
   import { Pool } from 'pg';
   
   class Database {
     private pool = new Pool({ /* config */ });
     
     async saveProof(proof: StoredProof): Promise<void> {
       await this.pool.query(
         'INSERT INTO proofs (id, domain, ...) VALUES ($1, $2, ...)',
         [proof.id, proof.domain, ...]
       );
     }
     // ... other methods
   }
   ```

## Configuration

Environment variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Successful operation
- `400` - Bad request (validation error)
- `401` - Verification failed
- `404` - Resource not found
- `500` - Server error

## Development

```bash
# Build
npm run build

# Lint
npm run lint

# Test
npm test
```

## Security Considerations

- ✅ Tokens expire after 24 hours
- ✅ SHA-256 hashing for proof integrity
- ✅ Input validation on all endpoints
- ✅ HTTPS recommended for production
- ⚠️ Add rate limiting for production
- ⚠️ Add authentication for admin endpoints
- ⚠️ Use environment variables for sensitive config
- ⚠️ Implement CORS appropriately

## Next Steps

- [ ] Add PostgreSQL/MongoDB support
- [ ] Implement rate limiting
- [ ] Add admin authentication
- [ ] Add more verification methods
- [ ] Add webhook support for async notifications
- [ ] Add proof expiration mechanism
- [ ] Add audit logging
- [ ] Add monitoring and alerting

## License

MIT
