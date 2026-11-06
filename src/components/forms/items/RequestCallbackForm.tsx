import React, { useState } from 'react';
import { FormWrapper } from '../FormWrapper';
import { InputField } from '../fields/InputField';
import { SelectField } from '../fields/SelectField';
import { TextAreaField } from '../fields/TextAreaField';
import { ConsentCheckbox } from '../fields/ConsentCheckbox';
import { validateIndianMobile, validateEmail, validateRequired } from '../validation';
import { SubmissionService } from '../submissionService';
import { BaseEnquirySubmission } from '../types';

interface RequestCallbackFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const SERVICE_INTEREST_OPTIONS = [
  'Residential Electrical',
  'Industrial Electrical',
  'HT/LT Works',
  'Solar Solutions',
  'Maintenance',
  'Engineering Consultancy',
  'Other',
];

const CALLBACK_TIMES = ['Morning', 'Afternoon', 'Evening'];

export const RequestCallbackForm: React.FC<RequestCallbackFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [serviceInterestedIn, setServiceInterestedIn] = useState('Industrial Electrical');
  const [preferredCallbackTime, setPreferredCallbackTime] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [briefRequirement, setBriefRequirement] = useState('');
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(fullName, 'Full Name');
    if (!nameCheck.isValid) newErrors.fullName = nameCheck.error!;

    const phoneCheck = validateIndianMobile(phoneNumber);
    if (!phoneCheck.isValid) newErrors.phoneNumber = phoneCheck.error!;

    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) newErrors.email = emailCheck.error!;
    }

    if (!consent) {
      newErrors.consent = 'Consent is required to request a phone callback.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await SubmissionService.submitEnquiry({
      formId: 'request-callback',
      formTitle: 'Request a Callback',
      customerName: fullName,
      contactNumber: phoneNumber,
      email,
      consentGiven: consent,
      data: {
        'Service Interested In': serviceInterestedIn,
        'Preferred Callback Window': preferredCallbackTime,
        'Brief Requirement': briefRequirement || 'General enquiry',
      },
    });

    setIsSubmitting(false);
    if (result.success && result.submission) {
      setSubmissionSuccess(result.submission);
      onSuccess?.(result.submission);
    }
  };

  const handleReset = () => {
    setFullName('');
    setPhoneNumber('');
    setEmail('');
    setBriefRequirement('');
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="request-callback"
      title="Request an Engineering Callback"
      badge="Quick Enquiry"
      description="Short on time? Leave your number and our licensed electrical consultant will phone you back at your preferred convenience window."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="REQUEST CALLBACK"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Full Name"
          required
          icon="person"
          placeholder="e.g. S. Krishnamurthy"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />

        <InputField
          label="Phone Number"
          required
          type="tel"
          icon="phone"
          placeholder="e.g. +91 9632025123"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          error={errors.phoneNumber}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Email Address"
          type="email"
          icon="mail"
          placeholder="e.g. skm@gmail.com (Optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <SelectField
          label="Service Interested In"
          required
          options={SERVICE_INTEREST_OPTIONS}
          value={serviceInterestedIn}
          onChange={(e) => setServiceInterestedIn(e.target.value)}
          icon="bolt"
        />

        <SelectField
          label="Preferred Callback Time"
          required
          options={CALLBACK_TIMES}
          value={preferredCallbackTime}
          onChange={(e) => setPreferredCallbackTime(e.target.value as any)}
          icon="schedule"
        />
      </div>

      <TextAreaField
        label="Brief Requirement"
        placeholder="Tell us briefly what you're looking for (e.g. 100kVA transformer quotation, CEIG safety certificate, 3BHK flat rewiring)..."
        value={briefRequirement}
        onChange={(e) => setBriefRequirement(e.target.value)}
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
