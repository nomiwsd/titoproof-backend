# Render Deployment Fix - "Cannot find module './index.ts'" Error

## Masla / Problem

Jab Render par deploy karte hain to ye error aata hai:
```
Error: Cannot find module './index.ts'
```

## Wajah / Root Cause

Render compiled JavaScript file (`dist/index.js`) ki bajaye TypeScript file (`index.ts`) ko directly run karne ki koshish kar raha tha.

---

## ✅ Hal / Solution

### Option 1: render.yaml File Update Kare (Recommended)

Agar aap `render.yaml` file istemaal kar rahe hain:

**Purani Configuration (Incorrect):**
```yaml
services:
  - type: web
    name: titoproof-backend
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start  # ❌ یہ غلط ہے
```

**Nai Configuration (Correct):**
```yaml
services:
  - type: web
    name: titoproof-backend
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: node dist/index.js  # ✅ صحیح
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        sync: false
```

**Tabdeeli:**
- `startCommand: npm start` → `startCommand: node dist/index.js`

---

### Option 2: Render Dashboard Se Direct Update

Agar aap Render dashboard istemaal kar rahe hain:

1. **Render Dashboard** par jaye
2. Apni service (`titoproof-backend`) select kare
3. **Settings** tab par click kare
4. **Build & Deploy** section mein jaye
5. Ye settings update kare:

| Setting | Updated Value |
|---------|---------------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node dist/index.js` ← **یہ change کریں** |

6. **Save Changes** پر click کریں
7. **Manual Deploy** → **Deploy latest commit**

---

## Kaam Kaise Hota Hai? / How It Works

### Build Process
```bash
npm install              # Dependencies install ہوتے ہیں
npm run build           # TypeScript compile ہوتا ہے (tsc)
# Output: src/*.ts → dist/*.js
```

### Start Process
```bash
node dist/index.js      # Compiled JavaScript چلتا ہے
# NOT: node src/index.ts ❌
# NOT: npm start (if it points to wrong file) ❌
```

---

## Verify Kare / Verification Steps

### 1. Local Test
Apne computer par test kare:

```bash
# Build کریں
npm run build

# Check کریں کہ dist folder بنی یا نہیں
ls dist/
# Output: index.js app.js database.js ...

# Start کریں
node dist/index.js
# Server should start: "Server listening on port 3000"
```

### 2. Render Logs Check Kare

Deploy ke baad Render dashboard mein:
1. **Logs** tab پر جائیں
2. یہ messages دیکھنے چاہیئے:
```
==> Installing dependencies
==> Running 'npm install && npm run build'
==> Build successful
==> Starting service with 'node dist/index.js'
==> Server listening on port 10000
```

3. اگر پھر بھی error ہو:
```
Error: Cannot find module './index.ts'
```
تو **Start Command** دوبارہ check کریں۔

---

## Common Issues Aur Solution

### ❌ Issue: "Cannot find module 'typescript'"

**Cause**: TypeScript devDependency میں ہے لیکن production میں نہیں install ہو رہی

**Fix**: Build command میں `--production=false` flag add کریں:
```yaml
buildCommand: npm install --production=false && npm run build
```

یا TypeScript کو regular dependency بنا دیں:
```bash
npm install typescript --save
```

---

### ❌ Issue: "dist folder not found"

**Cause**: Build command fail ہو گئی یا run نہیں ہوئی

**Fix**:
1. Check `tsconfig.json`:
```json
{
  "compilerOptions": {
    "outDir": "./dist",    # یہ ضرور ہونی چاہیے
    "rootDir": "./src"
  }
}
```

2. Build command explicit بنائیں:
```yaml
buildCommand: npm install && npm run build && ls -la dist/
```
(آخر میں `ls -la dist/` logs میں files show کرے گا)

---

### ❌ Issue: Build success لیکن start fail

**Cause**: `dist/index.js` کی بجائے کوئی اور entry point ہے

**Fix**: Check کریں `package.json`:
```json
{
  "main": "dist/index.js",  # یہ صحیح ہونا چاہیے
  "scripts": {
    "start": "node dist/index.js"  # Explicit path
  }
}
```

---

## Environment Variables - Zaroori Variables

Render dashboard mein ye environment variables zaroor set kare:

```env
NODE_ENV=production
PORT=10000
DATABASE_MODE=mongodb
MONGODB_URI=mongodb+srv://your-connection-string
DB_NAME=titoproof
```

**Note**: `PORT` Render automatically set کرتا ہے، لیکن add کرنے میں کوئی حرج نہیں

---

## Step-by-Step Deployment (Fresh Start)

Agar phir bhi issue ho to naye se deploy kare:

### 1. Local par verify kare
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
node dist/index.js
# Ctrl+C to stop
```

