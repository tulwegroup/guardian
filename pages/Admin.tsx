
import React, { useState, useEffect } from 'react';
import { Lock, Upload, Wrench, LayoutGrid, Users, FileText, MapPin, UserPlus, Download, LogOut, Loader2, DollarSign, FileCheck, ShieldAlert, ArrowRight, RefreshCw, Mail, Pencil, X } from 'lucide-react';
import { Property, Agent, Community, Lead } from '../types';
import { getSupabase } from '../lib/supabase';
import { INITIAL_PROPERTIES, INITIAL_AGENTS, ALNAIR_PROJECTS, COMMUNITY_STRUCTURE } from '../constants';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface AdminProps {
  onAddProperty: (property: Property) => void;
  onUpdateLogo: (logoUrl: string) => void;
  onResetLogo: () => void;
  currentLogoUrl: string;
}

const SETUP_SQL_SCRIPT = `
CREATE TABLE IF NOT EXISTS agents (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  whatsapp text,
  photo_url text,
  role text default 'agent',
  password text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS communities (
  id text primary key,
  title text not null,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS leads (
  id text primary key,
  name text,
  email text,
  phone text,
  property_id text,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS properties (
  id text primary key,
  title text not null,
  price numeric,
  location text,
  type text,
  beds numeric,
  baths numeric,
  sqft numeric,
  image_url text,
  description text,
  is_featured boolean,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id text primary key,
  title text not null,
  content text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS site_settings (
  id text primary key,
  setting_value text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Seed Master Admin
INSERT INTO agents (id, name, email, phone, whatsapp, role, password, photo_url)
VALUES ('master-admin', 'Guardian Admin', 'hello@guardianhousing.ae', '+971505804669', '+971505804669', 'admin', 'guardian2024', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200')
ON CONFLICT (id) DO NOTHING;

-- Disable Security
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE communities DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;

-- Add Columns (Safe Checks)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS agent_id text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS external_url text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS brochure_url text;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS project_name text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS developer text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS currency text DEFAULT 'AED';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS original_price numeric;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_distress boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS size_sqm numeric;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS bed_type text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bath_type text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS study_room boolean DEFAULT false;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS rental_freq text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cheques text;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS reference_id text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS noc_status text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS noc_start_date text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS noc_end_date text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_agent_id text;
`;

// Helper component for map clicking
const LocationPicker = ({ lat, lng, onLocationSelect }: { lat: number, lng: number, onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker position={[lat, lng]} />
  );
};

