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

interface CustomerComplaintSupportFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const ISSUE_CATEGORIES = [
  'Electrical Installation',
  'Wiring',
  'Panel',
  'Transformer',
  'Solar System',
  'Maintenance',
  'Other',
];

const PRIORITIES = ['Critical', 'High', 'Normal'];
const CONTACT_METHODS = ['Phone', 'WhatsApp', 'Email'];

export const CustomerComplaintSupportForm: React.FC<CustomerComplaintSupportFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [workReferenceNumber, setWorkReferenceNumber] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [issueCategory, setIssueCategory] = useState('Panel');
  const [complaintPriority, setComplaintPriority] = useState<'Critical' | 'High' | 'Normal'>('High');
  const [issueDescription, setIssueDescription] = useState('');
  const [dateIssueOccurred, setDateIssueOccurred] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'Phone' | 'WhatsApp' | 'Email'>('Phone');
  const [files, setFiles] = useState<UploadedFileMeta[]>([]);
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(customerName, 'Customer Name');
    if (!nameCheck.isValid) newErrors.customerName = nameCheck.error!;

    const phoneCheck = validateIndianMobile(contactNumber);
    if (!phoneCheck.isValid) newErrors.contactNumber = phoneCheck.error!;

    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) newErrors.email = emailCheck.error!;
    }

    const locCheck = validateRequired(projectLocation, 'Project Location');
    if (!locCheck.isValid) newErrors.projectLocation = locCheck.error!;

    const descCheck = validateRequired(issueDescription, 'Issue Description');
    if (!descCheck.isValid) newErrors.issueDescription = descCheck.error!;

    if (!consent) {
      newErrors.consent = 'Consent is required to submit your service ticket.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await SubmissionService.submitEnquiry({
      formId: 'customer-complaint',
      formTitle: 'Customer Complaint & Service Support',
      customerName,
      contactNumber,
      email,
      location: projectLocation,
      consentGiven: consent,
      data: {
        'Work Reference / Invoice No': workReferenceNumber || 'Ongoing account',
        'Issue Category': issueCategory,
        'Complaint Priority': complaintPriority,
        'Date Issue Occurred': dateIssueOccurred || 'Recent',
        'Preferred Contact Method': preferredContactMethod,
        'Issue Description': issueDescription,
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
    setCustomerName('');
    setContactNumber('');
    setEmail('');
    setWorkReferenceNumber('');
    setProjectLocation('');
    setIssueDescription('');
    setDateIssueOccurred('');
    setFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="customer-complaint"
      title="Customer Complaint & Service Support"
      badge="Form 15 · Client Support & Warranty"
      description="Existing customer experiencing an issue with installed panels, inverters, or wiring? Log an official service ticket for prompt technical redressal."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="SUBMIT SERVICE REQUEST"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Customer Name"
          required
          icon="person"
          placeholder="e.g. Sudhir M. Shenoy"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          error={errors.customerName}
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
          placeholder="e.g. sudhir@domain.com (Optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <InputField
          label="Project / Work Reference Number"
          icon="tag"
          placeholder="e.g. AES-2025-XXXX or Invoice #"
          value={workReferenceNumber}
          onChange={(e) => setWorkReferenceNumber(e.target.value)}
          helperText="Found on invoice or agreement"
        />

        <InputField
          label="Project Location"
          required
          icon="location_on"
          placeholder="e.g. Sahakarnagar / Vidyaranyapura"
          value={projectLocation}
          onChange={(e) => setProjectLocation(e.target.value)}
          error={errors.projectLocation}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Issue Category"
          required
          options={ISSUE_CATEGORIES}
          value={issueCategory}
          onChange={(e) => setIssueCategory(e.target.value)}
          icon="build"
        />

        <SelectField
          label="Complaint Priority"
          required
          options={PRIORITIES}
          value={complaintPriority}
          onChange={(e) => setComplaintPriority(e.target.value as any)}
          icon="priority_high"
        />

        <SelectField
          label="Preferred Contact Method"
          required
          options={CONTACT_METHODS}
          value={preferredContactMethod}
          onChange={(e) => setPreferredContactMethod(e.target.value as any)}
          icon="contact_support"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Date Issue Occurred"
          type="date"
          icon="event"
          value={dateIssueOccurred}
          onChange={(e) => setDateIssueOccurred(e.target.value)}
        />

        <div className="flex flex-col justify-end">
          <p className="text-[12px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <strong className="text-[#0B192C]">Warranty Assurance:</strong> Projects under defect liability period or active AMC receive prioritized technician dispatch within 4 hours.
          </p>
        </div>
      </div>

      <TextAreaField
        label="Issue Description"
        required
        placeholder="Please detail the symptoms: breaker trip frequency, error code on solar inverter or protection relay, voltage fluctuation, or physical damage..."
        value={issueDescription}
        onChange={(e) => setIssueDescription(e.target.value)}
        error={errors.issueDescription}
      />

      <FileUploadField
        label="Upload Supporting Images / Documents"
        preset="general"
        files={files}
        onChange={setFiles}
        helperText="Photos of the faulted equipment, error code display, or warranty card (Optional)"
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
