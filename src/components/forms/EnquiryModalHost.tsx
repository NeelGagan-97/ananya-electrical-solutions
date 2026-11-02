import React, { useState, useEffect } from 'react';
import { FormId, BaseEnquirySubmission } from './types';
import { FormModal } from './FormModal';

// Form Item Imports
import { ResidentialServiceForm } from './items/ResidentialServiceForm';
import { IndustrialCommercialForm } from './items/IndustrialCommercialForm';
import { HtLtElectricalWorksForm } from './items/HtLtElectricalWorksForm';
import { SolarRooftopForm } from './items/SolarRooftopForm';
import { ElectricalMaintenanceAmcForm } from './items/ElectricalMaintenanceAmcForm';
import { ElectricalInspectionAuditForm } from './items/ElectricalInspectionAuditForm';
import { EngineeringDesignConsultancyForm } from './items/EngineeringDesignConsultancyForm';
import { VendorRegistrationForm } from './items/VendorRegistrationForm';
import { RequestSiteVisitForm } from './items/RequestSiteVisitForm';
import { BoqQuotationRequestForm } from './items/BoqQuotationRequestForm';
import { ElectricalEmergencySupportForm } from './items/ElectricalEmergencySupportForm';
import { RequestCallbackForm } from './items/RequestCallbackForm';
import { ProjectFeedbackForm } from './items/ProjectFeedbackForm';
import { CareersJobApplicationForm } from './items/CareersJobApplicationForm';
import { CustomerComplaintSupportForm } from './items/CustomerComplaintSupportForm';

export interface FormMetadataConfig {
  id: FormId;
  formNumber: number;
  title: string;
  shortTitle: string;
  badge: string;
  category: 'Residential' | 'Commercial & Industrial' | 'Engineering & Audits' | 'Emergency & Support' | 'Corporate';
  description: string;
  icon: string;
}

export const FORMS_REGISTRY: Record<FormId, FormMetadataConfig> = {
  'residential-service': {
    id: 'residential-service',
    formNumber: 1,
    title: 'Residential Electrical Service Request',
    shortTitle: 'Residential Service',
    badge: 'Home Electrical',
    category: 'Residential',
    description: 'Wiring, rewiring, DB installation, earthing, lighting and repair for houses, apartments & villas.',
    icon: 'home',
  },
  'industrial-commercial': {
    id: 'industrial-commercial',
    formNumber: 2,
    title: 'Industrial & Commercial Electrical Enquiry',
    shortTitle: 'Industrial & Commercial',
    badge: 'Turnkey Electrification',
    category: 'Commercial & Industrial',
    description: 'Plant electrification, power distribution, panels, cable laying and statutory liaisoning.',
    icon: 'factory',
  },
  'ht-lt-works': {
    id: 'ht-lt-works',
    formNumber: 3,
    title: 'HT/LT Electrical Works Enquiry',
    shortTitle: 'HT/LT Infrastructure',
    badge: '11kV–66kV Substations',
    category: 'Commercial & Industrial',
    description: 'High-voltage substations, transformer commissioning, VCB panels, and CEIG approvals.',
    icon: 'bolt',
  },
  'solar-rooftop': {
    id: 'solar-rooftop',
    formNumber: 4,
    title: 'Solar Rooftop Installation Enquiry',
    shortTitle: 'Solar Rooftop',
    badge: 'Solar EPC Solutions',
    category: 'Residential',
    description: 'On-grid, off-grid and hybrid rooftop solar with BESCOM net metering and subsidy assistance.',
    icon: 'solar_power',
  },
  'maintenance-amc': {
    id: 'maintenance-amc',
    formNumber: 5,
    title: 'Electrical Maintenance & AMC Request',
    shortTitle: 'Maintenance & AMC',
    badge: 'Asset Health & SLA',
    category: 'Commercial & Industrial',
    description: 'Preventive maintenance, transformer oil BDV filtration, relay testing, and emergency support.',
    icon: 'build',
  },
  'safety-audit': {
    id: 'safety-audit',
    formNumber: 6,
    title: 'Electrical Inspection & Safety Audit',
    shortTitle: 'Safety Audit',
    badge: 'CEA 2010 Compliance',
    category: 'Engineering & Audits',
    description: 'Calibrated earth resistance testing, thermography, harmonic analysis, and CEIG statutory inspection.',
    icon: 'verified_user',
  },
  'design-consultancy': {
    id: 'design-consultancy',
    formNumber: 7,
    title: 'Engineering Design & Consultancy',
    shortTitle: 'Design Consultancy',
    badge: 'MEP & Calculations',
    category: 'Engineering & Audits',
    description: 'Electrical load calculations, single line diagrams (SLD), cable sizing, and panel design drawings.',
    icon: 'architecture',
  },
  'vendor-registration': {
    id: 'vendor-registration',
    formNumber: 8,
    title: 'Vendor Registration & Business Partnership',
    shortTitle: 'Vendor Registration',
    badge: 'Supply Chain Partner',
    category: 'Corporate',
    description: 'Suppliers, OEMs, transformer manufacturers, cable distributors and electrical subcontractors.',
    icon: 'handshake',
  },
  'site-visit': {
    id: 'site-visit',
    formNumber: 9,
    title: 'Request a Site Visit',
    shortTitle: 'Site Visit Booking',
    badge: 'On-Site Inspection',
    category: 'Residential',
    description: 'Schedule an on-site visit by an experienced electrical supervisor for measurements and load analysis.',
    icon: 'location_on',
  },
  'boq-quotation': {
    id: 'boq-quotation',
    formNumber: 10,
    title: 'BOQ Upload & Quotation Request',
    shortTitle: 'BOQ Quotation',
    badge: 'Tender Costing',
    category: 'Commercial & Industrial',
    description: 'Upload your bill of quantities (Excel / PDF) or technical specifications for itemized pricing.',
    icon: 'table_view',
  },
  'emergency-support': {
    id: 'emergency-support',
    formNumber: 11,
    title: 'Electrical Emergency Support',
    shortTitle: 'Emergency Hotline',
    badge: '24/7 Breakdown Crew',
    category: 'Emergency & Support',
    description: 'Sudden power failure, transformer faults, short circuits, or electrical panel overheating.',
    icon: 'warning',
  },
  'request-callback': {
    id: 'request-callback',
    formNumber: 12,
    title: 'Request a Callback',
    shortTitle: 'Quick Callback',
    badge: 'Fast Connect',
    category: 'Residential',
    description: 'Quick telephone consultation with our senior electrical engineers at your convenient time window.',
    icon: 'phone_callback',
  },
  'project-feedback': {
    id: 'project-feedback',
    formNumber: 13,
    title: 'Project Completion Feedback',
    shortTitle: 'Client Feedback',
    badge: 'Quality Assurance',
    category: 'Corporate',
    description: 'Rate our workmanship, timeliness, and safety compliance on recently completed electrical projects.',
    icon: 'grade',
  },
  'careers-job': {
    id: 'careers-job',
    formNumber: 14,
    title: 'Careers & Job Application',
    shortTitle: 'Careers at AES',
    badge: 'Join Our Team',
    category: 'Corporate',
    description: 'Opportunities for electrical site engineers, supervisors, technicians, and project managers in Bengaluru.',
    icon: 'badge',
  },
  'customer-complaint': {
    id: 'customer-complaint',
    formNumber: 15,
    title: 'Customer Complaint & Service Support',
    shortTitle: 'Customer Support',
    badge: 'Warranty & Redressal',
    category: 'Emergency & Support',
    description: 'Dedicated post-handover support, warranty claims, and technical resolution for ongoing clients.',
    icon: 'support_agent',
  },
};

