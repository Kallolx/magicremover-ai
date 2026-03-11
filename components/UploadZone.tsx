
import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadZoneProps {
  onUpload: (file: File) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={`relative group bg-white border-2 border-dashed rounded-2xl sm:rounded-3xl p-8 sm:p-12 transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] shadow-xl shadow-slate-200/50 ${
          isDragging ? 'border-violet-500 bg-violet-50/50 scale-[1.02]' : 'border-slate-200 hover:border-violet-400'
        }`}
      >
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-violet-100 rounded-full text-violet-600 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500">
          <Upload size={32} className="sm:w-12 sm:h-12" strokeWidth={1.5} />
        </div>
        
        <div className="text-center mb-6 sm:mb-10">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 mb-2 sm:mb-3">Upload an image</h3>
          <p className="text-slate-500 text-base sm:text-lg tracking-tight">or drag and drop a file</p>
        </div>

        <div className="flex flex-col w-full gap-3 sm:gap-4 max-w-sm px-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-violet-600 text-white text-sm sm:text-base font-bold tracking-tight rounded-xl sm:rounded-2xl hover:bg-violet-700 active:scale-95 transition-all shadow-lg shadow-violet-200"
          >
            Upload Image
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>

        <div className="mt-6 sm:mt-8 text-slate-400 text-xs sm:text-sm tracking-tight text-center px-4">
          <span>Supports JPG, PNG, WebP • Max 10MB</span>
        </div>
      </motion.div>

      <div className="text-center">
        <p className="text-slate-400 text-[10px] sm:text-xs tracking-tight px-4">
          By uploading an image you agree to our <a href="#" className="underline">Terms of Service</a>. 
          This site is protected by hCaptcha.
        </p>
      </div>
    </div>
  );
};

export default UploadZone;
