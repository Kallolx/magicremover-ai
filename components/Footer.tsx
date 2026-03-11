
import React from 'react';
import { Code, Code2Icon, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm tracking-tight">
          <span>Developed</span>
          <Code2Icon size={12} className="sm:w-3.5 sm:h-3.5 text-red-500 fill-current" />
          <a href="https://kallol.me" target="_blank" rel="noopener noreferrer" className="hover:text-violet-600 transition-colors">
            <span>by Kamrul Hasan</span>
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium tracking-tight text-slate-400">
          <a href="#" className="hover:text-violet-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-violet-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-violet-600 transition-colors">Contact</a>
        </div>

        <div className="text-slate-400 text-xs tracking-tight">
          © {new Date().getFullYear()} MagicRemover AI
        </div>
      </div>
    </footer>
  );
};

export default Footer;
