// Ananya Electrical Solutions - Form Module Types

export type EnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Site Visit Scheduled'
  | 'Under Technical Review'
  | 'Quotation Preparation'
  | 'Quotation Sent'
  | 'Converted'
  | 'Closed'
  | 'Rejected';

export type FormId =
  | 'residential-service'
  | 'industrial-commercial'
  | 'ht-lt-works'
  | 'solar-rooftop'
  | 'maintenance-amc'
  | 'safety-audit'
  | 'design-consultancy'
  | 'vendor-registration'
  | 'site-visit'
  | 'boq-quotation'
  | 'emergency-support'
  | 'request-callback'
  | 'project-feedback'
  | 'careers-job'
  | 'customer-complaint';

export interface UploadedFileMeta {
  id: string;
  name: string;
  size: number;
  type: string;
  base64Data?: string;
  uploadedAt: string;
}

export interface BaseEnquirySubmission {
  id: string;
  referenceNumber: string;
  formId: FormId;
  formTitle: string;
  submittedAt: string;
  status: EnquiryStatus;
  customerName: string;
  contactNumber: string;
  email?: string;
  location?: string;
  consentGiven: boolean;
  data: Record<string, any>;
  files: UploadedFileMeta[];
  zohoLeadId?: string;
}

// Form 1: Residential Electrical Service Request
export interface ResidentialServiceData {
  fullName: string;
  contactNumber: string;
  email?: string;
  propertyType: 'Independent House' | 'Apartment' | 'Villa' | 'Residential Complex' | 'Other';
  propertyLocation: string;
  propertySize: 'Below 1,000 sq. ft.' | '1,000–2,000 sq. ft.' | '2,000–3,000 sq. ft.' | 'Above 3,000 sq. ft.';
  requiredServices: string[];
  preferredSiteVisitDate?: string;
  projectDescription?: string;
  consent: boolean;
}

// Form 2: Industrial & Commercial Electrical Enquiry
export interface IndustrialCommercialData {
  companyName: string;
  contactPerson: string;
  designation?: string;
  contactNumber: string;
  officialEmail: string;
  gstNumber?: string;
  industryType:
    | 'Manufacturing'
    | 'IT / Software Office'
    | 'Warehouse'
    | 'Shopping Mall'
    | 'Hospital'
    | 'Educational Institution'
    | 'Hotel'
    | 'Commercial Complex'
    | 'Other';
  projectLocation: string;
  connectedLoad?: string;
  voltageLevel: 'LT' | 'HT' | 'Both' | 'Not Sure';
  requiredServices: string[];
  projectScope?: string;
  expectedStartDate?: string;
  consent: boolean;
}

// Form 3: HT/LT Electrical Works Enquiry
export interface HtLtElectricalWorksData {
  organizationName: string;
  contactPerson: string;
  phoneNumber: string;
  officialEmail: string;
  projectLocation: string;
  projectCategory:
    | 'HT Electrical Works'
    | 'LT Electrical Works'
    | 'HT/LT Substation'
    | 'Transformer Installation'
    | 'Electrical Distribution Network'
    | 'HT/LT Panel Installation'
    | 'Cable Laying'
    | 'Other';
  voltageLevel: '11 kV' | '22 kV' | '33 kV' | '415 V' | 'Other';
  transformerCapacity: '100 kVA' | '250 kVA' | '500 kVA' | '750 kVA' | '1000 kVA' | 'Other';
  connectedLoad?: string;
  numberOfTransformers?: string;
  projectScope: string;
  expectedCompletionDate?: string;
  consent: boolean;
}

// Form 4: Solar Rooftop Installation Enquiry
export interface SolarRooftopData {
  fullNameOrOrg: string;
  contactNumber: string;
  email?: string;
  installationType: 'Residential' | 'Commercial' | 'Industrial';
  propertyLocation: string;
  connectionType: 'Single Phase' | 'Three Phase' | 'Not Sure';
  avgMonthlyBill: string;
  monthlyConsumptionKwh?: string;
  availableRooftopAreaSqFt?: string;
  preferredCapacity:
    | '1 kW'
    | '2 kW'
    | '3 kW'
    | '5 kW'
    | '10 kW'
    | '20 kW'
    | '50 kW'
    | '100 kW+'
    | 'Need Technical Recommendation';
  systemType: 'On-Grid' | 'Off-Grid' | 'Hybrid' | 'Need Consultation';
  batteryBackupRequired: 'Yes' | 'No';
  siteVisitRequired: 'Yes' | 'No';
  additionalRequirements?: string;
  consent: boolean;
}

// Form 5: Electrical Maintenance & AMC Request
export interface ElectricalMaintenanceAmcData {
  companyName: string;
  contactPerson: string;
  phoneNumber: string;
  email?: string;
  facilityLocation: string;
  facilityType:
    | 'Residential Complex'
    | 'Commercial Building'
    | 'Industrial Facility'
    | 'Office'
    | 'Hospital'
    | 'Warehouse'
    | 'Other';
  equipmentAvailable: string[];
  numberOfPanels?: string;
  transformerCapacity?: string;
  maintenanceType:
    | 'Preventive Maintenance'
    | 'Breakdown Maintenance'
    | 'Annual Maintenance Contract'
    | 'Inspection'
    | 'Emergency Support';
  requiredFrequency: 'One-Time' | 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual';
  existingContract: 'Yes' | 'No';
  descriptionOfRequirements?: string;
  preferredServiceDate?: string;
  consent: boolean;
}

