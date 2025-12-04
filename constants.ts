
import { NavItem, Property, Agent, Community } from './types';

export const DEFAULT_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 250'%3E%3Cdefs%3E%3ClinearGradient id='gold-grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23F9E076'/%3E%3Cstop offset='50%25' stop-color='%23D4AF37'/%3E%3Cstop offset='100%25' stop-color='%23B08D22'/%3E%3C/linearGradient%3E%3ClinearGradient id='silver-grad' x1='100%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FFFFFF'/%3E%3Cstop offset='50%25' stop-color='%23C0C0C0'/%3E%3Cstop offset='100%25' stop-color='%23808080'/%3E%3C/linearGradient%3E%3Cfilter id='dropShadow'%3E%3CfeGaussianBlur in='SourceAlpha' stdDeviation='3'/%3E%3CfeOffset dx='1' dy='1' result='offsetblur'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.3'/%3E%3C/feComponentTransfer%3E%3CfeMerge%3E%3CfeMergeNode/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg filter='url(%23dropShadow)'%3E%3Cpath d='M100,20 C140,20 160,60 140,90 C120,120 80,120 60,90 C40,60 60,20 100,20 Z' fill='url(%23silver-grad)' transform='translate(0, -10)' /%3E%3Cpath d='M60,90 C40,120 40,180 80,210 C90,218 100,220 110,215 C90,200 70,160 80,120 C85,100 100,80 120,70 C100,60 70,70 60,90 Z' fill='url(%23silver-grad)' /%3E%3Cpath d='M130,110 C150,110 165,130 165,150 C165,170 150,190 130,190 C110,190 95,170 95,150 C95,130 110,110 130,110 Z' fill='url(%23gold-grad)' /%3E%3Cpath d='M130,190 C110,190 80,230 100,240 C120,250 160,230 180,180 C190,140 170,100 150,90 C160,110 160,160 130,190 Z' fill='url(%23gold-grad)' /%3E%3C/g%3E%3C/svg%3E";

