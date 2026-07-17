import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  MapPin, 
  Phone,
  Heart
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-900 text-white">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 text-center md:text-left">
          {/* Brand Column */}
          <div className="flex flex-col items-center md:items-start max-w-md">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <img src="/logo.png" className="w-20 h-20 rounded-xl object-contain transition-transform group-hover:scale-105 duration-200" alt="NutriLens Logo" />
              <div className="flex flex-col text-left">
                <span className="text-xl font-bold text-white tracking-tight">
                  NutriLens
                </span>
                <span className="text-[10px] text-gray-400 -mt-1 font-medium tracking-wide">
                  FOOD ACCOUNTABILITY
                </span>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Transform your eating habits with AI-powered nutrition analysis. 
              Snap, analyze, and improve your diet effortlessly.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center md:items-end gap-3 text-sm">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Contact Us</h4>
            <div className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors duration-200">
              <Mail className="w-4 h-4 text-green-500" />
              <a href="mailto:hello@nutrilens.ai">hello@nutrilens.ai</a>
            </div>
            <div className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors duration-200">
              <Phone className="w-4 h-4 text-green-500" />
              <a href="tel:+2347082118322">+234 708 211 8322</a>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <MapPin className="w-4 h-4 text-green-500" />
              <span>ILE-IFE, NG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-center gap-2">
            {/* Copyright */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400">
              <span>© {currentYear} NutriLens. Made with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-current animate-pulse" />
              <span>for healthier lives.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
// 