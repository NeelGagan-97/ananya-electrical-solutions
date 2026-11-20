import React, { useState, useEffect } from 'react';
import { FormWrapper } from '../FormWrapper';
import { InputField } from '../fields/InputField';
import { SelectField } from '../fields/SelectField';
import { MultiSelectField } from '../fields/MultiSelectField';
import { TextAreaField } from '../fields/TextAreaField';
import { FileUploadField } from '../fields/FileUploadField';
import { ConsentCheckbox } from '../fields/ConsentCheckbox';
import { validateIndianMobile, validateEmail, validateRequired } from '../validation';
import { SubmissionService } from '../submissionService';
import { BaseEnquirySubmission, FormId, UploadedFileMeta } from '../types';

export type ResidentialSolarScope = 'both' | 'residential' | 'solar';

interface ResidentialSolarCombinedFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
  initialScope?: ResidentialSolarScope;
}

const PROPERTY_TYPES = ['Independent House', 'Apartment', 'Villa', 'Residential Complex', 'Other'];
const PROPERTY_SIZES = ['Below 1,000 sq. ft.', '1,000–2,000 sq. ft.', '2,000–3,000 sq. ft.', 'Above 3,000 sq. ft.'];
const RESIDENTIAL_SERVICES = [
  'New Electrical Wiring',
  'Rewiring',
  'Electrical Repairs',
  'Lighting Installation',
  'Distribution Board Installation',
  'Earthing Installation',
  'Electrical Panel Upgrade',
  'Other',
];

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

