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

interface CareersJobApplicationFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const POSITIONS = [
  'Electrical Engineer',
  'Site Engineer',
  'Electrical Supervisor',
  'Electrical Technician',
  'Solar Technician',
  'Project Manager',
  'Safety Engineer',
  'Other',
];

const EXPERIENCE_LEVELS = ['Fresher', '1–2 Years', '3–5 Years', '5–10 Years', '10+ Years'];

export const CareersJobApplicationForm: React.FC<CareersJobApplicationFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [positionApplyingFor, setPositionApplyingFor] = useState('Site Engineer');
  const [experience, setExperience] = useState('3–5 Years');
  const [educationalQualification, setEducationalQualification] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('Immediate / 15 Days');
  const [resumeFiles, setResumeFiles] = useState<UploadedFileMeta[]>([]);
  const [additionalInformation, setAdditionalInformation] = useState('');
  const [consent, setConsent] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(fullName, 'Full Name');
    if (!nameCheck.isValid) newErrors.fullName = nameCheck.error!;

    const phoneCheck = validateIndianMobile(phoneNumber);
    if (!phoneCheck.isValid) newErrors.phoneNumber = phoneCheck.error!;

    const emailCheck = validateEmail(email, true);
    if (!emailCheck.isValid) newErrors.email = emailCheck.error!;

    if (resumeFiles.length === 0) {
      newErrors.resumeFiles = 'Please upload your resume in PDF format (Required).';
    }

    if (!consent) {
      newErrors.consent = 'Consent is required to submit your job application.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await SubmissionService.submitEnquiry({
      formId: 'careers-job',
      formTitle: 'Careers & Job Application',
      customerName: fullName,
      contactNumber: phoneNumber,
      email,
      location: currentLocation,
      consentGiven: consent,
      data: {
        'Position Applying For': positionApplyingFor,
        Experience: experience,
        'Educational Qualification': educationalQualification || 'Degree/Diploma',
        'Technical Skills': technicalSkills,
        'Expected Salary': expectedSalary || 'As per industry standard',
        'Notice Period': noticePeriod,
        'Resume Attached': resumeFiles.map((f) => f.name).join(', '),
        'Additional Info': additionalInformation,
      },
      files: resumeFiles,
    });

    setIsSubmitting(false);
    if (result.success && result.submission) {
      setSubmissionSuccess(result.submission);
      onSuccess?.(result.submission);
    }
  };

  const handleReset = () => {
    setFullName('');
    setPhoneNumber('');
    setEmail('');
    setCurrentLocation('');
    setEducationalQualification('');
    setTechnicalSkills('');
    setExpectedSalary('');
    setResumeFiles([]);
    setAdditionalInformation('');
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="careers-job"
      title="Careers & Engineering Opportunities"
      badge="Human Resources & Talent"
      description="Join Bengaluru's leading Super Grade licensed electrical contractor. We offer competitive remuneration, technical field training, and safety equipment."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="SUBMIT JOB APPLICATION"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Full Name"
          required
          icon="person"
          placeholder="e.g. Chethan Gowda"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Email Address"
          required
          type="email"
          icon="mail"
          placeholder="e.g. chethan@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <InputField
          label="Current Location"
          icon="location_on"
          placeholder="e.g. Sahakarnagar / Bengaluru"
          value={currentLocation}
          onChange={(e) => setCurrentLocation(e.target.value)}
        />

        <SelectField
          label="Position Applying For"
          required
          options={POSITIONS}
          value={positionApplyingFor}
          onChange={(e) => setPositionApplyingFor(e.target.value)}
          icon="engineering"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Experience"
          required
          options={EXPERIENCE_LEVELS}
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          icon="work_history"
        />

        <InputField
          label="Educational Qualification"
          icon="school"
          placeholder="e.g. B.E. Electrical & Electronics / Diploma"
          value={educationalQualification}
          onChange={(e) => setEducationalQualification(e.target.value)}
        />

        <InputField
          label="Notice Period"
          icon="event_busy"
          placeholder="e.g. Immediate / 30 Days"
          value={noticePeriod}
          onChange={(e) => setNoticePeriod(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Technical Skills & Certifications"
          icon="psychology"
          placeholder="e.g. AutoCad Electrical, 11kV Substation, HT Cable Jointing, Solar On-Grid"
          value={technicalSkills}
          onChange={(e) => setTechnicalSkills(e.target.value)}
        />

        <InputField
          label="Expected Salary (Monthly / Annual)"
          icon="payments"
          placeholder="e.g. ₹4.5 LPA (Optional)"
          value={expectedSalary}
          onChange={(e) => setExpectedSalary(e.target.value)}
          helperText="Optional"
        />
      </div>

      {/* Resume Upload - PDF ONLY, REQUIRED */}
      <FileUploadField
        label="Upload Resume (PDF Only)"
        required
        multiple={false}
        preset="resumePdfOnly"
        files={resumeFiles}
        onChange={setResumeFiles}
        error={errors.resumeFiles}
        helperText="Required – Please attach your resume in PDF format only (Max 10 MB)"
      />

      <TextAreaField
        label="Additional Information / Cover Note"
        placeholder="Share your supervisor license details (Grade A/B), key past turnkey substation or solar projects, or why you want to work with AES..."
        value={additionalInformation}
        onChange={(e) => setAdditionalInformation(e.target.value)}
      />

      <ConsentCheckbox
        checked={consent}
        onChange={setConsent}
        label="I declare that all details provided in this application are accurate and authorize Ananya Electrical Solutions HR to verify credentials and contact me regarding recruitment."
        error={errors.consent}
      />
    </FormWrapper>
  );
};
