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

interface ElectricalMaintenanceAmcFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const FACILITY_TYPES = [
  'Residential Complex',
  'Commercial Building',
  'Industrial Facility',
  'Office',
  'Hospital',
  'Warehouse',
  'Other',
];

const EQUIPMENT_OPTIONS = [
  'HT Panels',
  'LT Panels',
  'Transformers',
  'DG Sets',
  'UPS Systems',
  'Electrical Distribution Boards',
  'Lighting Systems',
  'Earthing Systems',
];

const MAINTENANCE_TYPES = [
  'Preventive Maintenance',
  'Breakdown Maintenance',
  'Annual Maintenance Contract',
  'Inspection',
  'Emergency Support',
];

const FREQUENCY_OPTIONS = ['One-Time', 'Monthly', 'Quarterly', 'Half-Yearly', 'Annual'];
const YES_NO_OPTIONS = ['Yes', 'No'];

export const ElectricalMaintenanceAmcForm: React.FC<ElectricalMaintenanceAmcFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [facilityLocation, setFacilityLocation] = useState('');
  const [facilityType, setFacilityType] = useState('Commercial Building');
  const [equipmentAvailable, setEquipmentAvailable] = useState<string[]>([
    'LT Panels',
    'Transformers',
    'DG Sets',
  ]);
  const [numberOfPanels, setNumberOfPanels] = useState('');
  const [transformerCapacity, setTransformerCapacity] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('Annual Maintenance Contract');
  const [requiredFrequency, setRequiredFrequency] = useState('Quarterly');
  const [existingContract, setExistingContract] = useState<'Yes' | 'No'>('No');
  const [descriptionOfRequirements, setDescriptionOfRequirements] = useState('');
  const [preferredServiceDate, setPreferredServiceDate] = useState('');
  const [files, setFiles] = useState<UploadedFileMeta[]>([]);
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

    const phoneCheck = validateIndianMobile(phoneNumber);
    if (!phoneCheck.isValid) newErrors.phoneNumber = phoneCheck.error!;

    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) newErrors.email = emailCheck.error!;
    }

    const locCheck = validateRequired(facilityLocation, 'Facility Location');
    if (!locCheck.isValid) newErrors.facilityLocation = locCheck.error!;

    if (equipmentAvailable.length === 0) {
      newErrors.equipmentAvailable = 'Please select at least one electrical equipment type.';
    }

    if (!consent) {
      newErrors.consent = 'Consent is required to submit your AMC request.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await SubmissionService.submitEnquiry({
      formId: 'maintenance-amc',
      formTitle: 'Electrical Maintenance & AMC Request',
      customerName: contactPerson,
      contactNumber: phoneNumber,
      email,
      location: facilityLocation,
      consentGiven: consent,
      data: {
        'Company Name': companyName,
        'Facility Type': facilityType,
        'Equipment Available': equipmentAvailable,
        'Number of Panels': numberOfPanels || 'Not specified',
        'Transformer Capacity': transformerCapacity || 'Not specified',
        'Maintenance Type': maintenanceType,
        'Required Frequency': requiredFrequency,
        'Existing Maintenance Contract': existingContract,
        'Preferred Service Date': preferredServiceDate || 'As per AMC schedule',
        'Description of Requirements': descriptionOfRequirements,
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
    setPhoneNumber('');
    setEmail('');
    setFacilityLocation('');
    setNumberOfPanels('');
    setTransformerCapacity('');
    setDescriptionOfRequirements('');
    setFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="maintenance-amc"
      title="Electrical Maintenance & AMC Request"
      badge="Maintenance & AMC"
      description="Scheduled preventive servicing, BDV oil filtration, relay calibration, thermal imaging, and 24/7 breakdown dispatch agreements."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="REQUEST MAINTENANCE SERVICE"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Company / Organization Name"
          required
          icon="business"
          placeholder="e.g. Prestige Tech Vista Resident Welfare Assoc"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          error={errors.companyName}
        />

        <InputField
          label="Contact Person"
          required
          icon="person"
          placeholder="e.g. Nagaraj Bhat (Facility Manager)"
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
          label="Email Address"
          type="email"
          icon="mail"
          placeholder="e.g. facility@techvista.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <InputField
          label="Facility Location"
          required
          icon="location_on"
          placeholder="e.g. Bellandur / Outer Ring Road"
          value={facilityLocation}
          onChange={(e) => setFacilityLocation(e.target.value)}
          error={errors.facilityLocation}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Facility Type"
          required
          options={FACILITY_TYPES}
          value={facilityType}
          onChange={(e) => setFacilityType(e.target.value)}
          icon="domain"
        />

        <SelectField
          label="Existing Maintenance Contract?"
          options={YES_NO_OPTIONS}
          value={existingContract}
          onChange={(e) => setExistingContract(e.target.value as any)}
          icon="assignment"
          helperText="Select Yes if replacing an expiring AMC vendor"
        />
      </div>

      <MultiSelectField
        label="Equipment Available"
        required
        options={EQUIPMENT_OPTIONS}
        selectedValues={equipmentAvailable}
        onChange={setEquipmentAvailable}
        error={errors.equipmentAvailable}
        helperText="Select all assets to include in maintenance coverage."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Number of Electrical Panels"
          icon="table_chart"
          placeholder="e.g. 6 panels (1 Main HT + 5 Floor Sub-panels)"
          value={numberOfPanels}
          onChange={(e) => setNumberOfPanels(e.target.value)}
        />

        <InputField
          label="Transformer Capacity"
          icon="flash_on"
          placeholder="e.g. 500 kVA (Oil-immersed / Dry-type)"
          value={transformerCapacity}
          onChange={(e) => setTransformerCapacity(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Maintenance Type"
          required
          options={MAINTENANCE_TYPES}
          value={maintenanceType}
          onChange={(e) => setMaintenanceType(e.target.value)}
          icon="build"
        />

        <SelectField
          label="Required Frequency"
          required
          options={FREQUENCY_OPTIONS}
          value={requiredFrequency}
          onChange={(e) => setRequiredFrequency(e.target.value)}
          icon="event_repeat"
        />

        <InputField
          label="Preferred Service Date"
          type="date"
          icon="event"
          value={preferredServiceDate}
          onChange={(e) => setPreferredServiceDate(e.target.value)}
        />
      </div>

      <TextAreaField
        label="Description of Requirements & Past Incidents"
        placeholder="State specific issues like capacitor bank tripping, oil leakage, high earth resistance, or routine quarterly PM requirements..."
        value={descriptionOfRequirements}
        onChange={(e) => setDescriptionOfRequirements(e.target.value)}
      />

      <FileUploadField
        label="Upload Equipment Details"
        preset="general"
        files={files}
        onChange={setFiles}
        helperText="Asset list, single line diagrams, or past maintenance reports (Optional)"
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
