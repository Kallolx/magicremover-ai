
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
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
    <div className="space-y-6">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={`relative group bg-white border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center min-h-[400px] shadow-xl shadow-slate-200/50 ${
          isDragging ? 'border-violet-500 bg-violet-50/50 scale-[1.02]' : 'border-slate-200 hover:border-violet-400'
        }`}
      >
        <div className="mb-8 p-6 bg-violet-100 rounded-full text-violet-600 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500">
          <Upload size={48} strokeWidth={1.5} />
        </div>
        
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-slate-800 mb-3">Upload an image</h3>
          <p className="text-slate-500 text-lg">or drag and drop a file</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-8 py-4 bg-violet-600 text-white font-bold rounded-2xl hover:bg-violet-700 active:scale-95 transition-all shadow-lg shadow-violet-200"
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

        <div className="mt-8 flex items-center gap-6 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <LinkIcon size={16} />
            <span>Paste URL (Ctrl+V)</span>
          </div>
          <div className="flex items-center gap-2">
            <ImageIcon size={16} />
            <span>Try sample image</span>
          </div>
        </div>
      </motion.div>

      <div className="text-center">
        <p className="text-slate-400 text-xs">
          By uploading an image you agree to our <a href="#" className="underline">Terms of Service</a>. 
          This site is protected by hCaptcha and its Privacy Policy and Terms of Service apply.
        </p>
      </div>
    </div>
  );
};

export default UploadZone;
