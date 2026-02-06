# TitoProof Backend - Complete Project Documentation

## Project Ka Introduction / Project Overview

**TitoProof** aik website ki ownership verify karne wala system hai. Ye backend API provide karta hai jo domain owners ko verify karne mein madad karta hai.

### Ye Kaise Kaam Karta Hai?
1. Koi bhi user apni website (domain) ko verify karne ke liye token request karta hai
2. System aik unique token generate karta hai jo 24 hours ke liye valid hota hai
3. User us token ko apni website par do tareeqon se add kar sakta hai:
   - **DNS TXT Record**: Domain ke DNS settings mein TXT record add karke
   - **HTML Meta Tag**: Website ke HTML `<head>` section mein meta tag add karke
4. Jab user verification request karta hai, system check karta hai ke token sahi jagah mojood hai ya nahi
5. Agar token mil jata hai to domain verified ho jati hai aur aik **permanent proof** generate hota hai

---

## Istemaal Shuda Technologies / Tech Stack

### 1. **Backend Framework**
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web server framework - HTTP requests handle کرنے کے لیے
- **TypeScript**: Type-safe JavaScript - code quality اور debugging کے لیے

### 2. **Database**
- **MongoDB**: NoSQL database - data storage کے لیے
  - Tokens store کرنے کے لیے (temporary)
  - Proofs store کرنے کے لیے (permanent)
- **Mongoose**: MongoDB کے ساتھ interact کرنے کے لیے ORM
- **In-Memory Database**: Development/testing کے لیے alternative

### 3. **Core Dependencies**
```json
{
  "express": "Web server بنانے کے لیے",
  "mongoose": "MongoDB database operations",
  "typescript": "Code type safety",
  "dotenv": "Environment variables manage کرنے کے لیے",
  "axios": "HTTP requests (HTML verification)",
  "dns": "DNS records check کرنے کے لیے",
  "uuid": "Unique token IDs generate کرنے کے لیے"
}
```

### 4. **Verification Engines**
Teen verification methods supported hain:
1. **DNS TXT Verification**: DNS records check karta hai
2. **HTML Meta Tag Verification**: Website ka HTML fetch karke meta tag check karta hai
3. **Email Domain Verification**: Email domain ko verified website se match karta hai

---

## Project Structure - Folder Ki Tafseel

```
titoproof-backend/
│
├── src/                          # Main source code folder
│   ├── index.ts                  # Entry point - server start ہوتا ہے
│   ├── app.ts                    # Express server configuration
│   ├── database.ts               # Database connection logic
│   ├── verificationService.ts    # Core verification logic
│   ├── types.ts                  # TypeScript type definitions
│   ├── utils.ts                  # Helper functions
│   │
│   ├── config/
│   │   └── database.ts          # MongoDB configuration
│   │
│   ├── models/                  # Database models/schemas
│   │   ├── Token.ts             # Token schema (temporary data)
│   │   └── Proof.ts             # Proof schema (permanent data)
│   │
│   ├── routes/                  # API endpoints
│   │   ├── api.ts               # Main API routes (/api/verify/*)
│   │   └── public.ts            # Public verification pages
│   │
│   └── engines/                 # Verification engines
│       ├── dns.ts               # DNS TXT verification
│       ├── html.ts              # HTML meta tag verification
│       └── email.ts             # Email domain verification
│
├── dist/                        # Compiled JavaScript (production)
├── node_modules/                # Dependencies
├── package.json                 # Project dependencies
├── tsconfig.json                # TypeScript configuration
├── render.yaml                  # Render.com deployment config
├── .env                         # Environment variables (local)
└── README.md                    # Documentation
```

---

## API Endpoints - Kya Kya APIs Hain?

### 1. **Generate Token** - Token Banaye
```http
POST /api/verify/generate-token
```
**Request Body:**
```json
{
  "domain": "example.com",
  "methods": ["DNS_TXT", "HTML_META"]  // optional
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "titoproof_abc123_1234567890",
    "domain": "example.com",
    "methods": ["DNS_TXT", "HTML_META"],
    "expiresAt": "2026-02-07T10:30:00.000Z",
    "setupInstructions": {
      "DNS_TXT": "اپنے DNS میں یہ TXT record add کریں...",
      "HTML_META": "اپنے website کے <head> میں یہ tag add کریں..."
    }
  }
}
```

