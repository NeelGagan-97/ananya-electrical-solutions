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

interface SolarRooftopFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const INSTALLATION_TYPES = ['Residential', 'Commercial', 'Industrial'];
const CONNECTION_TYPES = ['Single Phase', 'Three Phase', 'Not Sure'];
const SOLAR_CAPACITIES = [
  '1 kW',
  '2 kW',
  '3 kW',
  '5 kW',
  '10 kW',
  '20 kW',
  '50 kW',
  '100 kW+',
  'Need Technical Recommendation',
];
const SYSTEM_TYPES = ['On-Grid', 'Off-Grid', 'Hybrid', 'Need Consultation'];
const YES_NO_OPTIONS = ['Yes', 'No'];

export const SolarRooftopForm: React.FC<SolarRooftopFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [fullNameOrOrg, setFullNameOrOrg] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [installationType, setInstallationType] = useState('Residential');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [connectionType, setConnectionType] = useState('Three Phase');
  const [avgMonthlyBill, setAvgMonthlyBill] = useState('');
  const [monthlyConsumptionKwh, setMonthlyConsumptionKwh] = useState('');
  const [availableRooftopArea, setAvailableRooftopArea] = useState('');
  const [preferredCapacity, setPreferredCapacity] = useState('5 kW');
  const [systemType, setSystemType] = useState('On-Grid');
  const [batteryBackupRequired, setBatteryBackupRequired] = useState<'Yes' | 'No'>('No');
  const [siteVisitRequired, setSiteVisitRequired] = useState<'Yes' | 'No'>('Yes');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [billFiles, setBillFiles] = useState<UploadedFileMeta[]>([]);
  const [rooftopFiles, setRooftopFiles] = useState<UploadedFileMeta[]>([]);
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(fullNameOrOrg, 'Full Name / Organization');
    if (!nameCheck.isValid) newErrors.fullNameOrOrg = nameCheck.error!;

    const phoneCheck = validateIndianMobile(contactNumber);
    if (!phoneCheck.isValid) newErrors.contactNumber = phoneCheck.error!;

    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) newErrors.email = emailCheck.error!;
    }

    const locCheck = validateRequired(propertyLocation, 'Property Location');
    if (!locCheck.isValid) newErrors.propertyLocation = locCheck.error!;

    const billCheck = validateRequired(avgMonthlyBill, 'Average Monthly Electricity Bill');
    if (!billCheck.isValid) newErrors.avgMonthlyBill = billCheck.error!;

    if (!consent) {
      newErrors.consent = 'Consent is required to request solar consultation.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const allFiles = [...billFiles, ...rooftopFiles];

    const result = await SubmissionService.submitEnquiry({
      formId: 'solar-rooftop',
      formTitle: 'Solar Rooftop Installation Enquiry',
      customerName: fullNameOrOrg,
      contactNumber,
      email,
      location: propertyLocation,
      consentGiven: consent,
      data: {
        'Installation Type': installationType,
        'Connection Type': connectionType,
        'Avg Monthly Bill': avgMonthlyBill,
        'Monthly Consumption': monthlyConsumptionKwh ? `${monthlyConsumptionKwh} kWh` : 'Not specified',
        'Available Rooftop Area': availableRooftopArea ? `${availableRooftopArea} sq. ft.` : 'Not measured',
        'Preferred Solar Capacity': preferredCapacity,
        'Solar System Type': systemType,
        'Battery Backup Required': batteryBackupRequired,
        'Site Visit Required': siteVisitRequired,
        'Additional Requirements': additionalRequirements,
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
    setFullNameOrOrg('');
    setContactNumber('');
    setEmail('');
    setPropertyLocation('');
    setAvgMonthlyBill('');
    setMonthlyConsumptionKwh('');
    setAvailableRooftopArea('');
    setBillFiles([]);
    setRooftopFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="solar-rooftop"
      title="Solar Rooftop Installation Enquiry"
      badge="Form 04 · Solar Rooftop Solutions"
      description="Calculate your payback period, discover PM Surya Ghar subsidy eligibility, and request rooftop solar engineering analysis."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="REQUEST SOLAR CONSULTATION"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Full Name / Organization"
          required
          icon="solar_power"
          placeholder="e.g. Dr. Rajeshwari / Sterling Tech Park"
          value={fullNameOrOrg}
          onChange={(e) => setFullNameOrOrg(e.target.value)}
          error={errors.fullNameOrOrg}
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
          placeholder="e.g. rajeshwari@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <SelectField
          label="Installation Type"
          required
          options={INSTALLATION_TYPES}
          value={installationType}
          onChange={(e) => setInstallationType(e.target.value)}
          icon="apartment"
        />

        <InputField
          label="Property Location"
          required
          icon="location_on"
          placeholder="e.g. Sahakarnagar / Vidyaranyapura"
          value={propertyLocation}
          onChange={(e) => setPropertyLocation(e.target.value)}
          error={errors.propertyLocation}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Electricity Connection Type"
          required
          options={CONNECTION_TYPES}
          value={connectionType}
          onChange={(e) => setConnectionType(e.target.value)}
          icon="power"
        />

        <InputField
          label="Avg Monthly Electricity Bill"
          required
          icon="currency_rupee"
          placeholder="e.g. ₹6,500 / month"
          value={avgMonthlyBill}
          onChange={(e) => setAvgMonthlyBill(e.target.value)}
          error={errors.avgMonthlyBill}
        />

        <InputField
          label="Monthly Consumption (kWh)"
          type="number"
          icon="electric_bolt"
          placeholder="e.g. 520 units"
          value={monthlyConsumptionKwh}
          onChange={(e) => setMonthlyConsumptionKwh(e.target.value)}
          helperText="Optional – from your BESCOM bill"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Available Rooftop Area (sq. ft.)"
          type="number"
          icon="square_foot"
          placeholder="e.g. 800 sq ft"
          value={availableRooftopArea}
          onChange={(e) => setAvailableRooftopArea(e.target.value)}
          helperText="RCC roof, metal shed, or terrace"
        />

        <SelectField
          label="Preferred Solar Capacity"
          required
          options={SOLAR_CAPACITIES}
          value={preferredCapacity}
          onChange={(e) => setPreferredCapacity(e.target.value)}
          icon="wb_sunny"
        />

        <SelectField
          label="Solar System Type"
          required
          options={SYSTEM_TYPES}
          value={systemType}
          onChange={(e) => setSystemType(e.target.value)}
          icon="settings_input_composite"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Battery Backup Required?"
          options={YES_NO_OPTIONS}
          value={batteryBackupRequired}
          onChange={(e) => setBatteryBackupRequired(e.target.value as any)}
          icon="battery_charging_full"
          helperText="On-Grid usually feeds net meter without batteries"
        />

        <SelectField
          label="Site Visit & Shadow Analysis Required?"
          options={YES_NO_OPTIONS}
          value={siteVisitRequired}
          onChange={(e) => setSiteVisitRequired(e.target.value as any)}
          icon="explore"
          helperText="Our engineers conduct drone/compass shadow checks"
        />
      </div>

      <TextAreaField
        label="Additional Requirements & Rooftop Characteristics"
        placeholder="Note parapet wall height, water tank shadows, tilt preference, or preferred Tier-1 panel brands (Tata Power Solar, Adani, Vikram, etc.)..."
        value={additionalRequirements}
        onChange={(e) => setAdditionalRequirements(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadField
          label="Upload Electricity Bill"
          preset="general"
          files={billFiles}
          onChange={setBillFiles}
          helperText="BESCOM / DISCOM bill showing Account ID & tariff (Optional)"
        />

        <FileUploadField
          label="Upload Rooftop Images"
          preset="general"
          files={rooftopFiles}
          onChange={setRooftopFiles}
          helperText="Photos of your open roof terrace from opposite corners (Optional)"
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
