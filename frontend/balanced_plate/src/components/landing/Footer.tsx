import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Utensils, 
  Mail, 
  MapPin, 
  Phone,
  Heart
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'API', href: '#' },
      { name: 'Integrations', href: '#' },
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Press Kit', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    resources: [
      { name: 'Help Center', href: '#' },
      { name: 'Community', href: '#' },
      { name: 'Nutrition Guide', href: '#' },
      { name: 'Recipe Database', href: '#' },
      { name: 'Webinars', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'GDPR', href: '#' },
    ],
  };


  return (
    <footer className="relative bg-gray-900 text-white">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group mb-6">
              <div>
                <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  Balanced Plate
                </span>
                <span className="text-[10px] text-gray-400 -mt-1 font-medium tracking-wide">
                  FOOD ACCOUNTABILITY
                </span>
              </div>
            </Link>

            <p className="text-gray-400 mb-6 max-w-xs">
              Transform your eating habits with AI-powered nutrition analysis. 
              Snap, analyze, and improve your diet effortlessly.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-4 h-4" />
                <span>hello@balancedplate.ai</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+234 708 211 8322</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>ILE-IFE, NG</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          
          

          {/* Company Links */}
          

          {/* Resources Links */}
          

          {/* Legal Links */}
          
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-2 sm:py-2 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>© {currentYear} Balanced Plate. Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
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