import React, { useState } from 'react';
import { FormWrapper } from '../FormWrapper';
import { InputField } from '../fields/InputField';
import { SelectField } from '../fields/SelectField';
import { TextAreaField } from '../fields/TextAreaField';
import { StarRatingField } from '../fields/StarRatingField';
import { validateIndianMobile, validateRequired } from '../validation';
import { SubmissionService } from '../submissionService';
import { BaseEnquirySubmission } from '../types';

interface ProjectFeedbackFormProps {
  onCancel?: () => void;
  onSuccess?: (submission: BaseEnquirySubmission) => void;
  variant?: 'modal' | 'section' | 'inline';
}

const PROJECT_CATEGORIES = [
  'Substation & HT/LT Works',
  'Commercial / Industrial Electrification',
  'Solar Rooftop Installation',
  'Residential Wiring & Automation',
  'Electrical Maintenance & AMC',
  'Safety Audit & CEIG Approval',
  'Other',
];

export const ProjectFeedbackForm: React.FC<ProjectFeedbackFormProps> = ({
  onCancel,
  onSuccess,
  variant = 'modal',
}) => {
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [projectCategory, setProjectCategory] = useState('Substation & HT/LT Works');
  const [projectLocation, setProjectLocation] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [workQualityRating, setWorkQualityRating] = useState(5);
  const [timelinessRating, setTimelinessRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [whatDidYouAppreciate, setWhatDidYouAppreciate] = useState('');
  const [suggestionsForImprovement, setSuggestionsForImprovement] = useState('');
  const [permissionToPublish, setPermissionToPublish] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<BaseEnquirySubmission | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(customerName, 'Customer Name');
    if (!nameCheck.isValid) newErrors.customerName = nameCheck.error!;

    if (contactNumber.trim()) {
      const phoneCheck = validateIndianMobile(contactNumber);
      if (!phoneCheck.isValid) newErrors.contactNumber = phoneCheck.error!;
    }

    if (overallRating < 1) newErrors.overallRating = 'Please provide an overall rating.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await SubmissionService.submitEnquiry({
      formId: 'project-feedback',
      formTitle: 'Project Completion Feedback',
      customerName,
      contactNumber: contactNumber || 'Not provided',
      location: projectLocation,
      consentGiven: true,
      data: {
        'Project Category': projectCategory,
        'Overall Rating': `${overallRating} / 5 Stars`,
        'Work Quality': `${workQualityRating} / 5 Stars`,
        Timeliness: `${timelinessRating} / 5 Stars`,
        Communication: `${communicationRating} / 5 Stars`,
        'What Appreciated': whatDidYouAppreciate || 'None noted',
        'Improvement Suggestions': suggestionsForImprovement || 'None noted',
        'Permission to Publish': permissionToPublish ? 'Granted by client' : 'Private internal feedback only',
        'Approval Status': 'Awaiting Admin Review (Never automatically published)',
      },
    });

    setIsSubmitting(false);
    if (result.success && result.submission) {
      setSubmissionSuccess(result.submission);
      onSuccess?.(result.submission);
    }
  };

  const handleReset = () => {
    setCustomerName('');
    setContactNumber('');
    setProjectLocation('');
    setOverallRating(5);
    setWorkQualityRating(5);
    setTimelinessRating(5);
    setCommunicationRating(5);
    setWhatDidYouAppreciate('');
    setSuggestionsForImprovement('');
    setPermissionToPublish(false);
    setErrors({});
    setSubmissionSuccess(null);
  };

  return (
    <FormWrapper
      formId="project-feedback"
      title="Project Completion Feedback"
      badge="Quality Assurance & Reviews"
      description="Help us maintain Super Grade quality standards. Your ratings guide our continuous improvement in engineering and site safety."
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      submitButtonText="SUBMIT FEEDBACK"
      submissionSuccess={submissionSuccess}
      onReset={handleReset}
      variant={variant}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Customer / Client Name"
          required
          icon="person"
          placeholder="e.g. B. N. Satish"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          error={errors.customerName}
        />

        <InputField
          label="Contact Number"
          type="tel"
          icon="phone"
          placeholder="e.g. +91 9632025123 (Optional)"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          error={errors.contactNumber}
          helperText="Optional – in case we need to follow up"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Project Category"
          options={PROJECT_CATEGORIES}
          value={projectCategory}
          onChange={(e) => setProjectCategory(e.target.value)}
          icon="engineering"
        />

        <InputField
          label="Project Location"
          icon="location_on"
          placeholder="e.g. Sahakarnagar, Bengaluru"
          value={projectLocation}
          onChange={(e) => setProjectLocation(e.target.value)}
        />
      </div>

      {/* Ratings Section */}
      <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
        <h4 className="text-[13px] font-bold text-[#0B192C] uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-[#0284C7]">star</span>
          Service Evaluation Metrics
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StarRatingField
            label="Overall Project Satisfaction"
            required
            rating={overallRating}
            onChange={setOverallRating}
            error={errors.overallRating}
          />

          <StarRatingField
            label="Workmanship & Technical Quality"
            required
            rating={workQualityRating}
            onChange={setWorkQualityRating}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StarRatingField
            label="Timeliness & Schedule Adherence"
            required
            rating={timelinessRating}
            onChange={setTimelinessRating}
          />

          <StarRatingField
            label="Communication & Responsiveness"
            required
            rating={communicationRating}
            onChange={setCommunicationRating}
          />
        </div>
      </div>

      <TextAreaField
        label="What did you appreciate most about our service?"
        placeholder="e.g. Professional execution, neat cable dressing, timely BESCOM liaisoning, prompt site cleanup..."
        value={whatDidYouAppreciate}
        onChange={(e) => setWhatDidYouAppreciate(e.target.value)}
      />

      <TextAreaField
        label="Suggestions for improvement"
        placeholder="Tell us what we could have done better or features you would like to see..."
        value={suggestionsForImprovement}
        onChange={(e) => setSuggestionsForImprovement(e.target.value)}
      />

      {/* Permission to publish checkbox (Explicitly optional, never auto-published) */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={permissionToPublish}
            onChange={(e) => setPermissionToPublish(e.target.checked)}
            className="mt-0.5 rounded text-[#0284C7] focus:ring-[#0284C7]"
          />
          <div className="text-[12px] leading-relaxed text-slate-600">
            <strong className="text-slate-800 block">Permission to publish feedback (Optional)</strong>
            <span>
              I grant permission to Ananya Electrical Solutions to feature this testimonial on their website or client deck. Note: Feedback is strictly reviewed by management and is never published automatically without human authorization.
            </span>
          </div>
        </label>
      </div>
    </FormWrapper>
  );
};