// Nested Community Structure (Used for Admin Selection)
export const COMMUNITY_STRUCTURE = [
  {
    label: 'DEIRA',
    path: '#',
    subItems: [
      { label: 'Abu Hail', path: '/buy?search=Abu%20Hail' },
      { label: 'Al Baraha', path: '/buy?search=Al%20Baraha' },
      { label: 'Al Mamzar', path: '/buy?search=Al%20Mamzar' },
      { label: 'Al Muraqqabat', path: '/buy?search=Al%20Muraqqabat' },
      { label: 'Al Rigga', path: '/buy?search=Al%20Rigga' },
      { label: 'Al Sabkha', path: '/buy?search=Al%20Sabkha' },
      { label: 'Al Wuheida', path: '/buy?search=Al%20Wuheida' },
      { label: 'Corniche Deira', path: '/buy?search=Corniche%20Deira' },
      { label: 'Hor Al Anz', path: '/buy?search=Hor%20Al%20Anz' },
      { label: 'Naif', path: '/buy?search=Naif' },
      { label: 'Port Saeed', path: '/buy?search=Port%20Saeed' },
    ]
  },
  {
    label: 'BUR DUBAI',
    path: '#',
    subItems: [
      { label: 'Al Fahidi', path: '/buy?search=Al%20Fahidi' },
      { label: 'Al Hudaiba', path: '/buy?search=Al%20Hudaiba' },
      { label: 'Al Jafiliya', path: '/buy?search=Al%20Jafiliya' },
      { label: 'Al Karama', path: '/buy?search=Al%20Karama' },
      { label: 'Al Mankhool', path: '/buy?search=Al%20Mankhool' },
      { label: 'Al Raffa', path: '/buy?search=Al%20Raffa' },
      { label: 'Oud Metha', path: '/buy?search=Oud%20Metha' },
      { label: 'Umm Hurair', path: '/buy?search=Umm%20Hurair' },
    ]
  },
  {
    label: 'ZABEEL / DIFC',
    path: '#',
    subItems: [
      { label: 'Trade Centre', path: '/buy?search=Trade%20Centre' },
      { label: 'Zabeel', path: '/buy?search=Zabeel' },
      { label: 'DIFC', path: '/buy?search=DIFC' },
    ]
  },
  {
    label: 'DOWNTOWN / BUSINESS BAY',
    path: '#',
    subItems: [
      { label: 'Downtown Dubai', path: '/buy?search=Downtown%20Dubai' },
      { label: 'Business Bay', path: '/buy?search=Business%20Bay' },
    ]
  },
  {
    label: 'COASTAL JUMEIRAH',
    path: '#',
    subItems: [
      { label: 'Jumeirah', path: '/buy?search=Jumeirah' },
      { label: 'Umm Suqeim', path: '/buy?search=Umm%20Suqeim' },
      { label: 'Al Sufouh', path: '/buy?search=Al%20Sufouh' },
    ]
  },
  {
    label: 'MARINA & JLT',
    path: '#',
    subItems: [
      { label: 'Dubai Marina', path: '/buy?search=Dubai%20Marina' },
      { label: 'JBR', path: '/buy?search=JBR' },
      { label: 'JLT', path: '/buy?search=JLT' },
    ]
  },
  {
    label: 'PALM & ISLANDS',
    path: '#',
    subItems: [
      { label: 'Palm Jumeirah', path: '/buy?search=Palm%20Jumeirah' },
      { label: 'The World Islands', path: '/buy?search=World%20Islands' },
      { label: 'Jumeirah Bay', path: '/buy?search=Jumeirah%20Bay' },
      { label: 'Dubai Harbour', path: '/buy?search=Dubai%20Harbour' },
    ]
  },
  {
    label: 'INNER RESIDENTIAL BELT',
    path: '#',
    subItems: [
      { label: 'Al Barsha', path: '/buy?search=Al%20Barsha' },
      { label: 'Al Quoz', path: '/buy?search=Al%20Quoz' },
    ]
  },
  {
    label: 'MBR CITY / NAD AL SHEBA',
    path: '#',
    subItems: [
      { label: 'Nad Al Sheba', path: '/buy?search=Nad%20Al%20Sheba' },
      { label: 'Bukadra', path: '/buy?search=Bukadra' },
      { label: 'Al Merkadh', path: '/buy?search=Al%20Merkadh' },
      { label: 'Ras Al Khor', path: '/buy?search=Ras%20Al%20Khor' },
    ]
  },
  {
    label: 'EMIRATES LIVING',
    path: '#',
    subItems: [
      { label: 'Emirates Hills', path: '/buy?search=Emirates%20Hills' },
      { label: 'The Meadows', path: '/buy?search=The%20Meadows' },
      { label: 'The Springs', path: '/buy?search=The%20Springs' },
      { label: 'The Lakes', path: '/buy?search=The%20Lakes' },
      { label: 'Jumeirah Islands', path: '/buy?search=Jumeirah%20Islands' },
      { label: 'Jumeirah Park', path: '/buy?search=Jumeirah%20Park' },
    ]
  },
  {
    label: 'DUBAILAND',
    path: '#',
    subItems: [
      { label: 'Al Barari', path: '/buy?search=Al%20Barari' },
      { label: 'Arjan', path: '/buy?search=Arjan' },
      { label: 'Majan', path: '/buy?search=Majan' },
      { label: 'Liwan', path: '/buy?search=Liwan' },
      { label: 'Falcon City', path: '/buy?search=Falcon%20City' },
      { label: 'Living Legends', path: '/buy?search=Living%20Legends' },
    ]
  },
  {
    label: 'SILICON & ACADEMIC',
    path: '#',
    subItems: [
      { label: 'Dubai Silicon Oasis', path: '/buy?search=Silicon%20Oasis' },
      { label: 'Academic City', path: '/buy?search=Academic%20City' },
    ]
  },
  {
    label: 'SPORTS / MOTOR / STUDIO',
    path: '#',
    subItems: [
      { label: 'Sports City', path: '/buy?search=Sports%20City' },
      { label: 'Motor City', path: '/buy?search=Motor%20City' },
      { label: 'Studio City', path: '/buy?search=Studio%20City' },
    ]
  },
  {
    label: 'PRODUCTION & MEDIA',
    path: '#',
    subItems: [
      { label: 'IMPZ', path: '/buy?search=IMPZ' },
      { label: 'Internet City', path: '/buy?search=Internet%20City' },
      { label: 'Media City', path: '/buy?search=Media%20City' },
    ]
  },
  {
    label: 'ARABIAN RANCHES',
    path: '#',
    subItems: [
      { label: 'Arabian Ranches', path: '/buy?search=Arabian%20Ranches' },
      { label: 'Al Reem', path: '/buy?search=Al%20Reem' },
      { label: 'Mudon', path: '/buy?search=Mudon' },
      { label: 'Serena', path: '/buy?search=Serena' },
    ]
  },
  {
    label: 'AL FURJAN / JEBEL ALI',
    path: '#',
    subItems: [
      { label: 'Al Furjan', path: '/buy?search=Al%20Furjan' },
      { label: 'Discovery Gardens', path: '/buy?search=Discovery%20Gardens' },
      { label: 'Jebel Ali', path: '/buy?search=Jebel%20Ali' },
    ]
  },
  {
    label: 'DUBAI SOUTH',
    path: '#',
    subItems: [
      { label: 'Dubai South', path: '/buy?search=Dubai%20South' },
      { label: 'Expo City', path: '/buy?search=Expo%20City' },
    ]
  },
  {
    label: 'CREEK & WATERFRONT',
    path: '#',
    subItems: [
      { label: 'Al Jaddaf', path: '/buy?search=Al%20Jaddaf' },
      { label: 'Culture Village', path: '/buy?search=Culture%20Village' },
      { label: 'Dubai Creek Harbour', path: '/buy?search=Dubai%20Creek' },
      { label: 'Dubai Islands', path: '/buy?search=Dubai%20Islands' },
    ]
  },
  {
    label: 'MIRDIF & EASTERN',
    path: '#',
    subItems: [
      { label: 'Mirdif', path: '/buy?search=Mirdif' },
      { label: 'Mushrif', path: '/buy?search=Mushrif' },
      { label: 'Al Warqa', path: '/buy?search=Al%20Warqa' },
      { label: 'Nad Al Hamar', path: '/buy?search=Nad%20Al%20Hamar' },
    ]
  },
  {
    label: 'QUSAIS / MUHAISNAH',
    path: '#',
    subItems: [
      { label: 'Al Qusais', path: '/buy?search=Al%20Qusais' },
      { label: 'Muhaisnah', path: '/buy?search=Muhaisnah' },
      { label: 'Al Mizhar', path: '/buy?search=Al%20Mizhar' },
    ]
  },
  {
    label: 'OUTER COMMUNITIES',
    path: '#',
    subItems: [
      { label: 'Al Khawaneej', path: '/buy?search=Al%20Khawaneej' },
      { label: 'Al Aweer', path: '/buy?search=Al%20Aweer' },
    ]
  },
];

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  { 
    label: 'Buy', 
    path: '/buy',
    subItems: [
      { label: 'Properties for Sale', path: '/buy' },
      { label: 'Buying Guide', path: '/buying-guide' },
      { label: 'Mortgage Calculator', path: '/mortgage-calculator' },
    ]
  },
  { 
    label: 'Rent', 
    path: '/rent',
    subItems: [
      { label: 'Properties for Rent', path: '/rent' },
    ]
  },
  {
    label: 'Sell',
    path: '/selling-guide',
    subItems: [
      { label: 'Selling Guide', path: '/selling-guide' }
    ]
  },
  { label: 'Off-Plan', path: '/off-plan' },
  { 
    label: 'Communities', 
    path: '/communities',
    // Removed nested subItems for public nav, as per request
  },
  { label: 'UK Investment', path: '/uk-investment' },
  { label: 'Careers', path: '/careers' },
  { label: 'Login', path: '/admin' }, // Renamed from Admin
];

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'master-admin',
    name: 'Guardian Admin',
    email: 'hello@guardianhousing.ae',
    phone: '+971 50 580 4669',
    whatsapp: '971505804669',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
    role: 'admin',
    password: 'guardian2024'
  }
];

