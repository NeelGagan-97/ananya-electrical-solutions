import React, { useState, useEffect, Suspense } from 'react';
import { FormId, BaseEnquirySubmission } from './types';
import { FormModal } from './FormModal';
import {
  AES_OPEN_FORM_MODAL_EVENT,
  openAesEnquiryModal,
  setEnquiryModalMounted,
  consumePendingEnquiryModalId,
} from './events';

// Code-split form item components so none of the 15 heavy forms are in the initial bundle
const ResidentialIndustrialCommercialForm = React.lazy(() =>
  import('./items/ResidentialIndustrialCommercialForm').then((m) => ({
    default: m.ResidentialIndustrialCommercialForm,
  }))
);
const HtLtSolarCombinedForm = React.lazy(() =>
  import('./items/HtLtSolarCombinedForm').then((m) => ({ default: m.HtLtSolarCombinedForm }))
);
const ElectricalMaintenanceAmcForm = React.lazy(() =>
  import('./items/ElectricalMaintenanceAmcForm').then((m) => ({ default: m.ElectricalMaintenanceAmcForm }))
);
const ElectricalInspectionAuditForm = React.lazy(() =>
  import('./items/ElectricalInspectionAuditForm').then((m) => ({ default: m.ElectricalInspectionAuditForm }))
);
const EngineeringDesignConsultancyForm = React.lazy(() =>
  import('./items/EngineeringDesignConsultancyForm').then((m) => ({ default: m.EngineeringDesignConsultancyForm }))
);
const RequestSiteVisitForm = React.lazy(() =>
  import('./items/RequestSiteVisitForm').then((m) => ({ default: m.RequestSiteVisitForm }))
);
const BoqQuotationRequestForm = React.lazy(() =>
  import('./items/BoqQuotationRequestForm').then((m) => ({ default: m.BoqQuotationRequestForm }))
);
const ElectricalEmergencySupportForm = React.lazy(() =>
  import('./items/ElectricalEmergencySupportForm').then((m) => ({ default: m.ElectricalEmergencySupportForm }))
);
const RequestCallbackForm = React.lazy(() =>
  import('./items/RequestCallbackForm').then((m) => ({ default: m.RequestCallbackForm }))
);
const CustomerComplaintSupportForm = React.lazy(() =>
  import('./items/CustomerComplaintSupportForm').then((m) => ({ default: m.CustomerComplaintSupportForm }))
);

export interface FormMetadataConfig {
  id: FormId;
  formNumber: number;
  title: string;
  shortTitle: string;
  badge: string;
  category: 'Residential' | 'Commercial & Industrial' | 'Engineering & Audits' | 'Emergency & Support' | 'Corporate';
  secondaryCategories?: ('Residential' | 'Commercial & Industrial' | 'Engineering & Audits' | 'Emergency & Support' | 'Corporate')[];
  hiddenInHub?: boolean;
  description: string;
  icon: string;
}

