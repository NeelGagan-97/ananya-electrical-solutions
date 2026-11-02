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

interface VendorRegistrationFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const BUSINESS_CATEGORIES = [
  'Electrical Equipment Supplier',
  'Cable Supplier',
  'Transformer Supplier',
  'Electrical Panel Manufacturer',
  'Solar Equipment Supplier',
  'Electrical Contractor',
  'Subcontractor',
  'Engineering Consultant',
  'Other',
];

export const VendorRegistrationForm: React.FC<VendorRegistrationFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Electrical Equipment Supplier');
  const [productsOffered, setProductsOffered] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [serviceLocations, setServiceLocations] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [additionalInformation, setAdditionalInformation] = useState('');
  const [profileFiles, setProfileFiles] = useState<UploadedFileMeta[]>([]);
  const [gstFiles, setGstFiles] = useState<UploadedFileMeta[]>([]);
  const [certFiles, setCertFiles] = useState<UploadedFileMeta[]>([]);
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const companyCheck = validateRequired(companyName, 'Company Name');
    if (!companyCheck.isValid) newErrors.companyName = companyCheck.error!;

    const personCheck = validateRequired(contactPerson, 'Contact Person');
    if (!personCheck.isValid) newErrors.contactPerson = personCheck.error!;

    const phoneCheck = validateIndianMobile(phoneNumber);
    if (!phoneCheck.isValid) newErrors.phoneNumber = phoneCheck.error!;

    const emailCheck = validateEmail(officialEmail, true);
    if (!emailCheck.isValid) newErrors.officialEmail = emailCheck.error!;

    const addrCheck = validateRequired(companyAddress, 'Company Address');
    if (!addrCheck.isValid) newErrors.companyAddress = addrCheck.error!;

    if (!consent) {
      newErrors.consent = 'Consent is required to submit your vendor registration.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const allFiles = [...profileFiles, ...gstFiles, ...certFiles];

    const result = await SubmissionService.submitEnquiry({
      formId: 'vendor-registration',
      formTitle: 'Vendor Registration & Business Partnership',
      customerName: contactPerson,
      contactNumber: phoneNumber,
      email: officialEmail,
      location: companyAddress,
      consentGiven: consent,
      data: {
        'Company Name': companyName,
        'GST Number': gstNumber || 'Not provided',
        'Business Category': businessCategory,
        'Products / Services Offered': productsOffered,
        'Years of Experience': yearsOfExperience || 'Not specified',
        'Service Locations': serviceLocations || 'Pan Karnataka',
        'Website URL': websiteUrl || 'Not provided',
        'Additional Info': additionalInformation,
      },
      files: allFiles,
    });

    setIsSubmitting(false);
    if (result.success && result.submission) {
      setSubmissionSuccess(result.submission);
      onSuccess?.(result.submission);
    }
  };

  const handleReset = () => {
    setCompanyName('');
    setContactPerson('');
    setPhoneNumber('');
    setOfficialEmail('');
    setGstNumber('');
    setCompanyAddress('');
    setProductsOffered('');
    setYearsOfExperience('');
    setServiceLocations('');
    setWebsiteUrl('');
    setAdditionalInformation('');
    setProfileFiles([]);
    setGstFiles([]);
    setCertFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="vendor-registration"
      title="Vendor Registration & Business Partnership"
      badge="Form 08 · Vendor & Supplier Onboarding"
      description="Register your electrical manufacturing, cable supply, OEM distributorship, or subcontracting capabilities with Ananya Electrical Solutions procurement."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="SUBMIT VENDOR APPLICATION"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Company Name"
          required
          icon="storefront"
          placeholder="e.g. Polycab Cables & Transformers Distributorship"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          error={errors.companyName}
        />

        <InputField
          label="Contact Person"
          required
          icon="person"
          placeholder="e.g. Hemant Kulkarni"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          error={errors.contactPerson}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <InputField
          label="Official Email"
          required
          type="email"
          icon="mail"
          placeholder="e.g. vendor@company.com"
          value={officialEmail}
          onChange={(e) => setOfficialEmail(e.target.value)}
          error={errors.officialEmail}
        />

        <InputField
          label="GST Number"
          icon="receipt_long"
          placeholder="e.g. 29ABCDE1234F1Z5"
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Company Address"
          required
          icon="location_on"
          placeholder="Registered office address & warehouse city"
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
          error={errors.companyAddress}
        />

        <SelectField
          label="Business Category"
          required
          options={BUSINESS_CATEGORIES}
          value={businessCategory}
          onChange={(e) => setBusinessCategory(e.target.value)}
          icon="category"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Years of Experience"
          icon="verified"
          placeholder="e.g. 8 Years"
          value={yearsOfExperience}
          onChange={(e) => setYearsOfExperience(e.target.value)}
        />

        <InputField
          label="Service Locations / Coverage"
          icon="map"
          placeholder="e.g. Bengaluru, Mysore, Hubli, Pan-India"
          value={serviceLocations}
          onChange={(e) => setServiceLocations(e.target.value)}
        />

        <InputField
          label="Website URL"
          type="url"
          icon="language"
          placeholder="https://..."
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
        />
      </div>

      <TextAreaField
        label="Products / Services Offered"
        placeholder="List primary OEM brands (Schneider, ABB, L&T, Siemens, Havells), transformer ranges, cable cross-sections, or fabrication abilities..."
        value={productsOffered}
        onChange={(e) => setProductsOffered(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FileUploadField
          label="Company Profile Upload"
          preset="general"
          files={profileFiles}
          onChange={setProfileFiles}
          helperText="Brochure / PPT (PDF / DOCX)"
        />

        <FileUploadField
          label="GST Certificate Upload"
          preset="general"
          files={gstFiles}
          onChange={setGstFiles}
          helperText="GST REG-06 Certificate (PDF / JPG)"
        />

        <FileUploadField
          label="Certifications Upload"
          preset="general"
          files={certFiles}
          onChange={setCertFiles}
          helperText="ISO, CPRI, or Dealer Authorizations"
        />
      </div>

      <TextAreaField
        label="Additional Information"
        placeholder="Payment terms, warehouse stock capacity, credit period, or reference projects..."
        value={additionalInformation}
        onChange={(e) => setAdditionalInformation(e.target.value)}
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