/**
 * Global helper to trigger any AES form modal from anywhere in the app
 */
export const openAesEnquiryModal = (formId: FormId) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aes:open-form-modal', {
        detail: { formId },
      })
    );
  }
};

interface EnquiryModalHostProps {
  onFormSubmitted?: (submission: BaseEnquirySubmission) => void;
}

export const EnquiryModalHost: React.FC<EnquiryModalHostProps> = ({ onFormSubmitted }) => {
  const [activeFormId, setActiveFormId] = useState<FormId | null>(null);

  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ formId: FormId }>;
      if (customEvent.detail && customEvent.detail.formId && FORMS_REGISTRY[customEvent.detail.formId]) {
        setActiveFormId(customEvent.detail.formId);
      }
    };

    window.addEventListener('aes:open-form-modal', handleOpenEvent);
    return () => window.removeEventListener('aes:open-form-modal', handleOpenEvent);
  }, []);

  if (!activeFormId) return null;

  const config = FORMS_REGISTRY[activeFormId];
  if (!config) return null;

  const handleClose = () => setActiveFormId(null);

  const handleSuccess = (submission: BaseEnquirySubmission) => {
    onFormSubmitted?.(submission);
  };

  const renderActiveForm = () => {
    switch (activeFormId) {
      case 'residential-service':
        return <ResidentialServiceForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'industrial-commercial':
        return <IndustrialCommercialForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'ht-lt-works':
        return <HtLtElectricalWorksForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'solar-rooftop':
        return <SolarRooftopForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'maintenance-amc':
        return <ElectricalMaintenanceAmcForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'safety-audit':
        return <ElectricalInspectionAuditForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'design-consultancy':
        return <EngineeringDesignConsultancyForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'vendor-registration':
        return <VendorRegistrationForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'site-visit':
        return <RequestSiteVisitForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'boq-quotation':
        return <BoqQuotationRequestForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'emergency-support':
        return <ElectricalEmergencySupportForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'request-callback':
        return <RequestCallbackForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'project-feedback':
        return <ProjectFeedbackForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'careers-job':
        return <CareersJobApplicationForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'customer-complaint':
        return <CustomerComplaintSupportForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      default:
        return null;
    }
  };

  return (
    <FormModal
      isOpen={Boolean(activeFormId)}
      onClose={handleClose}
      title={config.title}
      badge={`Form ${String(config.formNumber).padStart(2, '0')} · ${config.badge}`}
      description={config.description}
      icon={config.icon}
    >
      {renderActiveForm()}
    </FormModal>
  );
};
