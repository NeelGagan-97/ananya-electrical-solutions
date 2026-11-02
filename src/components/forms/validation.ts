// Shared validation utilities for Ananya Electrical Solutions forms

export const validateIndianMobile = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Mobile number is required.' };
  }

  // Clean common characters (spaces, dashes, parentheses)
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Matches 10 digits starting with 6-9, with optional +91, 91, or 0 prefix
  const regex = /^(\+91|91|0)?[6-9]\d{9}$/;
  if (!regex.test(cleaned)) {
    return {
      isValid: false,
      error: 'Please enter a valid 10-digit Indian mobile number (e.g. +91 9632025123 or 9632025123).',
    };
  }

  return { isValid: true };
};

export const validateEmail = (email: string, isRequired = false): { isValid: boolean; error?: string } => {
  const trimmed = email ? email.trim() : '';
  if (!trimmed) {
    if (isRequired) {
      return { isValid: false, error: 'Official email address is required.' };
    }
    return { isValid: true };
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  return { isValid: true };
};

export const validateRequired = (value: any, fieldLabel: string): { isValid: boolean; error?: string } => {
  if (value === undefined || value === null) {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }
  if (typeof value === 'string' && !value.trim()) {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }
  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, error: `Please select at least one ${fieldLabel.toLowerCase()}.` };
  }
  if (typeof value === 'boolean' && !value) {
    return { isValid: false, error: `You must consent to continue.` };
  }
  return { isValid: true };
};

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const FILE_TYPE_PRESETS = {
  general: {
    extensions: ['.pdf', '.jpg', '.jpeg', '.png', '.docx'],
    mimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ],
    label: 'PDF, JPG, PNG, DOCX (Max 10 MB)',
  },
  boq: {
    extensions: ['.pdf', '.xlsx', '.csv', '.dwg', '.doc', '.docx'],
    mimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/vnd.ms-excel',
      'application/acad',
      'application/x-acad',
      'application/autocad_dwg',
      'image/vnd.dwg',
      'drawing/dwg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    label: 'BOQ Sheets (XLSX, CSV, PDF, DWG - Max 10 MB)',
  },
  resumePdfOnly: {
    extensions: ['.pdf'],
    mimeTypes: ['application/pdf'],
    label: 'PDF Only (Max 10 MB)',
  },
  technicalDrawings: {
    extensions: ['.pdf', '.dwg', '.jpg', '.jpeg', '.png', '.docx'],
    mimeTypes: [
      'application/pdf',
      'application/acad',
      'application/x-acad',
      'application/autocad_dwg',
      'image/vnd.dwg',
      'image/jpeg',
      'image/png',
    ],
    label: 'SLD / Drawings (PDF, DWG, JPG, PNG - Max 10 MB)',
  },
};

export const validateUploadedFile = (
  file: File,
  preset: keyof typeof FILE_TYPE_PRESETS = 'general'
): { isValid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File "${file.name}" is ${sizeMb} MB. Maximum allowed size is 10 MB.`,
    };
  }

  const { extensions } = FILE_TYPE_PRESETS[preset];
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();

  const isExtensionValid = extensions.some((ext) => ext.toLowerCase() === fileExt);

  if (!isExtensionValid) {
    return {
      isValid: false,
      error: `Invalid file format for "${file.name}". Supported: ${extensions.join(', ').toUpperCase()}`,
    };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
