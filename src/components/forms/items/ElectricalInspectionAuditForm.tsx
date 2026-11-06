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

interface ElectricalInspectionAuditFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const FACILITY_TYPES = ['Residential', 'Commercial', 'Industrial', 'Institutional', 'Other'];
const VOLTAGE_LEVELS = ['LT', 'HT', 'Both', 'Not Sure'];
const INSPECTION_TYPES = [
  'Electrical Safety Inspection',
  'Earthing Resistance Testing',
  'Load Assessment',
  'HT/LT Panel Inspection',
  'Transformer Inspection',
  'Cable Inspection',
  'Electrical Installation Audit',
  'Thermal Inspection',
  'Other',
];

export const ElectricalInspectionAuditForm: React.FC<ElectricalInspectionAuditFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [nameOrOrg, setNameOrOrg] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [facilityType, setFacilityType] = useState('Commercial');
  const [inspectionsRequired, setInspectionsRequired] = useState<string[]>([
    'Electrical Safety Inspection',
    'Earthing Resistance Testing',
    'Thermal Inspection',
  ]);
  const [voltageLevel, setVoltageLevel] = useState('LT');
  const [installationCapacity, setInstallationCapacity] = useState('');
  const [lastInspectionDate, setLastInspectionDate] = useState('');
  const [preferredInspectionDate, setPreferredInspectionDate] = useState('');
  const [technicalRequirements, setTechnicalRequirements] = useState('');
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

    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) newErrors.email = emailCheck.error!;
    }

    const locCheck = validateRequired(siteLocation, 'Site Location');
    if (!locCheck.isValid) newErrors.siteLocation = locCheck.error!;

    if (inspectionsRequired.length === 0) {
      newErrors.inspectionsRequired = 'Please select at least one inspection type.';
    }

    if (!consent) {
      newErrors.consent = 'Consent is required to submit your audit request.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await SubmissionService.submitEnquiry({
      formId: 'safety-audit',
      formTitle: 'Electrical Inspection & Safety Audit',
      customerName: contactPerson || nameOrOrg,
      contactNumber: phoneNumber,
      email,
      location: siteLocation,
      consentGiven: consent,
      data: {
        'Organization / Name': nameOrOrg,
        'Facility Type': facilityType,
        'Inspections Required': inspectionsRequired,
        'Voltage Level': voltageLevel,
        'Installation Capacity': installationCapacity || 'Not specified',
        'Last Inspection Date': lastInspectionDate || 'Never / Not known',
        'Preferred Inspection Date': preferredInspectionDate || 'Immediate',
        'Technical Requirements': technicalRequirements,
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
    setEmail('');
    setSiteLocation('');
    setInstallationCapacity('');
    setTechnicalRequirements('');
    setFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="safety-audit"
      title="Electrical Inspection & Safety Audit"
      badge="Safety Audit & Compliance"
      description="Calibrated earth pit resistance testing, infrared thermography for hotspot detection, harmonic analysis, and CEIG statutory inspection reports."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="REQUEST SAFETY AUDIT"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Name / Organization"
          required
          icon="verified_user"
          placeholder="e.g. Manipal Hospital / Brigade Millennium"
          value={nameOrOrg}
          onChange={(e) => setNameOrOrg(e.target.value)}
          error={errors.nameOrOrg}
        />

        <InputField
          label="Contact Person"
          icon="person"
          placeholder="e.g. Safety Officer Vinay Kumar"
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
          label="Email Address"
          type="email"
          icon="mail"
          placeholder="e.g. safety@facility.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <InputField
          label="Site Location"
          required
          icon="location_on"
          placeholder="e.g. Electronic City Phase 1, Bengaluru"
          value={siteLocation}
          onChange={(e) => setSiteLocation(e.target.value)}
          error={errors.siteLocation}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Facility Type"
          required
          options={FACILITY_TYPES}
          value={facilityType}
          onChange={(e) => setFacilityType(e.target.value)}
          icon="apartment"
        />

        <SelectField
          label="Voltage Level"
          required
          options={VOLTAGE_LEVELS}
          value={voltageLevel}
          onChange={(e) => setVoltageLevel(e.target.value)}
          icon="electric_bolt"
        />

        <InputField
          label="Installation Capacity / Connected Load"
          icon="speed"
          placeholder="e.g. 500 kVA / 400 kW"
          value={installationCapacity}
          onChange={(e) => setInstallationCapacity(e.target.value)}
        />
      </div>

      <MultiSelectField
        label="Inspection Required"
        required
        options={INSPECTION_TYPES}
        selectedValues={inspectionsRequired}
        onChange={setInspectionsRequired}
        error={errors.inspectionsRequired}
        helperText="Select one or more audit protocols needed."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Last Inspection Date"
          type="date"
          icon="history"
          value={lastInspectionDate}
          onChange={(e) => setLastInspectionDate(e.target.value)}
          helperText="Date of previous statutory audit or earthing test"
        />

        <InputField
          label="Preferred Inspection Date"
          type="date"
          icon="calendar_today"
          value={preferredInspectionDate}
          onChange={(e) => setPreferredInspectionDate(e.target.value)}
          helperText="Target date for our audit engineers to arrive"
        />
      </div>

      <TextAreaField
        label="Technical Requirements & Specific Concerns"
        placeholder="Note if needed for insurance renewal, CEIG statutory compliance, fire NOC, recurring circuit breaker trips, or high soil resistivity concerns..."
        value={technicalRequirements}
        onChange={(e) => setTechnicalRequirements(e.target.value)}
      />

      <FileUploadField
        label="Upload Existing Inspection Reports"
        preset="general"
        files={files}
        onChange={setFiles}
        helperText="Attach previous CEA / CEIG inspection reports, SLDs, or test certificates (Optional)"
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
