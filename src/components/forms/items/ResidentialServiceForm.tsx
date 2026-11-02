import React, { useState } from 'react';
import { FormWrapper } from '../FormWrapper';
import { InputField } from '../fields/InputField';
import { SelectField } from '../fields/SelectField';
import { MultiSelectField } from '../fields/MultiSelectField';
import { TextAreaField } from '../fields/TextAreaField';
import { FileUploadField } from '../fields/FileUploadField';
import { ConsentCheckbox } from '../fields/ConsentCheckbox';
import { validateIndianMobile, validateEmail, validateRequired } from '../validation';
import { SubmissionService } from '../submissionService';
import { BaseEnquirySubmission, UploadedFileMeta } from '../types';

interface ResidentialServiceFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const PROPERTY_TYPES = ['Independent House', 'Apartment', 'Villa', 'Residential Complex', 'Other'];
const PROPERTY_SIZES = ['Below 1,000 sq. ft.', '1,000–2,000 sq. ft.', '2,000–3,000 sq. ft.', 'Above 3,000 sq. ft.'];
const SERVICE_OPTIONS = [
  'New Electrical Wiring',
  'Rewiring',
  'Electrical Repairs',
  'Lighting Installation',
  'Distribution Board Installation',
  'Earthing Installation',
  'Electrical Panel Upgrade',
  'Other',
];

export const ResidentialServiceForm: React.FC<ResidentialServiceFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [propertyType, setPropertyType] = useState('Independent House');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [propertySize, setPropertySize] = useState('1,000–2,000 sq. ft.');
  const [requiredServices, setRequiredServices] = useState<string[]>(['New Electrical Wiring']);
  const [preferredSiteVisitDate, setPreferredSiteVisitDate] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [files, setFiles] = useState<UploadedFileMeta[]>([]);
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(fullName, 'Full Name');
    if (!nameCheck.isValid) newErrors.fullName = nameCheck.error!;

    const phoneCheck = validateIndianMobile(contactNumber);
    if (!phoneCheck.isValid) newErrors.contactNumber = phoneCheck.error!;

    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) newErrors.email = emailCheck.error!;
    }

    const locCheck = validateRequired(propertyLocation, 'Property Location');
    if (!locCheck.isValid) newErrors.propertyLocation = locCheck.error!;

    if (requiredServices.length === 0) {
      newErrors.requiredServices = 'Please select at least one electrical service.';
    }

    if (!consent) {
      newErrors.consent = 'Consent is required to submit your service request.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await SubmissionService.submitEnquiry({
      formId: 'residential-service',
      formTitle: 'Residential Electrical Service Request',
      customerName: fullName,
      contactNumber,
      email,
      location: propertyLocation,
      consentGiven: consent,
      data: {
        'Property Type': propertyType,
        'Property Size': propertySize,
        'Required Services': requiredServices,
        'Preferred Site Visit Date': preferredSiteVisitDate || 'Flexible',
        'Project Description': projectDescription,
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
    setFullName('');
    setContactNumber('');
    setEmail('');
    setPropertyLocation('');
    setRequiredServices(['New Electrical Wiring']);
    setProjectDescription('');
    setFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="residential-service"
      title="Residential Electrical Service Request"
      badge="Form 01 · Residential"
      description="Professional house wiring, distribution board upgrades, pipe earthing, and safety repairs by certified residential technicians."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="REQUEST ELECTRICAL SERVICE"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Full Name"
          required
          icon="person"
          placeholder="e.g. Ramesh Kumar"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />

        <InputField
          label="Contact Number"
          required
          type="tel"
          icon="phone"
          placeholder="e.g. +91 9632025123"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          error={errors.contactNumber}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Email Address"
          type="email"
          icon="mail"
          placeholder="e.g. ramesh@example.com (Optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          helperText="Optional – for quotation and digital receipt"
        />

        <InputField
          label="Property Location"
          required
          icon="location_on"
          placeholder="e.g. Sahakarnagar / Hebbal, Bengaluru"
          value={propertyLocation}
          onChange={(e) => setPropertyLocation(e.target.value)}
          error={errors.propertyLocation}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Property Type"
          required
          options={PROPERTY_TYPES}
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          icon="home"
        />

        <SelectField
          label="Property Size"
          required
          options={PROPERTY_SIZES}
          value={propertySize}
          onChange={(e) => setPropertySize(e.target.value)}
          icon="square_foot"
        />
      </div>

      <MultiSelectField
        label="Required Service"
        required
        options={SERVICE_OPTIONS}
        selectedValues={requiredServices}
        onChange={setRequiredServices}
        error={errors.requiredServices}
        helperText="Select one or more services needed for your home."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Preferred Site Visit Date"
          type="date"
          icon="calendar_today"
          value={preferredSiteVisitDate}
          onChange={(e) => setPreferredSiteVisitDate(e.target.value)}
          helperText="Convenient date for our supervisor to inspect"
        />

        <div className="flex flex-col justify-end">
          <p className="text-[12px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <strong className="text-[#0B192C]">Standard Visit:</strong> Monday to Saturday between 8:30 AM and 7:30 PM across Bengaluru.
          </p>
        </div>
      </div>

      <TextAreaField
        label="Project Description"
        placeholder="Briefly describe your electrical requirements, points count, or any specific challenges..."
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
      />

      <FileUploadField
        label="Upload Images or Documents"
        preset="general"
        files={files}
        onChange={setFiles}
        helperText="Attach layout plan, existing DB photo, or room pictures (Optional, Max 10 MB)"
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
