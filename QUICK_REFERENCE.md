# Quick Reference Card - Keep This Handy!

## 🚀 Every Time You Restart Your PC:

### Method 1: One-Click Start (Easiest)
```
Double-click: START_ALL.bat
```
This opens 2 windows: Backend + Tunnel

### Method 2: Manual Start
**Terminal 1 (Backend):**
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Tunnel):**
```bash
cloudflared tunnel --url http://localhost:8000
```

---

## 📝 Update Vercel (After Each Restart):

1. **Copy** the tunnel URL from cloudflared window:
   ```
   https://XXXXX-XXXXX-XXXXX.trycloudflare.com
   ```

2. **Update** Vercel environment variable:
   - Go to: https://vercel.com/kallolx/magicremover-ai/settings/environment-variables
   - Edit: `VITE_BACKEND_URL`
   - Paste new URL
   - Save

3. **Redeploy**:
   - Go to: Deployments tab
   - Click "..." → "Redeploy"

---

## 🔗 Important URLs:

- **Local Frontend**: http://localhost:5173
- **Local Backend**: http://localhost:8000
- **Backend Health**: http://localhost:8000/health
- **Vercel Dashboard**: https://vercel.com/kallolx/magicremover-ai
- **Vercel Settings**: https://vercel.com/kallolx/magicremover-ai/settings/environment-variables

---

## 💡 Tips:

- ✅ Keep both terminal windows open while using the app
- ✅ Update `.env.local` for local development
- ✅ Tunnel URL changes every restart
- ✅ Your 3060 GPU makes processing super fast!
- ❌ Don't close the terminal windows

---

## 🐛 Quick Fixes:

**Port 8000 in use:**
```powershell
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**Cloudflared not found:**
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

**Check if working:**
```bash
# Backend health check
curl http://localhost:8000/health

# Tunnel health check (replace with your URL)
curl https://your-tunnel-url.trycloudflare.com/health
```

---

## 📱 Use from Your SaaS:

```javascript
// In newscard-generator.vercel.app
const response = await fetch('https://YOUR-TUNNEL-URL.trycloudflare.com/process-image?quality=ultra', {
  method: 'POST',
  body: formData
});
```

---

**Save this file!** You'll need it every time you restart your PC. 💾