### 2. **Verify Domain** - Domain Ki Tasdeeq Kare
```http
POST /api/verify/verify-domain
```
**Request Body:**
```json
{
  "domain": "example.com",
  "method": "DNS_TXT",
  "token": "titoproof_abc123_1234567890"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "proof": {
      "domain": "example.com",
      "method": "DNS_TXT",
      "hash": "sha256_hash_here",
      "verifiedAt": "2026-02-06T10:30:00.000Z"
    }
  }
}
```

### 3. **Get Status** - Domain Ki Status Check Kare
```http
GET /api/verify/status/example.com
```

### 4. **Verify Email Domain** - Email Domain Check Kare
```http
POST /api/verify/email-domain
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "domain": "example.com"
}
```

### 5. **Health Check** - Server status
```http
GET /health
```

### 6. **Public Verification Page** - Public Page
```http
GET /verify/example.com
```
HTML page return karta hai jis par verification status dikhaayi deti hai.

---

## Deployment on Render - Render Par Kaise Deploy Kare?

### **Prerequisites - Zaroori Cheeze**
1. ✅ Render.com account (free tier available)
2. ✅ GitHub/GitLab repository (code push kar de)
3. ✅ MongoDB Atlas account (free tier) - database ke liye

---

### **Step 1: MongoDB Atlas Setup**

