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

interface HtLtElectricalWorksFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const PROJECT_CATEGORIES = [
  'HT Electrical Works',
  'LT Electrical Works',
  'HT/LT Substation',
  'Transformer Installation',
  'Electrical Distribution Network',
  'HT/LT Panel Installation',
  'Cable Laying',
  'Other',
];

const VOLTAGE_LEVELS = ['11 kV', '22 kV', '33 kV', '415 V', 'Other'];
const TRANSFORMER_CAPACITIES = ['100 kVA', '250 kVA', '500 kVA', '750 kVA', '1000 kVA', 'Other'];

export const HtLtElectricalWorksForm: React.FC<HtLtElectricalWorksFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [organizationName, setOrganizationName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectCategory, setProjectCategory] = useState('HT/LT Substation');
  const [voltageLevel, setVoltageLevel] = useState('11 kV');
  const [transformerCapacity, setTransformerCapacity] = useState('500 kVA');
  const [customTransformerCapacity, setCustomTransformerCapacity] = useState('');
  const [connectedLoad, setConnectedLoad] = useState('');
  const [numberOfTransformers, setNumberOfTransformers] = useState('1');
  const [projectScope, setProjectScope] = useState('');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('');
  const [sldFiles, setSldFiles] = useState<UploadedFileMeta[]>([]);
  const [boqFiles, setBoqFiles] = useState<UploadedFileMeta[]>([]);
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const orgCheck = validateRequired(organizationName, 'Organization Name');
    if (!orgCheck.isValid) newErrors.organizationName = orgCheck.error!;

    const personCheck = validateRequired(contactPerson, 'Contact Person');
    if (!personCheck.isValid) newErrors.contactPerson = personCheck.error!;

    const phoneCheck = validateIndianMobile(phoneNumber);
    if (!phoneCheck.isValid) newErrors.phoneNumber = phoneCheck.error!;

    const emailCheck = validateEmail(officialEmail, true);
    if (!emailCheck.isValid) newErrors.officialEmail = emailCheck.error!;

    const locCheck = validateRequired(projectLocation, 'Project Location');
    if (!locCheck.isValid) newErrors.projectLocation = locCheck.error!;

    if (!consent) {
      newErrors.consent = 'Consent is required to submit your proposal request.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const resolvedCapacity =
      transformerCapacity === 'Other' && customTransformerCapacity
        ? customTransformerCapacity
        : transformerCapacity;

    const allFiles = [...sldFiles, ...boqFiles];

    const result = await SubmissionService.submitEnquiry({
      formId: 'ht-lt-works',
      formTitle: 'HT/LT Electrical Works Enquiry',
      customerName: contactPerson,
      contactNumber: phoneNumber,
      email: officialEmail,
      location: projectLocation,
      consentGiven: consent,
      data: {
        'Organization Name': organizationName,
        'Project Category': projectCategory,
        'Voltage Level': voltageLevel,
        'Transformer Capacity': resolvedCapacity,
        'Number of Transformers': numberOfTransformers,
        'Connected Load': connectedLoad || 'To be calculated',
        'Project Scope & Technical Requirements': projectScope,
        'Expected Completion Date': expectedCompletionDate || 'Per project schedule',
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
    setOrganizationName('');
    setContactPerson('');
    setPhoneNumber('');
    setOfficialEmail('');
    setProjectLocation('');
    setConnectedLoad('');
    setProjectScope('');
    setSldFiles([]);
    setBoqFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="ht-lt-works"
      title="HT/LT Electrical Works Enquiry"
      badge="HT/LT · High & Low Voltage Infrastructure"
      description="11kV / 33kV / 66kV substation design, CEIG approval documentation, transformer yard civil works, and VCB / ACB panel commissioning."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="REQUEST HT/LT PROPOSAL"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Organization Name"
          required
          icon="corporate_fare"
          placeholder="e.g. Karnataka Infrastructure Development Corp"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          error={errors.organizationName}
        />

        <InputField
          label="Contact Person"
          required
          icon="person"
          placeholder="e.g. S. Narayana Swamy"
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
          placeholder="e.g. electrical@org.in"
          value={officialEmail}
          onChange={(e) => setOfficialEmail(e.target.value)}
          error={errors.officialEmail}
        />

        <InputField
          label="Project Location"
          required
          icon="location_on"
          placeholder="e.g. Devanahalli KIADB Tech Park"
          value={projectLocation}
          onChange={(e) => setProjectLocation(e.target.value)}
          error={errors.projectLocation}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Project Category"
          required
          options={PROJECT_CATEGORIES}
          value={projectCategory}
          onChange={(e) => setProjectCategory(e.target.value)}
          icon="category"
        />

        <SelectField
          label="Voltage Level"
          required
          options={VOLTAGE_LEVELS}
          value={voltageLevel}
          onChange={(e) => setVoltageLevel(e.target.value)}
          icon="offline_bolt"
        />

        <SelectField
          label="Transformer Capacity"
          options={TRANSFORMER_CAPACITIES}
          value={transformerCapacity}
          onChange={(e) => setTransformerCapacity(e.target.value)}
          icon="memory"
        />
      </div>

      {transformerCapacity === 'Other' && (
        <InputField
          label="Specify Transformer Rating (kVA / MVA)"
          icon="tune"
          placeholder="e.g. 1250 kVA or 2.5 MVA"
          value={customTransformerCapacity}
          onChange={(e) => setCustomTransformerCapacity(e.target.value)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Connected Load"
          icon="speed"
          placeholder="e.g. 750 kVA / 600 kW"
          value={connectedLoad}
          onChange={(e) => setConnectedLoad(e.target.value)}
        />

        <InputField
          label="Number of Transformers"
          type="number"
          min="1"
          icon="counter_1"
          placeholder="e.g. 1"
          value={numberOfTransformers}
          onChange={(e) => setNumberOfTransformers(e.target.value)}
        />

        <InputField
          label="Expected Completion Date"
          type="date"
          icon="event"
          value={expectedCompletionDate}
          onChange={(e) => setExpectedCompletionDate(e.target.value)}
        />
      </div>

      <TextAreaField
        label="Project Scope & Technical Requirements"
        placeholder="Provide details on statutory BESCOM/CEIG approvals required, cable run lengths, GIS vs AIS substation, and breaker specifications..."
        value={projectScope}
        onChange={(e) => setProjectScope(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadField
          label="Upload Single Line Diagram (SLD)"
          preset="technicalDrawings"
          files={sldFiles}
          onChange={setSldFiles}
          helperText="Upload existing or proposed electrical SLD (PDF, DWG, PNG)"
        />

        <FileUploadField
          label="Upload BOQ / Technical Specifications"
          preset="boq"
          files={boqFiles}
          onChange={setBoqFiles}
          helperText="Upload tender bill of quantities or equipment schedule"
        />
      </div>

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
