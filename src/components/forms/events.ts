import { FormId } from './types';

/**
 * Lightweight event dispatches for opening form modals and hubs
 * Decoupled from the heavy modal UI components to allow complete code-splitting
 */
export const openAesEnquiryModal = (formId: FormId) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aes:open-form-modal', {
        detail: { formId },
      })
    );
  }
};

export const openAesEnquiryHub = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aes:open-enquiry-hub'));
  }
};
