import React, { useState } from 'react';
import { FormWrapper } from '../FormWrapper';
import { InputField } from '../fields/InputField';
import { SelectField } from '../fields/SelectField';
import { TextAreaField } from '../fields/TextAreaField';
import { FileUploadField } from '../fields/FileUploadField';
import { ConsentCheckbox } from '../fields/ConsentCheckbox';
import { validateIndianMobile, validateRequired } from '../validation';
import { SubmissionService, AES_CONTACT_DETAILS } from '../submissionService';
import { BaseEnquirySubmission, UploadedFileMeta } from '../types';

interface ElectricalEmergencySupportFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const EMERGENCY_TYPES = [
  'Power Failure',
  'Electrical Short Circuit',
  'Panel Fault',
  'Transformer Issue',
  'Cable Fault',
  'Burning Smell / Overheating',
  'Other',
];

const SEVERITY_LEVELS = ['Critical', 'Urgent', 'Normal'];

export const ElectricalEmergencySupportForm: React.FC<ElectricalEmergencySupportFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [location, setLocation] = useState('');
  const [propertyFacilityType, setPropertyFacilityType] = useState('');
  const [emergencyType, setEmergencyType] = useState('Electrical Short Circuit');
  const [severity, setSeverity] = useState<'Critical' | 'Urgent' | 'Normal'>('Critical');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<UploadedFileMeta[]>([]);
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(name, 'Name');
    if (!nameCheck.isValid) newErrors.name = nameCheck.error!;

    const phoneCheck = validateIndianMobile(contactNumber);
    if (!phoneCheck.isValid) newErrors.contactNumber = phoneCheck.error!;

    const locCheck = validateRequired(location, 'Location');
    if (!locCheck.isValid) newErrors.location = locCheck.error!;

    if (!consent) {
      newErrors.consent = 'Consent is required to submit emergency assistance request.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await SubmissionService.submitEnquiry({
      formId: 'emergency-support',
      formTitle: 'Electrical Emergency Support',
      customerName: name,
      contactNumber,
      location,
      consentGiven: consent,
      data: {
        'Property / Facility Type': propertyFacilityType || 'General facility',
        'Emergency Type': emergencyType,
        Severity: severity,
        'Situation Description': description,
        'Direct Hotline': AES_CONTACT_DETAILS.phone,
      },
      files,
    });

    setIsSubmitting(false);
    if (result.success && result.submission) {
      setSubmissionSuccess(result.submission);
      onSuccess?.(result.submission);
    }
  };

  const handleReset = () => {
    setName('');
    setContactNumber('');
    setLocation('');
    setPropertyFacilityType('');
    setDescription('');
    setFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  const safetyNotice = (
    <div className="p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[24px] text-red-600 animate-pulse">
          warning
        </span>
        <h4 className="font-bold text-[14px] uppercase tracking-wide text-red-800">
          ELECTRICAL SAFETY ADVISORY & PROTOCOL
        </h4>
      </div>
      <p className="text-[12.5px] leading-relaxed text-red-800">
        <strong>CRITICAL SAFETY RULE:</strong> Please immediately stay far away from exposed live wires, sparking breaker panels, flooded switchgear, or smoking equipment. If life safety or an active flame hazard is present, immediately evacuate the premises and dial Fire Services (101) or BESCOM Emergency (1912).
      </p>
      <div className="flex items-center justify-between text-[11.5px] bg-red-100/70 p-2.5 rounded-lg border border-red-200">
        <span className="text-red-700 font-medium">
          Note: AES dispatches licensed engineers as quickly as scheduling and traffic permit; submission does not guarantee immediate availability.
        </span>
        <a
          href={`tel:${AES_CONTACT_DETAILS.phoneDial}`}
          className="font-bold text-red-800 underline hover:text-black shrink-0 ml-2"
        >
          Direct Hotline: +91 9632025123
        </a>
      </div>
    </div>
  );

  return (
    <FormWrapper
      formId="emergency-support"
      title="Electrical Emergency Support"
      badge="Form 11 · Emergency Breakdown Dispatch"
      description="Report sudden power outages, tripped main circuit breakers, transformer sparking, or electrical short circuits to our rapid breakdown crew."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="REQUEST EMERGENCY ASSISTANCE"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
      safetyNotice={safetyNotice}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Name"
          required
          icon="person"
          placeholder="e.g. Anand Rao"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        <InputField
          label="Contact Number"
          required
          type="tel"
          icon="phone_in_talk"
          placeholder="e.g. +91 9632025123"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          error={errors.contactNumber}
          helperText="Keep this phone reachable for immediate engineer callback"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Exact Site Location"
          required
          icon="location_on"
          placeholder="Building name, street, landmark in Bengaluru"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          error={errors.location}
        />

        <InputField
          label="Property / Facility Type"
          icon="domain"
          placeholder="e.g. Hospital, Factory, Residential Apartment"
          value={propertyFacilityType}
          onChange={(e) => setPropertyFacilityType(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Emergency Type"
          required
          options={EMERGENCY_TYPES}
          value={emergencyType}
          onChange={(e) => setEmergencyType(e.target.value)}
          icon="report_problem"
        />

        <SelectField
          label="Severity Level"
          required
          options={SEVERITY_LEVELS}
          value={severity}
          onChange={(e) => setSeverity(e.target.value as any)}
          icon="priority_high"
        />
      </div>

      <TextAreaField
        label="Description of Emergency Situation"
        placeholder="Is there smoke, sparking, buzzing noise, or whole-facility blackout? Mention if main breaker trips immediately upon resetting..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <FileUploadField
        label="Upload Images (Optional)"
        preset="general"
        files={files}
        onChange={setFiles}
        helperText="Take a photo from a safe distance of the affected panel or breaker (Optional)"
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
