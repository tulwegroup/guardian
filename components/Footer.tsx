
import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../constants';
import { getSupabase } from '../lib/supabase';

const Footer: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<string>('Checking...');

  useEffect(() => {
    const check = async () => {
      const sb = getSupabase();
      if (!sb) {
        setDbStatus('Disconnected');
        return;
      }
      const { count, error } = await sb.from('properties').select('*', { count: 'exact', head: true });
      if (error) setDbStatus(`Error: ${error.message}`);
      else setDbStatus(`Connected (${count} items)`);
    };
    check();
  }, []);

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold tracking-widest text-white">
                GUARDIAN
              </span>
              <span className="text-xs tracking-[0.3em] text-gold-500 uppercase">Housing Real Estate</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Redefining the housing landscape by building a strong foundation of trust, integrity, and excellence. We create stories, turning houses into homes.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-gold-500 font-serif text-xl">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/buy" className="hover:text-white transition-colors">Buy Property</Link></li>
              <li><Link to="/rent" className="hover:text-white transition-colors">Rent Property</Link></li>
              <li><Link to="/off-plan" className="hover:text-white transition-colors">Off-Plan Projects</Link></li>
              <li><Link to="/uk-investment" className="hover:text-white transition-colors">UK Investments</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-gold-500 font-serif text-xl">Contact Us</h3>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="text-gold-500 shrink-0" size={20} />
                <span>{CONTACT_INFO.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-gold-500 shrink-0" size={20} />
                <span>{CONTACT_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-gold-500 shrink-0" size={20} />
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-white transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <a href="#" className="text-gray-400 hover:text-gold-500 transition-colors"><Instagram size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-gold-500 transition-colors"><Facebook size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-gold-500 transition-colors"><Linkedin size={24} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Guardian Housing Real Estate. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-2 md:mt-0 text-[10px] opacity-50">
             <Database size={10} />
             <span>System v3.1 | DB: {dbStatus}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
