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

interface IndustrialCommercialFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const INDUSTRY_TYPES = [
  'Manufacturing',
  'IT / Software Office',
  'Warehouse',
  'Shopping Mall',
  'Hospital',
  'Educational Institution',
  'Hotel',
  'Commercial Complex',
  'Other',
];

const VOLTAGE_LEVELS = ['LT', 'HT', 'Both', 'Not Sure'];

const REQUIRED_SERVICES = [
  'Electrical Installation',
  'Industrial Wiring',
  'Power Distribution',
  'Electrical Panels',
  'Transformer Installation',
  'Cable Laying',
  'Lighting Systems',
  'Earthing Systems',
  'Electrical Maintenance',
];

export const IndustrialCommercialForm: React.FC<IndustrialCommercialFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [industryType, setIndustryType] = useState('Manufacturing');
  const [projectLocation, setProjectLocation] = useState('');
  const [connectedLoad, setConnectedLoad] = useState('');
  const [voltageLevel, setVoltageLevel] = useState<'LT' | 'HT' | 'Both' | 'Not Sure'>('LT');
  const [requiredServices, setRequiredServices] = useState<string[]>(['Industrial Wiring', 'Power Distribution']);
  const [projectScope, setProjectScope] = useState('');
  const [files, setFiles] = useState<UploadedFileMeta[]>([]);
  const [expectedStartDate, setExpectedStartDate] = useState('');
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const companyCheck = validateRequired(companyName, 'Company / Organization Name');
    if (!companyCheck.isValid) newErrors.companyName = companyCheck.error!;

    const personCheck = validateRequired(contactPerson, 'Contact Person');
    if (!personCheck.isValid) newErrors.contactPerson = personCheck.error!;

    const phoneCheck = validateIndianMobile(contactNumber);
    if (!phoneCheck.isValid) newErrors.contactNumber = phoneCheck.error!;

    const emailCheck = validateEmail(officialEmail, true);
    if (!emailCheck.isValid) newErrors.officialEmail = emailCheck.error!;

    const locCheck = validateRequired(projectLocation, 'Project Location');
    if (!locCheck.isValid) newErrors.projectLocation = locCheck.error!;

    if (requiredServices.length === 0) {
      newErrors.requiredServices = 'Please select at least one required service.';
    }

    if (!consent) {
      newErrors.consent = 'Consent is required to submit your enquiry.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await SubmissionService.submitEnquiry({
      formId: 'industrial-commercial',
      formTitle: 'Industrial & Commercial Electrical Enquiry',
      customerName: contactPerson,
      contactNumber,
      email: officialEmail,
      location: projectLocation,
      consentGiven: consent,
      data: {
        'Company Name': companyName,
        Designation: designation || 'Not specified',
        'GST Number': gstNumber || 'Not provided',
        'Facility Type': industryType,
        'Connected Load': connectedLoad || 'To be assessed',
        'Voltage Level': voltageLevel,
        'Required Services': requiredServices,
        'Project Scope': projectScope,
        'Expected Start Date': expectedStartDate || 'Immediate',
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
    setCompanyName('');
    setContactPerson('');
    setDesignation('');
    setContactNumber('');
    setOfficialEmail('');
    setGstNumber('');
    setProjectLocation('');
    setConnectedLoad('');
    setProjectScope('');
    setFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="industrial-commercial"
      title="Industrial & Commercial Electrical Enquiry"
      badge="Industrial & Commercial Works"
      description="Turnkey plant electrification, MCC/PCC panels, busduct trunking, and BESCOM/CEIG statutory compliance for corporate facilities."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="SUBMIT INDUSTRIAL ENQUIRY"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Company / Organization Name"
          required
          icon="business"
          placeholder="e.g. Apex Precision Engineering Pvt Ltd"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          error={errors.companyName}
        />

        <InputField
          label="Contact Person"
          required
          icon="person"
          placeholder="e.g. Anand Vardhan"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          error={errors.contactPerson}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Designation"
          icon="badge"
          placeholder="e.g. Plant Head / GM Works"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
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

        <InputField
          label="Official Email"
          required
          type="email"
          icon="mail"
          placeholder="e.g. anand@apexeng.in"
          value={officialEmail}
          onChange={(e) => setOfficialEmail(e.target.value)}
          error={errors.officialEmail}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="GST Number"
          icon="receipt_long"
          placeholder="e.g. 29AAAAA0000A1Z5 (Optional)"
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
          helperText="For B2B input tax credit invoices"
        />

        <SelectField
          label="Industry / Facility Type"
          required
          options={INDUSTRY_TYPES}
          value={industryType}
          onChange={(e) => setIndustryType(e.target.value)}
          icon="factory"
        />

        <InputField
          label="Project Location"
          required
          icon="location_on"
          placeholder="e.g. Peenya Industrial Area, Bengaluru"
          value={projectLocation}
          onChange={(e) => setProjectLocation(e.target.value)}
          error={errors.projectLocation}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Connected Load (kW / kVA)"
          icon="bolt"
          placeholder="e.g. 250 kVA or 500 kW"
          value={connectedLoad}
          onChange={(e) => setConnectedLoad(e.target.value)}
          helperText="Approximate or sanction load if known"
        />

        <SelectField
          label="Voltage Level"
          required
          options={VOLTAGE_LEVELS}
          value={voltageLevel}
          onChange={(e) => setVoltageLevel(e.target.value as any)}
          icon="electric_meter"
        />
      </div>

      <MultiSelectField
        label="Required Services"
        required
        options={REQUIRED_SERVICES}
        selectedValues={requiredServices}
        onChange={setRequiredServices}
        error={errors.requiredServices}
        helperText="Select all electrical work categories involved."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Expected Project Start Date"
          type="date"
          icon="calendar_today"
          value={expectedStartDate}
          onChange={(e) => setExpectedStartDate(e.target.value)}
        />

        <div className="flex flex-col justify-end">
          <p className="text-[12px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <strong className="text-[#0B192C]">Turnkey Capability:</strong> AES is a Super Grade licensed electrical contractor with in-house testing equipment and CEIG liaisoning.
          </p>
        </div>
      </div>

      <TextAreaField
        label="Project Scope & Technical Details"
        placeholder="Detail the floor area, machine specifications, HT yard space, or cable routing constraints..."
        value={projectScope}
        onChange={(e) => setProjectScope(e.target.value)}
      />

      <FileUploadField
        label="Upload Drawings / BOQ / Technical Documents"
        preset="boq"
        files={files}
        onChange={setFiles}
        helperText="Upload CAD drawings, Single Line Diagrams, or BOQ spreadsheets (Max 10 MB)"
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
