

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  photoUrl: string;
  role: 'admin' | 'agent';
  password?: string; // Only used for initial auth check
}

export interface NavItem {
  label: string;
  path: string;
  subItems?: NavItem[];
}

export interface Community {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  message?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

export interface Property {
  id: string;
  // Basic Info
  title: string;
  projectName?: string;
  developer?: string;
  description: string;
  
  // Price & Currency
  price: number;
  currency: 'AED' | 'GBP';
  originalPrice?: number; // For Distress deals
  isDistress?: boolean;
  
  // Specs
  location: string;
  lat?: number;
  lng?: number;
  type: 'sale' | 'rent' | 'off-plan' | 'uk-investment';
  propertyType: string; // Apartment, Villa, etc.
  status: string; // Active, Sold, Rented, Ready to Move
  
  // Dimensions
  beds: number; // Numeric for sorting
  bedType: string; // String for display (e.g. "2 BHK + Maid")
  baths: number; // Numeric for sorting
  bathType: string;
  sqft: number;
  sizeSqm?: number;
  
  imageUrl: string;
  isFeatured?: boolean;
  
  agentId?: string;
  agent?: Agent;

  externalUrl?: string;
  brochureUrl?: string;

  studyRoom?: boolean;
  rentalFreq?: string;
  cheques?: string;

  referenceId?: string;
  nocStatus?: string;
  nocStartDate?: string;
  nocEndDate?: string;
  listingAgentId?: string;
}