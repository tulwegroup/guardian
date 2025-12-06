



import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { NAV_ITEMS, CONTACT_INFO, DEFAULT_LOGO } from '../constants';

interface NavbarProps {
  logoUrl: string;
}

const Navbar: React.FC<NavbarProps> = ({ logoUrl }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState(logoUrl);
  const location = useLocation();

  useEffect(() => {
    setImgSrc(logoUrl);
  }, [logoUrl]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setActiveSubDropdown(null);
  }, [location]);

  const isHome = location.pathname === '/';
  const headerClass = isScrolled || !isHome
    ? 'bg-guardian-dark shadow-md py-2'
    : 'bg-transparent py-4';
  
  const textColor = isScrolled || !isHome ? 'text-white' : 'text-white';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Brand Lockup */}
        <Link to="/" className="flex items-center gap-4 group relative z-50">
           <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
             <img 
               key={imgSrc}
               src={imgSrc} 
               alt="Guardian Housing Logo" 
               className="w-full h-full object-contain drop-shadow-md"
               onError={() => {
                 if (imgSrc !== DEFAULT_LOGO) setImgSrc(DEFAULT_LOGO);
               }}
             />
           </div>
           
           <div className="flex flex-col justify-center drop-shadow-md">
             <h1 className="font-serif font-bold text-white tracking-[0.15em] text-lg md:text-2xl leading-none">
               GUARDIAN
             </h1>
             <span className="text-gold-500 text-[0.6rem] md:text-[0.65rem] font-sans font-medium tracking-[0.25em] uppercase leading-tight mt-1">
               Housing Real Estate
             </span>
           </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-3 xl:space-x-6">
          {NAV_ITEMS.map((item) => (
            <div key={item.path} className="relative group">
              {item.subItems ? (
                 <button className={`flex items-center gap-1 text-sm uppercase tracking-wider font-medium hover:text-gold-400 transition-colors py-4 ${textColor}`}>
                   {item.label} <ChevronDown size={14} />
                 </button>
              ) : (
                <Link
                  to={item.path}
                  className={`text-sm uppercase tracking-wider font-medium hover:text-gold-400 transition-colors py-4 ${
                    location.pathname === item.path ? 'text-gold-400 border-b border-gold-400' : textColor
                  }`}
                >
                  {item.label}
                </Link>
              )}

              {/* Level 1 Dropdown */}
              {item.subItems && (
                <div className="absolute top-full left-0 bg-slate-900 min-w-[240px] shadow-xl rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 border-t-2 border-gold-500 flex flex-col z-[60]">
                  {item.subItems.map((sub, idx) => (
                    <div key={idx} className="relative group/item">
                       {/* If it has sub-items (nested community structure) */}
                       {sub.subItems ? (
                          <div className="px-6 py-3 text-white hover:bg-white/5 hover:text-gold-400 text-sm tracking-wide border-b border-white/5 flex justify-between items-center cursor-pointer">
                             {sub.label}
                             <ChevronRight size={14} className="opacity-70"/>
                             
                             {/* Level 2 Dropdown (Flyout) */}
                             <div className="absolute top-0 left-full bg-slate-900 min-w-[220px] max-h-[60vh] overflow-y-auto no-scrollbar shadow-xl border-l border-gold-500/30 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-[70]">
                                {sub.subItems.map((nested) => (
                                   <Link 
                                      key={nested.path} 
                                      to={nested.path}
                                      className="block px-6 py-3 text-gray-300 hover:text-gold-400 hover:bg-white/5 text-xs uppercase tracking-wider border-b border-white/5"
                                   >
                                      {nested.label}
                                   </Link>
                                ))}
                             </div>
                          </div>
                       ) : (
                         <Link 
                           to={sub.path}
                           className="block px-6 py-3 text-white hover:bg-white/5 hover:text-gold-400 text-sm tracking-wide border-b border-white/5 last:border-0"
                         >
                           {sub.label}
                         </Link>
                       )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <a 
            href={`https://wa.me/${CONTACT_INFO.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-sm transition-all shadow-lg hover:shadow-gold-500/20 mr-2"
          >
            <MessageCircle size={16} />
            <span className="text-sm font-medium">WhatsApp</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden text-gold-400 relative z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-slate-900 border-t border-slate-800 shadow-xl py-6 px-6 flex flex-col space-y-2 animate-fade-in-down max-h-[80vh] overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <div key={item.path}>
              {item.subItems ? (
                <div>
                   <button 
                     onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                     className="flex items-center justify-between w-full text-white hover:text-gold-400 text-lg uppercase tracking-wider py-2"
                   >
                     {item.label}
                     <ChevronDown size={16} className={`transform transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                   </button>
                   {activeDropdown === item.label && (
                     <div className="pl-4 border-l border-gold-500/30 ml-2 mt-1 space-y-1 mb-2">
                       {item.subItems.map((sub, idx) => (
                         <div key={idx}>
                           {sub.subItems ? (
                              <div>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); setActiveSubDropdown(activeSubDropdown === sub.label ? null : sub.label); }}
                                   className="flex items-center justify-between w-full text-gray-300 hover:text-gold-400 text-sm py-2"
                                 >
                                    {sub.label}
                                    <ChevronDown size={12} className={`transform transition-transform ${activeSubDropdown === sub.label ? 'rotate-180' : ''}`} />
                                 </button>
                                 {activeSubDropdown === sub.label && (
                                    <div className="pl-4 border-l border-white/10 ml-2 space-y-1">
                                       {sub.subItems.map(nested => (
                                          <Link key={nested.path} to={nested.path} className="block text-gray-400 hover:text-gold-400 text-xs py-1 uppercase" onClick={() => setIsMobileMenuOpen(false)}>
                                             {nested.label}
                                          </Link>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           ) : (
                             <Link key={sub.path} to={sub.path} className="block text-gray-300 hover:text-gold-400 text-sm py-1" onClick={() => setIsMobileMenuOpen(false)}>
                               {sub.label}
                             </Link>
                           )}
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-white hover:text-gold-400 text-lg uppercase tracking-wider py-2"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          <div className="pt-4 border-t border-slate-800 mt-2">
             <a 
               href={`https://wa.me/${CONTACT_INFO.phone.replace(/[^0-9]/g, '')}`}
               target="_blank"
               rel="noopener noreferrer"
               className="text-gold-400 font-serif text-xl flex items-center gap-2"
             >
                <MessageCircle size={20} />
                WhatsApp Us
             </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;