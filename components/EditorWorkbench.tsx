
import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  ArrowLeft,
  Check,
  Eraser,
  Undo2,
  X
} from 'lucide-react';

interface EditorWorkbenchProps {
  originalImage: string;
  processedImage: string;
  onReset: () => void;
}

const colors = [
  { name: 'Transparent', value: 'transparent' },
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#64748b' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' }
];

const EditorWorkbench: React.FC<EditorWorkbenchProps> = ({ originalImage, processedImage, onReset }) => {
  const [activeBg, setActiveBg] = useState('transparent');
  const [eraserMode, setEraserMode] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [downloadSize, setDownloadSize] = useState<'original' | 'large' | 'medium' | 'small'>('original');
  const [jpgQuality, setJpgQuality] = useState(95);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<ImageData[]>([]);

  // Track mouse position for cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    if (eraserMode) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [eraserMode]);

  // Load the processed image onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const loadImage = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      // Save initial state
      historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    };

    if (img.complete) {
      loadImage();
    } else {
      img.onload = loadImage;
    }
  }, [processedImage]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!eraserMode) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Save state for undo
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (canvas && ctx) {
      historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (historyRef.current.length > 20) historyRef.current.shift(); // Keep only last 20 states
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    if (!eraserMode) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx || historyRef.current.length <= 1) return;

    historyRef.current.pop(); // Remove current state
    const previousState = historyRef.current[historyRef.current.length - 1];
    ctx.putImageData(previousState, 0, 0);
  };

  const processDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate target dimensions based on size selection
    let targetWidth = canvas.width;
    let targetHeight = canvas.height;

    const sizeMap = {
      original: { max: Infinity },
      large: { max: 2048 },
      medium: { max: 1024 },
      small: { max: 512 }
    };

    const maxDimension = sizeMap[downloadSize].max;
    if (canvas.width > maxDimension || canvas.height > maxDimension) {
      const ratio = Math.min(maxDimension / canvas.width, maxDimension / canvas.height);
      targetWidth = Math.floor(canvas.width * ratio);
      targetHeight = Math.floor(canvas.height * ratio);
    }

    // Create a temporary canvas for resizing if needed
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = targetWidth;
    exportCanvas.height = targetHeight;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    // Draw scaled image
    exportCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

    // Determine MIME type and quality
    let mimeType = 'image/png';
    let quality = 1.0;

    if (downloadFormat === 'jpg') {
      mimeType = 'image/jpeg';
      quality = jpgQuality / 100;
    } else if (downloadFormat === 'webp') {
      mimeType = 'image/webp';
      quality = jpgQuality / 100;
    }

    // Download
    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `background-removed-${downloadSize}.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShowDownloadModal(false);
    }, mimeType, quality);
  };

  const handleDownload = () => {
    setShowDownloadModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header - Simple on mobile, full toolbar on desktop */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          {/* Mobile: Just Back and Download buttons */}
          <div className="flex md:hidden items-center justify-between">
            <button 
              onClick={onReset}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors text-sm tracking-tight"
              title="Back to Home"
            >
              <ArrowLeft size={18} />
              <span className="font-semibold">Back</span>
            </button>

            <button 
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-semibold tracking-tight rounded-lg hover:bg-violet-700 transition-all shadow-md"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
          </div>

          {/* Desktop: Full toolbar */}
          <div className="hidden md:flex flex-row items-center justify-between gap-6">
            <button 
              onClick={onReset}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-base tracking-tight"
              title="Back to Home"
            >
              <ArrowLeft size={20} />
              <span className="font-semibold">Back</span>
            </button>

            <div className="flex items-center gap-4 justify-center flex-1">
              {/* Background Colors */}
              <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                <span className="text-sm text-slate-500 mr-1 tracking-tight">BG:</span>
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setActiveBg(color.value)}
                    className={`relative w-8 h-8 rounded-lg border-2 transition-all overflow-hidden ${
                      activeBg === color.value ? 'border-violet-600 scale-110' : 'border-slate-300 hover:border-slate-400 hover:scale-105'
                    }`}
                    title={color.name}
                  >
                    {color.value === 'transparent' ? (
                      <div className="checkerboard w-full h-full" />
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: color.value }} />
                    )}
                    {activeBg === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check size={12} className="text-white drop-shadow" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Eraser Tool */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEraserMode(!eraserMode)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm tracking-tight transition-all ${
                    eraserMode 
                      ? 'bg-violet-100 text-violet-700 border-2 border-violet-600' 
                      : 'bg-slate-100 text-slate-700 border-2 border-slate-300 hover:border-slate-400'
                  }`}
                  title="Toggle Eraser Tool"
                >
                  <Eraser size={18} />
                  <span>Erase</span>
                </button>

                {eraserMode && (
                  <>
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg">
                      <span className="text-xs text-slate-600 tracking-tight whitespace-nowrap">Size: {brushSize}px</span>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-20 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-violet-600"
                      />
                    </div>

                    <button
                      onClick={handleUndo}
                      disabled={historyRef.current.length <= 1}
                      className="flex items-center gap-1.5 px-2.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Undo"
                    >
                      <Undo2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold tracking-tight rounded-lg hover:bg-violet-700 transition-all shadow-md hover:shadow-lg"
            >
              <Download size={18} />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 overflow-auto">
        {/* Mobile Toolbar - Compact, above image */}
        <div className="md:hidden w-full max-w-2xl mb-3">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-2.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              {/* Background Colors */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500 tracking-tight">BG:</span>
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setActiveBg(color.value)}
                    className={`relative w-7 h-7 rounded-md border-2 transition-all overflow-hidden ${
                      activeBg === color.value ? 'border-violet-600 scale-105' : 'border-slate-300'
                    }`}
                    title={color.name}
                  >
                    {color.value === 'transparent' ? (
                      <div className="checkerboard w-full h-full" />
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: color.value }} />
                    )}
                    {activeBg === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check size={10} className="text-white drop-shadow" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Eraser Toggle */}
              <button
                onClick={() => setEraserMode(!eraserMode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium text-xs tracking-tight transition-all ${
                  eraserMode 
                    ? 'bg-violet-100 text-violet-700 border border-violet-600' 
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}
              >
                <Eraser size={14} />
                <span>Erase</span>
              </button>

              {/* Undo Button */}
              {eraserMode && (
                <button
                  onClick={handleUndo}
                  disabled={historyRef.current.length <= 1}
                  className="flex items-center px-2 py-1.5 text-slate-600 bg-slate-100 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <Undo2 size={14} />
                </button>
              )}
            </div>

            {/* Brush Size Slider (when eraser active) */}
            {eraserMode && (
              <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-2 rounded-md">
                <span className="text-xs text-slate-600 tracking-tight whitespace-nowrap">Brush: {brushSize}px</span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* Image Canvas */}
        <div 
          ref={containerRef}
          className={`relative transition-all duration-300 ${activeBg === 'transparent' ? 'checkerboard' : ''}`}
          style={{ 
            backgroundColor: activeBg !== 'transparent' ? activeBg : undefined
          }}
        >
          {/* Hidden image for reference */}
          <img 
            ref={imageRef}
            src={processedImage} 
            alt="Background Removed" 
            className="hidden"
          />
          
          {/* Canvas for editing */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={`block max-w-full max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] w-auto h-auto ${
              eraserMode ? 'cursor-none' : ''
            }`}
            style={{ imageRendering: 'crisp-edges' }}
          />

          {/* Brush cursor preview */}
          {eraserMode && (
            <div 
              className="pointer-events-none fixed rounded-full border-2 border-violet-600 bg-violet-600/20 z-50"
              style={{
                width: `${brushSize * 2}px`,
                height: `${brushSize * 2}px`,
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
        </div>
      </div>

      {/* Download Options Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">Download Options</h3>
              <button 
                onClick={() => setShowDownloadModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 tracking-tight">Format</label>
              <div className="grid grid-cols-3 gap-2">
                {(['png', 'jpg', 'webp'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setDownloadFormat(format)}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm tracking-tight transition-all ${
                      downloadFormat === format
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 tracking-tight">
                {downloadFormat === 'png' && 'Best quality, supports transparency, larger file size'}
                {downloadFormat === 'jpg' && 'Good quality, no transparency, smaller file size'}
                {downloadFormat === 'webp' && 'Modern format, best compression, supports transparency'}
              </p>
            </div>

            {/* Quality Slider for JPG/WEBP */}
            {(downloadFormat === 'jpg' || downloadFormat === 'webp') && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 tracking-tight">
                  Quality: {jpgQuality}%
                </label>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={jpgQuality}
                  onChange={(e) => setJpgQuality(Number(e.target.value))}
                  className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
              </div>
            )}

            {/* Size Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 tracking-tight">Size</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'original', label: 'Original', desc: 'Full resolution' },
                  { value: 'large', label: 'Large', desc: '2048px max' },
                  { value: 'medium', label: 'Medium', desc: '1024px max' },
                  { value: 'small', label: 'Small', desc: '512px max' }
                ].map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setDownloadSize(size.value as any)}
                    className={`px-3 py-2.5 rounded-lg text-left transition-all ${
                      downloadSize === size.value
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <div className="font-medium text-sm tracking-tight">{size.label}</div>
                    <div className={`text-xs ${downloadSize === size.value ? 'text-violet-100' : 'text-slate-500'}`}>
                      {size.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={processDownload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold text-base tracking-tight rounded-lg hover:bg-violet-700 transition-all shadow-md hover:shadow-lg"
            >
              <Download size={20} />
              <span>Download Image</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorWorkbench;
