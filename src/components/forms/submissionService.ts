import { BaseEnquirySubmission, FormId, EnquiryStatus, UploadedFileMeta } from './types';
import { trackConversionEvent } from '../../utils/seo';

export const AES_CONTACT_DETAILS = {
  phone: '+91 9632025123',
  phoneDial: '+919632025123',
  whatsappNumber: '919632025123',
  email: 'ananyaelectricalsolutions@gmail.com',
  address: 'Sahakarnagar Main Road, Bengaluru, Karnataka 560092',
};

const AES_SUBMISSIONS_STORAGE_KEY = 'aes_enquiry_form_submissions_v1';

export class SubmissionService {
  /**
   * Generates a branded, unique enquiry reference code
   * Example: AES-2026-RES-49821
   */
  static generateReferenceNumber(formId: FormId): string {
    const prefixMap: Record<FormId, string> = {
      'residential-service': 'RES',
      'industrial-commercial': 'IND',
      'ht-lt-works': 'HTLT',
      'solar-rooftop': 'SOLAR',
      'maintenance-amc': 'AMC',
      'safety-audit': 'AUDIT',
      'design-consultancy': 'ENG',
      'vendor-registration': 'VEND',
      'site-visit': 'VISIT',
      'boq-quotation': 'BOQ',
      'emergency-support': 'EMERG',
      'request-callback': 'CALL',
      'project-feedback': 'FDBK',
      'careers-job': 'CAREER',
      'customer-complaint': 'SRVC',
    };

    const code = prefixMap[formId] || 'ENQ';
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    const year = new Date().getFullYear();
    return `AES-${year}-${code}-${randomHex}`;
  }

