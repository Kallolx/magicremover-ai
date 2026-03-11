# Industry-Grade Background Removal Backend

🚀 **Production-ready FastAPI backend with GPU acceleration and multiple quality presets**

## Features

### 🎯 Core Capabilities
- ✅ **Multiple AI Models**: isnet-general-use (best quality) & u2net (fast)
- ✅ **GPU Acceleration**: Automatic CUDA/DirectML detection
- ✅ **Alpha Matting**: Superior edge quality for professional results
- ✅ **Post-Processing**: Advanced edge enhancement and artifact reduction
- ✅ **Quality Presets**: High, Balanced, Fast modes
- ✅ **CORS Enabled**: Ready for frontend integration

### 💪 Performance
- Pre-loaded model sessions (no reload per request)
- GPU/CPU automatic selection
- Optimized PNG compression
- Supports images up to 10MB

## API Endpoints

### 1. Main Processing Endpoint
**POST** `/process-image`

**Query Parameters:**
- `quality`: `"high"` | `"balanced"` | `"fast"` (default: `"high"`)
- `model`: `"isnet"` | `"u2net"` (default: `"isnet"`)
- `alpha_matting`: `true` | `false` (default: `true`)

**Example:**
```bash
curl -X POST "http://localhost:8000/process-image?quality=high&model=isnet" \
  -F "file=@image.jpg" \
  --output result.png
```

**Quality Presets:**
- **High**: Maximum quality, alpha matting, all enhancements (best for final output)
- **Balanced**: Good quality with reasonable speed (recommended)
- **Fast**: Quick processing, good results (best for previews)

### 2. High-Quality Preset
**POST** `/process-image/high-quality`

Maximum quality processing with all enhancements.
Best for: E-commerce, marketing materials, final production

```bash
curl -X POST "http://localhost:8000/process-image/high-quality" \
  -F "file=@product.jpg" \
  --output product_nobg.png
```

### 3. Fast Processing Preset
**POST** `/process-image/fast`

Quick processing for previews and batch operations.
Best for: Real-time apps, previews, batch processing

```bash
curl -X POST "http://localhost:8000/process-image/fast" \
  -F "file=@image.jpg" \
  --output preview.png
```

### 4. Health Check
**GET** `/health`

Returns system status, available models, and GPU info.

```bash
curl http://localhost:8000/health
```

## Setup Instructions

### 1. Create Virtual Environment
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
```

### 2. Install Dependencies
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

**For GPU Support (NVIDIA):**
```powershell
pip uninstall onnxruntime
pip install onnxruntime-gpu
```

**For GPU Support (AMD/Intel - Windows):**
```powershell
pip install onnxruntime-directml
```

### 3. Start Server
```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Model Download
On first startup, models will auto-download:
- **isnet-general-use**: ~180MB (latest, best quality)
- **u2net**: ~176MB (fast, good quality)

Models are cached locally after first download.

## Frontend Integration

### JavaScript/TypeScript Example
```typescript
async function removeBackground(file: File, quality: 'high' | 'balanced' | 'fast' = 'high') {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(
    `http://localhost:8000/process-image?quality=${quality}`,
    {
      method: 'POST',
      body: formData,
    }
  );
  
  if (!response.ok) {
    throw new Error('Processing failed');
  }
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
```

### React Example
```tsx
const [processedImage, setProcessedImage] = useState<string | null>(null);

const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch('http://localhost:8000/process-image?quality=high', {
      method: 'POST',
      body: formData,
    });
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setProcessedImage(url);
  } catch (error) {
    console.error('Processing failed:', error);
  }
};
```

## GPU Acceleration

The backend automatically detects and uses available GPU:

- **NVIDIA GPUs**: CUDA (via `onnxruntime-gpu`)
- **AMD/Intel GPUs**: DirectML (via `onnxruntime-directml`)
- **Fallback**: CPU execution

Check GPU status:
```bash
curl http://localhost:8000/health
```

Look for `"compute"` field in response.

## Performance Tips

### For Maximum Quality
```
POST /process-image/high-quality
```
- Uses isnet model
- Alpha matting enabled
- Full post-processing
- Best for final output

### For Speed
```
POST /process-image/fast
```
- Uses u2net model
- No alpha matting
- Minimal post-processing
- 2-3x faster

### For Balanced
```
POST /process-image?quality=balanced
```
- Configurable model
- Optional alpha matting
- Good quality/speed ratio

## Supported Formats

**Input:** JPEG, PNG, WebP (up to 10MB)  
**Output:** PNG with transparent background

## Error Handling

The API returns detailed error responses:

```json
{
  "error": "Invalid file type",
  "message": "Only images are allowed. Received: application/pdf",
  "allowed_types": ["image/jpeg", "image/png", "image/webp"]
}
```

## Production Deployment

### Environment Variables
```bash
export MAX_FILE_SIZE=10485760  # 10MB
export HOST=0.0.0.0
export PORT=8000
```

### Run with Gunicorn (Production)
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## License
MIT

## Support
For issues or questions, check the API documentation at `http://localhost:8000/docs` (auto-generated FastAPI docs)