const Admin: React.FC<AdminProps> = ({ onAddProperty, onUpdateLogo, onResetLogo, currentLogoUrl }) => {
  // Auth & Session
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  const [authError, setAuthError] = useState('');
  
  // View State
  const [activeTab, setActiveTab] = useState('properties');
  const [dbStatus, setDbStatus] = useState<'disconnected' | 'connected' | 'error' | 'missing_tables'>('disconnected');
  const [showScript, setShowScript] = useState(false);
  
  // Data Store
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  
  // --- FORMS ---
  const [logoPreview, setLogoPreview] = useState<string>(currentLogoUrl);
  const [hasUnsavedLogo, setHasUnsavedLogo] = useState(false);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);

  // Extended Property Form
  const [propForm, setPropForm] = useState<Partial<Property>>({
    title: '', price: 0, currency: 'AED', location: '', type: 'sale', status: 'Active',
    propertyType: 'Apartment', beds: 1, bedType: '1 BHK', baths: 1, bathType: '1 BATH',
    sqft: 0, sizeSqm: 0, description: '', isFeatured: false, lat: 25.2048, lng: 55.2708,
    isDistress: false, originalPrice: 0, studyRoom: false,
    rentalFreq: 'yearly', cheques: '1',
    referenceId: '', nocStatus: 'No',
    listingAgentId: ''
  });
  const [selectedRegion, setSelectedRegion] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Agent Form (Create / Edit) - Used internally by Admins
  const [agentForm, setAgentForm] = useState<Partial<Agent>>({ name: '', email: '', phone: '', whatsapp: '', role: 'agent', password: '' });
  const [agentPhotoPreview, setAgentPhotoPreview] = useState('');
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);

  const [commForm, setCommForm] = useState<Partial<Community>>({ title: '', description: '' });
  const [commImagePreview, setCommImagePreview] = useState('');

  // Blog Form
  const [blogForm, setBlogForm] = useState({ title: '', content: '' });
  const [blogImage, setBlogImage] = useState('');

  // Processing States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState('');

  // DROPDOWN OPTIONS
  const PROPERTY_TYPES_LIST = ['Apartment', 'Duplex', 'Penthouse', 'Townhouse', 'Villa', 'Office', 'Building', 'Plot', 'Labor Camp'];
  const BED_TYPES = ['Studio', '1 BHK', '2 BHK', '2 BHK + Maid', '2.5 BHK + Maid', '3 BHK', '3 BHK + Maid', '3.5 BHK + Maid', '4 BHK', '4 BHK + Maid', '4.5 BHK + Maid', '5 BHK', '5 BHK + Maid', '5.5 BHK + Maid', '6 BHK', '7 BHK', '8 BHK', '9 BHK', '10 BHK'];
  const BATH_TYPES = ['1 BATH', '1.5 BATH', '2 BATH', '2.5 BATH', '3 BATH', '3.5 BATH', '4 BATH', '4.5 BATH', '5 BATH', '5.5 BATH', '6 BATH', '6.5 BATH', '7 BATH', '8 BATH', '9 BATH', '10 BATH'];
  const RENT_CHEQUES = ['1', '2', '3', '4', '6', '12', 'Flexible'];

  // Initialize
  useEffect(() => {
    checkDbConnection();
    const savedSession = localStorage.getItem('guardian_admin_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Migration fix: Ensure photoUrl is present if photo_url exists
        if (parsed && parsed.photo_url && !parsed.photoUrl) {
            parsed.photoUrl = parsed.photo_url;
        }
        if (parsed?.id) setCurrentAgent(parsed);
      } catch (e) { localStorage.removeItem('guardian_admin_session'); }
    }
  }, []);

  const handleLogout = () => {
    setCurrentAgent(null);
    localStorage.removeItem('guardian_admin_session');
    setLoginEmail(''); setLoginPass('');
  };

  const checkDbConnection = async () => {
    const supabase = getSupabase();
    if (!supabase) { setDbStatus('disconnected'); return; }

    try {
      const { error: t1 } = await supabase.from('site_settings').select('id').limit(1);
      const { error: t2 } = await supabase.from('agents').select('id').limit(1);
      
      if (t1 || t2) { setDbStatus('missing_tables'); setShowScript(true); } 
      else { setDbStatus('connected'); if (currentAgent) fetchAdminData(); }
    } catch (e) { setDbStatus('error'); }
  };

  const fetchAdminData = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data: leadData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (leadData) {
      const mappedLeads: Lead[] = leadData.map((l: any) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        propertyId: l.property_id,
        createdAt: l.created_at,
        message: l.message
      }));
      setLeads(mappedLeads);
    }
    
    const { data: agentData } = await supabase.from('agents').select('*');
    if (agentData) {
        const mappedAgents: Agent[] = agentData.map((a: any) => ({
            id: a.id,
            name: a.name,
            email: a.email,
            phone: a.phone,
            whatsapp: a.whatsapp,
            role: a.role,
            photoUrl: a.photo_url || a.photoUrl,
            password: a.password
        }));
        setAgents(mappedAgents);
    }

    const { data: commData } = await supabase.from('communities').select('*');
    if (commData) setCommunities(commData);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const supabase = getSupabase();
    
    // No supabase client? Fallback to local admin check (failsafe)
    if (!supabase && loginPass === 'guardian2024') {
        const demoAgent = INITIAL_AGENTS[0];
        setCurrentAgent(demoAgent);
        localStorage.setItem('guardian_admin_session', JSON.stringify(demoAgent));
        return;
    }

    if (supabase) {
        // Try to find the agent
        const { data } = await supabase.from('agents').select('*').eq('email', loginEmail).eq('password', loginPass).single();
        if (data) {
            const loggedInAgent: Agent = {
                id: data.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                whatsapp: data.whatsapp,
                role: data.role as 'admin' | 'agent',
                photoUrl: data.photo_url || data.photoUrl,
                password: data.password
            };
            setCurrentAgent(loggedInAgent);
            localStorage.setItem('guardian_admin_session', JSON.stringify(loggedInAgent));
        } else if (loginEmail === 'hello@guardianhousing.ae' && loginPass === 'guardian2024') {
             // AUTO-CREATE ADMIN if it doesn't exist but credentials are correct
             const { data: newAdmin } = await supabase.from('agents').upsert({
                id: 'master-admin', name: 'Guardian Admin', email: 'hello@guardianhousing.ae', phone: '+971505804669', whatsapp: '971505804669', photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200', role: 'admin', password: 'guardian2024'
             }).select().single();
             if (newAdmin) {
                 const adminAgent: Agent = {
                     id: newAdmin.id,
                     name: newAdmin.name,
                     email: newAdmin.email,
                     phone: newAdmin.phone,
                     whatsapp: newAdmin.whatsapp,
                     role: 'admin',
                     photoUrl: newAdmin.photo_url,
                     password: newAdmin.password
                 };
                 setCurrentAgent(adminAgent);
                 localStorage.setItem('guardian_admin_session', JSON.stringify(adminAgent));
                 return;
             }
        } else {
            setAuthError('Invalid credentials.');
        }
    }
  };

  const handleSeedOffPlan = async () => {
    if (!window.confirm("Upload Al Nair Projects?")) return;
    setIsSeeding(true);
    setSeedStatus('Processing...');
    
    const supabase = getSupabase();
    if (!supabase) return;
    
    try {
        const markedUpProperties = ALNAIR_PROJECTS.map(p => ({
            id: p.id, title: p.title, price: Math.round(p.price * 1.05), location: p.location, lat: p.lat, lng: p.lng,
            type: 'off-plan', beds: p.beds, baths: p.baths, sqft: p.sqft, description: p.description,
            image_url: p.imageUrl, is_featured: p.isFeatured, agent_id: currentAgent?.id || 'master-admin',
            external_url: p.externalUrl || null, brochure_url: p.brochureUrl || null,
            status: 'Active', property_type: 'Apartment', currency: 'AED'
        }));

        const { error } = await supabase.from('properties').upsert(markedUpProperties);
        if (error) throw error;
        setSeedStatus('Success!');
        window.dispatchEvent(new Event('supabase-config-updated'));
        setTimeout(() => setSeedStatus(''), 3000);
    } catch (e: any) { 
        setSeedStatus(`Error: ${e.message}`);
        alert(`Failed: ${e.message}. \n\nTip: Click 'Repair / Show Script'.`); 
    }
    setIsSeeding(false);
  }

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024 * 2) { alert("File too large. Max 2MB."); return; }
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) { setLogoPreview(ev.target.result as string); setHasUnsavedLogo(true); } };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLogo = async () => {
      setIsProcessingLogo(true);
      const supabase = getSupabase();
      onUpdateLogo(logoPreview);
      if (supabase && dbStatus === 'connected') {
        await supabase.from('site_settings').upsert({ id: 'logo_url', setting_value: logoPreview });
      }
      setHasUnsavedLogo(false);
      setIsProcessingLogo(false);
      window.dispatchEvent(new Event('supabase-config-updated'));
  };

  const handlePropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const supabase = getSupabase();
    
    const finalBeds = parseInt(propForm.bedType?.split(' ')[0] || '1') || 1;
    const finalBaths = parseFloat(propForm.bathType?.split(' ')[0] || '1') || 1;

    // Determine Agent ID:
    // If Admin selects someone else, use that.
    // Otherwise, use current agent's ID.
    // Fallback to master-admin.
    let assignedAgentId = currentAgent?.id || 'master-admin';
    if (currentAgent?.role === 'admin' && propForm.listingAgentId) {
        assignedAgentId = propForm.listingAgentId;
    }

    // Explicitly construct payload to prevent 'Column not found' errors
    // Do NOT spread ...propForm directly, as it contains camelCase keys that don't exist in DB
    const newPropertyPayload = {
        id: Date.now().toString(),
        title: propForm.title,
        price: propForm.price,
        location: propForm.location,
        lat: propForm.lat,
        lng: propForm.lng,
        type: propForm.type,
        beds: finalBeds,
        baths: finalBaths,
        sqft: propForm.sqft,
        image_url: imagePreview || 'https://images.unsplash.com/photo-1600596542815-e328701102b9',
        description: propForm.description,
        is_featured: propForm.isFeatured,
        agent_id: assignedAgentId,
        
        project_name: propForm.projectName,
        developer: propForm.developer,
        currency: propForm.currency,
        original_price: propForm.originalPrice,
        is_distress: propForm.isDistress,
        status: propForm.status,
        property_type: propForm.propertyType,
        size_sqm: propForm.sizeSqm,
        
        bed_type: propForm.bedType,
        bath_type: propForm.bathType,
        study_room: propForm.studyRoom,
        
        rental_freq: propForm.rentalFreq,
        cheques: propForm.cheques,
        
        reference_id: propForm.referenceId,
        noc_status: propForm.nocStatus,
        noc_start_date: propForm.nocStartDate,
        noc_end_date: propForm.nocEndDate,
        listing_agent_id: assignedAgentId
    };

    if (supabase && dbStatus === 'connected') {
        const { error } = await supabase.from('properties').insert(newPropertyPayload);
        if (error) { 
            alert(`DB Error: ${error.message}`); 
            setIsSubmitting(false); 
            return; 
        }
        else window.dispatchEvent(new Event('supabase-config-updated'));
    }

    setIsSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgentId(agent.id);
    setAgentForm({
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        whatsapp: agent.whatsapp,
        password: agent.password,
        role: agent.role
    });
    setAgentPhotoPreview(agent.photoUrl);
  };

  const cancelEditAgent = () => {
    setEditingAgentId(null);
    setAgentForm({ name: '', email: '', phone: '', whatsapp: '', role: 'agent', password: '' });
    setAgentPhotoPreview('');
  };

  const handleAgentSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); setIsSubmitting(true);
      const supabase = getSupabase();
      if (!supabase) return;

      const payload = {
          ...agentForm,
          photo_url: agentPhotoPreview || 'https://images.unsplash.com/photo-1560250097-0b93528c311a'
      };

      let error;
      if (editingAgentId) {
          // Update Mode
          const { error: err } = await supabase.from('agents').update(payload).eq('id', editingAgentId);
          error = err;
      } else {
          // Create Mode
          const { error: err } = await supabase.from('agents').insert({
              id: Date.now().toString(),
              ...payload
          });
          error = err;
      }

      if (!error) { 
          alert(editingAgentId ? "Agent Updated!" : "Agent Created!"); 
          fetchAdminData(); 
          cancelEditAgent();
      } else {
          alert(error.message);
      }
      setIsSubmitting(false);
  };

  const handleCommSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('communities').insert({
      id: Date.now().toString(), ...commForm, image_url: commImagePreview || 'https://images.unsplash.com/photo-1512453979798-5ea904ac66de'
    });
    if (!error) { alert("Community Added!"); fetchAdminData(); } else alert(error.message);
    setIsSubmitting(false);
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
     e.preventDefault(); setIsSubmitting(true);
     const supabase = getSupabase();
     if (!supabase) return;
     const { error } = await supabase.from('blog_posts').insert({
        id: Date.now().toString(),
        title: blogForm.title,
        content: blogForm.content,
        image_url: blogImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
     });
     if (!error) { alert("Blog Posted!"); setBlogForm({title:'',content:''}); setBlogImage(''); } else alert(error.message);
     setIsSubmitting(false);
  };

  if (!currentAgent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-20">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="text-gold-400" size={32} />
            </div>
            <h1 className="text-2xl font-serif text-slate-900 font-bold">Agent Portal</h1>
            <p className="text-gray-500 text-sm mt-2">Please log in to access the dashboard.</p>
          </div>
          
          {authError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4 border border-red-100">{authError}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
             <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 border border-gray-300 rounded-sm" />
             <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Password" className="w-full px-4 py-3 border border-gray-300 rounded-sm" />
             <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-sm hover:bg-gold-500 uppercase tracking-wider font-bold">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="bg-slate-900 rounded-t-lg px-8 py-6 flex justify-between items-center shadow-lg mb-6">
            <div className="flex items-center gap-4"><img src={currentAgent.photoUrl} className="w-12 h-12 rounded-full border-2 border-gold-400" alt="Profile" /><div><h1 className="text-xl font-serif text-white">{currentAgent.name}</h1><p className="text-gold-500 text-xs uppercase">{currentAgent.role}</p></div></div>
            <div className="flex items-center gap-4"><button onClick={handleLogout} className="text-gray-400 hover:text-white text-xs flex items-center gap-1"><LogOut size={12}/> Logout</button><button onClick={() => setShowScript(true)} className="bg-slate-800 text-gold-500 px-3 py-1 rounded text-xs border border-slate-700 hover:border-gold-500"><Wrench size={12} className="inline mr-1"/> Repair / Show Script</button></div>
        </div>

        {showScript && (
            <div className="bg-orange-50 border border-orange-200 p-6 mb-6 rounded relative">
                <h3 className="font-bold text-orange-900 mb-2">DB Update Script (Run in Supabase)</h3>
                <pre className="bg-slate-900 text-gray-300 p-3 rounded text-xs overflow-auto max-h-48 font-mono">{SETUP_SQL_SCRIPT}</pre>
                <button onClick={() => navigator.clipboard.writeText(SETUP_SQL_SCRIPT)} className="absolute top-4 right-4 bg-gold-500 text-white px-3 py-1 text-xs rounded">Copy SQL</button>
            </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
            {['properties','agents','leads','communities', 'blog', 'settings'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium capitalize ${activeTab === tab ? 'border-b-2 border-gold-500 text-slate-900' : 'text-gray-500'}`}>{tab}</button>
            ))}
        </div>

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
           <div className="bg-white p-8 rounded shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-bold">Add Property</h2>
                 <button onClick={handleSeedOffPlan} disabled={isSeeding} className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded text-xs border border-purple-200 flex items-center gap-1">{isSeeding ? <Loader2 size={12} className="animate-spin"/> : <Download size={12}/>} Load Al Nair</button>
               </div>
               {isSuccess && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 flex items-center gap-2"><FileCheck size={16}/> Published Successfully!</div>}
               <form onSubmit={handlePropSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ... Property Form Inputs ... */}
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded border border-gray-200">
                     <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Basic Information</label>
                     <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Listing Title" required value={propForm.title} onChange={e=>setPropForm({...propForm, title: e.target.value})} className="w-full border p-2 rounded" />
                        <input type="text" placeholder="Project Name" value={propForm.projectName || ''} onChange={e=>setPropForm({...propForm, projectName: e.target.value})} className="w-full border p-2 rounded" />
                        <input type="text" placeholder="Developer" value={propForm.developer || ''} onChange={e=>setPropForm({...propForm, developer: e.target.value})} className="w-full border p-2 rounded" />
                        <select value={propForm.type} onChange={e=>setPropForm({...propForm, type: e.target.value as any})} className="w-full border p-2 rounded">
                            <option value="sale">For Sale</option>
                            <option value="rent">For Rent</option>
                            <option value="off-plan">Off-Plan</option>
                            <option value="uk-investment">UK Investment</option>
                        </select>
                     </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                     <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Price & Status</label>
                     <div className="space-y-3">
                        <div className="flex gap-2">
                           <select value={propForm.currency} onChange={e=>setPropForm({...propForm, currency: e.target.value as any})} className="w-24 border p-2 rounded font-bold">
                              <option value="AED">AED</option>
                              <option value="GBP">GBP</option>
                           </select>
                           <input type="number" placeholder="Current Asking Price" required value={propForm.price} onChange={e=>setPropForm({...propForm, price: parseFloat(e.target.value)})} className="flex-grow border p-2 rounded" />
                        </div>
                        <div className="flex items-center gap-2 bg-red-50 p-2 rounded border border-red-100">
                           <input type="checkbox" checked={propForm.isDistress} onChange={e=>setPropForm({...propForm, isDistress: e.target.checked})} className="w-4 h-4 text-red-600"/>
                           <label className="text-sm font-bold text-red-800">Distress Deal?</label>
                           {propForm.isDistress && (
                              <input type="number" placeholder="Original Price" value={propForm.originalPrice || ''} onChange={e=>setPropForm({...propForm, originalPrice: parseFloat(e.target.value)})} className="w-32 border p-1 text-sm rounded ml-auto"/>
                           )}
                        </div>
                        <select value={propForm.status} onChange={e=>setPropForm({...propForm, status: e.target.value})} className="w-full border p-2 rounded">
                           <option value="Active">Active</option>
                           <option value="Sold">Sold</option>
                           <option value="Ready to Move-in">Ready to Move-in</option>
                           {propForm.type === 'rent' && <option value="Rented">Rented</option>}
                        </select>
                     </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                     <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Property Specs</label>
                     <div className="grid grid-cols-2 gap-3">
                        <select value={propForm.propertyType} onChange={e=>setPropForm({...propForm, propertyType: e.target.value})} className="col-span-2 border p-2 rounded">
                           {PROPERTY_TYPES_LIST.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={propForm.bedType} onChange={e=>setPropForm({...propForm, bedType: e.target.value})} className="border p-2 rounded">
                           {BED_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={propForm.bathType} onChange={e=>setPropForm({...propForm, bathType: e.target.value})} className="border p-2 rounded">
                           {BATH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input type="number" placeholder="Size (Sqft)" value={propForm.sqft} onChange={e=>setPropForm({...propForm, sqft: parseFloat(e.target.value)})} className="border p-2 rounded"/>
                        <input type="number" placeholder="Size (Sqm)" value={propForm.sizeSqm || ''} onChange={e=>setPropForm({...propForm, sizeSqm: parseFloat(e.target.value)})} className="border p-2 rounded"/>
                        <div className="col-span-2 flex items-center gap-2">
                           <input type="checkbox" checked={propForm.studyRoom} onChange={e=>setPropForm({...propForm, studyRoom: e.target.checked})}/>
                           <label className="text-sm">Has Study Room?</label>
                        </div>
                     </div>
                  </div>
                  <div className="md:col-span-2 bg-yellow-50 p-4 rounded border border-yellow-200">
                     <label className="text-xs font-bold text-yellow-800 uppercase mb-2 block flex items-center gap-2"><MapPin size={14}/> Location & Community</label>
                     
                     {/* Region and Community Dropdowns */}
                     <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <select 
                           value={selectedRegion} 
                           onChange={e => {
                               setSelectedRegion(e.target.value);
                               setPropForm({...propForm, location: ''}); // Reset sub-community
                           }} 
                           className="border p-2 rounded font-medium"
                        >
                            <option value="">-- Select Region --</option>
                            {COMMUNITY_STRUCTURE.map(region => (
                                <option key={region.label} value={region.label}>{region.label}</option>
                            ))}
                        </select>

                        <select 
                           value={propForm.location} 
                           onChange={e => setPropForm({...propForm, location: e.target.value})} 
                           disabled={!selectedRegion}
                           className="border p-2 rounded"
                        >
                            <option value="">-- Select Community --</option>
                            {selectedRegion && COMMUNITY_STRUCTURE.find(c => c.label === selectedRegion)?.subItems?.map(sub => (
                                <option key={sub.label} value={sub.label}>{sub.label}</option>
                            ))}
                        </select>
                     </div>

                     <div className="flex gap-2 mb-2">
                        <input type="number" placeholder="Lat" className="w-24 border p-2 rounded bg-white" readOnly value={propForm.lat} />
                        <input type="number" placeholder="Lng" className="w-24 border p-2 rounded bg-white" readOnly value={propForm.lng} />
                        <span className="text-xs text-gray-500 self-center">Click map to set precise coords</span>
                     </div>
                     <div className="h-64 w-full rounded border border-gray-300 overflow-hidden relative z-0">
                         <MapContainer center={[propForm.lat || 25.2048, propForm.lng || 55.2708]} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                            <LocationPicker 
                                lat={propForm.lat || 25.2048} 
                                lng={propForm.lng || 55.2708} 
                                onLocationSelect={(lat, lng) => setPropForm({...propForm, lat, lng})} 
                            />
                         </MapContainer>
                     </div>
                  </div>
                  {propForm.type === 'rent' && (
                     <div className="md:col-span-2 bg-blue-50 p-4 rounded border border-blue-100 grid grid-cols-2 gap-4">
                        <label className="col-span-2 text-xs font-bold text-blue-800 uppercase">Rental Details</label>
                        <select value={propForm.rentalFreq} onChange={e=>setPropForm({...propForm, rentalFreq: e.target.value as any})} className="border p-2 rounded">
                           <option value="yearly">Yearly</option>
                           <option value="monthly">Monthly</option>
                        </select>
                        <select value={propForm.cheques} onChange={e=>setPropForm({...propForm, cheques: e.target.value})} className="border p-2 rounded">
                           <option value="">No. of Cheques</option>
                           {RENT_CHEQUES.map(c => <option key={c} value={c}>{c} Cheques</option>)}
                        </select>
                     </div>
                  )}
                  <div className="md:col-span-2 bg-slate-100 p-4 rounded border border-slate-300">
                     <label className="text-xs font-bold text-slate-700 uppercase mb-2 block flex items-center gap-2"><ShieldAlert size={14}/> Internal Information (Private)</label>
                     <div className="grid md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Ref ID (e.g. Mimi_Sale-001)" value={propForm.referenceId || ''} onChange={e=>setPropForm({...propForm, referenceId: e.target.value})} className="border p-2 rounded"/>
                        <select value={propForm.nocStatus} onChange={e=>setPropForm({...propForm, nocStatus: e.target.value as any})} className="border p-2 rounded">
                           <option value="No">NOC: No</option>
                           <option value="Yes">NOC: Yes</option>
                           <option value="Other Agents">NOC: Other Agents</option>
                        </select>
                        
                        {/* Only Admin can see this dropdown to assign other agents */}
                        {currentAgent.role === 'admin' ? (
                            <select value={propForm.listingAgentId} onChange={e=>setPropForm({...propForm, listingAgentId: e.target.value})} className="border p-2 rounded">
                                <option value="">-- Assign To Agent (Optional) --</option>
                                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        ) : (
                            <div className="p-2 border rounded bg-gray-200 text-gray-500 text-sm">
                                Agent: {currentAgent.name} (Auto-assigned)
                            </div>
                        )}
                        
                        <input type="date" placeholder="NOC Start" value={propForm.nocStartDate || ''} onChange={e=>setPropForm({...propForm, nocStartDate: e.target.value})} className="border p-2 rounded text-sm"/>
                        <input type="date" placeholder="NOC End" value={propForm.nocEndDate || ''} onChange={e=>setPropForm({...propForm, nocEndDate: e.target.value})} className="border p-2 rounded text-sm"/>
                     </div>
                  </div>
                  <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Image URL</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="https://..." value={imagePreview} onChange={e=>setImagePreview(e.target.value)} className="flex-grow border p-2 rounded" />
                        <label className="bg-gray-100 px-3 py-2 rounded cursor-pointer hover:bg-gray-200"><Upload size={16}/><input type="file" className="hidden" onChange={(e)=>{if(e.target.files?.[0]) { const r = new FileReader(); r.onload=()=>setImagePreview(r.result as string); r.readAsDataURL(e.target.files[0]); }}}/></label>
                      </div>
                      <textarea placeholder="Description..." value={propForm.description} onChange={e=>setPropForm({...propForm, description: e.target.value})} className="w-full border p-2 rounded mt-2 h-24"/>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                      <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white px-8 py-3 rounded hover:bg-gold-500 transition-colors uppercase tracking-wider font-bold">{isSubmitting ? 'Saving...' : 'Publish Property'}</button>
                  </div>
               </form>
           </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
           <div className="bg-white p-8 rounded shadow-sm">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-bold">Manage Agents</h2>
                 <button onClick={fetchAdminData} className="text-gold-500"><RefreshCw size={16}/></button>
               </div>
               
               {/* AGENT FORM (Create or Edit) */}
               {currentAgent.role === 'admin' && (
                  <form onSubmit={handleAgentSubmit} className={`mb-8 p-6 border rounded ${editingAgentId ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                      <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${editingAgentId ? 'text-orange-900' : 'text-blue-900'}`}>
                          {editingAgentId ? <><Pencil size={16}/> Edit Agent Profile</> : <><UserPlus size={16}/> Create New Agent Profile</>}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input required type="text" placeholder="Full Name" value={agentForm.name} onChange={e=>setAgentForm({...agentForm, name: e.target.value})} className="border p-2 rounded bg-white" />
                          <input required type="email" placeholder="Email (Login)" value={agentForm.email} onChange={e=>setAgentForm({...agentForm, email: e.target.value})} className="border p-2 rounded bg-white" />
                          <input required type="tel" placeholder="Phone" value={agentForm.phone} onChange={e=>setAgentForm({...agentForm, phone: e.target.value})} className="border p-2 rounded bg-white" />
                          <input required type="tel" placeholder="WhatsApp (No spaces)" value={agentForm.whatsapp} onChange={e=>setAgentForm({...agentForm, whatsapp: e.target.value})} className="border p-2 rounded bg-white" />
                          <input required type="password" placeholder="Password" value={agentForm.password} onChange={e=>setAgentForm({...agentForm, password: e.target.value})} className="border p-2 rounded bg-white" />
                          <div className="flex gap-2">
                              <input type="text" placeholder="Photo URL" value={agentPhotoPreview} onChange={e=>setAgentPhotoPreview(e.target.value)} className="flex-grow border p-2 rounded bg-white" />
                              <label className="bg-white border px-3 py-2 rounded cursor-pointer hover:bg-gray-100"><Upload size={16}/><input type="file" className="hidden" onChange={(e)=>{if(e.target.files?.[0]) { const r = new FileReader(); r.onload=()=>setAgentPhotoPreview(r.result as string); r.readAsDataURL(e.target.files[0]); }}}/></label>
                          </div>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                          {editingAgentId && <button type="button" onClick={cancelEditAgent} className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm flex items-center gap-1"><X size={14}/> Cancel</button>}
                          <button type="submit" disabled={isSubmitting} className={`text-white px-4 py-2 rounded text-sm ${editingAgentId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                              {isSubmitting ? 'Saving...' : (editingAgentId ? 'Update Agent' : 'Create Agent')}
                          </button>
                      </div>
                  </form>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map(agent => (
                      <div key={agent.id} className="border p-4 rounded flex items-center justify-between bg-white shadow-sm group">
                          <div className="flex items-center gap-4">
                              <img src={agent.photoUrl} className="w-16 h-16 rounded-full object-cover border border-gray-200" alt={agent.name}/>
                              <div>
                                  <p className="font-bold text-slate-900">{agent.name}</p>
                                  <p className="text-xs text-gray-500">{agent.email}</p>
                              </div>
                          </div>
                          {currentAgent.role === 'admin' && (
                              <button onClick={() => handleEditAgent(agent)} className="text-gray-400 hover:text-orange-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity" title="Edit Agent">
                                  <Pencil size={16} />
                              </button>
                          )}
                      </div>
                  ))}
               </div>
           </div>
        )}

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
           <div className="bg-white p-8 rounded shadow-sm">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold">Inquiries & Leads</h2>
                 <button onClick={fetchAdminData} className="bg-gray-100 p-2 rounded hover:bg-gray-200"><RefreshCw size={16}/></button>
               </div>
               
               {leads.length === 0 ? (
                 <div className="text-center py-10 text-gray-400 italic">No inquiries yet.</div>
               ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-left border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-bold text-slate-700">Name</th>
                                <th className="p-4 font-bold text-slate-700">Contact</th>
                                <th className="p-4 font-bold text-slate-700">Interest</th>
                                <th className="p-4 font-bold text-slate-700">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map(lead => (
                                <tr key={lead.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium text-slate-900">{lead.name}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline flex items-center gap-1"><Mail size={12}/> {lead.email}</a>
                                            <span className="text-gray-500 text-xs">{lead.phone}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {lead.propertyId === 'general-inquiry' ? (
                                            <span className="bg-gold-100 text-gold-800 px-2 py-1 rounded text-xs font-bold">Invest In Future</span>
                                        ) : (
                                            <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs">Prop ID: {lead.propertyId}</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
               )}
           </div>
        )}

        {/* COMMUNITIES TAB */}
        {activeTab === 'communities' && (
           <div className="bg-white p-8 rounded shadow-sm">
             <h2 className="text-lg font-bold mb-4">Manage Communities</h2>
             <form onSubmit={handleCommSubmit} className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded">
                <div className="grid gap-4">
                   <input type="text" placeholder="Community Title" required value={commForm.title} onChange={e=>setCommForm({...commForm, title: e.target.value})} className="border p-2 rounded"/>
                   <textarea placeholder="Description" required value={commForm.description} onChange={e=>setCommForm({...commForm, description: e.target.value})} className="border p-2 rounded"/>
                   <div className="flex gap-2"><input type="text" placeholder="Image URL" value={commImagePreview} onChange={e=>setCommImagePreview(e.target.value)} className="flex-grow border p-2 rounded" /><label className="bg-gray-100 px-3 py-2 rounded cursor-pointer hover:bg-gray-200"><Upload size={16}/><input type="file" className="hidden" onChange={(e)=>{if(e.target.files?.[0]) { const r = new FileReader(); r.onload=()=>setCommImagePreview(r.result as string); r.readAsDataURL(e.target.files[0]); }}}/></label></div>
                   <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-gold-500">{isSubmitting ? 'Saving...' : 'Add Community'}</button>
                </div>
             </form>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{communities.map(comm => <div key={comm.id} className="border p-4 rounded flex gap-4"><img src={comm.imageUrl} className="w-24 h-24 object-cover rounded" alt={comm.title}/><div><h3 className="font-bold">{comm.title}</h3></div></div>)}</div>
           </div>
        )}
        
        {/* BLOG TAB */}
        {activeTab === 'blog' && (
           <div className="bg-white p-8 rounded shadow-sm">
             <h2 className="text-lg font-bold mb-4">Blog & SEO</h2>
             <form onSubmit={handleBlogSubmit} className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded">
                <div className="grid gap-4">
                   <input type="text" placeholder="Blog Post Title" required value={blogForm.title} onChange={e=>setBlogForm({...blogForm, title: e.target.value})} className="border p-2 rounded"/>
                   <textarea placeholder="Article Content..." required value={blogForm.content} onChange={e=>setBlogForm({...blogForm, content: e.target.value})} className="border p-2 rounded h-32"/>
                   <div className="flex gap-2"><input type="text" placeholder="Header Image URL" value={blogImage} onChange={e=>setBlogImage(e.target.value)} className="flex-grow border p-2 rounded" /><label className="bg-gray-100 px-3 py-2 rounded cursor-pointer hover:bg-gray-200"><Upload size={16}/><input type="file" className="hidden" onChange={(e)=>{if(e.target.files?.[0]) { const r = new FileReader(); r.onload=()=>setBlogImage(r.result as string); r.readAsDataURL(e.target.files[0]); }}}/></label></div>
                   <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-gold-500">{isSubmitting ? 'Posting...' : 'Publish Article'}</button>
                </div>
             </form>
             <div className="text-xs text-gray-500">Note: Blog posts appear at the bottom of the Off-Plan page for SEO purposes.</div>
           </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
            <div className="bg-white p-8 rounded shadow-sm">
               <h2 className="text-lg font-bold mb-4">Brand Settings</h2>
               <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="border p-4 rounded bg-gray-50 text-center"><img src={logoPreview} className="h-32 object-contain mx-auto mb-2" alt="Logo"/><p className="text-xs text-gray-500">Current Logo Preview</p></div>
                   <div className="flex-grow space-y-4"><div><label className="block text-sm font-bold text-gray-700 mb-2">Upload New Logo (Image File)</label><input type="file" accept="image/*" onChange={handleLogoFileUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/></div><div className="pt-4 border-t border-gray-100 flex gap-4"><button onClick={handleSaveLogo} disabled={!hasUnsavedLogo} className="bg-gold-500 text-white px-6 py-2 rounded text-sm font-bold hover:bg-gold-600 disabled:opacity-50 shadow-md">{isProcessingLogo ? 'Saving...' : 'Save Brand Settings'}</button></div></div>
               </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
