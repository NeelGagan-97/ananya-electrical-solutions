import React, { useState, useEffect } from 'react';
import { FormWrapper } from '../FormWrapper';
import { InputField } from '../fields/InputField';
import { SelectField } from '../fields/SelectField';
import { TextAreaField } from '../fields/TextAreaField';
import { FileUploadField } from '../fields/FileUploadField';
import { ConsentCheckbox } from '../fields/ConsentCheckbox';
import { validateIndianMobile, validateEmail, validateRequired } from '../validation';
import { SubmissionService } from '../submissionService';
import { BaseEnquirySubmission, FormId, UploadedFileMeta } from '../types';

export type HtLtSolarScope = 'both' | 'ht-lt' | 'solar';

interface HtLtSolarCombinedFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
  initialScope?: HtLtSolarScope;
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

export const HtLtSolarCombinedForm: React.FC<HtLtSolarCombinedFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
  initialScope = 'both',
}) => {
  const [enquiryScope, setEnquiryScope] = useState<HtLtSolarScope>(initialScope);

  useEffect(() => {
    setEnquiryScope(initialScope);
  }, [initialScope]);

  const includeHtLt = enquiryScope === 'ht-lt' || enquiryScope === 'both';
  const includeSolar = enquiryScope === 'solar' || enquiryScope === 'both';

  // Shared Contact & Location Fields
  const [organizationOrName, setOrganizationOrName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [projectLocation, setProjectLocation] = useState('');

  // HT/LT Technical Fields
  const [projectCategory, setProjectCategory] = useState('HT/LT Substation');
  const [voltageLevel, setVoltageLevel] = useState('11 kV');
  const [transformerCapacity, setTransformerCapacity] = useState('500 kVA');
  const [customTransformerCapacity, setCustomTransformerCapacity] = useState('');
  const [connectedLoad, setConnectedLoad] = useState('');
  const [numberOfTransformers, setNumberOfTransformers] = useState('1');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('');
  const [sldFiles, setSldFiles] = useState<UploadedFileMeta[]>([]);
  const [boqFiles, setBoqFiles] = useState<UploadedFileMeta[]>([]);

  // Solar Rooftop Technical Fields
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

  // Shared Notes & Consent
  const [projectNotes, setProjectNotes] = useState('');
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const nameLabel = includeHtLt ? 'Organization / Full Name' : 'Full Name / Organization';
    const nameCheck = validateRequired(organizationOrName, nameLabel);
    if (!nameCheck.isValid) newErrors.organizationOrName = nameCheck.error!;

    if (includeHtLt) {
      const personCheck = validateRequired(contactPerson, 'Contact Person');
      if (!personCheck.isValid) newErrors.contactPerson = personCheck.error!;
    }

    const phoneCheck = validateIndianMobile(phoneNumber);
    if (!phoneCheck.isValid) newErrors.phoneNumber = phoneCheck.error!;

    if (includeHtLt) {
      const emailCheck = validateEmail(email, true);
      if (!emailCheck.isValid) newErrors.email = emailCheck.error!;
    } else if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) newErrors.email = emailCheck.error!;
    }

    const locCheck = validateRequired(projectLocation, 'Project Location');
    if (!locCheck.isValid) newErrors.projectLocation = locCheck.error!;

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
      enquiryScope === 'ht-lt'
        ? 'ht-lt-works'
        : enquiryScope === 'solar'
        ? 'solar-rooftop'
        : 'ht-lt-solar';

    const resolvedTitle =
      enquiryScope === 'ht-lt'
        ? 'HT/LT Electrical Works Enquiry'
        : enquiryScope === 'solar'
        ? 'Solar Rooftop Installation Enquiry'
        : 'HT/LT & Solar Enquiry';

    const scopeLabel =
      enquiryScope === 'ht-lt'
        ? 'HT/LT Electrical Works'
        : enquiryScope === 'solar'
        ? 'Solar Rooftop Installation'
        : 'Combined HT/LT & Solar Enquiry';

    const data: Record<string, string> = {
      'Enquiry Scope': scopeLabel,
    };

    const allFiles: UploadedFileMeta[] = [];

    if (includeHtLt) {
      const resolvedCapacity =
        transformerCapacity === 'Other' && customTransformerCapacity
          ? customTransformerCapacity
          : transformerCapacity;
      data['Organization Name'] = organizationOrName;
      data['Project Category'] = projectCategory;
      data['Voltage Level'] = voltageLevel;
      data['Transformer Capacity'] = resolvedCapacity;
      data['Number of Transformers'] = numberOfTransformers;
      data['Connected Load'] = connectedLoad || 'To be calculated';
      data['Expected Completion Date'] = expectedCompletionDate || 'Per project schedule';
      allFiles.push(...sldFiles, ...boqFiles);
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

    data['Project Scope & Technical Requirements'] = projectNotes;

    const result = await SubmissionService.submitEnquiry({
      formId: resolvedFormId,
      formTitle: resolvedTitle,
      customerName: contactPerson.trim() || organizationOrName.trim(),
      contactNumber: phoneNumber,
      email,
      location: projectLocation,
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
    setOrganizationOrName('');
    setContactPerson('');
    setPhoneNumber('');
    setEmail('');
    setProjectLocation('');
    setConnectedLoad('');
    setCustomTransformerCapacity('');
    setAvgMonthlyBill('');
    setMonthlyConsumptionKwh('');
    setAvailableRooftopArea('');
    setProjectNotes('');
    setSldFiles([]);
    setBoqFiles([]);
    setBillFiles([]);
    setRooftopFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  const scopeOptions: { id: HtLtSolarScope; label: string; icon: string }[] = [
    { id: 'both', label: 'Both HT/LT & Solar', icon: 'hub' },
    { id: 'ht-lt', label: 'HT/LT Electrical Works', icon: 'bolt' },
    { id: 'solar', label: 'Solar Rooftop EPC', icon: 'solar_power' },
  ];

  return (
    <FormWrapper
      formId="ht-lt-solar"
      title="HT/LT & Solar Enquiry"
      badge="HT/LT Substations & Solar EPC"
      description="Unified enquiry for 11kV–66kV substations, transformers, CEIG approvals, and on-grid/off-grid/hybrid rooftop solar with BESCOM net metering."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText={
        enquiryScope === 'ht-lt'
          ? 'REQUEST HT/LT PROPOSAL'
          : enquiryScope === 'solar'
          ? 'REQUEST SOLAR CONSULTATION'
          : 'REQUEST HT/LT & SOLAR PROPOSAL'
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
          label={includeHtLt ? 'Organization / Full Name' : 'Full Name / Organization'}
          required
          icon={includeHtLt ? 'corporate_fare' : 'solar_power'}
          placeholder={
            includeHtLt
              ? 'e.g. Karnataka Infrastructure Development Corp'
              : 'e.g. Dr. Rajeshwari / Sterling Tech Park'
          }
          value={organizationOrName}
          onChange={(e) => setOrganizationOrName(e.target.value)}
          error={errors.organizationOrName}
        />

        <InputField
          label={includeHtLt ? 'Contact Person' : 'Contact Person (Optional)'}
          required={includeHtLt}
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
          label={includeHtLt ? 'Official Email' : 'Email Address'}
          required={includeHtLt}
          type="email"
          icon="mail"
          placeholder="e.g. electrical@org.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <InputField
          label="Project / Property Location"
          required
          icon="location_on"
          placeholder="e.g. Devanahalli KIADB / Sahakarnagar"
          value={projectLocation}
          onChange={(e) => setProjectLocation(e.target.value)}
          error={errors.projectLocation}
        />
      </div>

      {/* HT/LT Electrical Works Section */}
      {includeHtLt && (
        <div className="space-y-4 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 text-[#0B192C]">
            <span className="material-symbols-outlined text-[18px] text-[#0284C7]">bolt</span>
            <h4 className="text-[13.5px] font-bold uppercase tracking-wider">
              HT/LT Infrastructure Specifications
            </h4>
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

      {/* Shared Technical Requirements & Consent */}
      <TextAreaField
        label="Project Scope & Additional Technical Requirements"
        placeholder="Provide details on BESCOM/CEIG statutory approvals, cable runs, breaker specifications, rooftop shadow/tilt preferences, or preferred Tier-1 brands..."
        value={projectNotes}
        onChange={(e) => setProjectNotes(e.target.value)}
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
