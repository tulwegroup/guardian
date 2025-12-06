
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSupabase } from '../lib/supabase';
import { Property, Agent } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Bed, Bath, Square, MapPin, Phone, Mail, MessageCircle, ArrowLeft, Download, Info } from 'lucide-react';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      
      const { data: propData } = await supabase.from('properties').select('*').eq('id', id).single();
      
      if (propData) {
        // Map DB fields to Property type
        const mappedProp: Property = {
          ...propData,
          imageUrl: propData.image_url,
          isFeatured: propData.is_featured,
          agentId: propData.agent_id,
          lat: propData.lat,
          lng: propData.lng,
          externalUrl: propData.external_url,
          brochureUrl: propData.brochure_url,
          // Map other camelCase fields from snake_case if needed
          projectName: propData.project_name,
          originalPrice: propData.original_price,
          isDistress: propData.is_distress,
          propertyType: propData.property_type,
          sizeSqm: propData.size_sqm,
          bedType: propData.bed_type,
          bathType: propData.bath_type,
          studyRoom: propData.study_room,
          rentalFreq: propData.rental_freq,
          referenceId: propData.reference_id,
          nocStatus: propData.noc_status,
          nocStartDate: propData.noc_start_date,
          nocEndDate: propData.noc_end_date,
          listingAgentId: propData.listing_agent_id
        };
        setProperty(mappedProp);

        if (mappedProp.agentId) {
           const { data: agentData } = await supabase.from('agents').select('*').eq('id', mappedProp.agentId).single();
           if (agentData) {
               setAgent({
                   ...agentData,
                   photoUrl: agentData.photo_url || agentData.photoUrl,
               });
           }
        }
      }
      setLoading(false);
    };

    if (id) fetchProperty();
  }, [id]);

  if (loading) return <div className="pt-32 pb-20 text-center">Loading property...</div>;
  if (!property) return <div className="pt-32 pb-20 text-center">Property not found.</div>;

  const displayAgent = agent || {
      id: 'default', name: 'Guardian Agent', email: 'hello@guardianhousing.ae', phone: '+971505804669', whatsapp: '971505804669',
      photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a', role: 'admin' as const
  };

  const currencySymbol = property.currency === 'GBP' ? '£' : 'AED';
  const priceDisplay = property.price.toLocaleString();
  
  // Clean Whatsapp
  const whatsappUrl = `https://wa.me/${displayAgent.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hi ${displayAgent.name}, I'm interested in ${property.title}.`
  )}`;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      
      {/* HERO IMAGE */}
      <div className="h-[50vh] md:h-[60vh] relative w-full overflow-hidden">
         <img src={property.imageUrl} className="w-full h-full object-cover" alt={property.title} />
         <div className="absolute inset-0 bg-black/20"></div>
         <div className="absolute top-6 left-6 md:left-20">
             <Link to="/buy" className="bg-white/90 hover:bg-white text-slate-900 px-4 py-2 rounded-sm text-sm font-bold flex items-center gap-2 transition-colors">
                <ArrowLeft size={16}/> Back to Listings
             </Link>
         </div>
      </div>

      <div className="container mx-auto px-6 -mt-20 relative z-10">
         <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT MAIN CONTENT */}
            <div className="lg:w-2/3">
               <div className="bg-white p-8 rounded shadow-lg border border-gray-100 mb-8">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                          <span className="text-gold-500 font-bold uppercase tracking-widest text-xs">{property.propertyType} • {property.type === 'sale' ? 'For Sale' : 'For Rent'}</span>
                          <h1 className="text-3xl md:text-4xl font-serif text-slate-900 mt-2 mb-2">{property.title}</h1>
                          <div className="flex items-center text-gray-500 text-sm">
                             <MapPin size={16} className="mr-1 text-gold-500"/> {property.location}
                          </div>
                      </div>
                      <div className="text-right">
                          {property.isDistress && property.originalPrice ? (
                              <div>
                                  <span className="text-red-500 line-through text-lg opacity-70">{currencySymbol} {property.originalPrice.toLocaleString()}</span>
                                  <div className="text-3xl font-bold text-slate-900">{currencySymbol} {priceDisplay}</div>
                              </div>
                          ) : (
                              <div className="text-3xl font-bold text-slate-900">{currencySymbol} {priceDisplay} {property.type === 'rent' && <span className="text-sm font-normal text-gray-500">/ {property.rentalFreq}</span>}</div>
                          )}
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-4 border-y border-gray-100 py-6 mb-6">
                       <div className="flex items-center gap-3">
                           <div className="bg-slate-50 p-3 rounded-full"><Bed size={24} className="text-slate-700"/></div>
                           <div>
                               <span className="block text-sm text-gray-500">Bedrooms</span>
                               <span className="font-bold text-slate-900 text-lg">{property.bedType || `${property.beds} Beds`}</span>
                           </div>
                       </div>
                       <div className="flex items-center gap-3">
                           <div className="bg-slate-50 p-3 rounded-full"><Bath size={24} className="text-slate-700"/></div>
                           <div>
                               <span className="block text-sm text-gray-500">Bathrooms</span>
                               <span className="font-bold text-slate-900 text-lg">{property.bathType || `${property.baths} Baths`}</span>
                           </div>
                       </div>
                       <div className="flex items-center gap-3">
                           <div className="bg-slate-50 p-3 rounded-full"><Square size={24} className="text-slate-700"/></div>
                           <div>
                               <span className="block text-sm text-gray-500">Area</span>
                               <span className="font-bold text-slate-900 text-lg">{property.sqft.toLocaleString()} Sq.ft</span>
                           </div>
                       </div>
                   </div>

                   <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">Description</h3>
                   <div className="prose text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
                       {property.description}
                   </div>

                   {property.brochureUrl && (
                       <a href={property.brochureUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded hover:bg-gold-500 transition-colors">
                           <Download size={18}/> Download Brochure
                       </a>
                   )}
               </div>

               {/* MAP */}
               <div className="bg-white p-2 rounded shadow-lg border border-gray-100 h-[400px] overflow-hidden relative z-0">
                  {property.lat && property.lng ? (
                     <MapContainer center={[property.lat, property.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                        <Marker position={[property.lat, property.lng]}></Marker>
                     </MapContainer>
                  ) : (
                      <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400">Map location not available</div>
                  )}
               </div>
            </div>

            {/* RIGHT SIDEBAR (AGENT) */}
            <div className="lg:w-1/3">
                <div className="bg-white p-6 rounded shadow-lg border-t-4 border-gold-500 sticky top-32">
                    <div className="flex items-center gap-4 mb-6">
                        <img src={displayAgent.photoUrl} alt={displayAgent.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"/>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Listed By</p>
                            <h3 className="text-xl font-bold text-slate-900">{displayAgent.name}</h3>
                            <p className="text-sm text-gold-600 font-medium">{displayAgent.email}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <a href={`tel:${displayAgent.phone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white hover:bg-slate-800 transition-colors rounded uppercase tracking-wider font-bold text-sm">
                            <Phone size={16}/> Call Agent
                        </a>
                        <a href={`mailto:${displayAgent.email}`} className="flex items-center justify-center gap-2 w-full py-3 border border-slate-300 text-slate-700 hover:bg-gray-50 transition-colors rounded uppercase tracking-wider font-bold text-sm">
                            <Mail size={16}/> Email Agent
                        </a>
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white hover:bg-[#128C7E] transition-colors rounded uppercase tracking-wider font-bold text-sm">
                            <MessageCircle size={16}/> WhatsApp
                        </a>
                    </div>
                </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
