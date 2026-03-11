"""
Industry-Grade Image Processing Module for Background Removal
Features:
- State-of-the-art AI models with GPU acceleration
- Advanced alpha matting algorithm
- Professional edge refinement
- Detail preservation and artifact removal
- Multi-stage processing pipeline
"""

import io
import os
from typing import Optional, Literal
from PIL import Image, ImageFilter, ImageEnhance, ImageOps
from rembg import remove, new_session
import numpy as np
import cv2
from scipy.ndimage import binary_erosion, binary_dilation, gaussian_filter

# GPU/CPU Detection
def detect_providers():
    """Detect available computation providers (GPU/CPU)"""
    try:
        import onnxruntime as ort
        available = ort.get_available_providers()
        
        # Prioritize GPU providers
        if 'CUDAExecutionProvider' in available:
            print("🚀 GPU (CUDA) detected and enabled!")
            return ['CUDAExecutionProvider', 'CPUExecutionProvider']
        elif 'DmlExecutionProvider' in available:  # DirectML for AMD/Intel
            print("🚀 GPU (DirectML) detected and enabled!")
            return ['DmlExecutionProvider', 'CPUExecutionProvider']
        else:
            print("💻 Using CPU (GPU not detected)")
            return ['CPUExecutionProvider']
    except Exception as e:
        print(f"⚠️ Provider detection failed, using CPU: {e}")
        return ['CPUExecutionProvider']

# Get optimal providers
PROVIDERS = detect_providers()

# Pre-load multiple model sessions for different use cases
print("Loading state-of-the-art AI models...")
print("📦 Loading isnet-general-use (Best Quality - Latest Model)...")
MODEL_ISNET = new_session("isnet-general-use", providers=PROVIDERS)
print("📦 Loading u2net (High Quality - Fast)...")
MODEL_U2NET = new_session("u2net", providers=PROVIDERS)
print("📦 Loading u2netp (Lightweight - Ultra Fast)...")
MODEL_U2NETP = new_session("u2netp", providers=PROVIDERS)
print("✅ All AI models loaded successfully!")

# Default to best quality model
DEFAULT_MODEL = MODEL_ISNET

ModelType = Literal["isnet", "u2net", "u2netp"]