### 2. Code push kare
```bash
git add .
git commit -m "Fix: Update start command for Render deployment"
git push origin main
```

### 3. Render par new service create kare
- Dashboard → **New +** → **Web Service**
- Repository select کریں
- یہ exact settings use کریں:

```
Name: titoproof-backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: node dist/index.js
```

### 4. Environment variables add kare
```
NODE_ENV=production
DATABASE_MODE=mongodb
MONGODB_URI=<your-mongodb-uri>
DB_NAME=titoproof
```

### 5. Deploy Kare
- **Create Web Service** button دبائیں
- Logs monitor کریں
- Success message:
```
Your service is live 🎉
https://titoproof-backend.onrender.com
```

---

## Testing After Deployment

### 1. Health Check
```bash
curl https://your-app.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-06T...",
  "database": {
    "mode": "mongodb",
    "status": "connected"
  }
}
```

### 2. Generate Token Test
```bash
curl -X POST https://your-app.onrender.com/api/verify/generate-token \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}'
```

### 3. Browser Test
```
https://your-app.onrender.com
```
API documentation page دکھنی چاہیے

---

## Final Checklist

Deploy se pehle ye check kare:

- [ ] ✅ `render.yaml` میں `startCommand: node dist/index.js` ہے
- [ ] ✅ `package.json` میں `"start": "node dist/index.js"` ہے
- [ ] ✅ `tsconfig.json` میں `"outDir": "./dist"` ہے
- [ ] ✅ Local پر `npm run build` کام کر رہی ہے
- [ ] ✅ `dist/index.js` file generate ہو رہی ہے
- [ ] ✅ Environment variables set ہیں (MONGODB_URI, etc.)
- [ ] ✅ MongoDB Atlas میں IP whitelist (`0.0.0.0/0`) ہے

---

## Still Having Issues? Troubleshooting

### Debug Mode Enable Kare

Render environment variables میں:
```env
DEBUG=*
LOG_LEVEL=verbose
```

### Build Log Check Kare

Render dashboard → Service → **Events** tab:
- "Build succeeded" message ہونا چاہیے
- "Deploy live" message ہونا چاہیے

### Contact Points

1. **Render Logs**: Real-time errors دیکھنے کے لیے
2. **MongoDB Atlas Logs**: Database connection issues کے لیے
3. **Browser Console**: Frontend errors کے لیے

---

## Khulasa / Summary

**Problem**: 
```
Error: Cannot find module './index.ts'
```

**Solution**:
```yaml
startCommand: node dist/index.js  # TypeScript نہیں، compiled JS چلائیں
```

**تین critical commands**:
1. **Build**: `npm install && npm run build` (compile TypeScript)
2. **Start**: `node dist/index.js` (run compiled JavaScript)
3. **Verify**: `curl https://your-app.onrender.com/health` (test deployment)

---

**Ab deploy successfully ho jayega! ✨**

Agar phir bhi issue ho to:
1. Render logs dekhe
2. Local par `npm run build` test kare
3. `dist/` folder check kare ke files ban rahi hain ya nahi
