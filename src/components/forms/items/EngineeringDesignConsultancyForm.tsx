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

interface EngineeringDesignConsultancyFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const PROJECT_TYPES = ['Residential', 'Commercial', 'Industrial', 'Infrastructure', 'Other'];
const PROJECT_STAGES = ['Planning', 'Design', 'Under Construction', 'Existing Installation'];
const CONSULTANCY_OPTIONS = [
  'Electrical Load Calculation',
  'Single Line Diagram (SLD)',
  'Electrical Layout Drawings',
  'Cable Sizing',
  'Transformer Sizing',
  'Panel Design',
  'Lighting Design',
  'Earthing Design',
  'Power Distribution Design',
  'Technical Documentation',
  'Other',
];

export const EngineeringDesignConsultancyForm: React.FC<EngineeringDesignConsultancyFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [nameOrOrg, setNameOrOrg] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectType, setProjectType] = useState('Commercial');
  const [requiredConsultancy, setRequiredConsultancy] = useState<string[]>([
    'Electrical Load Calculation',
    'Single Line Diagram (SLD)',
    'Panel Design',
  ]);
  const [projectStage, setProjectStage] = useState('Planning');
  const [voltageLevel, setVoltageLevel] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [files, setFiles] = useState<UploadedFileMeta[]>([]);
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(nameOrOrg, 'Name / Organization');
    if (!nameCheck.isValid) newErrors.nameOrOrg = nameCheck.error!;

    const phoneCheck = validateIndianMobile(phoneNumber);
    if (!phoneCheck.isValid) newErrors.phoneNumber = phoneCheck.error!;

    const emailCheck = validateEmail(officialEmail, true);
    if (!emailCheck.isValid) newErrors.officialEmail = emailCheck.error!;

    if (requiredConsultancy.length === 0) {
      newErrors.requiredConsultancy = 'Please select at least one design consultancy service.';
    }

    if (!consent) {
      newErrors.consent = 'Consent is required to submit your consultancy request.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await SubmissionService.submitEnquiry({
      formId: 'design-consultancy',
      formTitle: 'Engineering Design & Consultancy',
      customerName: contactPerson || nameOrOrg,
      contactNumber: phoneNumber,
      email: officialEmail,
      location: projectLocation,
      consentGiven: consent,
      data: {
        'Client / Firm': nameOrOrg,
        'Project Type': projectType,
        'Project Stage': projectStage,
        'Required Consultancy': requiredConsultancy,
        'Voltage Level': voltageLevel || 'Standard 415V/11kV',
        'Expected Delivery Date': expectedDeliveryDate || 'Per consultancy milestone',
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
    setNameOrOrg('');
    setContactPerson('');
    setPhoneNumber('');
    setOfficialEmail('');
    setProjectLocation('');
    setVoltageLevel('');
    setProjectDescription('');
    setFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="design-consultancy"
      title="Engineering Design & Consultancy"
      badge="Design & Engineering"
      description="Architectural electrical schematics, transformer & busbar calculations, CAD / Revit drafting, and statutory approval package preparation."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="REQUEST ENGINEERING CONSULTANCY"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Name / Organization"
          required
          icon="architecture"
          placeholder="e.g. Skyline Architects / Godrej Properties"
          value={nameOrOrg}
          onChange={(e) => setNameOrOrg(e.target.value)}
          error={errors.nameOrOrg}
        />

        <InputField
          label="Contact Person"
          icon="person"
          placeholder="e.g. Ar. Prateek Sharma (Principal Architect)"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
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
          placeholder="e.g. design@firm.com"
          value={officialEmail}
          onChange={(e) => setOfficialEmail(e.target.value)}
          error={errors.officialEmail}
        />

        <InputField
          label="Project Location"
          icon="location_on"
          placeholder="e.g. Whitefield, Bengaluru"
          value={projectLocation}
          onChange={(e) => setProjectLocation(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Project Type"
          required
          options={PROJECT_TYPES}
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          icon="business_center"
        />

        <SelectField
          label="Project Stage"
          required
          options={PROJECT_STAGES}
          value={projectStage}
          onChange={(e) => setProjectStage(e.target.value)}
          icon="timeline"
        />

        <InputField
          label="Voltage Level"
          icon="electric_meter"
          placeholder="e.g. 11kV HT or 415V LT"
          value={voltageLevel}
          onChange={(e) => setVoltageLevel(e.target.value)}
        />
      </div>

      <MultiSelectField
        label="Required Consultancy"
        required
        options={CONSULTANCY_OPTIONS}
        selectedValues={requiredConsultancy}
        onChange={setRequiredConsultancy}
        error={errors.requiredConsultancy}
        helperText="Select technical design drawings and engineering calculation packages needed."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Expected Delivery Date"
          type="date"
          icon="event"
          value={expectedDeliveryDate}
          onChange={(e) => setExpectedDeliveryDate(e.target.value)}
        />

        <div className="flex flex-col justify-end">
          <p className="text-[12px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <strong className="text-[#0B192C]">Deliverables:</strong> Stamped SLDs, cable schedule spreadsheets, voltage drop calculations compliant with CEA 2010 regulations.
          </p>
        </div>
      </div>

      <TextAreaField
        label="Project Description & Scope"
        placeholder="Detail total built-up area (sq ft), sanctioned load requirement, diversity factors, standby DG set sizing, or specific MEP coordination goals..."
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
      />

      <FileUploadField
        label="Upload Drawings / Documents"
        preset="technicalDrawings"
        files={files}
        onChange={setFiles}
        helperText="Architectural floor plans (PDF / DWG), equipment schedules, or site plot maps (Max 10 MB)"
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
