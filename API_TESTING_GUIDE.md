# 🧪 API Testing Guide - Postman & cURL

## Postman Se Kaise Test Kare?

---

## Setup

### Base URL
```
Local: http://localhost:3000
Production: https://titoproof-backend-4yxb.onrender.com
```

---

## 1️⃣ Health Check

### cURL
```bash
curl https://titoproof-backend-4yxb.onrender.com/health
```

### Postman
```
Method: GET
URL: {{baseUrl}}/health
```

### Response
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

---

## 2️⃣ Generate Verification Token

### cURL
```bash
curl -X POST https://titoproof-backend-4yxb.onrender.com/api/verify/generate-token \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "methods": ["DNS_TXT", "HTML_META"]
  }'
```

### Postman
```
Method: POST
URL: {{baseUrl}}/api/verify/generate-token
Headers: Content-Type: application/json
Body (raw JSON):
{
  "domain": "example.com",
  "methods": ["DNS_TXT", "HTML_META"]
}
```

### Response
```json
{
  "success": true,
  "data": {
    "token": "titoproof_abc123_1234567890",
    "domain": "example.com",
    "methods": ["DNS_TXT", "HTML_META"],
    "expiresAt": "2026-02-07T10:30:00.000Z",
    "createdAt": "2026-02-06T10:30:00.000Z",
    "setupInstructions": {
      "DNS_TXT": "To verify ownership of example.com via DNS TXT record:\n\n1. Add a TXT record to your DNS settings:\n   Host: @ (or leave blank)\n   Type: TXT\n   Value: titoproof_abc123_1234567890\n   TTL: 3600\n\n2. Wait up to 48 hours for DNS propagation\n\n3. Send verification request to /api/verify/verify-domain",
      "HTML_META": "To verify ownership of example.com via HTML meta tag:\n\n1. Add this meta tag to your website's <head> section:\n   <meta name=\"titoproof-verification\" content=\"titoproof_abc123_1234567890\" />\n\n2. Make sure it's on https://example.com\n\n3. Send verification request to /api/verify/verify-domain"
    }
  }
}
```

**Important**: Token ko save kar le - verification ke liye zaroori hai!

---

## 3️⃣ Verify Domain (DNS Method)

### Setup First
Apne domain ke DNS settings mein TXT record add kare:
```
Host: @
Type: TXT
Value: titoproof_abc123_1234567890
TTL: 3600
```

### cURL
```bash
curl -X POST https://your-app.onrender.com/api/verify/verify-domain \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "method": "DNS_TXT",
    "token": "titoproof_abc123_1234567890"
  }'
```

### Postman
```
Method: POST
URL: {{baseUrl}}/api/verify/verify-domain
Headers: Content-Type: application/json
Body:
{
  "domain": "example.com",
  "method": "DNS_TXT",
  "token": "titoproof_abc123_1234567890"
}
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "verified": true,
    "method": "DNS_TXT",
    "domain": "example.com",
    "proof": {
      "_id": "65f1234567890abcdef12345",
      "domain": "example.com",
      "method": "DNS_TXT",
      "token": "titoproof_abc123_1234567890",
      "verifiedAt": "2026-02-06T10:30:00.000Z",
      "hash": "a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8",
      "metadata": {
        "verificationDetails": "DNS_TXT"
      }
    }
  },
  "message": "Domain verified successfully!"
}
```

### Response (Failed)
```json
{
  "success": false,
  "error": "Verification failed",
  "details": "TXT record not found or token mismatch"
}
```

---

## 4️⃣ Verify Domain (HTML Method)

### Setup First
Apni website ke `<head>` mein ye tag add kare:
```html
<meta name="titoproof-verification" content="titoproof_abc123_1234567890" />
```

### cURL
```bash
curl -X POST https://your-app.onrender.com/api/verify/verify-domain \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "method": "HTML_META",
    "token": "titoproof_abc123_1234567890"
  }'
```

### Postman
```
Method: POST
URL: {{baseUrl}}/api/verify/verify-domain
Headers: Content-Type: application/json
Body:
{
  "domain": "example.com",
  "method": "HTML_META",
  "token": "titoproof_abc123_1234567890"
}
```

---

## 5️⃣ Get Domain Status

### cURL
```bash
curl https://titoproof-backend-4yxb.onrender.com/api/verify/status/example.com
```

### Postman
```
Method: GET
URL: {{baseUrl}}/api/verify/status/example.com
```

### Response (Verified)
```json
{
  "success": true,
  "data": {
    "domain": "example.com",
    "verified": true,
    "proof": {
      "method": "DNS_TXT",
      "verifiedAt": "2026-02-06T10:30:00.000Z",
      "hash": "a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2..."
    }
  }
}
```

### Response (Not Verified)
```json
{
  "success": true,
  "data": {
    "domain": "example.com",
    "verified": false,
    "proof": null
  }
}
```

---

## 6️⃣ Verify Email Domain

### cURL
```bash
curl -X POST https://titoproof-backend-4yxb.onrender.com/api/verify/email-domain \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "domain": "example.com"
  }'
```

### Postman
```
Method: POST
URL: {{baseUrl}}/api/verify/email-domain
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "user@example.com",
  "domain": "example.com"
}
```

