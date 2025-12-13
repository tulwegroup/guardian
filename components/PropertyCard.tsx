
import React, { useState, useEffect } from 'react';
import { Bed, Bath, Square, MapPin, Download, Info, Phone, Mail, MessageCircle, Pencil } from 'lucide-react';
import { Property, Agent } from '../types';
import { getSupabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadPurpose, setLeadPurpose] = useState<'details' | 'brochure' | 'contact'>('details');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
      const session = localStorage.getItem('guardian_admin_session');
      if (session) setIsAdmin(true);
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { alert("Please enter a valid email address."); return; }
    
    setIsSubmitting(true);
    const supabase = getSupabase();
    
    // 1. Save to Database
    if (supabase) { 
        await supabase.from('leads').insert({ 
            id: Date.now().toString(),
            name: formData.name, 
            email: formData.email, 
            phone: formData.phone, 
            property_id: property.id 
        }); 
    }
    
    // 2. Simulate Success
    setTimeout(() => {
       setIsSubmitting(false); setSuccess(true);
       
       // Handle Whatsapp/Download redirection for Brochure requests
       if (leadPurpose === 'brochure' && property.brochureUrl && property.type === 'off-plan') {
           window.open(property.brochureUrl, '_blank');
       }
       
       setTimeout(() => { setShowLeadForm(false); setSuccess(false); setFormData({ name: '', email: '', phone: '' }); }, 2000);
    }, 1000);
  };

  const isOffPlan = property.type === 'off-plan';
  const displayAgent: Agent | undefined = property.agent;
  
  // Agent Details
  const agentName = displayAgent?.name || 'Guardian Agent';
  const agentPhoto = displayAgent?.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a';
  const agentPhone = displayAgent?.phone || '+971505804669';
  const agentEmail = displayAgent?.email?.trim() ? displayAgent.email.trim() : 'hello@guardianhousing.ae';
  
  // WhatsApp Logic
  const rawWhatsapp = displayAgent?.whatsapp || '971505804669';
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Hi ${agentName}, I am interested in "${property.title}"${property.referenceId ? ` (Ref: ${property.referenceId})` : ''}.`
  )}`;

  const currencySymbol = property.currency === 'GBP' ? '£' : 'AED';

  return (
    <>
    <div className="group bg-white rounded-md overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 flex flex-col h-full relative font-sans">
      
      {/* Admin Quick Edit */}
      {isAdmin && (
          <Link to={`/admin?editPropId=${property.id}`} className="absolute top-3 left-3 z-30 bg-orange-500 text-white p-2 rounded shadow-lg hover:bg-orange-600 transition-colors" title="Edit this property">
              <Pencil size={16}/>
          </Link>
      )}

      {/* IMAGE CONTAINER - Clickable */}
      <Link to={`/property/${property.id}`} className="relative overflow-hidden h-64 block">
        <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
        
        {/* TOP RIGHT BADGES */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1 pointer-events-none">
           <div className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm shadow-sm">
             {property.isDistress ? 'DISTRESS DEAL' : (property.type === 'sale' ? 'FOR SALE' : property.type === 'rent' ? 'FOR RENT' : 'OFF-PLAN')}
           </div>
           {property.status === 'Active' && <div className="bg-white/90 text-slate-900 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm shadow-sm">ACTIVE</div>}
        </div>
        
        {/* BOTTOM RIGHT ACTIONS */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={(e) => e.preventDefault()}>
           {property.brochureUrl && (
             <button onClick={(e) => { e.preventDefault(); setLeadPurpose('brochure'); setShowLeadForm(true); }} className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors" title="Download Brochure">
                <Download size={16}/>
             </button>
           )}
           {/* Direct link to details page icon */}
           <Link to={`/property/${property.id}`} className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors" title="View Details">
               <Info size={16}/>
           </Link>
        </div>
      </Link>
      
      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-grow">
        
        {/* TYPE & PRICE */}
        <div className="mb-1">
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{property.propertyType}</span>
           <div className="mt-1">
                {property.isDistress && property.originalPrice ? (
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">{property.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">{currencySymbol}</span></span>
                        <span className="text-sm text-red-500 line-through decoration-2 opacity-70">{property.originalPrice.toLocaleString()}</span>
                    </div>
                ) : (
                    <div className="text-2xl font-bold text-slate-900">
                      {property.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">{currencySymbol} {property.type === 'rent' && `/ ${property.rentalFreq || 'Year'}`}</span>
                    </div>
                )}
           </div>
        </div>

        {/* TITLE - Clickable */}
        <Link to={`/property/${property.id}`} className="text-base font-serif text-slate-800 line-clamp-1 mb-1 group-hover:text-gold-600 transition-colors block">
            {property.title}
        </Link>

        {/* LOCATION */}
        <div className="flex items-center text-gray-500 text-xs mb-4">
          <MapPin size={12} className="mr-1 shrink-0" /> <span className="truncate">{property.location}</span>
        </div>

        {/* SPECS ROW */}
        <div className="flex items-center gap-4 border-t border-gray-100 pt-3 mt-auto mb-4 text-slate-700">
           <div className="flex items-center gap-1.5 font-medium text-xs">
              <Bed size={16} strokeWidth={2}/> {property.beds} <span className="hidden sm:inline">Bed</span>
           </div>
           <div className="flex items-center gap-1.5 font-medium text-xs">
              <Bath size={16} strokeWidth={2}/> {property.baths} <span className="hidden sm:inline">Bath</span>
           </div>
           <div className="flex items-center gap-1.5 font-medium text-xs">
              <Square size={16} strokeWidth={2}/> {property.sqft} <span className="hidden sm:inline">Sq Ft</span>
           </div>
        </div>

        {/* AGENT PROFILE SECTION */}
        <div className="flex items-center gap-3 mb-3 pt-2">
           <img src={agentPhoto} alt={agentName} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
           <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none mb-0.5">Listed By</p>
              <p className="text-xs font-bold text-slate-800 leading-none">{agentName}</p>
           </div>
        </div>

        {/* CONTACT BUTTONS (Direct Links) */}
        <div className="grid grid-cols-3 gap-2">
           <a 
             href={`tel:${agentPhone}`} 
             className="flex items-center justify-center gap-1 py-2 rounded border border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-wider"
           >
               <Phone size={14} /> Call
           </a>
           <a 
             href={`mailto:${agentEmail}`} 
             className="flex items-center justify-center gap-1 py-2 rounded border border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-wider"
           >
               <Mail size={14} /> Email
           </a>
           <a 
             href={whatsappUrl}
             target="_blank"
             rel="noopener noreferrer"
             className="flex items-center justify-center gap-1 py-2 rounded border border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-wider"
           >
               <MessageCircle size={14} /> WhatsApp
           </a>
        </div>
      </div>
    </div>

    {/* LEAD FORM POPUP */}
    {showLeadForm && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-white rounded-none shadow-2xl max-w-md w-full p-8 animate-fade-in relative border-t-4 border-gold-500">
          <button onClick={() => setShowLeadForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>
          
          <h3 className="text-2xl font-serif text-slate-900 mb-1">
             {leadPurpose === 'brochure' ? 'Download Brochure' : 'Request Info'}
          </h3>
          <p className="text-xs text-gray-500 mb-6">Please enter your details below.</p>
          
          {success ? (
             <div className="text-center py-8">
               <div className="text-green-600 text-xl font-bold mb-2">✓ Success</div>
               <p className="text-gray-500 text-sm">We will be in touch shortly.</p>
             </div>
          ) : (
             <form onSubmit={handleLeadSubmit} className="space-y-4">
                <input required type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-3 rounded text-sm outline-none focus:border-gold-500"/>
                <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border p-3 rounded text-sm outline-none focus:border-gold-500"/>
                <input required type="tel" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border p-3 rounded text-sm outline-none focus:border-gold-500"/>
                <button disabled={isSubmitting} type="submit" className="w-full bg-slate-900 text-white py-3 font-bold uppercase tracking-wider text-xs hover:bg-gold-500 transition-colors">
                   {isSubmitting ? 'Processing...' : 'Submit'}
                </button>
             </form>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default PropertyCard;
