# Quick Start Guide

## 🚀 Run Everything Locally

### 1. Start Backend (with GPU)
```bash
# Option A: Use the batch file
./start-backend-public.bat

# Option B: Manual start
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start Frontend
```bash
bun run dev
```

### 3. Access
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🌐 Make it Public (Choose One)

### Option 1: Cloudflare Tunnel (Recommended)

**Install:**
```bash
winget install --id Cloudflare.cloudflared
```

**Setup:**
```bash
# Login
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create magicremover-api

# Copy the tunnel ID shown, then create config file:
# C:\Users\YourName\.cloudflared\config.yml
```

**config.yml:**
```yaml
tunnel: YOUR_TUNNEL_ID_HERE
credentials-file: C:\Users\YourName\.cloudflared\YOUR_TUNNEL_ID.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```

**Route DNS:**
```bash
cloudflared tunnel route dns YOUR_TUNNEL_ID api.yourdomain.com
```

**Run:**
```bash
cloudflared tunnel run magicremover-api
```

**Update .env.local:**
```env
VITE_BACKEND_URL=https://api.yourdomain.com
```

---

### Option 2: Ngrok (Quick Test)

**Install:**
```bash
winget install ngrok
```

**Setup:**
```bash
# Get token from https://ngrok.com
ngrok config add-authtoken YOUR_TOKEN

# Expose backend
ngrok http 8000
```

**Use the URL shown (e.g., https://abc123.ngrok.io)**

**Update .env.local:**
```env
VITE_BACKEND_URL=https://abc123.ngrok.io
```

---

## 🔗 Integration with Your SaaS

### From `newscard-generator.vercel.app`:

**JavaScript Example:**
```javascript
// Call API directly
async function removeBackground(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch('https://api.yourdomain.com/process-image?quality=ultra', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) throw new Error('Failed to remove background');
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// Usage
const processedImageURL = await removeBackground(myImageFile);
```

**Or just redirect:**
```javascript
// Add button in your SaaS
<button onClick={() => window.open('https://magicremover.yourdomain.com', '_blank')}>
  Remove Background
</button>
```

---

## 📦 Deploy Frontend (Vercel)

```bash
# Build
bun run build

# Deploy to Vercel
vercel deploy

# Add environment variable in Vercel dashboard:
# VITE_BACKEND_URL = https://api.yourdomain.com
```

---

## ⚡ Performance Tips

1. **Keep GPU PC running 24/7** for instant access
2. **Use SSD** for faster model loading
3. **8GB+ RAM** recommended
4. **Monitor GPU temperature** (use MSI Afterburner)

---

## 🔒 Security (Optional)

Add API key authentication if needed:

**backend/main.py:**
```python
from fastapi import Header, HTTPException

@app.post("/process-image")
async def process_image(
    file: UploadFile = File(...),
    x_api_key: str = Header(None)
):
    if x_api_key != "your-secret-key-here":
        raise HTTPException(status_code=401, detail="Invalid API Key")
    # ... rest of code
```

**Frontend:**
```javascript
fetch(url, {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-secret-key-here'
  },
  body: formData
})
```

---

## 🐛 Troubleshooting

**Backend won't start:**
```bash
cd backend
pip install --upgrade rembg torch onnxruntime-gpu
```

**Slow processing:**
- Check if GPU is detected: Visit http://localhost:8000/health
- Update GPU drivers
- Close other GPU-intensive apps

**CORS errors:**
- Add your domain to `allow_origins` in `backend/main.py`

**Port 8000 already in use:**
```bash
# Use different port
uvicorn main:app --port 8001
# Update .env.local accordingly
```

---

Need help? Check the logs in terminal!