### Response (Match)
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "domain": "example.com",
    "emailDomain": "example.com",
    "match": true,
    "domainVerified": true
  },
  "message": "Email domain matches verified website"
}
```

### Response (Mismatch)
```json
{
  "success": false,
  "error": "Domain mismatch",
  "details": "Email domain (gmail.com) does not match example.com"
}
```

---

## 7️⃣ Public Verification Page

### Browser
```
https://titoproof-backend-4yxb.onrender.com/verify/example.com
```

یہ ایک HTML page return کرتا ہے جس پر domain کی verification status دکھائی دیتی ہے۔

---

## 📦 Postman Collection Import

### Create Collection

1. **Postman** khole
2. **Collections** → **New Collection**
3. Name: `TitoProof API`
4. **Variables** tab:
   - Variable: `baseUrl`
   - Initial Value: `https://titoproof-backend-4yxb.onrender.com`
   - Current Value: `https://titoproof-backend-4yxb.onrender.com`

### Add Requests

#### Request 1: Health Check
```
Name: Health Check
Method: GET
URL: {{baseUrl}}/health
Example: https://titoproof-backend-4yxb.onrender.com/health
```

#### Request 2: Generate Token
```
Name: Generate Token
Method: POST
URL: {{baseUrl}}/api/verify/generate-token
Example: https://titoproof-backend-4yxb.onrender.com/api/verify/generate-token
Headers: Content-Type: application/json
Body:
{
  "domain": "example.com",
  "methods": ["DNS_TXT", "HTML_META"]
}
```

#### Request 3: Verify Domain (DNS)
```
Name: Verify Domain - DNS
Method: POST
URL: {{baseUrl}}/api/verify/verify-domain
Example: https://titoproof-backend-4yxb.onrender.com/api/verify/verify-domain
Headers: Content-Type: application/json
Body:
{
  "domain": "example.com",
  "method": "DNS_TXT",
  "token": "{{token}}"
}
```

#### Request 4: Verify Domain (HTML)
```
Name: Verify Domain - HTML
Method: POST
URL: {{baseUrl}}/api/verify/verify-domain
Example: https://titoproof-backend-4yxb.onrender.com/api/verify/verify-domain
Headers: Content-Type: application/json
Body:
{
  "domain": "example.com",
  "method": "HTML_META",
  "token": "{{token}}"
}
```

#### Request 5: Get Status
```
Name: Get Domain Status
Method: GET
URL: {{baseUrl}}/api/verify/status/example.com
Example: https://titoproof-backend-4yxb.onrender.com/api/verify/status/example.com
```

#### Request 6: Verify Email
```
Name: Verify Email Domain
Method: POST
URL: {{baseUrl}}/api/verify/email-domain
Example: https://titoproof-backend-4yxb.onrender.com/api/verify/email-domain
Headers: Content-Type: application/json
Body:
{
  "email": "user@example.com",
  "domain": "example.com"
}
```

---

## 🔍 Testing Flow

### Complete Verification Flow

```
1. Generate Token
   POST /api/verify/generate-token
   Body: {"domain": "example.com"}
   → Save token from response

2. Setup Verification
   Option A: Add DNS TXT record
   Option B: Add HTML meta tag to website
   → Wait a few minutes

3. Verify Domain
   POST /api/verify/verify-domain
   Body: {"domain": "example.com", "method": "DNS_TXT", "token": "<saved_token>"}
   → Get proof object

4. Check Status (Anytime)
   GET /api/verify/status/example.com
   → See current verification status

5. Verify Email (Optional)
   POST /api/verify/email-domain
   Body: {"email": "user@example.com", "domain": "example.com"}
   → Confirm email matches verified domain
```

---

## 🧪 Test Data

### Valid Domains for Testing
```
- example.com
- test.example.com
- my-website.com
- domain123.org
```

### Invalid Domains (Should Fail)
```
- invalid domain (spaces not allowed)
- http://example.com (no protocol)
- example (no TLD)
```

---

## 📊 Expected Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Request successful |
| 400 | Bad Request | Missing/invalid parameters |
| 404 | Not Found | Domain/token not found |
| 500 | Server Error | Internal error |

---

## 🔧 Debugging

### Enable Verbose Logging

Environment variable:
```env
DEBUG=*
LOG_LEVEL=verbose
```

### Common Errors

#### "Token not found"
- Token expired (24 hours)
- Token incorrect
- **Fix**: Generate new token

#### "DNS verification failed"
- DNS not propagated yet (wait)
- TXT record incorrect
- **Fix**: Check DNS settings

#### "HTML verification failed"
- Meta tag not on homepage
- Website not accessible (HTTPS)
- Tag missing/incorrect
- **Fix**: View website source, check `<head>`

#### "Domain not verified"
- Verification never completed
- **Fix**: Run verify-domain request first

---

## ✅ Quick Test Script (Bash)

```bash
#!/bin/bash

BASE_URL="https://titoproof-backend-4yxb.onrender.com"
DOMAIN="example.com"

# 1. Health Check
echo "1. Testing health..."
curl -s "$BASE_URL/health" | jq

# 2. Generate Token
echo -e "\n2. Generating token..."
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/verify/generate-token" \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"$DOMAIN\"}")
echo $TOKEN_RESPONSE | jq

TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

# 3. Get Status
echo -e "\n3. Checking status..."
curl -s "$BASE_URL/api/verify/status/$DOMAIN" | jq

echo -e "\n✅ Basic tests complete!"
echo "Now add the token to your DNS/HTML and run:"
echo "curl -X POST https://titoproof-backend-4yxb.onrender.com/api/verify/verify-domain -H 'Content-Type: application/json' -d '{\"domain\":\"$DOMAIN\",\"method\":\"DNS_TXT\",\"token\":\"$TOKEN\"}'" "
```

**Save as**: `test_api.sh`
**Run**: `bash test_api.sh`

---

## 📖 More Info

- **Full Documentation**: `PROJECT_DOCUMENTATION_URDU.md`
- **Deployment Guide**: `QUICK_DEPLOY_GUIDE.md`
- **Architecture**: `ARCHITECTURE.md`

---

**Happy Testing! 🎉**
