
import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
          <span>Made with</span>
          <Heart size={14} className="text-red-500 fill-current" />
          <span>by Senior Frontend Team</span>
        </div>

        <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-violet-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-violet-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-violet-600 transition-colors">GDPR</a>
          <a href="#" className="hover:text-violet-600 transition-colors">Contact</a>
        </div>

        <div className="text-slate-400 text-xs">
          © {new Date().getFullYear()} MagicRemover AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
