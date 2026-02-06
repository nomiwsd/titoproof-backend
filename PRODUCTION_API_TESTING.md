# 🧪 Production API Testing - TitoProof Backend
**Base URL**: `https://titoproof-backend-4yxb.onrender.com`

---

## Quick Test Commands (Copy & Paste)

### 1️⃣ Health Check
```bash
curl -s "https://titoproof-backend-4yxb.onrender.com/health" | jq
```

---

### 2️⃣ Generate Verification Token
```bash
curl -s -X POST "https://titoproof-backend-4yxb.onrender.com/api/verify/generate-token" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "methods": ["DNS_TXT", "HTML_META"]
  }' | jq
```

**Response میں سے token save کریں:**
```json
{
  "success": true,
  "data": {
    "token": "titoproof_abc123_...",
    ...
  }
}
```

---

## 3️⃣ Verify Domain - DNS Method

**پہلے یہ کریں**: اپنے domain کے DNS settings میں TXT record add کریں:
```
Host: _titoproof.example.com
Type: TXT
Value: <token-from-step-2>
TTL: 3600
```

**پھر یہ کمانڈ چلائیں:**
```bash
curl -s -X POST "https://titoproof-backend-4yxb.onrender.com/api/verify/verify-domain" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "method": "DNS_TXT",
    "token": "titoproof_abc123_..."
  }' | jq
```

---

## 4️⃣ Verify Domain - HTML Method

**پہلے یہ کریں**: اپنی website کے `<head>` میں یہ tag add کریں:
```html
<meta name="titoproof-verification" content="titoproof_abc123_..." />
```

**پھر یہ کمانڈ چلائیں:**
```bash
curl -s -X POST "https://titoproof-backend-4yxb.onrender.com/api/verify/verify-domain" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "method": "HTML_META",
    "token": "titoproof_abc123_..."
  }' | jq
```

---

## 5️⃣ Check Domain Status
```bash
curl -s "https://titoproof-backend-4yxb.onrender.com/api/verify/status/example.com" | jq
```

---

## 6️⃣ Verify Email Domain
```bash
curl -s -X POST "https://titoproof-backend-4yxb.onrender.com/api/verify/email-domain" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "domain": "example.com"
  }' | jq
```

---

## 7️⃣ Public Verification Page (Browser)
```
https://titoproof-backend-4yxb.onrender.com/verify/example.com
```

یہ domain کی verification status کو HTML page میں دکھاتا ہے۔

---

## 🔥 Postman میں Quick Setup

1. **New Request** بنائیں
2. **Method**: `POST`
3. **URL**: `https://titoproof-backend-4yxb.onrender.com/api/verify/generate-token`
4. **Headers** میں add کریں:
   ```
   Key: Content-Type
   Value: application/json
   ```
5. **Body** (raw JSON):
   ```json
   {
     "domain": "example.com",
     "methods": ["DNS_TXT", "HTML_META"]
   }
   ```
6. **Send** کریں
7. Response میں سے `token` کو copy کریں

---

## 📋 Complete Testing Workflow

### Step 1: Token Generate کریں
```bash
TOKEN_RESPONSE=$(curl -s -X POST "https://titoproof-backend-4yxb.onrender.com/api/verify/generate-token" \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com","methods":["DNS_TXT","HTML_META"]}')

TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.data.token')
echo "Your Token: $TOKEN"
```

### Step 2: DNS یا HTML میں Token Add کریں
- **DNS**: `_titoproof.example.com` TXT record میں token add کریں
- **HTML**: Website کے `<head>` میں `<meta name="titoproof-verification" content="$TOKEN" />` add کریں

### Step 3: Verification Run کریں
```bash
# DNS Verification
curl -s -X POST "https://titoproof-backend-4yxb.onrender.com/api/verify/verify-domain" \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"example.com\",\"method\":\"DNS_TXT\",\"token\":\"$TOKEN\"}" | jq

# یا HTML Verification
curl -s -X POST "https://titoproof-backend-4yxb.onrender.com/api/verify/verify-domain" \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"example.com\",\"method\":\"HTML_META\",\"token\":\"$TOKEN\"}" | jq
```

### Step 4: Status Check کریں
```bash
curl -s "https://titoproof-backend-4yxb.onrender.com/api/verify/status/example.com" | jq
```

---

## 🧪 Test Script (Save as `test-production.sh`)

```bash
#!/bin/bash

BASE_URL="https://titoproof-backend-4yxb.onrender.com"
DOMAIN="example.com"

echo "🧪 Testing TitoProof API - Production"
echo "Base URL: $BASE_URL"
echo "---"

# 1. Health Check
echo -e "\n1️⃣ Health Check..."
curl -s "$BASE_URL/health" | jq

# 2. Generate Token
echo -e "\n2️⃣ Generating token for $DOMAIN..."
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/verify/generate-token" \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"$DOMAIN\",\"methods\":[\"DNS_TXT\",\"HTML_META\"]}")

echo "$TOKEN_RESPONSE" | jq
TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.data.token')

echo -e "\n✅ Token Generated: $TOKEN"
echo "👉 Add this token to your DNS TXT record or HTML meta tag"

# 3. Check Status (before verification)
echo -e "\n3️⃣ Current Status (before verification)..."
curl -s "$BASE_URL/api/verify/status/$DOMAIN" | jq

echo -e "\n📝 Next Steps:"
echo "1. Add DNS TXT record: _titoproof.$DOMAIN = $TOKEN"
echo "   OR add HTML meta tag: <meta name=\"titoproof-verification\" content=\"$TOKEN\" />"
echo ""
echo "2. Wait for DNS propagation (5-30 mins) or deploy HTML changes"
echo ""
echo "3. Run verification:"
echo "   curl -X POST $BASE_URL/api/verify/verify-domain -H 'Content-Type: application/json' -d '{\"domain\":\"$DOMAIN\",\"method\":\"DNS_TXT\",\"token\":\"$TOKEN\"}'"

echo -e "\n✅ Test script complete!"
```

**استعمال کریں:**
```bash
chmod +x test-production.sh
./test-production.sh
```

---

## 📊 Expected Response Examples

### ✅ Successful Token Generation
```json
{
  "success": true,
  "data": {
    "token": "titoproof_abc123_1234567890",
    "domain": "example.com",
    "methods": ["DNS_TXT", "HTML_META"],
    "expiresAt": "2026-02-07T12:30:00.000Z",
    "createdAt": "2026-02-06T12:30:00.000Z"
  }
}
```

### ✅ Successful Verification
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
      "verifiedAt": "2026-02-06T12:30:00.000Z"
    }
  }
}
```

### ❌ Failed Verification
```json
{
  "error": "Verification failed - token not found in domain"
}
```

---

## 🔍 Troubleshooting

| Error | Reason | Fix |
|-------|--------|-----|
| "Cannot find module" | Build folder missing | API rebuilt ✅ |
| "Token not found" | DNS/HTML not updated | Check DNS/HTML, wait for propagation |
| "Domain not verified" | Verification never ran | Run verify-domain endpoint first |
| Connection refused | API down | Check Render dashboard |
| 404 Not Found | Wrong endpoint | Check URL spelling |

---

## 💡 Tips

- **jq** نہ ہو تو بغیر `| jq` کے استعمال کریں
- **Windows PowerShell** میں `curl` alias ہو سکتا ہے - `curl.exe` سے استعمال کریں
- Token **24 گھنٹے** میں expire ہوتا ہے
- DNS propagation عام پر **5-30 منٹ** لیتا ہے

---

**Happy Testing! 🎉**
