
import React from 'react';
import { Layers, Wand2 } from 'lucide-react';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onLogoClick}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-200 group-hover:scale-105 transition-transform">
            <Layers size={20} className="sm:w-6 sm:h-6" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">MagicRemover<span className="text-violet-600">AI</span></span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold tracking-tight text-white bg-violet-600 rounded-lg sm:rounded-xl hover:bg-violet-700 transition-all shadow-md">
            <Wand2 size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Try Free</span>
            <span className="xs:hidden">Try</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