  /**
   * Core submission processor with realistic latency simulation and storage
   */
  static async submitEnquiry(payload: {
    formId: FormId;
    formTitle: string;
    customerName: string;
    contactNumber: string;
    email?: string;
    location?: string;
    consentGiven: boolean;
    data: Record<string, any>;
    files?: UploadedFileMeta[];
  }): Promise<{ success: boolean; submission?: BaseEnquirySubmission; error?: string }> {
    try {
      // Simulate asynchronous network/processing roundtrip
      await new Promise((resolve) => setTimeout(resolve, 850));

      const referenceNumber = this.generateReferenceNumber(payload.formId);
      const submission: BaseEnquirySubmission = {
        id: `aes_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        referenceNumber,
        formId: payload.formId,
        formTitle: payload.formTitle,
        submittedAt: new Date().toISOString(),
        status: 'New',
        customerName: payload.customerName.trim(),
        contactNumber: payload.contactNumber.trim(),
        email: payload.email?.trim() || undefined,
        location: payload.location?.trim() || undefined,
        consentGiven: payload.consentGiven,
        data: payload.data,
        files: payload.files || [],
      };

      // Send the enquiry to the secure Cloudflare Worker, which creates the Zoho CRM Lead.
      try {
        const zohoResponse = await fetch("/api/zoho/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formId: submission.formId,
            formTitle: submission.formTitle,
            referenceNumber: submission.referenceNumber,
            submittedAt: submission.submittedAt,
            customerName: submission.customerName,
            contactNumber: submission.contactNumber,
            email: submission.email,
            location: submission.location,
            data: submission.data,
          }),
        });
        const zohoResult = (await zohoResponse.json().catch(() => ({}))) as {
          success?: boolean;
          error?: string;
          zohoLeadId?: string;
        };
        if (zohoResponse.ok && zohoResult.success) {
          submission.zohoLeadId = zohoResult.zohoLeadId;
        } else {
          console.warn('Zoho CRM Lead response:', zohoResult.error || `HTTP ${zohoResponse.status}`);
        }
      } catch (networkErr) {
        console.warn('Zoho CRM endpoint unreachable; continuing with local inquiry registration:', networkErr);
      }

      // Store locally so the customer enquiry and reference number are always preserved
      this.saveSubmission(submission);

      // Track analytics conversion event
      trackConversionEvent(
        'quote_form_submit',
        `${payload.formTitle} (${payload.customerName} - ${referenceNumber})`,
        'AES_Forms_Module'
      );

      // Dispatch window event so any listening UI or badge updates instantly
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('aes:inquiry-submitted', {
            detail: { submission },
          })
        );
      }

      return { success: true, submission };
    } catch (err: any) {
      console.error('Error submitting AES Enquiry:', err);
      return {
        success: false,
        error: err?.message || 'Unable to submit enquiry. Please try again or contact us directly.',
      };
    }
  }

  /**
   * Retrieve all local submissions
   */
  static getSubmissions(): BaseEnquirySubmission[] {
    try {
      const stored = localStorage.getItem(AES_SUBMISSIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save submission into local storage safely
   */
  private static saveSubmission(item: BaseEnquirySubmission): void {
    try {
      const existing = this.getSubmissions();
      const updated = [item, ...existing];
      localStorage.setItem(AES_SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist enquiry to localStorage:', e);
    }
  }

  /**
   * Update status of an enquiry (e.g. New -> Contacted -> Site Visit Scheduled)
   */
  static updateEnquiryStatus(id: string, newStatus: EnquiryStatus): boolean {
    try {
      const existing = this.getSubmissions();
      const index = existing.findIndex((s) => s.id === id || s.referenceNumber === id);
      if (index === -1) return false;
      existing[index].status = newStatus;
      localStorage.setItem(AES_SUBMISSIONS_STORAGE_KEY, JSON.stringify(existing));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Formats official WhatsApp click-to-chat URL with pre-filled enquiry details
   * Only generated after customer submits and explicitly consents
   */
  static buildWhatsAppUrl(submission: BaseEnquirySubmission): string {
    const textLines = [
      `*Ananya Electrical Solutions - Official Enquiry*`,
      `*Reference:* ${submission.referenceNumber}`,
      `*Form:* ${submission.formTitle}`,
      `*Client:* ${submission.customerName}`,
      `*Phone:* ${submission.contactNumber}`,
    ];

    if (submission.email) {
      textLines.push(`*Email:* ${submission.email}`);
    }
    if (submission.location) {
      textLines.push(`*Location:* ${submission.location}`);
    }

    // Summarize important key-values
    const dataKeys = Object.keys(submission.data).slice(0, 4);
    if (dataKeys.length > 0) {
      textLines.push(`--- Key Requirements ---`);
      dataKeys.forEach((key) => {
        const val = submission.data[key];
        if (val !== undefined && val !== null && val !== '') {
          const displayVal = Array.isArray(val) ? val.join(', ') : String(val);
          textLines.push(`• ${key}: ${displayVal}`);
        }
      });
    }

    if (submission.files.length > 0) {
      textLines.push(`*Attached Files:* ${submission.files.length} document(s) uploaded`);
    }

    textLines.push(`\nKindly review our electrical requirements and contact us.`);

    const encoded = encodeURIComponent(textLines.join('\n'));
    return `https://wa.me/${AES_CONTACT_DETAILS.whatsappNumber}?text=${encoded}`;
  }

  /**
   * Formats official Mailto link with pre-filled enquiry details
   */
  static buildMailtoUrl(submission: BaseEnquirySubmission): string {
    const subject = encodeURIComponent(
      `[${submission.referenceNumber}] ${submission.formTitle} - ${submission.customerName}`
    );

    const bodyLines = [
      `Dear AES Engineering Team,`,
      ``,
      `I have submitted an official enquiry via your website:`,
      `Reference Number: ${submission.referenceNumber}`,
      `Enquiry Type: ${submission.formTitle}`,
      `Name: ${submission.customerName}`,
      `Phone: ${submission.contactNumber}`,
    ];

    if (submission.email) bodyLines.push(`Email: ${submission.email}`);
    if (submission.location) bodyLines.push(`Site Location: ${submission.location}`);

    bodyLines.push(``, `--- Submitted Details ---`);
    Object.entries(submission.data).forEach(([k, v]) => {
      if (v) {
        bodyLines.push(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
      }
    });

    bodyLines.push(
      ``,
      `Please review and share your technical proposal or schedule a site inspection.`,
      ``,
      `Thank you.`
    );

    const body = encodeURIComponent(bodyLines.join('\n'));
    return `mailto:${AES_CONTACT_DETAILS.email}?subject=${subject}&body=${body}`;
  }
}
