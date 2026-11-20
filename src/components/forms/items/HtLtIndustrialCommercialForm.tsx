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

export type HtLtIndustrialScope = 'both' | 'industrial-commercial' | 'ht-lt';

interface HtLtIndustrialCommercialFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
  initialScope?: HtLtIndustrialScope;
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

const FACILITY_VOLTAGE_LEVELS = ['LT', 'HT', 'Both', 'Not Sure'];

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

const HT_LT_PROJECT_CATEGORIES = [
  'HT Electrical Works',
  'LT Electrical Works',
  'HT/LT Substation',
  'Transformer Installation',
  'Electrical Distribution Network',
  'HT/LT Panel Installation',
  'Cable Laying',
  'Other',
];

const HT_LT_VOLTAGE_LEVELS = ['11 kV', '22 kV', '33 kV', '415 V', 'Other'];
const TRANSFORMER_CAPACITIES = ['100 kVA', '250 kVA', '500 kVA', '750 kVA', '1000 kVA', 'Other'];

export const HtLtIndustrialCommercialForm: React.FC<HtLtIndustrialCommercialFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
  initialScope = 'both',
}) => {
  const [enquiryScope, setEnquiryScope] = useState<HtLtIndustrialScope>(initialScope);

  useEffect(() => {
    setEnquiryScope(initialScope);
  }, [initialScope]);

  const includeIndustrial = enquiryScope === 'industrial-commercial' || enquiryScope === 'both';
  const includeHtLt = enquiryScope === 'ht-lt' || enquiryScope === 'both';

  // Shared Organization, Contact & Load Fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [connectedLoad, setConnectedLoad] = useState('');

  // Industrial & Commercial Specifications
  const [industryType, setIndustryType] = useState('Manufacturing');
  const [facilityVoltageLevel, setFacilityVoltageLevel] = useState<'LT' | 'HT' | 'Both' | 'Not Sure'>('Both');
  const [requiredServices, setRequiredServices] = useState<string[]>([
    'Industrial Wiring',
    'Power Distribution',
  ]);
  const [expectedStartDate, setExpectedStartDate] = useState('');

  // HT/LT Infrastructure Specifications
  const [projectCategory, setProjectCategory] = useState('HT/LT Substation');
  const [htLtVoltageLevel, setHtLtVoltageLevel] = useState('11 kV');
  const [transformerCapacity, setTransformerCapacity] = useState('500 kVA');
  const [customTransformerCapacity, setCustomTransformerCapacity] = useState('');
  const [numberOfTransformers, setNumberOfTransformers] = useState('1');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('');

  // Shared Scope, Documents & Consent
  const [projectScope, setProjectScope] = useState('');
  const [sldFiles, setSldFiles] = useState<UploadedFileMeta[]>([]);
  const [boqFiles, setBoqFiles] = useState<UploadedFileMeta[]>([]);
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

    if (includeIndustrial && requiredServices.length === 0) {
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

    const resolvedFormId: FormId =
      enquiryScope === 'industrial-commercial'
        ? 'industrial-commercial'
        : enquiryScope === 'ht-lt'
        ? 'ht-lt-works'
        : 'ht-lt-industrial-commercial';

    const resolvedTitle =
      enquiryScope === 'industrial-commercial'
        ? 'Industrial & Commercial Electrical Enquiry'
        : enquiryScope === 'ht-lt'
        ? 'HT/LT Electrical Works Enquiry'
        : 'HT/LT, Industrial & Commercial Electrical Enquiry';

    const scopeLabel =
      enquiryScope === 'industrial-commercial'
        ? 'Industrial & Commercial Electrical'
        : enquiryScope === 'ht-lt'
        ? 'HT/LT Electrical Works'
        : 'Combined HT/LT, Industrial & Commercial Electrical';

    const data: Record<string, any> = {
      'Enquiry Scope': scopeLabel,
      'Company Name': companyName,
      Designation: designation || 'Not specified',
      'GST Number': gstNumber || 'Not provided',
      'Connected Load': connectedLoad || 'To be assessed',
    };

    if (includeIndustrial) {
      data['Facility Type'] = industryType;
      data['Supply Voltage Category'] = facilityVoltageLevel;
      data['Required Services'] = requiredServices;
      data['Expected Start Date'] = expectedStartDate || 'Immediate';
    }

    if (includeHtLt) {
      const resolvedCapacity =
        transformerCapacity === 'Other' && customTransformerCapacity
          ? customTransformerCapacity
          : transformerCapacity;
      data['HT/LT Project Category'] = projectCategory;
      data['HT/LT Voltage Level'] = htLtVoltageLevel;
      data['Transformer Capacity'] = resolvedCapacity;
      data['Number of Transformers'] = numberOfTransformers;
      data['Expected Completion Date'] = expectedCompletionDate || 'Per project schedule';
    }

    data['Project Scope & Technical Details'] = projectScope;

    const result = await SubmissionService.submitEnquiry({
      formId: resolvedFormId,
      formTitle: resolvedTitle,
      customerName: contactPerson,
      contactNumber,
      email: officialEmail,
      location: projectLocation,
      consentGiven: consent,
      data,
      files: [...sldFiles, ...boqFiles],
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
    setCustomTransformerCapacity('');
    setExpectedStartDate('');
    setExpectedCompletionDate('');
    setProjectScope('');
    setSldFiles([]);
    setBoqFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  const scopeOptions: { id: HtLtIndustrialScope; label: string; icon: string }[] = [
    { id: 'both', label: 'Both HT/LT & Industrial', icon: 'hub' },
    { id: 'industrial-commercial', label: 'Industrial & Commercial', icon: 'factory' },
    { id: 'ht-lt', label: 'HT/LT Electrical Works', icon: 'bolt' },
  ];

  return (
    <FormWrapper
      formId="ht-lt-industrial-commercial"
      title="HT/LT, Industrial & Commercial Electrical Enquiry"
      badge="HT/LT Substations & Turnkey EPC"
      description="Turnkey 11kV–66kV substations, transformers, VCB/MCC/PCC panels, plant electrification, cable laying, and BESCOM/CEIG statutory liaisoning."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText={
        enquiryScope === 'ht-lt'
          ? 'REQUEST HT/LT PROPOSAL'
          : enquiryScope === 'industrial-commercial'
          ? 'SUBMIT INDUSTRIAL ENQUIRY'
          : 'SUBMIT HT/LT & INDUSTRIAL ENQUIRY'
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

      {/* Shared Organization & Contact Details */}
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
          placeholder="e.g. electrical@org.in"
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

        <InputField
          label="Project Location"
          required
          icon="location_on"
          placeholder="e.g. Peenya Industrial Area / Devanahalli KIADB"
          value={projectLocation}
          onChange={(e) => setProjectLocation(e.target.value)}
          error={errors.projectLocation}
        />

        <InputField
          label="Connected Load (kW / kVA)"
          icon="speed"
          placeholder="e.g. 500 kVA or 750 kW"
          value={connectedLoad}
          onChange={(e) => setConnectedLoad(e.target.value)}
          helperText="Approximate or sanction load if known"
        />
      </div>

      {/* Industrial & Commercial Section */}
      {includeIndustrial && (
        <div className="space-y-4 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 text-[#0B192C]">
            <span className="material-symbols-outlined text-[18px] text-[#0284C7]">factory</span>
            <h4 className="text-[13.5px] font-bold uppercase tracking-wider">
              Industrial & Commercial Facility Specifications
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Industry / Facility Type"
              required
              options={INDUSTRY_TYPES}
              value={industryType}
              onChange={(e) => setIndustryType(e.target.value)}
              icon="factory"
            />

            <SelectField
              label="Supply Voltage Category"
              required
              options={FACILITY_VOLTAGE_LEVELS}
              value={facilityVoltageLevel}
              onChange={(e) => setFacilityVoltageLevel(e.target.value as 'LT' | 'HT' | 'Both' | 'Not Sure')}
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
        </div>
      )}

      {/* HT/LT Electrical Works Section */}
      {includeHtLt && (
        <div className="space-y-4 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 text-[#0B192C]">
            <span className="material-symbols-outlined text-[18px] text-[#0284C7]">bolt</span>
            <h4 className="text-[13.5px] font-bold uppercase tracking-wider">
              HT/LT Infrastructure & Substation Specifications
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="HT/LT Project Category"
              required
              options={HT_LT_PROJECT_CATEGORIES}
              value={projectCategory}
              onChange={(e) => setProjectCategory(e.target.value)}
              icon="category"
            />

            <SelectField
              label="Operating Voltage Level"
              required
              options={HT_LT_VOLTAGE_LEVELS}
              value={htLtVoltageLevel}
              onChange={(e) => setHtLtVoltageLevel(e.target.value)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      )}

      {/* Shared Technical Scope & Document Uploads */}
      <TextAreaField
        label="Project Scope & Technical Details"
        placeholder="Detail the floor area, machine specifications, HT yard space, BESCOM/CEIG statutory approvals, or cable routing constraints..."
        value={projectScope}
        onChange={(e) => setProjectScope(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadField
          label="Upload Single Line Diagram (SLD) / Drawings"
          preset="technicalDrawings"
          files={sldFiles}
          onChange={setSldFiles}
          helperText="Upload CAD drawings or Single Line Diagrams (PDF, DWG, PNG)"
        />

        <FileUploadField
          label="Upload BOQ / Technical Specifications"
          preset="boq"
          files={boqFiles}
          onChange={setBoqFiles}
          helperText="Upload tender bill of quantities or equipment schedule (Max 10 MB)"
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
