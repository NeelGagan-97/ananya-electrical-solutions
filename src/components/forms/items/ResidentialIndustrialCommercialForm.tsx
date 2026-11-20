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

export type ResidentialIndustrialScope = 'both' | 'residential' | 'industrial-commercial';

interface ResidentialIndustrialCommercialFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
  initialScope?: ResidentialIndustrialScope;
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

const INDUSTRIAL_SERVICES = [
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

export const ResidentialIndustrialCommercialForm: React.FC<ResidentialIndustrialCommercialFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
  initialScope = 'both',
}) => {
  const [enquiryScope, setEnquiryScope] = useState<ResidentialIndustrialScope>(initialScope);

  useEffect(() => {
    setEnquiryScope(initialScope);
  }, [initialScope]);

  const includeResidential = enquiryScope === 'residential' || enquiryScope === 'both';
  const includeIndustrial = enquiryScope === 'industrial-commercial' || enquiryScope === 'both';

  // Shared Contact & Location Fields
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [projectLocation, setProjectLocation] = useState('');

  // Residential Specifications
  const [propertyType, setPropertyType] = useState('Independent House');
  const [propertySize, setPropertySize] = useState('1,000–2,000 sq. ft.');
  const [residentialServices, setResidentialServices] = useState<string[]>(['New Electrical Wiring']);
  const [preferredSiteVisitDate, setPreferredSiteVisitDate] = useState('');

  // Industrial & Commercial Specifications
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [industryType, setIndustryType] = useState('Manufacturing');
  const [connectedLoad, setConnectedLoad] = useState('');
  const [voltageLevel, setVoltageLevel] = useState<'LT' | 'HT' | 'Both' | 'Not Sure'>('LT');
  const [industrialServices, setIndustrialServices] = useState<string[]>([
    'Industrial Wiring',
    'Power Distribution',
  ]);
  const [expectedStartDate, setExpectedStartDate] = useState('');

  // Shared Description, Uploads & Consent
  const [projectDescription, setProjectDescription] = useState('');
  const [files, setFiles] = useState<UploadedFileMeta[]>([]);
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(
      fullName,
      includeIndustrial && !includeResidential ? 'Contact Person' : 'Full Name'
    );
    if (!nameCheck.isValid) newErrors.fullName = nameCheck.error!;

    if (includeIndustrial) {
      const companyCheck = validateRequired(companyName, 'Company / Organization Name');
      if (!companyCheck.isValid) newErrors.companyName = companyCheck.error!;
    }

    const phoneCheck = validateIndianMobile(contactNumber);
    if (!phoneCheck.isValid) newErrors.contactNumber = phoneCheck.error!;

    if (includeIndustrial) {
      const emailCheck = validateEmail(email, true);
      if (!emailCheck.isValid) newErrors.email = emailCheck.error!;
    } else if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.isValid) newErrors.email = emailCheck.error!;
    }

    const locCheck = validateRequired(projectLocation, 'Property / Project Location');
    if (!locCheck.isValid) newErrors.projectLocation = locCheck.error!;

    if (includeResidential && residentialServices.length === 0) {
      newErrors.residentialServices = 'Please select at least one residential electrical service.';
    }

    if (includeIndustrial && industrialServices.length === 0) {
      newErrors.industrialServices = 'Please select at least one industrial/commercial service.';
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
        : enquiryScope === 'industrial-commercial'
        ? 'industrial-commercial'
        : 'residential-industrial-commercial';

    const resolvedTitle =
      enquiryScope === 'residential'
        ? 'Residential Electrical Service Request'
        : enquiryScope === 'industrial-commercial'
        ? 'Industrial & Commercial Electrical Enquiry'
        : 'Residential, Industrial and Commercial Electrical Enquiry';

    const scopeLabel =
      enquiryScope === 'residential'
        ? 'Residential Electrical'
        : enquiryScope === 'industrial-commercial'
        ? 'Industrial & Commercial Electrical'
        : 'Residential, Industrial & Commercial Electrical';

    const data: Record<string, any> = {
      'Enquiry Scope': scopeLabel,
    };

    if (includeResidential) {
      data['Property Type'] = propertyType;
      data['Property Size'] = propertySize;
      data['Residential Services'] = residentialServices;
      data['Preferred Site Visit Date'] = preferredSiteVisitDate || 'Flexible';
    }

    if (includeIndustrial) {
      data['Company Name'] = companyName;
      data['Designation'] = designation || 'Not specified';
      data['GST Number'] = gstNumber || 'Not provided';
      data['Facility Type'] = industryType;
      data['Connected Load'] = connectedLoad || 'To be assessed';
      data['Voltage Level'] = voltageLevel;
      data['Industrial & Commercial Services'] = industrialServices;
      data['Expected Start Date'] = expectedStartDate || 'Immediate';
    }

    data['Project Scope & Description'] = projectDescription;

    const result = await SubmissionService.submitEnquiry({
      formId: resolvedFormId,
      formTitle: resolvedTitle,
      customerName: fullName,
      contactNumber,
      email,
      location: projectLocation,
      consentGiven: consent,
      data,
      files,
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
    setProjectLocation('');
    setCompanyName('');
    setDesignation('');
    setGstNumber('');
    setConnectedLoad('');
    setPreferredSiteVisitDate('');
    setExpectedStartDate('');
    setResidentialServices(['New Electrical Wiring']);
    setIndustrialServices(['Industrial Wiring', 'Power Distribution']);
    setProjectDescription('');
    setFiles([]);
    setErrors({});
    setSubmissionSuccess(null);
  };

  const scopeOptions: { id: ResidentialIndustrialScope; label: string; icon: string }[] = [
    { id: 'both', label: 'All Sectors', icon: 'hub' },
    { id: 'residential', label: 'Residential', icon: 'home' },
    { id: 'industrial-commercial', label: 'Industrial & Commercial', icon: 'factory' },
  ];

  return (
    <FormWrapper
      formId="residential-industrial-commercial"
      title="Residential, Industrial and Commercial Electrical Enquiry"
      badge="Home, Industrial & Commercial"
      description="Complete wiring, DB & panel installations, plant electrification, earthing, lighting systems, and turnkey execution across residential, commercial, and industrial spaces."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText={
        enquiryScope === 'residential'
          ? 'REQUEST ELECTRICAL SERVICE'
          : enquiryScope === 'industrial-commercial'
          ? 'SUBMIT INDUSTRIAL ENQUIRY'
          : 'SUBMIT ELECTRICAL ENQUIRY'
      }
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      {/* Scope Switcher */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
        <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#0B192C]">
          Select Sector / Scope
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

      {/* Shared Contact & Location Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label={includeIndustrial && !includeResidential ? 'Contact Person' : 'Full Name / Contact Person'}
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
          label={includeIndustrial ? 'Official Email' : 'Email Address'}
          required={includeIndustrial}
          type="email"
          icon="mail"
          placeholder={includeIndustrial ? 'e.g. anand@apexeng.in' : 'e.g. ramesh@example.com (Optional)'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          helperText={includeIndustrial ? undefined : 'Optional – for quotation and digital receipt'}
        />

        <InputField
          label="Property / Project Location"
          required
          icon="location_on"
          placeholder="e.g. Sahakarnagar / Peenya Industrial Area, Bengaluru"
          value={projectLocation}
          onChange={(e) => setProjectLocation(e.target.value)}
          error={errors.projectLocation}
        />
      </div>

      {/* Residential Electrical Section */}
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
            label="Required Residential Services"
            required
            options={RESIDENTIAL_SERVICES}
            selectedValues={residentialServices}
            onChange={setResidentialServices}
            error={errors.residentialServices}
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
        </div>
      )}

      {/* Industrial & Commercial Section */}
      {includeIndustrial && (
        <div className="space-y-4 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 text-[#0B192C]">
            <span className="material-symbols-outlined text-[18px] text-[#0284C7]">factory</span>
            <h4 className="text-[13.5px] font-bold uppercase tracking-wider">
              Industrial & Commercial Specifications
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              label="Designation"
              icon="badge"
              placeholder="e.g. Plant Head / GM Works"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />

            <InputField
              label="GST Number"
              icon="receipt_long"
              placeholder="e.g. 29AAAAA0000A1Z5 (Optional)"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              helperText="For B2B input tax credit invoices"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Industry / Facility Type"
              required
              options={INDUSTRY_TYPES}
              value={industryType}
              onChange={(e) => setIndustryType(e.target.value)}
              icon="factory"
            />

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
              onChange={(e) => setVoltageLevel(e.target.value as 'LT' | 'HT' | 'Both' | 'Not Sure')}
              icon="electric_meter"
            />
          </div>

          <MultiSelectField
            label="Required Industrial / Commercial Services"
            required
            options={INDUSTRIAL_SERVICES}
            selectedValues={industrialServices}
            onChange={setIndustrialServices}
            error={errors.industrialServices}
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
                <strong className="text-[#0B192C]">Turnkey Capability:</strong> AES is a Class 1 licensed electrical contractor with in-house testing equipment and CEIG liaisoning.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Shared Project Details, Uploads & Consent */}
      <TextAreaField
        label="Project Scope & Technical Details"
        placeholder="Briefly describe wiring points, floor area, DB/panel specifications, machine loads, or cable routing details..."
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
      />

      <FileUploadField
        label={includeIndustrial ? 'Upload Drawings / BOQ / Photos' : 'Upload Images or Documents'}
        preset={includeIndustrial ? 'boq' : 'general'}
        files={files}
        onChange={setFiles}
        helperText="Attach layout plans, CAD drawings, BOQ sheets, or site photos (Optional, Max 10 MB)"
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        error={errors.consent}
      />
    </FormWrapper>
  );
};
