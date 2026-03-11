import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UploadZone from '../components/UploadZone';
import ProcessingState from '../components/ProcessingState';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    try {
      setProcessing(true);
      setError(null);

      // Read the original image
      const reader = new FileReader();
      const originalImagePromise = new Promise<string>((resolve) => {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setOriginalImage(result);
          resolve(result);
        };
        reader.readAsDataURL(file);
      });

      const originalImageData = await originalImagePromise;

      // Call backend API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${BACKEND_URL}/process-image?quality=ultra&model=isnet&alpha_matting=true`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Processing failed' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      // Convert response to blob and create URL
      const blob = await response.blob();
      const processedUrl = URL.createObjectURL(blob);

      // Navigate to editor page with both images
      navigate('/editor', {
        state: {
          originalImage: originalImageData,
          processedImage: processedUrl
        }
      });
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image. Please try again.');
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setProcessing(false);
    setOriginalImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onLogoClick={handleReset} />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        {!processing && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Remove Background <br />
                <span className="text-violet-600">100% Automatically</span>
              </h1>
              <p className="text-xl text-slate-500">
                Professional grade AI-powered subject isolation in seconds.
              </p>
            </div>
            <UploadZone onUpload={handleUpload} />
          </motion.div>
        )}

        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl"
          >
            <ProcessingState image={originalImage} />
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-red-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Processing Failed</h3>
                <p className="text-slate-600 mb-6">{error}</p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