1. [MongoDB Atlas](https://www.mongodb.com/atlas) par jaye
2. Free cluster create kare
3. Database User banaye (username/password)
4. **Network Access** mein jakar **"Allow Access from Anywhere"** (`0.0.0.0/0`) add kare
5. **Connect** button par click kare aur **Connection String** copy kare:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

### **Step 2: Render.com Par Web Service Banaye**

1. [Render Dashboard](https://dashboard.render.com/) par login kare
2. **"New +"** → **"Web Service"** par click kare
3. Apni GitHub repository connect kare
4. Repository select kare: `titoproof-backend`

---

### **Step 3: Build Settings Configure Kare**

| Setting | Value |
|---------|-------|
| **Name** | `titoproof-backend` (یا کوئی بھی نام) |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node dist/index.js` |

> **Ahem Note**: Build command TypeScript ko JavaScript mein compile karta hai

---

### **Step 4: Environment Variables Add Kare**

**Environment** section mein ye variables add kare:

| Key | Value | Tafseel |
|-----|-------|--------|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Render automatically set karta hai |
| `DATABASE_MODE` | `mongodb` | MongoDB use karne ke liye |
| `MONGODB_URI` | `mongodb+srv://...` | Aap ki MongoDB connection string |
| `DB_NAME` | `titoproof` | Database ka naam |

**Misaal:**
```env
NODE_ENV=production
PORT=10000
DATABASE_MODE=mongodb
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
DB_NAME=titoproof
```

---

### **Step 5: Deploy Kare**

1. **"Create Web Service"** par click kare
2. Render automatically:
   - Dependencies install karega
   - TypeScript compile karega
   - Server start karega
3. Kuch minutes mein aap ki API live ho jayegi!

---

## Common Deployment Issues Aur Unka Hal

### ❌ **Issue 1: "Cannot find module './index.ts'"**

**Wajah**: Render TypeScript file chalane ki koshish kar raha hai compiled JavaScript ki bajaye

**Hal**:
1. **Start Command** یہ ہونی چاہیے: `node dist/index.js`
2. **Build Command** یہ ہونی چاہیے: `npm install && npm run build`
3. `package.json` میں check کریں:
   ```json
   {
     "scripts": {
       "build": "tsc",
       "start": "node dist/index.js"
     }
   }
   ```

---

### ❌ **Issue 2: "Cannot connect to MongoDB"**

**Wajah**: MongoDB connection string ghalat hai ya IP whitelist nahi hai

**Hal**:
1. MongoDB Atlas میں **Network Access** → **Add IP Address** → **0.0.0.0/0** add کریں
2. MONGODB_URI environment variable double-check کریں
3. Username/password میں special characters ہوں تو encode کریں:
   ```
   @ → %40
   : → %3A
   ```

---

### ❌ **Issue 3: "Port already in use"**

**Wajah**: Code mein hardcoded port hai

**Hal**: `src/app.ts` mein ye check kare:
```typescript
const PORT = process.env.PORT || 3000;
```

---

### ❌ **Issue 4: Build Failed**

**Wajah**: Dependencies install nahi hui ya TypeScript compile fail ho gayi

**Hal**:
1. Local par test kare: `npm run build`
2. Check kare ke `typescript` dependency mojood hai
3. `tsconfig.json` sahi hai ya nahi

---

## Local Development - Apne Computer Par Kaise Chalaye?

### Installation
```bash
# Dependencies install kare
npm install

# Development mode (auto-reload)
npm run dev

# Production build
npm run build
npm start
```

### Environment Variables (.env file)
```env
PORT=3000
NODE_ENV=development
DATABASE_MODE=mongodb
MONGODB_URI=mongodb://localhost:27017/titoproof
DB_NAME=titoproof
```

---

## Testing API - Postman/cURL Se Kaise Test Kare?

### 1. Token Generate Kare
```bash
curl -X POST https://your-app.onrender.com/api/verify/generate-token \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

### 2. Domain Verify Kare
```bash
curl -X POST https://your-app.onrender.com/api/verify/verify-domain \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "method": "DNS_TXT",
    "token": "titoproof_abc123_1234567890"
  }'
```

### 3. Status Check Kare
```bash
curl https://your-app.onrender.com/api/verify/status/example.com
```

---

## Database Schema - Data Kaise Store Hota Hai?

### **Token Model** (Temporary - 24 hours)
```typescript
{
  token: "titoproof_uuid_timestamp",
  domain: "example.com",
  methods: ["DNS_TXT", "HTML_META"],
  expiresAt: Date,
  createdAt: Date
}
```

### **Proof Model** (Permanent)
```typescript
{
  domain: "example.com",
  method: "DNS_TXT",
  token: "titoproof_...",
  verifiedAt: Date,
  hash: "sha256_hash",
  metadata: {
    ipAddress: "1.2.3.4",
    userAgent: "..."
  }
}
```

---

## Security Features - Security

1. ✅ **Token Expiration**: Har token 24 hours baad expire ho jata hai
2. ✅ **SHA-256 Hashing**: Proof integrity ke liye
3. ✅ **Domain Validation**: Invalid domains reject ho jate hain
4. ✅ **HTTPS**: Production mein encrypted connections
5. ✅ **Environment Variables**: Sensitive data `.env` mein store hota hai

---

## Monitoring - Kaise Monitor Kare?

### Health Check
```bash
curl https://your-app.onrender.com/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-06T10:30:00.000Z",
  "database": {
    "mode": "mongodb",
    "status": "connected"
  }
}
```

### Render Logs
- Render Dashboard → Your Service → **Logs** tab
- Real-time logs dekh sakte hain

---

## Cost - Kitna Kharcha Aata Hai?

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Render** | ✅ 750 hours/month | $7/month سے شروع |
| **MongoDB Atlas** | ✅ 512 MB storage | $9/month سے شروع |
| **Total** | ✅ **FREE** for small projects | ~$16/month |

---

## Use Cases - Kaha Istemaal Ho Sakta Hai?

1. 🌐 **Website Verification**: Users apni website ki ownership verify kar sakte hain
2. 📧 **Email Verification**: Email domain ko website se link kar sakte hain
3. 🔒 **Domain Authentication**: Third-party services mein domain validation
4. 🎯 **Trust Systems**: Verified domains badge/certification dene ke liye

---

## Roadmap - Aage Kya Features Aa Sakte Hain?

- [ ] File-based verification (upload a text file)
- [ ] Webhook support (verification success/fail notifications)
- [ ] API rate limiting
- [ ] Multi-domain batch verification
- [ ] Analytics dashboard
- [ ] Email notifications

---

## Support & Documentation

- 📖 **README**: [README.md](README.md)
- 🏗️ **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- 🚀 **Quick Start**: [QUICK_START.md](QUICK_START.md)
- 🛠️ **Developer Guide**: [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- 📡 **API Examples**: [API_EXAMPLES.md](API_EXAMPLES.md)

---

## Khulasa / Summary

**TitoProof Backend** aik powerful domain verification system hai jo:
- ✅ TypeScript + Express.js par bana hai
- ✅ MongoDB mein data store karta hai
- ✅ DNS aur HTML dono verification methods support karta hai
- ✅ Render.com par free mein deploy ho sakta hai
- ✅ REST API provide karta hai
- ✅ Production-ready aur secure hai

**Deployment aasan hai**:
1. MongoDB Atlas par database banaye
2. Render par web service create kare
3. Environment variables set kare
4. Deploy button dabaye - Done! ✨

---

**Made with ❤️ for easy domain verification**
