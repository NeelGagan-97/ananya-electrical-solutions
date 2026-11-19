import { FormId } from './types';

export const AES_OPEN_FORM_MODAL_EVENT = 'aes:open-form-modal';
export const AES_OPEN_ENQUIRY_HUB_EVENT = 'aes-open-enquiry-hub';

let isModalHostMounted = false;
let pendingModalFormId: FormId | null = null;

let isHubLauncherMounted = false;
let pendingHubOpen = false;

export const setEnquiryModalMounted = (mounted: boolean) => {
  isModalHostMounted = mounted;
};

export const consumePendingEnquiryModalId = (): FormId | null => {
  const next = pendingModalFormId;
  pendingModalFormId = null;
  return next;
};

export const setEnquiryHubMounted = (mounted: boolean) => {
  isHubLauncherMounted = mounted;
};

export const consumePendingEnquiryHubOpen = (): boolean => {
  const next = pendingHubOpen;
  pendingHubOpen = false;
  return next;
};

/**
 * Lightweight event dispatches for opening form modals and hubs.
 * Decoupled from the heavy modal UI components to allow complete code-splitting
 * while queuing calls made before lazy components finish mounting.
 */
export const openAesEnquiryModal = (formId: FormId) => {
  if (typeof window === 'undefined') return;
  if (!isModalHostMounted) {
    pendingModalFormId = formId;
  }
  window.dispatchEvent(
    new CustomEvent(AES_OPEN_FORM_MODAL_EVENT, {
      detail: { formId },
    })
  );
};

export const openAesEnquiryHub = () => {
  if (typeof window === 'undefined') return;
  if (!isHubLauncherMounted) {
    pendingHubOpen = true;
  }
  window.dispatchEvent(new CustomEvent(AES_OPEN_ENQUIRY_HUB_EVENT));
};
