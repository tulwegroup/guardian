

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Building2, Users, X } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { Property } from '../types';
import { PARTNERS } from '../constants';
import { getSupabase } from '../lib/supabase';

interface HomeProps {
  featuredProperties: Property[];
}

const VIDEOS = [
  "https://player.vimeo.com/external/371836666.sd.mp4?s=d9913106598c171e222956e1074e6f3044439c3e&profile_id=164&oauth2_token_id=57447761&v=2",
  "https://player.vimeo.com/external/494252666.sd.mp4?s=7b34e55e691129b053c0725a7732a30cb17173e6&profile_id=164&oauth2_token_id=57447761&v=2",
  "https://player.vimeo.com/external/369068415.sd.mp4?s=811654483863d666d9263a233405c48b2512f738&profile_id=164&oauth2_token_id=57447761&v=2"
];

const Home: React.FC<HomeProps> = ({ featuredProperties }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const errorCountRef = useRef(0);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVideoEnd = () => {
    errorCountRef.current = 0;
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEOS.length);
  };

  const handleVideoError = () => {
    if (errorCountRef.current < VIDEOS.length) {
      errorCountRef.current += 1;
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEOS.length);
    } else {
      setVideoError(true);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const supabase = getSupabase();
    
    // 1. Save to Database
    if (supabase) { 
        const { error } = await supabase.from('leads').insert({
            id: Date.now().toString(), // Use simple text ID for robustness
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            property_id: 'general-inquiry'
        });
        
        if (error) console.error("Lead Save Error:", error);
    }
    
    // 2. Simulate Email Sending (Client-Side)
    // NOTE: To send REAL emails, you would integrate EmailJS here.
    // Example: emailjs.send('service_id', 'template_id', { to_email: formData.email, name: formData.name })
    console.log("Simulating email to:", formData.email);

    setTimeout(() => {
       setIsSubmitting(false); 
       setSuccess(true);
       setTimeout(() => { 
           setShowLeadForm(false); 
           setSuccess(false); 
           setFormData({ name: '', email: '', phone: '' }); 
       }, 3000);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
        
        {videoError && (
           <img 
             src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071" 
             className="absolute inset-0 w-full h-full object-cover z-0 animate-fade-in"
             alt="Luxury Villa"
           />
        )}

        {!videoError && (
          <video 
            key={currentVideoIndex}
            src={VIDEOS[currentVideoIndex]}
            autoPlay 
            muted 
            playsInline
            preload="auto"
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            className="absolute inset-0 w-full h-full object-cover z-0"
            poster="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071"
          >
          </video>
        )}

        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-6">
          <span className="text-gold-400 tracking-[0.3em] uppercase text-sm md:text-base font-medium mb-4 animate-fade-in-up">
            Guardian Housing Real Estate
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-8 leading-tight max-w-4xl drop-shadow-lg">
            From House to Home <br/> We Create Stories
          </h1>
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <Link to="/buy" className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-medium uppercase tracking-wider transition-all rounded-sm shadow-lg hover:shadow-gold-500/20">
              Find Your Home
            </Link>
            <button 
              onClick={() => setShowLeadForm(true)}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium uppercase tracking-wider transition-all rounded-sm"
            >
              Invest in Future
            </button>
          </div>
        </div>
      </section>

      {/* LEAD FORM MODAL (Global) */}
      {showLeadForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-none shadow-2xl max-w-md w-full p-8 animate-fade-in relative border-t-4 border-gold-500">
            <button onClick={() => setShowLeadForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">✕</button>
            
            <h3 className="text-3xl font-serif text-slate-900 mb-2 text-center">Get In Touch</h3>
            <p className="text-center text-gray-500 text-sm mb-8 italic">Start your investment journey with us.</p>
            
            {success ? (
                <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                <h4 className="text-xl font-bold text-slate-900">Request Sent</h4>
                <p className="text-gray-500 mt-2 text-sm">A confirmation has been sent to your email.</p>
                <p className="text-gray-400 text-xs mt-1">Our agent will contact you shortly.</p>
                </div>
            ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Enter Your Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 px-3 py-3 focus:border-gold-500 focus:outline-none rounded-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 px-3 py-3 focus:border-gold-500 focus:outline-none rounded-sm" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Phone Number</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 px-3 py-3 focus:border-gold-500 focus:outline-none rounded-sm" />
                </div>
                
                <div className="flex items-start gap-2 mt-4">
                    <input type="checkbox" required id="consent" className="mt-1" />
                    <label htmlFor="consent" className="text-[10px] text-gray-500 leading-tight">By checking this box, you agree to receive communications from Guardian Housing via phone, email, and text message.</label>
                </div>

                <button disabled={isSubmitting} type="submit" className="w-full bg-slate-900 text-white py-4 font-bold hover:bg-gold-500 transition-colors uppercase tracking-widest mt-2 text-xs">
                    {isSubmitting ? 'Sending Request...' : 'SUBMIT'}
                </button>
                </form>
            )}
            </div>
        </div>
      )}

      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop" 
                  alt="Luxury Interior" 
                  className="w-full h-[500px] object-cover rounded-sm shadow-2xl"
                />
                <div className="absolute -bottom-10 -right-10 bg-guardian-dark p-8 hidden md:block shadow-xl">
                  <p className="text-gold-400 font-serif text-4xl font-bold mb-2">9+</p>
                  <p className="text-white text-sm uppercase tracking-wider">Years of <br/>Excellence</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <span className="text-guardian-red font-bold uppercase tracking-wider text-sm mb-2 block">About Us</span>
              <h2 className="text-4xl font-serif text-slate-900 mb-6">More Than Just a Transaction</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                At Guardian Housing, we understand that buying or selling a home is more than just a transaction; it's a life-changing experience. Our team of knowledgeable real estate professionals is committed to providing you with the expertise and support you need to make informed decisions.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                With deep roots in the local community, we bring an in-depth understanding of the market and a personalized approach tailored to your unique needs. Whether you're a first-time homebuyer or seeking an investment opportunity, we handle every aspect with integrity.
              </p>
              <Link to="/buy" className="text-slate-900 font-semibold border-b-2 border-gold-500 hover:text-gold-600 transition-colors inline-flex items-center gap-2">
                Learn More About Us <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-guardian-green/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-t from-guardian-red/20 to-transparent"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-serif text-white mb-6">Our Vision & Mission</h2>
            <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white/5 p-8 border border-white/10 hover:border-gold-500/50 transition-colors rounded-sm shadow-lg">
              <Star className="text-gold-500 mb-6" size={40} />
              <h3 className="text-2xl font-serif mb-4">Our Vision</h3>
              <p className="text-gray-300 leading-relaxed">
                To redefine the housing landscape by building a strong foundation of trust, integrity, and excellence. We aspire to be the leading choice for home buyers and sellers, creating vibrant communities where families thrive and dreams take root.
              </p>
            </div>
            <div className="bg-white/5 p-8 border border-white/10 hover:border-gold-500/50 transition-colors rounded-sm shadow-lg">
              <Users className="text-gold-500 mb-6" size={40} />
              <h3 className="text-2xl font-serif mb-4">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed">
                We are committed to empowering individuals through personalized service and innovative solutions, ensuring everyone has access to their ideal living space. Together, we pave the way for a brighter future, one home at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-gold-600 font-bold uppercase tracking-wider text-sm mb-2 block">Exclusive</span>
              <h2 className="text-4xl font-serif text-slate-900">Featured Properties</h2>
            </div>
            <Link to="/buy" className="hidden md:flex items-center gap-2 text-slate-600 hover:text-gold-600 transition-colors">
              View All Properties <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {featuredProperties.slice(0, 4).map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link to="/buy" className="inline-block px-6 py-3 border border-slate-900 text-slate-900 uppercase tracking-wider text-sm font-medium">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-400 text-sm uppercase tracking-[0.2em] mb-10">Working with the best developers</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {PARTNERS.map((partner) => (
               <span key={partner} className="text-2xl md:text-3xl font-serif font-bold text-slate-800">
                 {partner}
               </span>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
