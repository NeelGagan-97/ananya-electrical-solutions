import React, { useState, useRef } from 'react';
import { UploadedFileMeta } from '../types';
import {
  FILE_TYPE_PRESETS,
  validateUploadedFile,
  formatFileSize,
  MAX_FILE_SIZE_BYTES,
} from '../validation';

interface FileUploadFieldProps {
  label: string;
  files: UploadedFileMeta[];
  onChange: (files: UploadedFileMeta[]) => void;
  preset?: keyof typeof FILE_TYPE_PRESETS;
  required?: boolean;
  multiple?: boolean;
  helperText?: string;
  error?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  files,
  onChange,
  preset = 'general',
  required,
  multiple = true,
  helperText,
  error: externalError,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [internalError, setInternalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const presetConfig = FILE_TYPE_PRESETS[preset];

  const handleProcessFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setInternalError(null);

    const newFiles: UploadedFileMeta[] = multiple ? [...files] : [];
    const filesToUpload = Array.from(fileList);

    for (const file of filesToUpload) {
      const validation = validateUploadedFile(file, preset);
      if (!validation.isValid) {
        setInternalError(validation.error || 'Invalid file.');
        return;
      }

      // Check if already present
      if (newFiles.some((f) => f.name === file.name && f.size === file.size)) {
        continue;
      }

      newFiles.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    // Simulate animated upload progress
    setUploadProgress(15);
    const timer1 = setTimeout(() => setUploadProgress(65), 180);
    const timer2 = setTimeout(() => {
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(null);
        onChange(newFiles);
      }, 200);
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleProcessFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(files.filter((f) => f.id !== id));
  };

  const error = externalError || internalError;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between text-[13px] font-semibold text-[#0B192C]">
        <span className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </span>
        <span className="text-[11px] text-slate-500 font-medium">{presetConfig.label}</span>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative w-full rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#F8FAFC] hover:bg-white
          ${
            dragOver
              ? 'border-[#0284C7] bg-[#0284C7]/5 scale-[0.99]'
              : error
              ? 'border-red-300 bg-red-50/20'
              : 'border-slate-300 hover:border-[#0284C7]'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          aria-label={label}
          multiple={multiple}
          accept={presetConfig.extensions.join(',')}
          className="hidden"
          onChange={(e) => {
            handleProcessFiles(e.target.files);
            // Reset input so same file can be re-selected if removed
            e.target.value = '';
          }}
        />

        <div className="w-10 h-10 rounded-full bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-[22px]">upload_file</span>
        </div>

        <p className="text-[13px] font-medium text-slate-700">
          <span className="text-[#0284C7] font-semibold hover:underline">Click to browse</span> or drag and drop
        </p>
        <p className="text-[11.5px] text-slate-500 mt-0.5">
          {helperText || `Supports ${presetConfig.extensions.join(', ').toUpperCase()} up to 10 MB`}
        </p>

        {/* Upload Progress Bar */}
        {uploadProgress !== null && (
          <div className="w-full max-w-xs mt-3 bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#0284C7] h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Uploaded File Badges / List */}
      {files.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-xs text-[12.5px]"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="material-symbols-outlined text-[18px] text-[#0284C7] shrink-0">
                  {file.name.endsWith('.pdf')
                    ? 'picture_as_pdf'
                    : file.name.match(/\.(xlsx|csv)$/i)
                    ? 'table_view'
                    : file.name.match(/\.(jpg|jpeg|png)$/i)
                    ? 'image'
                    : 'description'}
                </span>
                <span className="font-medium text-slate-800 truncate" title={file.name}>
                  {file.name}
                </span>
                <span className="text-slate-400 text-[11px] shrink-0">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => handleRemove(file.id, e)}
                title="Remove file"
                className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {error ? (
        <p className="text-[11.5px] font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
          <span className="material-symbols-outlined text-[14px]">error</span>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
};
