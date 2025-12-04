
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import { Map, List as ListIcon, Filter, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';

// Helper to format price for map markers
const formatPrice = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}k`;
  }
  return price.toString();
};

// Fix Leaflet Default Icon Issue
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const createPriceIcon = (price: number, isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-price-marker',
    html: `<div class="${
      isSelected 
        ? 'bg-slate-900 text-gold-400 scale-125 z-[100] ring-2 ring-gold-400 font-bold' 
        : 'bg-white text-slate-900 hover:scale-110 hover:z-50'
    } px-2 py-1 rounded-sm shadow-md border ${
      isSelected ? 'border-gold-400' : 'border-slate-200'
    } text-xs whitespace-nowrap transition-all transform duration-200 flex items-center justify-center">
      ${formatPrice(price)}
    </div>`,
    iconSize: [40, 30],
    iconAnchor: [20, 15]
  });
};

interface ListingsProps {
  type: 'sale' | 'rent' | 'off-plan' | 'uk-investment';
  properties: Property[];
}

// Component to handle map view updates
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const Listings: React.FC<ListingsProps> = ({ type, properties }) => {
  // Default to Map view for Sale properties, or based on user preference
  const [showMap, setShowMap] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const searchLocation = searchParams.get('search');

  // Filters State
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    beds: 'any',
    category: 'any'
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredProperties = useMemo(() => {
    let props = properties;

    // 1. Filter by Route Type
    if (type === 'uk-investment') {
      props = props.filter(p => p.location.includes('United Kingdom'));
    } else {
      props = props.filter(p => p.type === type && !p.location.includes('United Kingdom'));
    }

    // 2. Filter by Price
    if (filters.minPrice) {
      props = props.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      props = props.filter(p => p.price <= Number(filters.maxPrice));
    }

    // 3. Filter by Beds
    if (filters.beds !== 'any') {
      if (filters.beds === '5+') {
        props = props.filter(p => p.beds >= 5);
      } else {
        props = props.filter(p => p.beds === Number(filters.beds));
      }
    }

    // 4. Filter by Category (Approximation using Title string match)
    if (filters.category !== 'any') {
      const cat = filters.category.toLowerCase();
      props = props.filter(p => p.title.toLowerCase().includes(cat));
    }
    
    // 5. Filter by Search Param (Location)
    if (searchLocation) {
        const query = searchLocation.toLowerCase();
        props = props.filter(p => 
            p.location.toLowerCase().includes(query) || 
            p.title.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
        );
    }

    // Randomize order for Off-Plan properties
    if (type === 'off-plan') {
       return props.sort(() => Math.random() - 0.5);
    }

    return props;
  }, [type, properties, filters, searchLocation]);

  const getPageTitle = () => {
    if (searchLocation) return `Properties in ${searchLocation}`;
    switch(type) {
      case 'sale': return 'Properties for Sale';
      case 'rent': return 'Properties for Rent';
      case 'off-plan': return 'Off-Plan Projects';
      case 'uk-investment': return 'UK Investment Opportunities';
      default: return 'Properties';
    }
  };

  const getPageDescription = () => {
    switch(type) {
      case 'sale': return 'Discover our exclusive portfolio of luxury homes and villas.';
      case 'rent': return 'Find your perfect rental home in prime locations.';
      case 'off-plan': return 'Invest in the future with premium off-plan developments.';
      case 'uk-investment': return 'High-yield property investment opportunities in the UK.';
      default: return '';
    }
  };

  // Determine Map Center
  const defaultCenter: [number, number] = type === 'uk-investment' 
    ? [53.4808, -2.2426] // Manchester/UK
    : [25.2048, 55.2708]; // Dubai

  const mapCenter: [number, number] = filteredProperties.length > 0 && filteredProperties[0].lat 
    ? [filteredProperties[0].lat!, filteredProperties[0].lng!] 
    : defaultCenter;

  const handleMarkerClick = (id: string) => {
    setSelectedPropertyId(id);
    const element = document.getElementById(`property-card-${id}`);
    
    if (element && listRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const clearFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', beds: 'any', category: 'any' });
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.beds !== 'any' || filters.category !== 'any' || searchLocation;

  return (
    <div className="pt-32 md:pt-44 h-screen flex flex-col bg-slate-50 overflow-hidden">
      
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col gap-4 shadow-sm z-30 shrink-0 min-h-[80px]">
         <div className="flex justify-between items-start md:items-center">
            <div>
                <h1 className="text-xl md:text-2xl font-serif text-slate-900 leading-tight">{getPageTitle()}</h1>
                <p className="hidden md:block text-xs text-gray-500 mt-1">{getPageDescription()}</p>
            </div>
            
            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gold-600 bg-gold-50 px-2 py-1 rounded-sm border border-gold-200 whitespace-nowrap">
                    {filteredProperties.length} Found
                </span>
                
                {/* Mobile Toggle */}
                <div className="md:hidden">
                    <button 
                      onClick={() => setShowMap(!showMap)}
                      className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-sm hover:bg-gold-500 transition-colors text-xs uppercase tracking-wider"
                    >
                        {showMap ? <><ListIcon size={14}/> List</> : <><Map size={14}/> Map</>}
                    </button>
                </div>
            </div>
         </div>

         {/* Filters Row */}
         <div className="flex flex-wrap items-center gap-2 md:gap-4 pb-2">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)} 
              className="md:hidden flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 border px-3 py-2 rounded bg-gray-50"
            >
              <Filter size={14} /> Filters
            </button>

            <div className={`${isFilterOpen ? 'flex' : 'hidden'} md:flex flex-wrap gap-2 w-full md:w-auto`}>
               {/* Min Price */}
               <select 
                 value={filters.minPrice} 
                 onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                 className="text-sm border border-gray-300 rounded-sm px-3 py-2 bg-white focus:border-gold-500 outline-none w-1/2 md:w-auto"
               >
                 <option value="">Min Price</option>
                 <option value="1000000">1M AED</option>
                 <option value="2000000">2M AED</option>
                 <option value="5000000">5M AED</option>
                 <option value="10000000">10M AED</option>
               </select>

               {/* Max Price */}
               <select 
                 value={filters.maxPrice} 
                 onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                 className="text-sm border border-gray-300 rounded-sm px-3 py-2 bg-white focus:border-gold-500 outline-none w-1/2 md:w-auto"
               >
                 <option value="">Max Price</option>
                 <option value="2000000">2M AED</option>
                 <option value="5000000">5M AED</option>
                 <option value="10000000">10M AED</option>
                 <option value="20000000">20M+ AED</option>
               </select>

               {/* Beds */}
               <select 
                 value={filters.beds} 
                 onChange={(e) => setFilters({...filters, beds: e.target.value})}
                 className="text-sm border border-gray-300 rounded-sm px-3 py-2 bg-white focus:border-gold-500 outline-none w-1/3 md:w-auto"
               >
                 <option value="any">Beds</option>
                 <option value="1">1 Bed</option>
                 <option value="2">2 Beds</option>
                 <option value="3">3 Beds</option>
                 <option value="4">4 Beds</option>
                 <option value="5+">5+ Beds</option>
               </select>

               {/* Category (Title Proxy) */}
               <select 
                 value={filters.category} 
                 onChange={(e) => setFilters({...filters, category: e.target.value})}
                 className="text-sm border border-gray-300 rounded-sm px-3 py-2 bg-white focus:border-gold-500 outline-none w-1/3 md:w-auto"
               >
                 <option value="any">Type</option>
                 <option value="villa">Villa</option>
                 <option value="apartment">Apartment</option>
                 <option value="townhouse">Townhouse</option>
                 <option value="penthouse">Penthouse</option>
               </select>
               
               {hasActiveFilters && (
                 <button 
                   onClick={clearFilters}
                   className="text-xs text-red-500 hover:text-red-700 underline px-2"
                 >
                   Clear
                 </button>
               )}
            </div>
         </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-grow flex relative overflow-hidden">
        
        {/* LEFT SIDE: MAP */}
        <div className={`${showMap ? 'block' : 'hidden'} md:block w-full md:w-1/2 lg:w-3/5 h-full min-h-[500px] relative z-10 order-1 bg-slate-100`}>
           <MapContainer 
             center={mapCenter} 
             zoom={type === 'uk-investment' ? 6 : 11} 
             style={{ height: '100%', width: '100%', minHeight: '100%', backgroundColor: '#e2e8f0' }}
           >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <MapUpdater center={mapCenter} />
              {filteredProperties.map(prop => (
                prop.lat && prop.lng && (
                  <Marker 
                    key={prop.id} 
                    position={[prop.lat, prop.lng]} 
                    icon={createPriceIcon(prop.price, selectedPropertyId === prop.id)}
                    eventHandlers={{
                      click: () => handleMarkerClick(prop.id),
                    }}
                  >
                  </Marker>
                )
              ))}
           </MapContainer>
        </div>

        {/* RIGHT SIDE: LIST */}
        <div 
          ref={listRef}
          className={`${!showMap ? 'block' : 'hidden'} md:block w-full md:w-1/2 lg:w-2/5 h-full overflow-y-auto p-4 md:p-6 bg-slate-50 order-2 border-l border-gray-200 shadow-inner`}
        >
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 pb-20">
                  {filteredProperties.map((prop) => (
                    <div 
                      id={`property-card-${prop.id}`} 
                      key={prop.id} 
                      className={`transition-all duration-300 rounded-sm ${
                        selectedPropertyId === prop.id 
                          ? 'ring-2 ring-gold-500 shadow-xl scale-[1.02] bg-white z-20' 
                          : 'hover:bg-white hover:shadow-md'
                      }`}
                      onClick={() => setSelectedPropertyId(prop.id)}
                    >
                      <PropertyCard property={prop} />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-20 flex flex-col items-center">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                     <Filter size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-serif text-gray-500">No properties match your filters.</h3>
                  {searchLocation && <p className="text-sm text-gray-400 mt-2">Try checking the spelling or remove the location filter.</p>}
                  <button onClick={clearFilters} className="text-gold-500 text-sm mt-2 hover:underline font-bold">
                    Clear all filters
                  </button>
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 pb-8">
               Guardian Housing Real Estate &copy; {new Date().getFullYear()}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Listings;