export const FORMS_REGISTRY: Record<FormId, FormMetadataConfig> = {
  'residential-industrial-commercial': {
    id: 'residential-industrial-commercial',
    formNumber: 1,
    title: 'Residential, Industrial and Commercial Electrical Enquiry',
    shortTitle: 'Residential, Industrial & Commercial',
    badge: 'Home, Industrial & Commercial',
    category: 'Residential',
    secondaryCategories: ['Commercial & Industrial'],
    description: 'House wiring, DB installation, earthing, repairs, plant electrification, MCC/PCC panels, power distribution, and cable laying.',
    icon: 'home',
  },
  'ht-lt-solar': {
    id: 'ht-lt-solar',
    formNumber: 2,
    title: 'HT/LT & Solar Enquiry',
    shortTitle: 'HT/LT & Solar',
    badge: 'HT/LT Substations & Solar EPC',
    category: 'Commercial & Industrial',
    secondaryCategories: ['Residential'],
    description: 'High-voltage 11kV–66kV substations, transformers, VCB panels, CEIG approvals, and on-grid/off-grid/hybrid rooftop solar with BESCOM net metering.',
    icon: 'bolt',
  },
  'residential-service': {
    id: 'residential-service',
    formNumber: 1,
    title: 'Residential, Industrial and Commercial Electrical Enquiry',
    shortTitle: 'Residential Service',
    badge: 'Home Electrical',
    category: 'Residential',
    hiddenInHub: true,
    description: 'Wiring, rewiring, DB installation, earthing, lighting and repair for houses, apartments & villas.',
    icon: 'home',
  },
  'industrial-commercial': {
    id: 'industrial-commercial',
    formNumber: 1,
    title: 'Residential, Industrial and Commercial Electrical Enquiry',
    shortTitle: 'Industrial & Commercial',
    badge: 'Turnkey Electrification',
    category: 'Commercial & Industrial',
    hiddenInHub: true,
    description: 'Plant electrification, power distribution, panels, cable laying and statutory liaisoning.',
    icon: 'factory',
  },
  'ht-lt-works': {
    id: 'ht-lt-works',
    formNumber: 2,
    title: 'HT/LT & Solar Enquiry',
    shortTitle: 'HT/LT Infrastructure',
    badge: '11kV–66kV Substations',
    category: 'Commercial & Industrial',
    hiddenInHub: true,
    description: 'High-voltage substations, transformer commissioning, VCB panels, and CEIG approvals.',
    icon: 'bolt',
  },
  'solar-rooftop': {
    id: 'solar-rooftop',
    formNumber: 2,
    title: 'HT/LT & Solar Enquiry',
    shortTitle: 'Solar Rooftop',
    badge: 'Solar EPC Solutions',
    category: 'Residential',
    hiddenInHub: true,
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
    hiddenInHub: true,
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
export { openAesEnquiryModal };

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

    window.addEventListener(AES_OPEN_FORM_MODAL_EVENT, handleOpenEvent);
    setEnquiryModalMounted(true);

    const pendingId = consumePendingEnquiryModalId();
    if (pendingId && FORMS_REGISTRY[pendingId]) {
      setActiveFormId(pendingId);
    }

    return () => {
      setEnquiryModalMounted(false);
      window.removeEventListener(AES_OPEN_FORM_MODAL_EVENT, handleOpenEvent);
    };
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
      case 'residential-industrial-commercial':
        return <ResidentialIndustrialCommercialForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" initialScope="both" />;
      case 'residential-service':
        return <ResidentialIndustrialCommercialForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" initialScope="residential" />;
      case 'industrial-commercial':
        return <ResidentialIndustrialCommercialForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" initialScope="industrial-commercial" />;
      case 'ht-lt-solar':
        return <HtLtSolarCombinedForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" initialScope="both" />;
      case 'ht-lt-works':
        return <HtLtSolarCombinedForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" initialScope="ht-lt" />;
      case 'solar-rooftop':
        return <HtLtSolarCombinedForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" initialScope="solar" />;
      case 'maintenance-amc':
        return <ElectricalMaintenanceAmcForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'safety-audit':
        return <ElectricalInspectionAuditForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'design-consultancy':
        return <EngineeringDesignConsultancyForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'site-visit':
        return <RequestSiteVisitForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'boq-quotation':
        return <BoqQuotationRequestForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'emergency-support':
        return <ElectricalEmergencySupportForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
      case 'request-callback':
        return <RequestCallbackForm onCancel={handleClose} onSuccess={handleSuccess} variant="modal" />;
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
      badge={config.badge}
      description={config.description}
      icon={config.icon}
    >
      <Suspense
        fallback={
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-3 border-[#0284C7] border-t-transparent animate-spin" />
            <span className="text-[13px] text-[#006398] font-semibold">Loading form...</span>
          </div>
        }
      >
        {renderActiveForm()}
      </Suspense>
    </FormModal>
  );
};
