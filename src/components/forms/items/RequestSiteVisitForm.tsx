import React, { useState } from 'react';
import { FormWrapper } from '../FormWrapper';
import { InputField } from '../fields/InputField';
import { SelectField } from '../fields/SelectField';
import { TextAreaField } from '../fields/TextAreaField';
import { FileUploadField } from '../fields/FileUploadField';
import { ConsentCheckbox } from '../fields/ConsentCheckbox';
import { validateIndianMobile, validateEmail, validateRequired } from '../validation';
import { SubmissionService } from '../submissionService';
import { BaseEnquirySubmission, UploadedFileMeta } from '../types';

interface RequestSiteVisitFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const SERVICE_REQUIRED_OPTIONS = [
  'Residential Electrical',
  'Commercial Electrical',
  'Industrial Electrical',
  'HT/LT Works',
  'Solar Installation',
  'Electrical Inspection',
  'Maintenance',
  'Other',
];

const TIME_SLOTS = ['9 AM – 12 PM', '12 PM – 3 PM', '3 PM – 6 PM'];

export const RequestSiteVisitForm: React.FC<RequestSiteVisitFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [propertyFacilityType, setPropertyFacilityType] = useState('');
  const [serviceRequired, setServiceRequired] = useState('Residential Electrical');
  const [preferredVisitDate, setPreferredVisitDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<'9 AM – 12 PM' | '12 PM – 3 PM' | '3 PM – 6 PM'>(
    '9 AM – 12 PM'
  );
  const [projectDescription, setProjectDescription] = useState('');
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

    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) newErrors.email = emailCheck.error!;
    }

    const locCheck = validateRequired(projectLocation, 'Project Location');
    if (!locCheck.isValid) newErrors.projectLocation = locCheck.error!;

    const dateCheck = validateRequired(preferredVisitDate, 'Preferred Visit Date');
    if (!dateCheck.isValid) newErrors.preferredVisitDate = dateCheck.error!;

    if (!consent) {
      newErrors.consent = 'Consent is required to schedule a site inspection.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await SubmissionService.submitEnquiry({
      formId: 'site-visit',
      formTitle: 'Request a Site Visit',
      customerName: name,
      contactNumber,
      email,
      location: projectLocation,
      consentGiven: consent,
      data: {
        'Facility Type': propertyFacilityType || 'General site',
        'Service Required': serviceRequired,
        'Preferred Visit Date': preferredVisitDate,
        'Preferred Time Slot': preferredTimeSlot,
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
    setName('');
    setContactNumber('');
    setEmail('');
    setProjectLocation('');
    setPropertyFacilityType('');
    setPreferredVisitDate('');
    setProjectDescription('');
    setFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="site-visit"
      title="Request an On-Site Engineering Visit"
      badge="Form 09 · Site Inspection & Survey"
      description="Book an on-site visit by an experienced electrical supervisor to take measurements, assess load capacity, and evaluate electrical routing."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="SCHEDULE SITE VISIT"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Name"
          required
          icon="person"
          placeholder="e.g. Gururaj Joshi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Email Address"
          type="email"
          icon="mail"
          placeholder="e.g. gururaj@example.com (Optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <InputField
          label="Project Location"
          required
          icon="location_on"
          placeholder="e.g. Sahakarnagar / Jakkur / Yelahanka"
          value={projectLocation}
          onChange={(e) => setProjectLocation(e.target.value)}
          error={errors.projectLocation}
        />

        <InputField
          label="Property / Facility Type"
          icon="home_work"
          placeholder="e.g. Villa, Commercial Showroom, Factory"
          value={propertyFacilityType}
          onChange={(e) => setPropertyFacilityType(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Service Required"
          required
          options={SERVICE_REQUIRED_OPTIONS}
          value={serviceRequired}
          onChange={(e) => setServiceRequired(e.target.value)}
          icon="electrical_services"
        />

        <InputField
          label="Preferred Visit Date"
          required
          type="date"
          icon="event"
          value={preferredVisitDate}
          onChange={(e) => setPreferredVisitDate(e.target.value)}
          error={errors.preferredVisitDate}
        />

        <SelectField
          label="Preferred Time Slot"
          required
          options={TIME_SLOTS}
          value={preferredTimeSlot}
          onChange={(e) => setPreferredTimeSlot(e.target.value as any)}
          icon="schedule"
        />
      </div>

      <TextAreaField
        label="Project Description & Landmark Details"
        placeholder="Provide nearest landmark, gated community rules, key electrical scope, or site access instructions..."
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
      />

      <FileUploadField
        label="Upload Site Images"
        preset="general"
        files={files}
        onChange={setFiles}
        helperText="Upload photos of site exterior, existing meter box, or electrical panel (Optional)"
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