// Initial Data for the Communities Page Grid
export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-1',
    title: 'Palm Jumeirah',
    description: 'Iconic island living with luxury villas and apartments.',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=1000'
  },
  {
    id: 'comm-2',
    title: 'Dubai Marina',
    description: 'The world’s largest man-made marina.',
    imageUrl: 'https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1000'
  },
  {
    id: 'comm-3',
    title: 'Downtown Dubai',
    description: 'Home to the Burj Khalifa and Dubai Mall.',
    imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef6c3?q=80&w=1000'
  },
  {
    id: 'comm-4',
    title: 'Business Bay',
    description: 'A central business district with waterfront living.',
    imageUrl: 'https://images.unsplash.com/photo-1569389397653-c04fe9b4cf15?q=80&w=1000'
  },
  {
    id: 'comm-5',
    title: 'Dubai Hills Estate',
    description: 'A green heart of Dubai with championship golf course.',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000'
  },
  {
    id: 'comm-6',
    title: 'Arabian Ranches',
    description: 'Desert-themed luxury villa community.',
    imageUrl: 'https://images.unsplash.com/photo-1599809275311-5d6727120a1f?q=80&w=1000'
  },
  {
    id: 'comm-7',
    title: 'Jumeirah Golf Estates',
    description: 'World-class residential golf destination.',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=1000'
  },
  {
    id: 'comm-8',
    title: 'Dubai Creek Harbour',
    description: 'The future of living with views of the skyline.',
    imageUrl: 'https://images.unsplash.com/photo-1597659840241-37e2b9c2f55f?q=80&w=1000'
  }
];

export const INITIAL_PROPERTIES: Property[] = [];