export const ResidentialSolarCombinedForm: React.FC<ResidentialSolarCombinedFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
  initialScope = 'both',
}) => {
  const [enquiryScope, setEnquiryScope] = useState<ResidentialSolarScope>(initialScope);

  useEffect(() => {
    setEnquiryScope(initialScope);
  }, [initialScope]);

  const includeResidential = enquiryScope === 'residential' || enquiryScope === 'both';
  const includeSolar = enquiryScope === 'solar' || enquiryScope === 'both';

  // Shared Contact & Property Location Fields
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [propertyLocation, setPropertyLocation] = useState('');

  // Residential Electrical Service Fields
  const [propertyType, setPropertyType] = useState('Independent House');
  const [propertySize, setPropertySize] = useState('1,000–2,000 sq. ft.');
  const [requiredServices, setRequiredServices] = useState<string[]>(['New Electrical Wiring']);
  const [preferredSiteVisitDate, setPreferredSiteVisitDate] = useState('');
  const [residentialFiles, setResidentialFiles] = useState<UploadedFileMeta[]>([]);

  // Solar Rooftop Installation Fields
  const [installationType, setInstallationType] = useState('Residential');
  const [connectionType, setConnectionType] = useState('Three Phase');
  const [avgMonthlyBill, setAvgMonthlyBill] = useState('');
  const [monthlyConsumptionKwh, setMonthlyConsumptionKwh] = useState('');
  const [availableRooftopArea, setAvailableRooftopArea] = useState('');
  const [preferredCapacity, setPreferredCapacity] = useState('5 kW');
  const [systemType, setSystemType] = useState('On-Grid');
  const [batteryBackupRequired, setBatteryBackupRequired] = useState<'Yes' | 'No'>('No');
  const [siteVisitRequired, setSiteVisitRequired] = useState<'Yes' | 'No'>('Yes');
  const [billFiles, setBillFiles] = useState<UploadedFileMeta[]>([]);
  const [rooftopFiles, setRooftopFiles] = useState<UploadedFileMeta[]>([]);

  // Shared Description & Consent
  const [projectDescription, setProjectDescription] = useState('');
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(fullName, includeSolar && !includeResidential ? 'Full Name / Organization' : 'Full Name');
    if (!nameCheck.isValid) newErrors.fullName = nameCheck.error!;

    const phoneCheck = validateIndianMobile(contactNumber);
    if (!phoneCheck.isValid) newErrors.contactNumber = phoneCheck.error!;

    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) newErrors.email = emailCheck.error!;
    }

    const locCheck = validateRequired(propertyLocation, 'Property Location');
    if (!locCheck.isValid) newErrors.propertyLocation = locCheck.error!;

    if (includeResidential && requiredServices.length === 0) {
      newErrors.requiredServices = 'Please select at least one electrical service.';
    }

    if (includeSolar) {
      const billCheck = validateRequired(avgMonthlyBill, 'Average Monthly Electricity Bill');
      if (!billCheck.isValid) newErrors.avgMonthlyBill = billCheck.error!;
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

    const resolvedFormId: FormId =
      enquiryScope === 'residential'
        ? 'residential-service'
        : enquiryScope === 'solar'
        ? 'solar-rooftop'
        : 'residential-solar';

    const resolvedTitle =
      enquiryScope === 'residential'
        ? 'Residential Electrical Service Request'
        : enquiryScope === 'solar'
        ? 'Solar Rooftop Installation Enquiry'
        : 'Residential Electrical Services & Solar Rooftop Enquiry';

    const scopeLabel =
      enquiryScope === 'residential'
        ? 'Residential Electrical Services'
        : enquiryScope === 'solar'
        ? 'Solar Rooftop Installation'
        : 'Combined Residential Electrical Services & Solar Rooftop';

    const data: Record<string, any> = {
      'Enquiry Scope': scopeLabel,
    };

    const allFiles: UploadedFileMeta[] = [];

    if (includeResidential) {
      data['Property Type'] = propertyType;
      data['Property Size'] = propertySize;
      data['Required Services'] = requiredServices;
      data['Preferred Site Visit Date'] = preferredSiteVisitDate || 'Flexible';
      allFiles.push(...residentialFiles);
    }

    if (includeSolar) {
      data['Installation Type'] = installationType;
      data['Connection Type'] = connectionType;
      data['Avg Monthly Bill'] = avgMonthlyBill;
      data['Monthly Consumption'] = monthlyConsumptionKwh
        ? `${monthlyConsumptionKwh} kWh`
        : 'Not specified';
      data['Available Rooftop Area'] = availableRooftopArea
        ? `${availableRooftopArea} sq. ft.`
        : 'Not measured';
      data['Preferred Solar Capacity'] = preferredCapacity;
      data['Solar System Type'] = systemType;
      data['Battery Backup Required'] = batteryBackupRequired;
      data['Site Visit Required'] = siteVisitRequired;
      allFiles.push(...billFiles, ...rooftopFiles);
    }

    data['Project Description'] = projectDescription;

    const result = await SubmissionService.submitEnquiry({
      formId: resolvedFormId,
      formTitle: resolvedTitle,
      customerName: fullName,
      contactNumber,
      email,
      location: propertyLocation,
      consentGiven: consent,
      data,
      files: allFiles,
    });

    setIsSubmitting(false);
    if (result.success && result.submission) {
      setSubmissionSuccess(result.submission);
      onSuccess?.(result.submission);
    }
  };

  const handleReset = () => {
    setFullName('');
    setContactNumber('');
    setEmail('');
    setPropertyLocation('');
    setRequiredServices(['New Electrical Wiring']);
    setPreferredSiteVisitDate('');
    setAvgMonthlyBill('');
    setMonthlyConsumptionKwh('');
    setAvailableRooftopArea('');
    setProjectDescription('');
    setResidentialFiles([]);
    setBillFiles([]);
    setRooftopFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  const scopeOptions: { id: ResidentialSolarScope; label: string; icon: string }[] = [
    { id: 'both', label: 'Both Residential & Solar', icon: 'hub' },
    { id: 'residential', label: 'Residential Electrical', icon: 'home' },
    { id: 'solar', label: 'Solar Rooftop EPC', icon: 'solar_power' },
  ];

  return (
    <FormWrapper
      formId="residential-solar"
      title="Residential Electrical Services & Solar Rooftop Enquiry"
      badge="Home Electrical & Solar EPC"
      description="Complete house wiring, distribution boards, earthing, safety repairs, and on-grid/off-grid/hybrid rooftop solar installations with BESCOM net metering."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText={
        enquiryScope === 'residential'
          ? 'REQUEST ELECTRICAL SERVICE'
          : enquiryScope === 'solar'
          ? 'REQUEST SOLAR CONSULTATION'
          : 'SUBMIT RESIDENTIAL & SOLAR ENQUIRY'
      }
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      {/* Scope Switcher */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
        <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#0B192C]">
          Select Enquiry Scope
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {scopeOptions.map((opt) => {
            const active = enquiryScope === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setEnquiryScope(opt.id);
                  setErrors({});
                }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-bold border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0B192C] text-white border-[#0B192C] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#0284C7] hover:text-[#0284C7]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] leading-none">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shared Contact & Location Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label={includeSolar && !includeResidential ? 'Full Name / Organization' : 'Full Name'}
          required
          icon="person"
          placeholder="e.g. Ramesh Kumar"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Email Address"
          type="email"
          icon="mail"
          placeholder="e.g. ramesh@example.com (Optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          helperText="Optional – for quotation and digital receipt"
        />

        <InputField
          label="Property Location"
          required
          icon="location_on"
          placeholder="e.g. Sahakarnagar / Hebbal, Bengaluru"
          value={propertyLocation}
          onChange={(e) => setPropertyLocation(e.target.value)}
          error={errors.propertyLocation}
        />
      </div>

      {/* Residential Electrical Services Section */}
      {includeResidential && (
        <div className="space-y-4 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 text-[#0B192C]">
            <span className="material-symbols-outlined text-[18px] text-[#0284C7]">home</span>
            <h4 className="text-[13.5px] font-bold uppercase tracking-wider">
              Residential Electrical Specifications
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Property Type"
              required
              options={PROPERTY_TYPES}
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              icon="home"
            />

            <SelectField
              label="Property Size"
              required
              options={PROPERTY_SIZES}
              value={propertySize}
              onChange={(e) => setPropertySize(e.target.value)}
              icon="square_foot"
            />
          </div>

          <MultiSelectField
            label="Required Electrical Services"
            required
            options={RESIDENTIAL_SERVICES}
            selectedValues={requiredServices}
            onChange={setRequiredServices}
            error={errors.requiredServices}
            helperText="Select one or more services needed for your home."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Preferred Site Visit Date"
              type="date"
              icon="calendar_today"
              value={preferredSiteVisitDate}
              onChange={(e) => setPreferredSiteVisitDate(e.target.value)}
              helperText="Convenient date for our supervisor to inspect"
            />

            <div className="flex flex-col justify-end">
              <p className="text-[12px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <strong className="text-[#0B192C]">Standard Visit:</strong> Monday to Saturday between 8:30 AM and 7:30 PM across Bengaluru.
              </p>
            </div>
          </div>

          <FileUploadField
            label="Upload Layout Plan or Electrical Photos"
            preset="general"
            files={residentialFiles}
            onChange={setResidentialFiles}
            helperText="Attach layout plan, existing DB photo, or room pictures (Optional, Max 10 MB)"
          />
        </div>
      )}

      {/* Solar Rooftop Installation Section */}
      {includeSolar && (
        <div className="space-y-4 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 text-[#0B192C]">
            <span className="material-symbols-outlined text-[18px] text-[#F59E0B]">solar_power</span>
            <h4 className="text-[13.5px] font-bold uppercase tracking-wider">
              Solar Rooftop EPC Specifications
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Installation Type"
              required
              options={INSTALLATION_TYPES}
              value={installationType}
              onChange={(e) => setInstallationType(e.target.value)}
              icon="apartment"
            />

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="Monthly Consumption (kWh)"
              type="number"
              icon="electric_bolt"
              placeholder="e.g. 520 units"
              value={monthlyConsumptionKwh}
              onChange={(e) => setMonthlyConsumptionKwh(e.target.value)}
              helperText="Optional – from your BESCOM bill"
            />

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Solar System Type"
              required
              options={SYSTEM_TYPES}
              value={systemType}
              onChange={(e) => setSystemType(e.target.value)}
              icon="settings_input_composite"
            />

            <SelectField
              label="Battery Backup Required?"
              options={YES_NO_OPTIONS}
              value={batteryBackupRequired}
              onChange={(e) => setBatteryBackupRequired(e.target.value as 'Yes' | 'No')}
              icon="battery_charging_full"
              helperText="On-Grid feeds net meter without batteries"
            />

            <SelectField
              label="Site Visit & Shadow Analysis?"
              options={YES_NO_OPTIONS}
              value={siteVisitRequired}
              onChange={(e) => setSiteVisitRequired(e.target.value as 'Yes' | 'No')}
              icon="explore"
              helperText="On-site compass & shadow feasibility check"
            />
          </div>

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
        </div>
      )}

      {/* Shared Notes & Consent */}
      <TextAreaField
        label="Project Description & Additional Requirements"
        placeholder="Briefly describe your wiring points, DB upgrades, rooftop shadow/tilt constraints, or BESCOM net metering requirements..."
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
