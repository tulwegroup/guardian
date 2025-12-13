
import React, { useState, useEffect } from 'react';
import { Lock, Upload, Wrench, LayoutGrid, Users, FileText, MapPin, UserPlus, Download, LogOut, Loader2, DollarSign, FileCheck, ShieldAlert, ArrowRight, RefreshCw, Mail, Pencil, X, Trash2, Briefcase } from 'lucide-react';
import { Property, Agent, Community, Lead, Job, BlogPost } from '../types';
import { getSupabase } from '../lib/supabase';
import { INITIAL_PROPERTIES, INITIAL_AGENTS, ALNAIR_PROJECTS, COMMUNITY_STRUCTURE } from '../constants';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useSearchParams } from 'react-router-dom';

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

CREATE TABLE IF NOT EXISTS jobs (
  id text primary key,
  title text not null,
  department text,
  location text,
  type text,
  description text,
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
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

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
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('properties');
  const [dbStatus, setDbStatus] = useState<'disconnected' | 'connected' | 'error' | 'missing_tables'>('disconnected');
  const [showScript, setShowScript] = useState(false);
  
  // Data Store
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [adminProperties, setAdminProperties] = useState<Property[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  
  // --- FORMS ---
  const [logoPreview, setLogoPreview] = useState<string>(currentLogoUrl);
  const [hasUnsavedLogo, setHasUnsavedLogo] = useState(false);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);

  // Extended Property Form
  const initialPropForm: Partial<Property> = {
    title: '', price: 0, currency: 'AED', location: '', type: 'sale', status: 'Active',
    propertyType: 'Apartment', beds: 1, bedType: '1 BHK', baths: 1, bathType: '1 BATH',
    sqft: 0, sizeSqm: 0, description: '', isFeatured: false, lat: 25.2048, lng: 55.2708,
    isDistress: false, originalPrice: 0, studyRoom: false,
    rentalFreq: 'yearly', cheques: '1',
    referenceId: '', nocStatus: 'No',
    listingAgentId: ''
  };
  const [propForm, setPropForm] = useState<Partial<Property>>(initialPropForm);
  const [editingPropId, setEditingPropId] = useState<string | null>(null);

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

  // Job Form
  const [jobForm, setJobForm] = useState({ title: '', department: 'Sales', location: 'Dubai, UAE', type: 'Full-time', description: '' });

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
        if (parsed && parsed.photo_url && !parsed.photoUrl) {
            parsed.photoUrl = parsed.photo_url;
        }
        if (parsed?.id) setCurrentAgent(parsed);
      } catch (e) { localStorage.removeItem('guardian_admin_session'); }
    }
  }, []);

  // Handle Deep Linking for Edit
  useEffect(() => {
    const editId = searchParams.get('editPropId');
    if (editId && adminProperties.length > 0) {
        const propToEdit = adminProperties.find(p => p.id === editId);
        if (propToEdit) {
            handleEditProperty(propToEdit);
            setActiveTab('properties');
        }
    }
  }, [searchParams, adminProperties]);

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
    
    // Fetch Properties for management
    const { data: propData } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    if (propData) {
        // Map snake_case to camelCase for internal use
        const mappedProps = propData.map((p: any) => ({
             ...p, imageUrl: p.image_url, isFeatured: p.is_featured, agentId: p.agent_id, 
             projectName: p.project_name, originalPrice: p.original_price, isDistress: p.is_distress,
             propertyType: p.property_type, sizeSqm: p.size_sqm, bedType: p.bed_type, bathType: p.bath_type,
             studyRoom: p.study_room, rentalFreq: p.rental_freq, referenceId: p.reference_id, nocStatus: p.noc_status,
             nocStartDate: p.noc_start_date, nocEndDate: p.noc_end_date, listingAgentId: p.listing_agent_id
        }));
        setAdminProperties(mappedProps);
    }

    const { data: leadData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (leadData) {
      const mappedLeads: Lead[] = leadData.map((l: any) => ({
        id: l.id, name: l.name, email: l.email, phone: l.phone, propertyId: l.property_id, createdAt: l.created_at, message: l.message
      }));
      setLeads(mappedLeads);
    }
    
    const { data: agentData } = await supabase.from('agents').select('*');
    if (agentData) {
        const mappedAgents: Agent[] = agentData.map((a: any) => ({
            id: a.id, name: a.name, email: a.email, phone: a.phone, whatsapp: a.whatsapp, role: a.role, photoUrl: a.photo_url || a.photoUrl, password: a.password
        }));
        setAgents(mappedAgents);
    }

    const { data: commData } = await supabase.from('communities').select('*');
    if (commData) {
        const mappedComms: Community[] = commData.map((c: any) => ({
            id: c.id, title: c.title, description: c.description, imageUrl: c.image_url
        }));
        setCommunities(mappedComms);
    }

    const { data: jobData } = await supabase.from('jobs').select('*');
    if (jobData) {
        const mappedJobs: Job[] = jobData.map((j: any) => ({
            id: j.id, title: j.title, department: j.department, location: j.location, type: j.type, description: j.description, createdAt: j.created_at
        }));
        setJobs(mappedJobs);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const supabase = getSupabase();
    
    // No supabase client? Fallback
    if (!supabase && loginPass === 'guardian2024') {
        const demoAgent = INITIAL_AGENTS[0];
        setCurrentAgent(demoAgent);
        localStorage.setItem('guardian_admin_session', JSON.stringify(demoAgent));
        return;
    }

    if (supabase) {
        const { data } = await supabase.from('agents').select('*').eq('email', loginEmail).eq('password', loginPass).single();
        if (data) {
            const loggedInAgent: Agent = {
                id: data.id, name: data.name, email: data.email, phone: data.phone, whatsapp: data.whatsapp, role: data.role as 'admin' | 'agent', photoUrl: data.photo_url || data.photoUrl, password: data.password
            };
            setCurrentAgent(loggedInAgent);
            localStorage.setItem('guardian_admin_session', JSON.stringify(loggedInAgent));
        } else if (loginEmail === 'hello@guardianhousing.ae' && loginPass === 'guardian2024') {
             // AUTO-CREATE ADMIN
             const { data: newAdmin } = await supabase.from('agents').upsert({
                id: 'master-admin', name: 'Guardian Admin', email: 'hello@guardianhousing.ae', phone: '+971505804669', whatsapp: '971505804669', photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200', role: 'admin', password: 'guardian2024'
             }).select().single();
             if (newAdmin) {
                 const adminAgent: Agent = {
                     id: newAdmin.id, name: newAdmin.name, email: newAdmin.email, phone: newAdmin.phone, whatsapp: newAdmin.whatsapp, role: 'admin', photoUrl: newAdmin.photo_url, password: newAdmin.password
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
        alert(`Failed: ${e.message}.`); 
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

    let assignedAgentId = currentAgent?.id || 'master-admin';
    if (currentAgent?.role === 'admin' && propForm.listingAgentId) {
        assignedAgentId = propForm.listingAgentId;
    }

    const newPropertyPayload = {
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
        if (editingPropId) {
            const { error } = await supabase.from('properties').update(newPropertyPayload).eq('id', editingPropId);
            if (error) { alert(`DB Error: ${error.message}`); setIsSubmitting(false); return; }
        } else {
            const { error } = await supabase.from('properties').insert({
                id: Date.now().toString(),
                ...newPropertyPayload
            });
            if (error) { alert(`DB Error: ${error.message}`); setIsSubmitting(false); return; }
        }
        window.dispatchEvent(new Event('supabase-config-updated'));
        fetchAdminData();
        handleCancelPropEdit();
    }
    setIsSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleEditProperty = (prop: Property) => {
    setEditingPropId(prop.id);
    setPropForm({ ...prop });
    setImagePreview(prop.imageUrl);
    setSelectedRegion(''); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('properties').delete().eq('id', id);
    fetchAdminData();
    window.dispatchEvent(new Event('supabase-config-updated'));
  };

  const handleCancelPropEdit = () => {
    setEditingPropId(null);
    setPropForm(initialPropForm);
    setImagePreview('');
  };

  // GENERIC DELETE (Community)
  const handleDeleteCommunity = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('communities').delete().eq('id', id);
    fetchAdminData();
  };
  
  // JOB MANAGEMENT
  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('jobs').insert({
        id: Date.now().toString(),
        ...jobForm
    });
    if (!error) { alert("Job Posted!"); setJobForm({title:'', department:'Sales', location:'Dubai, UAE', type:'Full-time', description:''}); fetchAdminData(); } 
    else alert(error.message);
    setIsSubmitting(false);
  };

  const handleDeleteJob = async (id: string) => {
      if (!window.confirm("Delete this job opening?")) return;
      const supabase = getSupabase();
      if (!supabase) return;
      await supabase.from('jobs').delete().eq('id', id);
      fetchAdminData();
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgentId(agent.id);
    setAgentForm({ name: agent.name, email: agent.email, phone: agent.phone, whatsapp: agent.whatsapp, password: agent.password, role: agent.role });
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

      const payload = { ...agentForm, photo_url: agentPhotoPreview || 'https://images.unsplash.com/photo-1560250097-0b93528c311a' };
      let error;
      let newAgentData: Agent | null = null;

      if (editingAgentId) {
          const { error: err, data } = await supabase.from('agents').update(payload).eq('id', editingAgentId).select().single();
          error = err;
          if (data) newAgentData = { ...data, photoUrl: data.photo_url } as Agent;
      } else {
          const { error: err } = await supabase.from('agents').insert({ id: Date.now().toString(), ...payload });
          error = err;
      }

      if (!error) { 
          alert(editingAgentId ? "Profile Updated!" : "Agent Created!"); 
          if (editingAgentId === currentAgent.id && newAgentData) {
              const updatedSession = { ...currentAgent, ...newAgentData };
              setCurrentAgent(updatedSession);
              localStorage.setItem('guardian_admin_session', JSON.stringify(updatedSession));
          }
          fetchAdminData(); cancelEditAgent();
      } else { alert(error.message); }
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
        id: Date.now().toString(), title: blogForm.title, content: blogForm.content, image_url: blogImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
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
            <h1 className="text-2xl font-serif text-slate-900 font-bold">Admin Portal</h1>
            <p className="text-gray-500 text-sm mt-2">Authorized Personnel Only</p>
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
            <div className="flex items-center gap-4">
                <img src={currentAgent.photoUrl} className="w-12 h-12 rounded-full border-2 border-gold-400" alt="Profile" />
                <div>
                    <h1 className="text-xl font-serif text-white">{currentAgent.name}</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-gold-500 text-xs uppercase">{currentAgent.role}</p>
                        <button onClick={() => { setActiveTab('agents'); handleEditAgent(currentAgent); }} className="text-gray-400 hover:text-white text-xs flex items-center gap-1 ml-2 border border-gray-700 rounded px-2 py-0.5"><Pencil size={10}/> Edit Profile</button>
                    </div>
                </div>
            </div>
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
            {['properties','agents','leads','communities', 'blog', 'careers', 'settings'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium capitalize ${activeTab === tab ? 'border-b-2 border-gold-500 text-slate-900' : 'text-gray-500'}`}>{tab}</button>
            ))}
        </div>

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
           <div className="bg-white p-8 rounded shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-bold">{editingPropId ? 'Edit Property' : 'Add Property'}</h2>
                 <button onClick={handleSeedOffPlan} disabled={isSeeding} className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded text-xs border border-purple-200 flex items-center gap-1">{isSeeding ? <Loader2 size={12} className="animate-spin"/> : <Download size={12}/>} Load Al Nair</button>
               </div>
               
               {isSuccess && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 flex items-center gap-2"><FileCheck size={16}/> {editingPropId ? 'Updated Successfully' : 'Published Successfully'}</div>}
               
               <form onSubmit={handlePropSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 border-b border-gray-100 pb-12">
                  {/* ... FORM FIELDS SAME AS BEFORE ... */}
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
                     </div>
                  </div>
                  <div className="md:col-span-2 bg-yellow-50 p-4 rounded border border-yellow-200">
                     <label className="text-xs font-bold text-yellow-800 uppercase mb-2 block flex items-center gap-2"><MapPin size={14}/> Location & Community</label>
                     <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <select value={selectedRegion} onChange={e => {setSelectedRegion(e.target.value); setPropForm({...propForm, location: ''});}} className="border p-2 rounded font-medium">
                            <option value="">-- Select Region --</option>
                            {COMMUNITY_STRUCTURE.map(region => (<option key={region.label} value={region.label}>{region.label}</option>))}
                        </select>
                        <select value={propForm.location} onChange={e => setPropForm({...propForm, location: e.target.value})} disabled={!selectedRegion} className="border p-2 rounded">
                            <option value="">-- Select Community --</option>
                            {selectedRegion && COMMUNITY_STRUCTURE.find(c => c.label === selectedRegion)?.subItems?.map(sub => (<option key={sub.label} value={sub.label}>{sub.label}</option>))}
                        </select>
                     </div>
                     <div className="h-64 w-full rounded border border-gray-300 overflow-hidden relative z-0">
                         <MapContainer center={[propForm.lat || 25.2048, propForm.lng || 55.2708]} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                            <LocationPicker lat={propForm.lat || 25.2048} lng={propForm.lng || 55.2708} onLocationSelect={(lat, lng) => setPropForm({...propForm, lat, lng})} />
                         </MapContainer>
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
                  <div className="md:col-span-2 flex justify-end gap-3">
                      {editingPropId && <button type="button" onClick={handleCancelPropEdit} className="text-gray-600 px-4 py-2 hover:text-gray-900 border border-gray-300 rounded">Cancel</button>}
                      <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white px-8 py-3 rounded hover:bg-gold-500 transition-colors uppercase tracking-wider font-bold">{isSubmitting ? 'Saving...' : (editingPropId ? 'Update Property' : 'Publish Property')}</button>
                  </div>
               </form>
               
               <h3 className="text-xl font-bold mb-4">Manage Properties</h3>
               <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                       <thead className="bg-gray-100 uppercase text-xs font-bold text-gray-500"><tr><th className="px-4 py-3">Property</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                       <tbody className="divide-y divide-gray-100">
                           {adminProperties.map(p => (
                               <tr key={p.id} className="hover:bg-gray-50 group">
                                   <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={p.imageUrl} className="w-10 h-10 rounded object-cover" alt="thumb"/><div><p className="font-bold text-slate-900 line-clamp-1">{p.title}</p></div></div></td>
                                   <td className="px-4 py-3 font-medium text-slate-900">{p.price.toLocaleString()} {p.currency}</td>
                                   <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs uppercase font-bold">{p.type}</span></td>
                                   <td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button onClick={() => handleEditProperty(p)} className="text-gray-400 hover:text-blue-600 p-1"><Pencil size={16}/></button><button onClick={() => handleDeleteProperty(p.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16}/></button></div></td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </div>
        )}

        {activeTab === 'careers' && (
            <div className="bg-white p-8 rounded shadow-sm">
                <h2 className="text-lg font-bold mb-4">Manage Careers</h2>
                <form onSubmit={handleJobSubmit} className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded">
                    <div className="grid gap-4">
                        <input type="text" placeholder="Job Title" required value={jobForm.title} onChange={e=>setJobForm({...jobForm, title: e.target.value})} className="border p-2 rounded"/>
                        <div className="grid grid-cols-3 gap-4">
                            <input type="text" placeholder="Department" value={jobForm.department} onChange={e=>setJobForm({...jobForm, department: e.target.value})} className="border p-2 rounded"/>
                            <input type="text" placeholder="Location" value={jobForm.location} onChange={e=>setJobForm({...jobForm, location: e.target.value})} className="border p-2 rounded"/>
                            <input type="text" placeholder="Type (Full-time)" value={jobForm.type} onChange={e=>setJobForm({...jobForm, type: e.target.value})} className="border p-2 rounded"/>
                        </div>
                        <textarea placeholder="Job Description" required value={jobForm.description} onChange={e=>setJobForm({...jobForm, description: e.target.value})} className="border p-2 rounded h-24"/>
                        <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-gold-500">{isSubmitting ? 'Saving...' : 'Post Job'}</button>
                    </div>
                </form>
                <div className="space-y-4">
                    {jobs.map(job => (
                        <div key={job.id} className="border p-4 rounded flex justify-between items-center bg-white">
                            <div><h3 className="font-bold">{job.title}</h3><p className="text-xs text-gray-500">{job.department} • {job.location}</p></div>
                            <button onClick={() => handleDeleteJob(job.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {communities.map(comm => (
                     <div key={comm.id} className="border p-4 rounded flex justify-between items-center bg-white">
                        <div className="flex gap-4 items-center">
                            <img src={comm.imageUrl} className="w-16 h-16 object-cover rounded" alt={comm.title}/>
                            <div><h3 className="font-bold">{comm.title}</h3></div>
                        </div>
                        <button onClick={() => handleDeleteCommunity(comm.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button>
                     </div>
                 ))}
             </div>
           </div>
        )}

        {/* ... OTHER TABS (Agents, Leads, Settings) remain roughly same structure ... */}
        {activeTab === 'agents' && (
           <div className="bg-white p-8 rounded shadow-sm">
               {/* Agents list code */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map(agent => (
                      <div key={agent.id} className="border p-4 rounded flex items-center justify-between bg-white shadow-sm group">
                          <div className="flex items-center gap-4">
                              <img src={agent.photoUrl} className="w-16 h-16 rounded-full object-cover border border-gray-200" alt={agent.name}/>
                              <div><p className="font-bold text-slate-900">{agent.name}</p></div>
                          </div>
                          {(currentAgent.role === 'admin' || currentAgent.id === agent.id) && (
                              <button onClick={() => handleEditAgent(agent)} className="text-gray-400 hover:text-orange-500 p-2"><Pencil size={16} /></button>
                          )}
                      </div>
                  ))}
               </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