def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Preprocess image - only convert to RGB, no effects or enhancements.
    
    Args:
        image: Input PIL Image
        
    Returns:
        RGB converted image (RAW, no effects)
    """
    # Only convert to RGB if needed - NO color changes, NO effects
    if image.mode != 'RGB':
        return image.convert('RGB')
    return image


def refine_alpha_channel_for_hair(alpha: np.ndarray) -> np.ndarray:
    """
    Industry-grade alpha refinement designed specifically for hair, fur, and fine details.
    Uses advanced techniques to preserve semi-transparent strands while removing noise.
    
    Args:
        alpha: Alpha channel as numpy array (0-255)
        
    Returns:
        Refined alpha channel with preserved hair details
    """
    # Split into solid and semi-transparent regions
    solid_fg = (alpha > 240).astype(np.uint8) * 255  # Definitely foreground
    solid_bg = (alpha < 15).astype(np.uint8) * 255   # Definitely background
    hair_region = ((alpha >= 15) & (alpha <= 240)).astype(np.uint8) * 255  # Hair/fur/edges
    
    # For solid foreground: minimal processing
    fg_mask = (alpha > 240).astype(np.uint8)
    
    # For hair/fur region: preserve fine details with edge-aware filtering
    hair_mask = ((alpha >= 15) & (alpha <= 240)).astype(np.uint8)
    if np.any(hair_mask):
        # Use multiple bilateral filters at different scales to preserve hair structure
        alpha_hair_1 = cv2.bilateralFilter(alpha, 5, 75, 75)   # Fine details
        alpha_hair_2 = cv2.bilateralFilter(alpha, 9, 100, 100) # Medium structure
        
        # Blend based on alpha value (finer details for higher alpha)
        alpha_normalized = alpha / 255.0
        weight = alpha_normalized ** 0.5  # Favor finer filter for denser areas
        alpha_hair_blended = (alpha_hair_1 * weight + alpha_hair_2 * (1 - weight)).astype(np.uint8)
        
        # Apply only to hair regions
        alpha = np.where(hair_mask, alpha_hair_blended, alpha)
    
    # Remove isolated noise in background (very conservative)
    bg_mask = (alpha < 15).astype(np.uint8)
    kernel_tiny = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    bg_cleaned = cv2.morphologyEx(bg_mask, cv2.MORPH_CLOSE, kernel_tiny, iterations=1)
    alpha[bg_cleaned > 0] = 0
    
    # Feather edges slightly for natural blending (only at boundaries)
    edge_mask = cv2.Canny(alpha, 50, 150)
    edge_dilated = cv2.dilate(edge_mask, kernel_tiny, iterations=2)
    
    if np.any(edge_dilated):
        # Apply very gentle gaussian only to edge pixels
        alpha_feathered = cv2.GaussianBlur(alpha, (3, 3), 0.5)
        alpha = np.where(edge_dilated > 0, alpha_feathered, alpha)
    
    return alpha


def enhance_edges_advanced(image: Image.Image) -> Image.Image:
    """
    Industry-grade edge enhancement with hair/fur preservation.
    
    Args:
        image: PIL Image with transparency (RGBA)
        
    Returns:
        Enhanced PIL Image with natural hair/fur edges
    """
    try:
        if image.mode != 'RGBA':
            return image
        
        # Convert to numpy for processing
        img_array = np.array(image)
        rgb = img_array[:, :, :3]
        alpha = img_array[:, :, 3]
        
        # Industry-grade alpha refinement for hair/fur
        alpha_refined = refine_alpha_channel_for_hair(alpha)
        
        # Recombine with original RGB (no color changes)
        result = np.dstack([rgb, alpha_refined])
        
        return Image.fromarray(result, 'RGBA')
        
    except Exception as e:
        print(f"Edge enhancement failed, using original: {e}")
        return image


def remove_background(
    file_bytes: bytes,
    model: ModelType = "isnet",
    alpha_matting: bool = True,
    alpha_matting_foreground_threshold: int = 180,  # Lower = preserves hands/details on white clothing
    alpha_matting_background_threshold: int = 10,   # Standard threshold
    alpha_matting_erode_size: int = 3,              # SMALL for hair/fur preservation (1-3 recommended)
    post_process: bool = True,                       # ENABLED for hair refinement
    only_mask: bool = False
) -> bytes:
    """
    Industry-grade background removal with hair/fur preservation.
    
    Args:
        file_bytes: Raw bytes of input image
        model: AI model ("isnet" = best accuracy, "u2net" = fast, "u2netp" = fastest)
        alpha_matting: Enable alpha matting (ESSENTIAL for hair/fur)
        alpha_matting_foreground_threshold: Lower values preserve more detail (recommended: 170-200)
        alpha_matting_background_threshold: Background detection threshold
        alpha_matting_erode_size: Edge refinement size (1-3 for hair, 5-10 for solid objects)
        post_process: Enable hair/fur refinement (ESSENTIAL for quality)
        only_mask: Return only the mask (for debugging)
        
    Returns:
        bytes: Industry-grade PNG with transparent background and preserved hair/fur
    """
    try:
        # Load and preprocess image
        input_image = Image.open(io.BytesIO(file_bytes))
        original_size = input_image.size
        original_mode = input_image.mode
        
        # Preprocess for better results
        input_image = preprocess_image(input_image)
        
        # Select model session
        if model == "isnet":
            session = MODEL_ISNET
        elif model == "u2net":
            session = MODEL_U2NET
        else:
            session = MODEL_U2NETP
        
        # Process with rembg using optimal settings
        output_image = remove(
            input_image,
            session=session,
            alpha_matting=alpha_matting,
            alpha_matting_foreground_threshold=alpha_matting_foreground_threshold,
            alpha_matting_background_threshold=alpha_matting_background_threshold,
            alpha_matting_erode_size=alpha_matting_erode_size,
            post_process_mask=True,
            only_mask=only_mask
        )
        
        # Advanced post-processing for professional quality
        if post_process and not only_mask:
            output_image = enhance_edges_advanced(output_image)
        
        # Ensure output is RGBA
        if output_image.mode != 'RGBA' and not only_mask:
            output_image = output_image.convert('RGBA')
        
        # Convert to bytes with maximum quality
        output_buffer = io.BytesIO()
        
        if only_mask:
            output_image.save(
                output_buffer,
                format='PNG',
                optimize=False,  # Don't optimize masks
                compress_level=6
            )
        else:
            output_image.save(
                output_buffer,
                format='PNG',
                optimize=True,
                compress_level=6,
                icc_profile=input_image.info.get('icc_profile')  # Preserve color profile
            )
        
        output_buffer.seek(0)
        return output_buffer.getvalue()
        
    except Exception as e:
        raise Exception(f"Background removal failed: {str(e)}")


def remove_background_ultra_quality(file_bytes: bytes) -> bytes:
    """
    Preset: MAXIMUM QUALITY - Industry-grade hair/fur preservation.
    Uses isnet model with optimized settings for fine details like hair, fur, and edges.
    Best for: Portraits with hair, people, animals, fur, fine textures.
    Processing time: 5-10 seconds
    
    Args:
        file_bytes: Raw bytes of input image
        
    Returns:
        bytes: Professional-grade PNG with preserved hair/fur details
    """
    return remove_background(
        file_bytes,
        model="isnet",
        alpha_matting=True,
        alpha_matting_foreground_threshold=170,  # Very low - captures all hair strands
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=2,  # Minimal erosion for maximum hair preservation
        post_process=True  # Essential for hair refinement
    )


def remove_background_high_quality(file_bytes: bytes) -> bytes:
    """
    Preset: High quality - Balanced hair/fur preservation.
    Uses isnet model with balanced settings for general portraits and subjects.
    Best for: General portraits, people, products with fine details.
    Processing time: 5-10 seconds
    
    Args:
        file_bytes: Raw bytes of input image
        
    Returns:
        bytes: High quality PNG with good hair/detail preservation
    """
    return remove_background(
        file_bytes,
        model="isnet",
        alpha_matting=True,
        alpha_matting_foreground_threshold=180,  # Balanced for general use
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=3,  # Small for good detail preservation
        post_process=True  # Enabled for quality
    )


def remove_background_fast(file_bytes: bytes) -> bytes:
    """
    Preset: Fast processing with good quality.
    Uses u2net model for speed while maintaining reasonable detail.
    Best for: Previews, batch processing, real-time applications.
    Processing time: 2-5 seconds
    
    Args:
        file_bytes: Raw bytes of input image
        
    Returns:
        bytes: Good quality PNG (faster processing)
    """
    return remove_background(
        file_bytes,
        model="u2net",
        alpha_matting=True,
        alpha_matting_foreground_threshold=180,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=5,  # Slightly larger for speed
        post_process=False  # Disabled for speed
    )


def validate_image_bytes(file_bytes: bytes) -> bool:
    """
    Validate that bytes represent a valid image.
    
    Args:
        file_bytes: Raw bytes to validate
        
    Returns:
        bool: True if valid image
    """
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
        return True
    except Exception:
        return False
