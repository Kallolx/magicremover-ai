import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import EditorWorkbench from '../components/EditorWorkbench';

interface EditorState {
  originalImage: string;
  processedImage: string;
}

const Editor: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as EditorState;

  // Redirect to home if no image data
  React.useEffect(() => {
    if (!state || !state.processedImage) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state || !state.processedImage) {
    return null;
  }

  const handleReset = () => {
    // Clean up blob URLs
    if (state.processedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(state.processedImage);
    }
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50"
    >
      <EditorWorkbench
        originalImage={state.originalImage}
        processedImage={state.processedImage}
        onReset={handleReset}
      />
    </motion.div>
  );
};

export default Editor;
