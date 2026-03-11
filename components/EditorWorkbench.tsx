
import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Home,
  Check,
  Eraser,
  Undo2
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

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'background-removed.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Logo and Home */}
            <div className="flex items-center gap-4">
              <button 
                onClick={onReset}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                title="Back to Home"
              >
                <Home size={20} />
                <span className="font-semibold hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center: Tools */}
            <div className="flex items-center gap-4">
              {/* Background Colors */}
              <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                <span className="text-sm text-slate-500 mr-1 hidden sm:inline">BG:</span>
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEraserMode(!eraserMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    eraserMode 
                      ? 'bg-violet-100 text-violet-700 border-2 border-violet-600' 
                      : 'bg-slate-100 text-slate-700 border-2 border-slate-300 hover:border-slate-400'
                  }`}
                  title="Toggle Eraser Tool"
                >
                  <Eraser size={18} />
                  <span className="hidden sm:inline">Erase</span>
                </button>

                {eraserMode && (
                  <>
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg">
                      <span className="text-xs text-slate-600 whitespace-nowrap">Size: {brushSize}px</span>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-24 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-violet-600"
                      />
                    </div>

                    <button
                      onClick={handleUndo}
                      disabled={historyRef.current.length <= 1}
                      className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Undo"
                    >
                      <Undo2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right: Download Button */}
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-all shadow-md hover:shadow-lg"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Area - Natural Size */}
      <div className="flex-grow flex items-center justify-center p-8 overflow-auto">
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
            className={`block max-w-full max-h-[calc(100vh-200px)] w-auto h-auto ${
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
    </div>
  );
};

export default EditorWorkbench;
