
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProcessingStateProps {
  image: string | null;
}

const wittyTexts = [
  "Detecting subjects...",
  "Analyzing pixels...",
  "Isolating foreground...",
  "Polishing edges...",
  "Making it perfect...",
  "Removing unwanted clutter..."
];

const ProcessingState: React.FC<ProcessingStateProps> = ({ image }) => {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % wittyTexts.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-12 w-full">
      <div className="relative w-full max-w-lg aspect-square rounded-3xl overflow-hidden bg-slate-100 shadow-2xl">
        {image && (
          <img 
            src={image} 
            alt="Processing" 
            className="w-full h-full object-cover opacity-50 grayscale"
          />
        )}
        
        {/* Scanning Effect */}
        <motion.div 
          initial={{ top: "-10%" }}
          animate={{ top: "110%" }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute left-0 right-0 h-1/4 scan-line z-10 border-t-2 border-violet-500 shadow-[0_-10px_30px_rgba(139,92,246,0.3)]"
        />

        {/* AI Overlay pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-violet-500/20 rounded-full animate-ping" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-800 animate-pulse">
          {wittyTexts[textIndex]}
        </h3>
        <p className="text-slate-500">Our AI is doing its magic, hang tight!</p>
      </div>

      <div className="w-full max-w-md h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3.5, ease: "linear" }}
          className="h-full bg-violet-600"
        />
      </div>
    </div>
  );
};

export default ProcessingState;
