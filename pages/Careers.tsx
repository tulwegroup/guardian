
import React, { useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

const OPENINGS = [
  {
    id: 1,
    title: "Senior Real Estate Consultant",
    department: "Sales",
    location: "Dubai, UAE",
    type: "Full-time",
    description: "We are looking for experienced consultants with a proven track record in Dubai real estate market."
  },
  {
    id: 2,
    title: "Off-Plan Specialist",
    department: "Sales",
    location: "Dubai, UAE",
    type: "Full-time",
    description: "Specialist needed for our growing off-plan division. Deep knowledge of Emaar, Sobha, and Damac projects required."
  },
  {
    id: 3,
    title: "Marketing Manager",
    department: "Marketing",
    location: "Dubai, UAE",
    type: "Full-time",
    description: "Lead our digital presence and lead generation campaigns."
  }
];

const Careers: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', position: '', linkedin: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('leads').insert({
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        property_id: `CAREER-APP: ${formData.position}`,
        message: `LinkedIn: ${formData.linkedin}`
      });
      
      if (!error) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', position: '', linkedin: '' });
      } else {
        alert("Error submitting application. Please try again.");
      }
    } else {
      // Fallback for no DB
      setTimeout(() => setSuccess(true), 1000);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <span className="text-gold-500 font-bold uppercase tracking-widest text-sm mb-4 block">Join Our Team</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Build Your Career With Guardian</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            We are always looking for exceptional talent to join our growing family. If you have a passion for real estate and a drive for excellence, we want to hear from you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Openings List */}
          <div>
            <h2 className="text-3xl font-serif text-slate-900 mb-8">Current Openings</h2>
            <div className="space-y-6">
              {OPENINGS.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded shadow-sm border border-gray-100 hover:border-gold-500 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-gold-600 transition-colors">{job.title}</h3>
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium">{job.department}</span>
                  </div>
                  <p className="text-gray-500 mb-4 text-sm">{job.description}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1"><MapPin size={12} /> {job.location}</div>
                    <div className="flex items-center gap-1"><Clock size={12} /> {job.type}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gold-50 p-8 rounded border border-gold-100">
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">Why Join Us?</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-gold-600" size={20}/> Competitive Commission Structure</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-gold-600" size={20}/> Premium Marketing Support</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-gold-600" size={20}/> Exclusive Off-Plan Inventory</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-gold-600" size={20}/> Continuous Training & Development</li>
              </ul>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white p-8 rounded shadow-lg border border-gray-100 h-fit sticky top-32">
            <h2 className="text-2xl font-serif text-slate-900 mb-6">Apply Now</h2>
            {success ? (
              <div className="text-center py-12 bg-green-50 rounded border border-green-100">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                <h3 className="text-xl font-bold text-green-800">Application Received</h3>
                <p className="text-green-700 mt-2">We will review your profile and get back to you soon.</p>
                <button onClick={() => setSuccess(false)} className="mt-6 text-sm text-green-800 font-bold underline">Submit another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-3 rounded focus:border-gold-500 outline-none" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border p-3 rounded focus:border-gold-500 outline-none" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border p-3 rounded focus:border-gold-500 outline-none" placeholder="+971 50 000 0000" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Position of Interest</label>
                  <select required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full border p-3 rounded focus:border-gold-500 outline-none">
                    <option value="">Select a role...</option>
                    <option value="Real Estate Consultant">Real Estate Consultant</option>
                    <option value="Off-Plan Specialist">Off-Plan Specialist</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Admin/Operations">Admin / Operations</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">LinkedIn Profile / Portfolio URL</label>
                  <input required type="url" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="w-full border p-3 rounded focus:border-gold-500 outline-none" placeholder="https://linkedin.com/in/..." />
                </div>
                
                <button disabled={isSubmitting} type="submit" className="w-full bg-slate-900 text-white py-4 font-bold hover:bg-gold-500 transition-colors uppercase tracking-widest mt-4 flex justify-center items-center gap-2">
                  {isSubmitting ? 'Sending...' : 'Submit Application'} {!isSubmitting && <ArrowRight size={16}/>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
    