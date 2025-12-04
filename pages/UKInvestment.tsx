
import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import { Building2, TrendingUp, ShieldCheck, ArrowRight, PoundSterling } from 'lucide-react';
import { INITIAL_PROPERTIES } from '../constants';

const UKInvestment: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      const supabase = getSupabase();
      if (supabase) {
        const { data } = await supabase.from('properties').select('*').eq('type', 'uk-investment');
        if (data) {
           // Map DB fields to Property type
           const mapped = data.map((p:any) => ({
             ...p, imageUrl: p.image_url, isFeatured: p.is_featured, agentId: p.agent_id, externalUrl: p.external_url, brochureUrl: p.brochure_url
           }));
           setProperties(mapped);
        }
      } else {
        // Fallback
        setProperties(INITIAL_PROPERTIES.filter(p => p.type === 'uk-investment'));
      }
      setLoading(false);
    };
    fetchProps();
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-white">
      {/* HERO */}
      <div className="relative h-[400px] w-full bg-slate-900 overflow-hidden">
        <img 
           src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070" 
           alt="London Skyline" 
           className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <span className="text-gold-500 tracking-[0.3em] uppercase text-sm font-bold mb-4">International Opportunities</span>
          <h1 className="text-4xl md:text-6xl font-serif text-white font-bold mb-6">Guardian Housing UK</h1>
          <p className="text-gray-300 max-w-2xl text-lg">Secure, high-yield investments in the United Kingdom supported living sector.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        
        {/* INTRO FROM PDF */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-gold-600 font-bold uppercase tracking-wider text-sm mb-2">Our History</h2>
            <h3 className="text-3xl font-serif text-slate-900 mb-6">Proven Track Record Since 2015</h3>
            <div className="prose text-gray-600 leading-relaxed space-y-4">
              <p>
                Guardian Housing has been providing supported accommodation since 2015. During that time, we have amassed a portfolio of over 500 units and formed good relationships with a network of referral agencies and property agents/landlords.
              </p>
              <p>
                We strongly believe in providing perfect service to our customers. Through our vast network of agents and from 9 years worth of personal experience, we are able to ensure that the properties we bring to market offer the best value for investment.
              </p>
              <p>
                Not just from a price perspective, but also from a desirability perspective. This way we are able to ensure that if a unit becomes vacant, we are able to re-let it within a few days.
              </p>
            </div>
          </div>
          <div className="bg-slate-50 p-8 rounded border border-gray-100 relative">
             <div className="absolute -top-4 -right-4 bg-gold-500 text-white p-4 rounded shadow-lg">
                <span className="block text-3xl font-bold">500+</span>
                <span className="text-xs uppercase">Units Managed</span>
             </div>
             <img src="https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=1000" className="w-full h-64 object-cover rounded mb-6" alt="UK Property"/>
             <blockquote className="italic text-slate-700 border-l-4 border-gold-500 pl-4">
               "We handle every aspect of property management with integrity and transparency."
             </blockquote>
          </div>
        </div>

        {/* INVESTMENT STRATEGY & ROI */}
        <div className="bg-slate-900 text-white rounded-sm overflow-hidden mb-20">
           <div className="grid md:grid-cols-2">
              <div className="p-12 flex flex-col justify-center">
                 <h2 className="text-gold-500 font-bold uppercase tracking-wider text-sm mb-2">Investment Strategy</h2>
                 <h3 className="text-3xl font-serif mb-6">High Yield Supported Living</h3>
                 <p className="text-gray-300 mb-6 leading-relaxed">
                   We are now offering the opportunity to invest in properties which typically offer a <strong>ROI of 8.5% per annum</strong>. Guardian Housing would manage the property, including the maintenance and sourcing of suitable tenants.
                 </p>
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="text-gold-500" />
                       <span>Fully Managed Service</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <TrendingUp className="text-gold-500" />
                       <span>8.5% Typical Annual ROI</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Building2 className="text-gold-500" />
                       <span>High Demand Sector</span>
                    </div>
                 </div>
              </div>
              <div className="bg-gold-600 p-12 text-slate-900">
                 <h3 className="text-xl font-bold border-b border-black/10 pb-4 mb-6">Example Investment Case</h3>
                 <div className="space-y-4 font-medium">
                    <div className="flex justify-between items-center bg-white/10 p-3 rounded">
                       <span>Property Type</span>
                       <span className="font-bold">Freehold 5 Bedroom</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/10 p-3 rounded">
                       <span>Property Value</span>
                       <span className="font-bold">£250,000</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/10 p-3 rounded">
                       <span>Max Monthly Return</span>
                       <span className="font-bold">£2,250.00</span>
                    </div>
                    <div className="mt-6 p-4 bg-slate-900 text-gold-400 rounded text-center">
                       <span className="block text-sm opacity-80 uppercase tracking-widest mb-1">Annual Return</span>
                       <span className="text-3xl font-serif font-bold">£29,250</span>
                       <span className="block text-xs mt-1 text-white">(8.5% Yield - 13 Payments)</span>
                    </div>
                    <p className="text-xs mt-4 opacity-70">*Figures will naturally vary from property to property.</p>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="text-center mb-16">
           <span className="bg-slate-100 text-slate-800 px-4 py-2 rounded-full text-sm font-bold border border-slate-200">
             Minimum Investment Starting from AED 100k
           </span>
        </div>

        {/* LISTINGS */}
        <div className="mb-8">
           <h3 className="text-2xl font-serif text-slate-900 mb-8 border-l-4 border-gold-500 pl-4">Available Opportunities</h3>
           {loading ? (
             <div className="text-center py-12">Loading investments...</div>
           ) : properties.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {properties.map(p => <PropertyCard key={p.id} property={p} />)}
             </div>
           ) : (
             <div className="text-center py-12 bg-gray-50 rounded border border-gray-100">
                <PoundSterling size={48} className="mx-auto text-gray-300 mb-4"/>
                <p className="text-gray-500">New UK investment opportunities coming soon.</p>
                <button className="mt-4 text-gold-600 font-bold hover:underline">Register your interest</button>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default UKInvestment;
