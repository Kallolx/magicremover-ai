# Hosting Guide - Background Remover Backend

## ✅ Recommended: Local GPU Hosting with Cloudflare Tunnel

Your RTX 3060 GPU is **perfect** for this! Much faster than cloud alternatives.

### Setup Steps:

#### 1. Install Cloudflare Tunnel (Cloudflared)

**Windows:**
```powershell
# Download cloudflared
winget install --id Cloudflare.cloudflared

# Or download directly from: https://github.com/cloudflare/cloudflared/releases
```

#### 2. Authenticate & Create Tunnel

```powershell
# Login to Cloudflare
cloudflared tunnel login

# Create a tunnel
cloudflared tunnel create magicremover-api

# This creates a tunnel ID and credentials file
```

#### 3. Configure Tunnel

Create `config.yml` in `C:\Users\YourUser\.cloudflared\`:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: C:\Users\YourUser\.cloudflared\YOUR_TUNNEL_ID.json

ingress:
  - hostname: api-bgremover.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```

#### 4. Add DNS Record

```powershell
cloudflared tunnel route dns YOUR_TUNNEL_ID api-bgremover.yourdomain.com
```

#### 5. Run Everything

**Terminal 1 - Start Backend:**
```powershell
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 - Start Cloudflare Tunnel:**
```powershell
cloudflared tunnel run magicremover-api
```

#### 6. Update CORS in Backend

Update `backend/main.py` to allow your SaaS domain:

```python
allow_origins=[
    "http://localhost:3000",
    "https://newscard-generator.vercel.app",
    "https://api-bgremover.yourdomain.com",
    "*"  # Or be specific with your domains
],
```

---

## Alternative Options:

### Option 2: **Ngrok (Quick & Easy)**

```powershell
# Install
winget install ngrok

# Authenticate (get token from ngrok.com)
ngrok config add-authtoken YOUR_TOKEN

# Run backend
cd backend
uvicorn main:app --port 8000

# In another terminal, expose it
ngrok http 8000
```

**Pros:** 
- Setup in 2 minutes
- Free tier available

**Cons:**
- URL changes on restart (unless paid plan)
- Less professional

### Option 3: **Cheap Cloud GPU Services**

If you can't keep your PC running 24/7:

#### A. **RunPod** (Cheapest)
- RTX 3070: ~$0.30/hour
- RTX 4090: ~$0.70/hour
- Only pay when running
- Easy Docker deployment

```dockerfile
# Dockerfile for RunPod
FROM python:3.10-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### B. **Vast.ai** (Marketplace)
- Even cheaper: $0.10-0.40/hour
- Community GPUs
- More setup required

#### C. **Modal** (Serverless - Best for Low Traffic)
- Pay only per API call
- Auto-scales to zero
- ~$0.000088/sec of GPU time
- Perfect for sporadic usage

```python
# modal_app.py example
import modal

stub = modal.Stub("bg-remover")

@stub.function(
    image=modal.Image.debian_slim()
        .pip_install("fastapi", "uvicorn", "rembg"),
    gpu="T4",  # Cheapest GPU
)
@modal.asgi_app()
def fastapi_app():
    from main import app
    return app
```

---

## 💰 Cost Comparison:

| Option | Cost | Speed | Reliability |
|--------|------|-------|-------------|
| **Your 3060 GPU + Cloudflare** | **$0 (electricity only)** | ⚡⚡⚡ Fast | ⭐⭐⭐ (if PC stays on) |
| Your 3060 + Ngrok | ~$8/month (static domain) | ⚡⚡⚡ Fast | ⭐⭐⭐ |
| RunPod RTX 3070 | ~$220/month (24/7) | ⚡⚡⚡ Fast | ⭐⭐⭐⭐ |
| Modal Serverless | ~$10-50/month (100-500 requests) | ⚡⚡ OK | ⭐⭐⭐⭐⭐ |
| Free VPS (no GPU) | $0 | 🐌 Very Slow (30s+) | ⭐⭐ |

---

## 🎯 Recommendation for Your Use Case:

**Start with: Your 3060 + Cloudflare Tunnel**

Why?
- ✅ Free
- ✅ Fast (your 3060 is powerful)
- ✅ Professional SSL
- ✅ Easy to integrate with `newscard-generator.vercel.app`
- ✅ Can keep running 24/7 if PC is on
- ✅ No vendor lock-in

**If traffic grows, switch to:** Modal (serverless) or RunPod (dedicated)

---

## 🔗 Integration with Your SaaS

### Update Your SaaS to Redirect:

**Option 1: Direct API calls from your SaaS**
```javascript
// In newscard-generator.vercel.app
const removeBg = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch('https://api-bgremover.yourdomain.com/process-image?quality=ultra', {
    method: 'POST',
    body: formData
  });
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
```

**Option 2: Redirect to Your App**
```javascript
// Redirect button in your SaaS
window.open('https://magicremover.yourdomain.com', '_blank');
```

---

## 🚀 Quick Start Script (Windows)

Save as `start-backend-public.bat`:

```batch
@echo off
echo Starting Background Remover Backend...
cd backend
start "Backend" cmd /k "uvicorn main:app --host 0.0.0.0 --port 8000"

timeout /t 3

echo Starting Cloudflare Tunnel...
start "Tunnel" cmd /k "cloudflared tunnel run magicremover-api"

echo ✅ Backend is now public at: https://api-bgremover.yourdomain.com
pause
```

---

## 🔒 Security Tips:

1. **Add API Key Authentication** (if you want to restrict access)
2. **Rate Limiting** (prevent abuse)
3. **CORS** (only allow your domains)
4. **Monitor Usage** (Cloudflare has analytics)

Let me know which option you want to go with, and I can help you set it up!
