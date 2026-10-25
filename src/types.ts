export type NavigationTab = 
  | 'home' 
  | 'twin-3d'
  | 'residential-3d'
  | 'residential-layout-3d'
  | 'electrical' 
  | 'solar-solutions' 
  | 'services' 
  | 'projects-gallery' 
  | 'about-us' 
  | 'contact-us';

export interface ServiceItem {
  id: string;
  title: string;
  category: 'high-voltage' | 'solar' | 'automation' | 'statutory' | 'maintenance';
  badge: string;
  description: string;
  voltageClass?: string;
  specs: string[];
  icon: string;
  image?: string;
}

export interface ElectricalEquipmentItem {
  id: string;
  name: string;
  category: string;
  voltageRating: string;
  capacityRange: string;
  standard: string;
  description: string;
  image: string;
  icon: string;
  features: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'industrial' | 'commercial' | 'solar';
  tag: string;
  description: string;
  location: string;
  status: string;
  image: string;
  capacity?: string;
  voltage?: string;
  completionYear: string;
  clientVertical: string;
  approvals: string[];
}

export interface EngineeringInquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  category: string;
  location: string;
  loadDetails: string;
  timestamp: string;
  complianceConfirmed: boolean;
}