// MOCKED DATA FROM "AL NAIR"
export const ALNAIR_PROJECTS: Property[] = [
  {
    id: 'an-1',
    title: 'Emaar Beachfront - Seapoint',
    projectName: 'Seapoint',
    developer: 'Emaar',
    price: 3800000,
    currency: 'AED',
    location: 'Dubai Harbour',
    lat: 25.099,
    lng: 55.138,
    type: 'off-plan',
    propertyType: 'Apartment',
    status: 'Active',
    beds: 2,
    bedType: '2 BHK',
    baths: 2,
    bathType: '2 BATH',
    sqft: 1450,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000',
    description: 'Exclusive seafront living with direct beach access. Featuring luxury 1, 2, 3 bedroom apartments and penthouses.',
    agentId: 'master-admin',
    isFeatured: true
  },
  {
    id: 'an-2',
    title: 'Sobha Hartland II - 350 Riverside',
    projectName: '350 Riverside Crescent',
    developer: 'Sobha Realty',
    price: 1900000,
    currency: 'AED',
    location: 'Sobha Hartland, MBR City',
    lat: 25.178,
    lng: 55.305,
    type: 'off-plan',
    propertyType: 'Apartment',
    status: 'Active',
    beds: 1,
    bedType: '1 BHK',
    baths: 2,
    bathType: '1.5 BATH',
    sqft: 950,
    imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1000',
    description: 'Waterfront living redefined in the heart of Dubai. Flexible payment plans available directly from developer.',
    agentId: 'master-admin',
    isFeatured: false
  },
  {
    id: 'an-3',
    title: 'Damac Lagoons - Morocco',
    projectName: 'Morocco Cluster',
    developer: 'Damac',
    price: 2600000,
    currency: 'AED',
    location: 'Hessa Street, Dubai',
    lat: 25.021,
    lng: 55.231,
    type: 'off-plan',
    propertyType: 'Townhouse',
    status: 'Active',
    beds: 4,
    bedType: '4 BHK',
    baths: 4,
    bathType: '4 BATH',
    sqft: 2200,
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1000',
    description: 'Experience the magic of Morocco in Dubai. Luxury townhouses centered around pristine lagoons and waterfalls.',
    agentId: 'master-admin',
    isFeatured: true
  },
  {
    id: 'an-4',
    title: 'Binghatti Trillionaire Residences',
    projectName: 'Trillionaire Residences',
    developer: 'Binghatti',
    price: 1500000,
    currency: 'AED',
    location: 'Business Bay',
    lat: 25.183,
    lng: 55.275,
    type: 'off-plan',
    propertyType: 'Apartment',
    status: 'Active',
    beds: 1,
    bedType: '1 BHK',
    baths: 1,
    bathType: '1 BATH',
    sqft: 750,
    imageUrl: 'https://images.unsplash.com/photo-1556955112-28cde3817b0a?q=80&w=1000',
    description: 'Hyper-luxury living with canal views. Designed for high-net-worth individuals seeking a trophy asset.',
    agentId: 'master-admin',
    isFeatured: false
  },
  {
    id: 'an-5',
    title: 'Palm Jebel Ali Villas',
    projectName: 'The Coral Collection',
    developer: 'Nakheel',
    price: 18500000,
    currency: 'AED',
    location: 'Palm Jebel Ali',
    lat: 25.006,
    lng: 54.986,
    type: 'off-plan',
    propertyType: 'Villa',
    status: 'Active',
    beds: 5,
    bedType: '5 BHK',
    baths: 6,
    bathType: '6 BATH',
    sqft: 7800,
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=1000',
    description: 'The most anticipated project of the decade. Beach villas on the new Palm offering unparalleled privacy and luxury.',
    agentId: 'master-admin',
    isFeatured: true
  },
  {
    id: 'an-6',
    title: 'Nakheel Rixos Apartments',
    projectName: 'Rixos Residences',
    developer: 'Nakheel',
    price: 4200000,
    currency: 'AED',
    location: 'Dubai Islands',
    lat: 25.295,
    lng: 55.337,
    type: 'off-plan',
    propertyType: 'Apartment',
    status: 'Active',
    beds: 3,
    bedType: '3 BHK',
    baths: 3,
    bathType: '3 BATH',
    sqft: 1900,
    imageUrl: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=1000',
    description: 'Resort-style living managed by Rixos. Private beach, pools, and world-class amenities.',
    agentId: 'master-admin',
    isFeatured: false
  }
];

export const PARTNERS = [
  'EMAAR', 'DAMAC', 'SOBHA', 'TIGER GROUP', 'DANUBE PROPERTIES', 'BINGHATTI'
];

export const CONTACT_INFO = {
  phone: '+971 50 580 4669',
  email: 'hello@guardianhousing.ae',
  address: 'Dubai, UAE'
};
