
import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { Community } from '../types';
import { INITIAL_COMMUNITIES } from '../constants';
import { Link } from 'react-router-dom';

const Communities: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      const supabase = getSupabase();
      
      // If no database, use sample data immediately
      if (!supabase) {
        setCommunities(INITIAL_COMMUNITIES);
        setLoading(false);
        return;
      }

      const { data } = await supabase.from('communities').select('*');
      
      if (data && data.length > 0) {
        setCommunities(data);
      } else {
        // Fallback to sample data if DB is empty
        setCommunities(INITIAL_COMMUNITIES);
      }
      setLoading(false);
    };
    fetchCommunities();
  }, []);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-gold-500 uppercase tracking-widest text-xs md:text-sm font-medium">Discover</span>
          <h1 className="text-3xl md:text-5xl font-serif text-slate-900 mt-2">Our Communities</h1>
          <div className="w-16 md:w-24 h-1 bg-gold-500 mx-auto mt-4 md:mt-6"></div>
        </div>

        {loading ? (
           <div className="text-center py-20 text-gray-400 flex flex-col items-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mb-4"></div>
             Loading communities...
           </div>
        ) : communities.length === 0 ? (
           <div className="text-center py-20 bg-white shadow-sm border border-gray-100">
             <h3 className="text-xl font-serif text-gray-500">Coming Soon</h3>
             <p className="text-gray-400 mt-2">We are curating the best communities for you.</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {communities.map((comm) => (
              <Link 
                key={comm.id} 
                to={`/buy?search=${encodeURIComponent(comm.title)}`}
                className="group relative h-40 md:h-[300px] overflow-hidden rounded shadow-sm cursor-pointer block"
              >
                <img 
                  src={comm.imageUrl} 
                  alt={comm.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-95 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center p-2 text-center">
                  <h3 className="text-sm md:text-3xl font-serif text-white tracking-wide uppercase drop-shadow-md font-bold">
                    {comm.title}
                  </h3>
                  {comm.description && (
                     <p className="hidden md:block text-gray-200 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 max-w-[80%]">
                       {comm.description}
                     </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Communities;
