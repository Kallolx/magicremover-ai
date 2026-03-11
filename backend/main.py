"""
Industry-Grade FastAPI Backend for Background Removal SaaS
Features:
- Multiple quality presets
- GPU/CPU acceleration
- Advanced options support
- Production-ready with CORS and validation
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional, Literal
import io
from processor import (
    remove_background, 
    remove_background_ultra_quality,
    remove_background_high_quality,
    remove_background_fast
)

# Initialize FastAPI app
app = FastAPI(
    title="Industry-Grade Background Removal API",
    description="Professional background removal with GPU acceleration and multiple quality presets",
    version="2.0.0"
)

# Configure CORS to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev server
        "https://newscard-generator.vercel.app",  # Your SaaS platform
        "*",  # Allow all origins (remove in production if you want stricter control)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Allowed image content types
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/webp"
}


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Background Removal API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check with GPU info"""
    from processor import PROVIDERS
    return {
        "status": "healthy",
        "models": ["isnet-general-use (best)", "u2net (fast)", "u2netp (fastest)"],
        "features": ["alpha_matting", "gpu_acceleration", "advanced_post_processing", "edge_refinement"],
        "compute": PROVIDERS,
        "quality_levels": ["ultra", "high", "balanced", "fast"],
        "endpoints": ["/process-image", "/process-image/ultra-quality", "/process-image/high-quality", "/process-image/fast"]
    }


@app.post("/process-image")
async def process_image(
    file: UploadFile = File(...),
    quality: Literal["ultra", "high", "balanced", "fast"] = Query(
        default="ultra",
        description="Quality preset: 'ultra' (maximum quality), 'high' (excellent), 'balanced' (good), 'fast' (quick)"
    ),
    model: Literal["isnet", "u2net", "u2netp"] = Query(
        default="isnet",
        description="AI model: 'isnet' (best quality), 'u2net' (fast), 'u2netp' (fastest)"
    ),
    alpha_matting: bool = Query(
        default=True,
        description="Enable alpha matting for superior edge quality (HIGHLY RECOMMENDED)"
    )
):
    """
    Process an uploaded image to remove its background with professional quality.
    
    Quality Presets:
    - ultra: MAXIMUM quality - aggressive alpha matting, full post-processing (10-20s, BEST for production)
    - high: Excellent quality - standard alpha matting, full post-processing (5-10s, recommended)
    - balanced: Good quality - alpha matting, minimal post-processing (3-7s, general use)
    - fast: Quick processing - basic removal (2-4s, previews only)
    
    Args:
        file: Image file (JPEG, PNG, or WebP, max 10MB)
        quality: Quality preset
        model: AI model to use
        alpha_matting: Enable alpha matting
        
    Returns:
        StreamingResponse: Industry-grade PNG with transparent background
    """
    try:
        # Validate content type
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid file type",
                    "message": f"Only images are allowed. Received: {file.content_type}",
                    "allowed_types": list(ALLOWED_CONTENT_TYPES)
                }
            )
        
        # Read file bytes
        file_bytes = await file.read()
        
        # Validate file size
        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Empty file",
                    "message": "The uploaded file is empty"
                }
            )
        
        # Check reasonable file size (max 10MB)
        max_size = 10 * 1024 * 1024
        if len(file_bytes) > max_size:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "File too large",
                    "message": f"Maximum file size is 10MB. Received: {len(file_bytes) / (1024*1024):.2f}MB"
                }
            )
        
        # Process based on quality preset
        try:
            if quality == "ultra":
                # MAXIMUM QUALITY - Industry-grade professional output (optimized)
                processed_bytes = remove_background(
                    file_bytes,
                    model=model,
                    alpha_matting=True,
                    alpha_matting_foreground_threshold=260,
                    alpha_matting_background_threshold=15,
                    alpha_matting_erode_size=12,
                    post_process=True
                )
            elif quality == "high":
                # HIGH QUALITY - Excellent results
                processed_bytes = remove_background(
                    file_bytes,
                    model=model,
                    alpha_matting=True,
                    alpha_matting_foreground_threshold=250,
                    alpha_matting_background_threshold=15,
                    alpha_matting_erode_size=12,
                    post_process=True
                )
            elif quality == "balanced":
                # BALANCED - Good quality, reasonable speed
                processed_bytes = remove_background(
                    file_bytes,
                    model=model,
                    alpha_matting=alpha_matting,
                    alpha_matting_foreground_threshold=240,
                    alpha_matting_background_threshold=10,
                    alpha_matting_erode_size=10,
                    post_process=True
                )
            else:  # fast
                # FAST - Quick preview
                processed_bytes = remove_background(
                    file_bytes,
                    model="u2net",  # Force u2net for speed
                    alpha_matting=False,
                    post_process=False
                )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Processing failed",
                    "message": str(e)
                }
            )
        
        # Return processed image
        return StreamingResponse(
            io.BytesIO(processed_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": f"inline; filename=removed_bg_{file.filename.rsplit('.', 1)[0]}.png",
                "X-Processing-Quality": quality,
                "X-Model-Used": model,
                "X-Alpha-Matting": "enabled" if alpha_matting else "disabled"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": f"An unexpected error occurred: {str(e)}"
            }
        )


@app.post("/process-image/ultra-quality")
async def process_image_ultra_quality(file: UploadFile = File(...)):
    """
    Preset endpoint: MAXIMUM QUALITY background removal.
    Uses isnet model with aggressive alpha matting and full post-processing.
    Best for: E-commerce products, professional photography, marketing materials, print
    Processing time: 10-20 seconds (worth the wait!)
    """
    try:
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        file_bytes = await file.read()
        
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        processed_bytes = remove_background_ultra_quality(file_bytes)
        
        return StreamingResponse(
            io.BytesIO(processed_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": f"inline; filename=ultra_{file.filename.rsplit('.', 1)[0]}.png",
                "X-Processing-Quality": "ultra-maximum"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/process-image/high-quality")
async def process_image_high_quality(file: UploadFile = File(...)):
    """
    Preset endpoint: Maximum quality background removal.
    Uses isnet model with alpha matting and all enhancements.
    Best for: Final production images, marketing materials, e-commerce
    """
    try:
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        file_bytes = await file.read()
        
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        processed_bytes = remove_background_high_quality(file_bytes)
        
        return StreamingResponse(
            io.BytesIO(processed_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": f"inline; filename=hq_{file.filename.rsplit('.', 1)[0]}.png",
                "X-Processing-Quality": "maximum"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/process-image/fast")
async def process_image_fast(file: UploadFile = File(...)):
    """
    Preset endpoint: Fast background removal.
    Uses u2net model without alpha matting for speed.
    Best for: Previews, batch processing, real-time applications
    """
    try:
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        file_bytes = await file.read()
        
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        processed_bytes = remove_background_fast(file_bytes)
        
        return StreamingResponse(
            io.BytesIO(processed_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": f"inline; filename=fast_{file.filename.rsplit('.', 1)[0]}.png",
                "X-Processing-Quality": "fast"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Custom exception handler for better error responses
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again."
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
