# 🚀 Complete Setup Guide - Background Remover AI

## Overview
This project consists of two parts:
1. **Backend**: Python FastAPI server with AI models (port 8000)
2. **Frontend**: React/TypeScript application (port 3000)

## Prerequisites
- Python 3.8+ installed
- Node.js/Bun installed
- 2GB+ free disk space (for AI models)
- (Optional) NVIDIA GPU for faster processing

---

## Part 1: Backend Setup (Python + FastAPI)

### Step 1: Navigate to Backend
```powershell
cd backend
```

### Step 2: Create Virtual Environment
```powershell
python -m venv venv
```

### Step 3: Activate Virtual Environment
```powershell
.\venv\Scripts\Activate
```
✅ You should see `(venv)` in your terminal

**If you get execution policy error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 4: Upgrade pip
```powershell
python -m pip install --upgrade pip
```

### Step 5: Install Dependencies
```powershell
pip install -r requirements.txt
```
⏱️ This takes 2-3 minutes

**For NVIDIA GPU Support (Optional):**
```powershell
pip uninstall onnxruntime
pip install onnxruntime-gpu
```

**For AMD/Intel GPU (Windows):**
```powershell
pip install onnxruntime-directml
```

### Step 6: Start Backend Server
```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

✅ **Backend is ready when you see:**
```
🚀 GPU (CUDA) detected and enabled!  # or "Using CPU"
📦 Loading u2net (General - High Quality)...
📦 Loading isnet-general-use (Latest - Best Quality)...
✅ All models loaded successfully!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**First Run:** Models (~350MB total) will auto-download on startup.

### Verify Backend
Open browser: http://localhost:8000
You should see: `{"status":"online","service":"Background Removal API"}`

---

## Part 2: Frontend Setup (React + TypeScript)

### Step 1: Open New Terminal
Keep backend running, open a new PowerShell window

### Step 2: Navigate to Project Root
```powershell
cd "E:\Projects\Testing Projects\magicremover-ai"
```

### Step 3: Install Dependencies (if needed)
```powershell
bun install
# or: npm install
```

### Step 4: Start Frontend
```powershell
bun run dev
# or: npm run dev
```

✅ **Frontend is ready when you see:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

---

## 🎯 Using the Application

1. Open browser: **http://localhost:3000**
2. Drag & drop an image or click to upload
3. Wait for AI processing (5-15 seconds)
4. View result with before/after slider
5. Change background color/blur
6. Download HD or preview version

### Quality Modes
The app uses **"high"** quality by default:
- **High**: Best quality, alpha matting, all enhancements (~10-15s)
- **Balanced**: Good quality, faster (~5-8s)
- **Fast**: Quick preview (~2-4s)

To change quality, edit `App.tsx` line 17:
```typescript
const [quality, setQuality] = useState<QualityMode>('high'); // or 'balanced', 'fast'
```

---

## 📋 Complete Startup Commands (Quick Reference)

### Terminal 1 - Backend:
```powershell
cd backend
.\venv\Scripts\Activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2 - Frontend:
```powershell
cd "E:\Projects\Testing Projects\magicremover-ai"
bun run dev
```

---

## 🛠️ Troubleshooting

### Backend Issues

**Problem: `pip` not recognized**
```powershell
python -m pip install -r requirements.txt
```

**Problem: Virtual environment activation fails**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Problem: CUDA errors on GPU**
Install CPU version instead:
```powershell
pip install onnxruntime --force-reinstall
```

**Problem: Models not downloading**
Check internet connection. Models download from Hugging Face automatically.

### Frontend Issues

**Problem: CORS errors**
- Ensure backend is running on port 8000
- Check backend logs for CORS middleware loading

**Problem: "Connection refused"**
- Backend is not running
- Check firewall isn't blocking port 8000

**Problem: Image upload fails**
- Check file size (max 10MB)
- Only JPEG, PNG, WebP supported
- Check browser console for errors

### Performance Issues

**Slow processing:**
- First request is slower (model initialization)
- GPU: 2-5 seconds per image
- CPU: 5-15 seconds per image
- Consider using "fast" quality preset

**Out of memory:**
- Reduce image size before upload
- Close other applications
- Use "fast" quality mode

---

## 🔥 API Testing (Optional)

Test backend directly with curl:

```powershell
# High quality
curl -X POST "http://localhost:8000/process-image?quality=high" `
  -F "file=@test.jpg" `
  --output result.png

# Fast processing
curl -X POST "http://localhost:8000/process-image/fast" `
  -F "file=@test.jpg" `
  --output result.png
```

Or test in browser:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

---

## 📊 System Requirements

### Minimum (CPU):
- RAM: 4GB
- Storage: 2GB free
- Processing: ~10-15 seconds/image

### Recommended (GPU):
- RAM: 8GB+
- NVIDIA GPU with 4GB+ VRAM
- Storage: 2GB free
- Processing: ~2-5 seconds/image

---

## 🎨 Features

### Backend:
- ✅ Multiple AI models (isnet, u2net)
- ✅ GPU/CPU auto-detection
- ✅ Alpha matting for edge quality
- ✅ Quality presets
- ✅ CORS enabled
- ✅ Error handling

### Frontend:
- ✅ Drag & drop upload
- ✅ Real-time processing
- ✅ Before/after slider
- ✅ Background color picker
- ✅ Blur background option
- ✅ HD download
- ✅ Error handling

---

## 🚫 Stopping the Application

### Stop Backend:
Press `Ctrl + C` in backend terminal

### Stop Frontend:
Press `Ctrl + C` in frontend terminal

### Deactivate Virtual Environment:
```powershell
deactivate
```

---

## 📝 Next Steps

1. **Customize quality**: Edit quality mode in App.tsx
2. **Add more backgrounds**: Modify color options in EditorWorkbench.tsx
3. **Batch processing**: Add multiple file upload
4. **Deploy**: Use gunicorn for backend, Vercel/Netlify for frontend

---

## 💡 Tips

- **First upload takes longer** (model loading)
- **Keep backend terminal open** while using app
- **Use GPU** for best performance
- **Start with "fast" mode** to test, then switch to "high"
- **Check health endpoint** to verify GPU usage

---

## Support

Backend API docs: http://localhost:8000/docs
Backend README: [backend/README.md](backend/README.md)

For issues:
1. Check both terminals for errors
2. Verify ports 3000 and 8000 are free
3. Restart both servers
4. Check firewall settings
