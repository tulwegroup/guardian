
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Listings from './pages/Listings';
import PropertyDetails from './pages/PropertyDetails';
import Admin from './pages/Admin';
import Communities from './pages/Communities';
import Guides from './pages/Guides';
import Careers from './pages/Careers';
import OffPlan from './pages/OffPlan';
import UKInvestment from './pages/UKInvestment';
import { INITIAL_PROPERTIES, DEFAULT_LOGO, INITIAL_AGENTS } from './constants';
import { Property, Agent } from './types';
import { getSupabase } from './lib/supabase';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Mortgage Calculator Component
const MortgageCalculator = () => {
  const [price, setPrice] = useState(1500000);
  const [downPayment, setDownPayment] = useState(300000); // 20%
  const [interest, setInterest] = useState(4.5);
  const [years, setYears] = useState(25);
  
  const principal = price - downPayment;
  const monthlyInterest = interest / 100 / 12;
  const numPayments = years * 12;
  const monthlyPayment = (principal * monthlyInterest * Math.pow(1 + monthlyInterest, numPayments)) / (Math.pow(1 + monthlyInterest, numPayments) - 1);

  return (
    <div className="pt-32 pb-20 container mx-auto px-6 max-w-4xl">
       <h1 className="text-4xl font-serif text-slate-900 mb-8 text-center">UAE Mortgage Calculator</h1>
       <div className="bg-white p-8 rounded shadow-lg border border-gray-100 grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
             <div><label className="block text-sm font-bold text-gray-700 mb-1">Property Price (AED)</label><input type="number" value={price} onChange={e=>setPrice(Number(e.target.value))} className="w-full border p-3 rounded"/></div>
             <div><label className="block text-sm font-bold text-gray-700 mb-1">Down Payment (AED)</label><input type="number" value={downPayment} onChange={e=>setDownPayment(Number(e.target.value))} className="w-full border p-3 rounded"/></div>
             <div><label className="block text-sm font-bold text-gray-700 mb-1">Interest Rate (%)</label><input type="number" step="0.1" value={interest} onChange={e=>setInterest(Number(e.target.value))} className="w-full border p-3 rounded"/></div>
             <div><label className="block text-sm font-bold text-gray-700 mb-1">Loan Period (Years)</label><input type="number" value={years} onChange={e=>setYears(Number(e.target.value))} className="w-full border p-3 rounded"/></div>
          </div>
          <div className="bg-slate-900 text-white p-8 rounded flex flex-col justify-center text-center">
             <span className="text-gold-400 text-sm uppercase tracking-widest">Monthly Payment</span>
             <span className="text-5xl font-serif font-bold my-4">AED {monthlyPayment.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
             <p className="text-gray-400 text-sm mt-4">Estimates only. Does not include insurance or bank fees.</p>
          </div>
       </div>
    </div>
  );
};

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO);

  useEffect(() => {
    console.log("GUARDIAN APP v3.4 LOADED");
  }, []);

  const fetchData = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Fetch Properties with Agents
    const { data: props } = await supabase.from('properties').select('*');
    const { data: agents } = await supabase.from('agents').select('*');
    
    // Logic Update: We check if 'props' exists (even if empty array) to overwrite the default listing
    if (props) {
       const mapped = props.map((p:any) => ({
          ...p,
          imageUrl: p.image_url,
          isFeatured: p.is_featured,
          agentId: p.agent_id,
          lat: p.lat,
          lng: p.lng,
          externalUrl: p.external_url,
          brochureUrl: p.brochure_url,
          agent: agents?.find((a:any) => a.id === p.agent_id) || INITIAL_AGENTS[0]
       }));
       setProperties(mapped);
    }
    
    // Fetch Logo
    const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 'logo_url').single();
    if (settings?.setting_value) setLogoUrl(settings.setting_value);

  }, []);

  useEffect(() => {
    fetchData();
    window.addEventListener('supabase-config-updated', fetchData);
    return () => window.removeEventListener('supabase-config-updated', fetchData);
  }, [fetchData]);

  const handleAddProperty = (p: Property) => {
    setProperties(prev => [p, ...prev]);
    setTimeout(fetchData, 1000);
  };

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
        <Navbar logoUrl={logoUrl} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home featuredProperties={properties.filter(p => p.isFeatured || p.type === 'sale')} />} />
            
            {/* Generic Listing Pages */}
            <Route path="/buy" element={<Listings type="sale" properties={properties} />} />
            <Route path="/rent" element={<Listings type="rent" properties={properties} />} />
            
            {/* Property Details Route */}
            <Route path="/property/:id" element={<PropertyDetails />} />

            {/* Dedicated Custom Pages */}
            <Route path="/off-plan" element={<OffPlan />} />
            <Route path="/uk-investment" element={<UKInvestment />} />
            <Route path="/careers" element={<Careers />} />
            
            <Route path="/communities" element={<Communities />} />
            <Route path="/buying-guide" element={<Guides />} />
            <Route path="/selling-guide" element={<Guides />} />
            <Route path="/mortgage-calculator" element={<MortgageCalculator />} />
            
            {/* Admin */}
            <Route path="/admin" element={
              <Admin 
                onAddProperty={handleAddProperty} 
                onUpdateLogo={setLogoUrl}
                onResetLogo={() => setLogoUrl(DEFAULT_LOGO)}
                currentLogoUrl={logoUrl}
              />
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
