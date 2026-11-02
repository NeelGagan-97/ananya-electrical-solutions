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

interface BoqQuotationRequestFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const PROJECT_CATEGORIES = [
  'Residential',
  'Commercial',
  'Industrial',
  'HT/LT Electrical Works',
  'Solar',
  'Other',
];

const QUOTATION_TYPES = [
  'Material Supply',
  'Labour Contract',
  'Material + Labour',
  'Complete Project Execution',
];

export const BoqQuotationRequestForm: React.FC<BoqQuotationRequestFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [companyOrCustomerName, setCompanyOrCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectCategory, setProjectCategory] = useState('Commercial');
  const [quotationType, setQuotationType] = useState('Complete Project Execution');
  const [approximateBudget, setApproximateBudget] = useState('');
  const [requiredQuotationDate, setRequiredQuotationDate] = useState('');
  const [boqFiles, setBoqFiles] = useState<UploadedFileMeta[]>([]);
  const [drawingFiles, setDrawingFiles] = useState<UploadedFileMeta[]>([]);
  const [specFiles, setSpecFiles] = useState<UploadedFileMeta[]>([]);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(companyOrCustomerName, 'Company / Customer Name');
    if (!nameCheck.isValid) newErrors.companyOrCustomerName = nameCheck.error!;

    const personCheck = validateRequired(contactPerson, 'Contact Person');
    if (!personCheck.isValid) newErrors.contactPerson = personCheck.error!;

    const phoneCheck = validateIndianMobile(phoneNumber);
    if (!phoneCheck.isValid) newErrors.phoneNumber = phoneCheck.error!;

    const emailCheck = validateEmail(officialEmail, true);
    if (!emailCheck.isValid) newErrors.officialEmail = emailCheck.error!;

    const locCheck = validateRequired(projectLocation, 'Project Location');
    if (!locCheck.isValid) newErrors.projectLocation = locCheck.error!;

    if (boqFiles.length === 0) {
      newErrors.boqFiles = 'Please upload at least one BOQ document (XLSX, CSV, or PDF).';
    }

    if (!consent) {
      newErrors.consent = 'Consent is required to submit your quotation request.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const allFiles = [...boqFiles, ...drawingFiles, ...specFiles];

    const result = await SubmissionService.submitEnquiry({
      formId: 'boq-quotation',
      formTitle: 'BOQ Upload & Quotation Request',
      customerName: contactPerson,
      contactNumber: phoneNumber,
      email: officialEmail,
      location: projectLocation,
      consentGiven: consent,
      data: {
        'Company / Client': companyOrCustomerName,
        'Project Category': projectCategory,
        'Quotation Type': quotationType,
        'Approximate Budget': approximateBudget || 'Open for competitive bidding',
        'Required By Date': requiredQuotationDate || 'Within standard 48 hours',
        'BOQ Items Attached': boqFiles.map((f) => f.name).join(', '),
        'Additional Instructions': additionalInstructions,
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
    setCompanyOrCustomerName('');
    setContactPerson('');
    setPhoneNumber('');
    setOfficialEmail('');
    setProjectLocation('');
    setApproximateBudget('');
    setRequiredQuotationDate('');
    setBoqFiles([]);
    setDrawingFiles([]);
    setSpecFiles([]);
    setAdditionalInstructions('');
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="boq-quotation"
      title="BOQ Upload & Quotation Request"
      badge="Form 10 · Tender & BOQ Costing"
      description="Upload your itemized Bill of Quantities (BOQ), tender schedule, or approved single line diagrams for transparent, item-by-item estimation."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="REQUEST PROJECT QUOTATION"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Company / Customer Name"
          required
          icon="business"
          placeholder="e.g. Sobha Developers / Vensa Power Tech"
          value={companyOrCustomerName}
          onChange={(e) => setCompanyOrCustomerName(e.target.value)}
          error={errors.companyOrCustomerName}
        />

        <InputField
          label="Contact Person"
          required
          icon="person"
          placeholder="e.g. Rajesh Nair (Tender Manager)"
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
          placeholder="e.g. tenders@client.com"
          value={officialEmail}
          onChange={(e) => setOfficialEmail(e.target.value)}
          error={errors.officialEmail}
        />

        <InputField
          label="Project Location"
          required
          icon="location_on"
          placeholder="e.g. Manyata Tech Park, Nagavara"
          value={projectLocation}
          onChange={(e) => setProjectLocation(e.target.value)}
          error={errors.projectLocation}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Project Category"
          required
          options={PROJECT_CATEGORIES}
          value={projectCategory}
          onChange={(e) => setProjectCategory(e.target.value)}
          icon="category"
        />

        <SelectField
          label="Quotation Type"
          required
          options={QUOTATION_TYPES}
          value={quotationType}
          onChange={(e) => setQuotationType(e.target.value)}
          icon="calculate"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Approximate Project Budget"
          icon="currency_rupee"
          placeholder="e.g. ₹25 Lakhs – ₹50 Lakhs (Optional)"
          value={approximateBudget}
          onChange={(e) => setApproximateBudget(e.target.value)}
          helperText="Assists in engineering tier / make recommendation"
        />

        <InputField
          label="Required Quotation Date"
          type="date"
          icon="alarm"
          value={requiredQuotationDate}
          onChange={(e) => setRequiredQuotationDate(e.target.value)}
          helperText="Tender closing or bid deadline"
        />
      </div>

      {/* BOQ Upload (Required) */}
      <FileUploadField
        label="Upload BOQ Document (Bill of Quantities)"
        required
        preset="boq"
        files={boqFiles}
        onChange={setBoqFiles}
        error={errors.boqFiles}
        helperText="Required – Excel (.xlsx, .csv) or PDF document detailing items and quantities"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadField
          label="Upload Drawings"
          preset="technicalDrawings"
          files={drawingFiles}
          onChange={setDrawingFiles}
          helperText="Layouts, CAD drawings, or cable trench routes (Optional)"
        />

        <FileUploadField
          label="Upload Technical Specifications"
          preset="general"
          files={specFiles}
          onChange={setSpecFiles}
          helperText="Approved make list, equipment datasheets (Optional)"
        />
      </div>

      <TextAreaField
        label="Additional Instructions & Tender Milestones"
        placeholder="Specify brand preferences (L&T, Siemens, Schneider, Polycab), defect liability period, or supply-only delivery location..."
        value={additionalInstructions}
        onChange={(e) => setAdditionalInstructions(e.target.value)}
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