// Form 6: Electrical Inspection & Safety Audit
export interface ElectricalInspectionAuditData {
  nameOrOrg: string;
  contactPerson?: string;
  phoneNumber: string;
  email?: string;
  siteLocation: string;
  facilityType: 'Residential' | 'Commercial' | 'Industrial' | 'Institutional' | 'Other';
  inspectionsRequired: string[];
  voltageLevel: 'LT' | 'HT' | 'Both' | 'Not Sure';
  installationCapacity?: string;
  lastInspectionDate?: string;
  preferredInspectionDate?: string;
  technicalRequirements?: string;
  consent: boolean;
}

// Form 7: Engineering Design & Consultancy
export interface EngineeringDesignConsultancyData {
  nameOrOrg: string;
  contactPerson?: string;
  phoneNumber: string;
  officialEmail: string;
  projectLocation?: string;
  projectType: 'Residential' | 'Commercial' | 'Industrial' | 'Infrastructure' | 'Other';
  requiredConsultancy: string[];
  projectStage: 'Planning' | 'Design' | 'Under Construction' | 'Existing Installation';
  voltageLevel?: string;
  projectDescription?: string;
  expectedDeliveryDate?: string;
  consent: boolean;
}

// Form 8: Vendor Registration & Business Partnership
export interface VendorRegistrationData {
  companyName: string;
  contactPerson: string;
  phoneNumber: string;
  officialEmail: string;
  gstNumber?: string;
  companyAddress: string;
  businessCategory:
    | 'Electrical Equipment Supplier'
    | 'Cable Supplier'
    | 'Transformer Supplier'
    | 'Electrical Panel Manufacturer'
    | 'Solar Equipment Supplier'
    | 'Electrical Contractor'
    | 'Subcontractor'
    | 'Engineering Consultant'
    | 'Other';
  productsOffered?: string;
  yearsOfExperience?: string;
  serviceLocations?: string;
  websiteUrl?: string;
  additionalInformation?: string;
  consent: boolean;
}

// Form 9: Request a Site Visit
export interface RequestSiteVisitData {
  name: string;
  contactNumber: string;
  email?: string;
  projectLocation: string;
  propertyFacilityType?: string;
  serviceRequired:
    | 'Residential Electrical'
    | 'Commercial Electrical'
    | 'Industrial Electrical'
    | 'HT/LT Works'
    | 'Solar Installation'
    | 'Electrical Inspection'
    | 'Maintenance'
    | 'Other';
  preferredVisitDate: string;
  preferredTimeSlot: '9 AM – 12 PM' | '12 PM – 3 PM' | '3 PM – 6 PM';
  projectDescription?: string;
  consent: boolean;
}

// Form 10: BOQ Upload & Quotation Request
export interface BoqQuotationRequestData {
  companyOrCustomerName: string;
  contactPerson: string;
  phoneNumber: string;
  officialEmail: string;
  projectLocation: string;
  projectCategory: 'Residential' | 'Commercial' | 'Industrial' | 'HT/LT Electrical Works' | 'Solar' | 'Other';
  quotationType: 'Material Supply' | 'Labour Contract' | 'Material + Labour' | 'Complete Project Execution';
  approximateBudget?: string;
  requiredQuotationDate?: string;
  additionalInstructions?: string;
  consent: boolean;
}

// Form 11: Electrical Emergency Support
export interface ElectricalEmergencySupportData {
  name: string;
  contactNumber: string;
  location: string;
  propertyFacilityType?: string;
  emergencyType:
    | 'Power Failure'
    | 'Electrical Short Circuit'
    | 'Panel Fault'
    | 'Transformer Issue'
    | 'Cable Fault'
    | 'Burning Smell / Overheating'
    | 'Other';
  severity: 'Critical' | 'Urgent' | 'Normal';
  description?: string;
  consent: boolean;
}

// Form 12: Request a Callback
export interface RequestCallbackData {
  fullName: string;
  phoneNumber: string;
  email?: string;
  serviceInterestedIn:
    | 'Residential Electrical'
    | 'Industrial Electrical'
    | 'HT/LT Works'
    | 'Solar Solutions'
    | 'Maintenance'
    | 'Engineering Consultancy'
    | 'Other';
  preferredCallbackTime: 'Morning' | 'Afternoon' | 'Evening';
  briefRequirement?: string;
  consent: boolean;
}

// Form 13: Project Completion Feedback
export interface ProjectFeedbackData {
  customerName: string;
  contactNumber?: string;
  projectCategory?: string;
  projectLocation?: string;
  overallRating: number;
  workQualityRating: number;
  timelinessRating: number;
  communicationRating: number;
  whatDidYouAppreciate?: string;
  suggestionsForImprovement?: string;
  permissionToPublish: boolean;
}

// Form 14: Careers & Job Application
export interface CareersJobApplicationData {
  fullName: string;
  phoneNumber: string;
  email: string;
  currentLocation?: string;
  positionApplyingFor:
    | 'Electrical Engineer'
    | 'Site Engineer'
    | 'Electrical Supervisor'
    | 'Electrical Technician'
    | 'Solar Technician'
    | 'Project Manager'
    | 'Safety Engineer'
    | 'Other';
  experience: 'Fresher' | '1–2 Years' | '3–5 Years' | '5–10 Years' | '10+ Years';
  educationalQualification?: string;
  technicalSkills?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  additionalInformation?: string;
  consent: boolean;
}

// Form 15: Customer Complaint & Service Support
export interface CustomerComplaintSupportData {
  customerName: string;
  contactNumber: string;
  email?: string;
  workReferenceNumber?: string;
  projectLocation: string;
  issueCategory: 'Electrical Installation' | 'Wiring' | 'Panel' | 'Transformer' | 'Solar System' | 'Maintenance' | 'Other';
  complaintPriority: 'Critical' | 'High' | 'Normal';
  issueDescription: string;
  dateIssueOccurred?: string;
  preferredContactMethod: 'Phone' | 'WhatsApp' | 'Email';
  consent: boolean;
}
