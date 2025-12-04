


import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { Property, BlogPost } from '../types';
import PropertyCard from '../components/PropertyCard';
import { PARTNERS, INITIAL_PROPERTIES, ALNAIR_PROJECTS } from '../constants';
import { ArrowRight, Building, Key, Percent, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const OffPlan: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabase();
      if (supabase) {
        // Fetch Properties
        const { data: props } = await supabase.from('properties').select('*').eq('type', 'off-plan');
        if (props) {
            const mapped = props.map((p:any) => ({
                ...p, imageUrl: p.image_url, isFeatured: p.is_featured, agentId: p.agent_id, 
                externalUrl: p.external_url, brochureUrl: p.brochure_url
            }));
            // Randomize order for freshness
            setProperties(mapped.sort(() => Math.random() - 0.5));
        }

        // Fetch Blog Posts
        const { data: blogs } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
        if (blogs) {
            setBlogPosts(blogs.map((b:any) => ({ ...b, imageUrl: b.image_url, createdAt: b.created_at })));
        }
      } else {
        // Fallback
        setProperties([...INITIAL_PROPERTIES, ...ALNAIR_PROJECTS].filter(p => p.type === 'off-plan'));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const scrollToProperties = () => {
    document.getElementById('browse-properties')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-50">
      
      {/* HERO / INTRO */}
      <div className="bg-white pb-16">
        <div className="container mx-auto px-6">
           <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                 <span className="text-gold-500 font-bold uppercase tracking-widest text-sm mb-2 block">Investment Opportunity</span>
                 <h1 className="text-5xl font-serif text-slate-900 mb-6 leading-tight">Working With The <br/>Best Developers</h1>
                 <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    At Guardian Housing Real Estate, we take pride in our commitment to excellence. Our partnerships with the UAE's best developers are at the heart of our mission to provide our clients with premier residential, commercial, and mixed-use properties that exemplify quality, innovation, and luxury.
                 </p>
                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-start gap-3">
                       <Building className="text-gold-500 mt-1 shrink-0" size={20}/>
                       <div>
                          <h4 className="font-bold text-slate-900">Capital Growth</h4>
                          <p className="text-xs text-gray-500">Significant appreciation potential before handover.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-3">
                       <Percent className="text-gold-500 mt-1 shrink-0" size={20}/>
                       <div>
                          <h4 className="font-bold text-slate-900">Flexible Plans</h4>
                          <p className="text-xs text-gray-500">Attractive post-handover payment options.</p>
                       </div>
                    </div>
                 </div>
                 <button 
                   onClick={scrollToProperties}
                   className="bg-slate-900 text-white px-8 py-3 rounded-sm hover:bg-gold-500 transition-colors uppercase tracking-wider font-bold inline-flex items-center gap-2"
                 >
                   Browse Off Plan Properties <ArrowRight size={16}/>
                 </button>
              </div>
              <div className="md:w-1/2 relative">
                 <div className="grid grid-cols-2 gap-4">
                    <img src="https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=1000" className="rounded-lg shadow-xl translate-y-8" alt="Dubai Off Plan"/>
                    <img src="https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=1000" className="rounded-lg shadow-xl" alt="Luxury Living"/>
                 </div>
                 {/* Floating Badge */}
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur shadow-2xl p-6 rounded-full text-center border border-gold-100">
                    <span className="block text-3xl font-serif font-bold text-slate-900">0%</span>
                    <span className="text-xs uppercase tracking-widest text-gold-600">Commission</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* DEVELOPERS STRIP */}
      <div className="bg-slate-900 py-12 border-y border-slate-800">
         <div className="container mx-auto px-6 text-center">
            <p className="text-gray-500 text-xs uppercase tracking-[0.3em] mb-8">Official Partners</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {PARTNERS.map((partner) => (
                <span key={partner} className="text-xl md:text-2xl font-serif font-bold text-white">
                    {partner}
                </span>
                ))}
            </div>
            <div className="mt-8">
               <a 
                 href="mailto:hello@guardianhousing.ae?subject=Developer Partnership Inquiry"
                 className="inline-flex items-center gap-2 border border-gold-500/30 text-gold-500 hover:bg-gold-500 hover:text-white px-6 py-2 rounded-full text-sm transition-all"
               >
                 <Mail size={16} /> Partner with us
               </a>
            </div>
         </div>
      </div>

      {/* EXPLORE COMMUNITIES */}
      <div className="bg-white py-16 border-b border-gray-100">
         <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-8">
               <h2 className="text-3xl font-serif text-slate-900">Explore Communities</h2>
               <Link to="/communities" className="text-gold-600 font-bold hover:underline text-sm">View All Areas</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {['Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'Dubai Hills'].map((area, idx) => (
                  <Link to={`/buy?search=${area}`} key={idx} className="relative h-40 rounded overflow-hidden group">
                     <img src={`https://source.unsplash.com/random/400x300?dubai,${idx}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={area} />
                     <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="text-white font-serif font-bold text-lg">{area}</span>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </div>

      {/* PROPERTIES GRID */}
      <div id="browse-properties" className="container mx-auto px-6 py-20">
         <div className="text-center mb-12">
            <span className="text-gold-500 uppercase tracking-widest text-sm font-medium">Curated Selection</span>
            <h2 className="text-4xl font-serif text-slate-900 mt-2">Latest Off-Plan Projects</h2>
         </div>

         {loading ? (
            <div className="text-center py-12">Loading projects...</div>
         ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
         ) : (
            <div className="text-center py-12 bg-white rounded shadow-sm">
               <p className="text-gray-500">No off-plan projects currently listed.</p>
            </div>
         )}
      </div>

      {/* BLOG SECTION */}
      {blogPosts.length > 0 && (
         <div className="bg-white py-20">
            <div className="container mx-auto px-6">
               <h2 className="text-3xl font-serif text-slate-900 mb-12 border-l-4 border-gold-500 pl-4">Market Insights</h2>
               <div className="grid md:grid-cols-3 gap-8">
                  {blogPosts.map(post => (
                     <div key={post.id} className="group cursor-pointer">
                        <div className="h-48 overflow-hidden rounded mb-4">
                           <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                        </div>
                        <span className="text-xs text-gold-500 uppercase font-bold">{new Date(post.createdAt).toLocaleDateString()}</span>
                        <h3 className="text-xl font-bold text-slate-900 mt-2 group-hover:text-gold-600 transition-colors">{post.title}</h3>
                        <p className="text-gray-500 text-sm mt-2 line-clamp-3">{post.content}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default OffPlan;
