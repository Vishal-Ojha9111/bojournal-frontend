// FILE: src/components/ui/FileUploader.tsx
// PURPOSE: File upload component with presigned URL support and progress tracking
// API: POST /api/v2/transactions/presigned-url, POST /api/v2/user/profile-picture-url

import React, { useState, useRef } from 'react';
import apiClient from '../../lib/apiClient';
import axios from 'axios';

export interface FileUploadResult {
  file: File;
  fileUrl: string;
  error?: string;
}

export interface FileUploaderProps {
  allowedPrefixes: string[]; // e.g., ['transactions/', 'profile_pictures/']
  maxSizeMB?: number;
  maxFiles?: number;
  accept?: string;
  onUploadComplete?: (results: FileUploadResult[]) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
  className?: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  fileUrl?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  allowedPrefixes,
  maxSizeMB = 5,
  maxFiles = 5,
  accept = 'image/jpeg,image/png,image/jpg',
  onUploadComplete,
  onError,
  multiple = true,
  className = '',
}) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: ensure prefix validation (transactions/|profile_pictures/)
  const validatePrefix = (prefix: string): boolean => {
    return allowedPrefixes.some(allowed => prefix.startsWith(allowed));
  };

  const validateFile = (file: File): string | null => {
    // Size validation
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Type validation
    const acceptedTypes = accept.split(',').map(t => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      return `File type must be one of: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFile = async (file: File, prefix: string): Promise<FileUploadResult> => {
    const fileName = `${prefix}${Date.now()}_${file.name}`;
    
    // Validate prefix
    if (!validatePrefix(prefix)) {
      throw new Error(`Invalid prefix: ${prefix}. Allowed: ${allowedPrefixes.join(', ')}`);
    }

    try {
      // Step 1: Get presigned URL
      let presignedResponse;
      
      if (prefix.startsWith('profile_pictures/')) {
        // Profile picture endpoint
        presignedResponse = await apiClient.get('/user/profile-picture-url', {
          params: { file_name: fileName }
        });
      } else {
        // Transaction file endpoint
        presignedResponse = await apiClient.post('/transactions/presigned-url', {
          file_name: fileName,
          content_type: file.type,
          key_prefix: prefix,
        });
      }

      const { upload_url, file_url } = presignedResponse.data.data || presignedResponse.data;

      if (!upload_url || !file_url) {
        throw new Error('Invalid presigned URL response');
      }

      // Step 2: Upload to S3 using presigned URL
      await axios.put(upload_url, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          
          setUploads(prev =>
            prev.map(u =>
              u.fileName === file.name
                ? { ...u, progress, status: 'uploading' }
                : u
            )
          );
        },
      });

      return {
        file,
        fileUrl: file_url,
      };
    } catch (error: unknown) {
      const errorMessage = 
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Upload failed';
      return {
        file,
        fileUrl: '',
        error: errorMessage,
      };
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validate file count
    const fileArray = Array.from(files);
    if (fileArray.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    const validationErrors: string[] = [];
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(`${file.name}: ${error}`);
      }
    });

    if (validationErrors.length > 0) {
      onError?.(validationErrors.join('\n'));
      return;
    }

    // Initialize upload progress
    const initialUploads: UploadProgress[] = fileArray.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'pending',
    }));
    setUploads(initialUploads);

    // Determine prefix (use first allowed prefix for now)
    const prefix = allowedPrefixes[0];

    // Upload all files
    const uploadPromises = fileArray.map(file => uploadFile(file, prefix));
    const results = await Promise.all(uploadPromises);

    // Update final status
    setUploads(prev =>
      prev.map((u, i) => ({
        ...u,
        status: results[i].error ? 'error' : 'success',
        error: results[i].error,
        fileUrl: results[i].fileUrl,
        progress: 100,
      }))
    );

    // Check for errors
    const failedUploads = results.filter(r => r.error);
    if (failedUploads.length > 0) {
      const errorMessages = failedUploads
        .map(r => `${r.file.name}: ${r.error}`)
        .join('\n');
      onError?.(errorMessages);
    }

    // Call onUploadComplete with all results
    onUploadComplete?.(results);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const clearUploads = () => {
    setUploads([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8
          transition-colors duration-200
          cursor-pointer
          ${isDragging
            ? 'border-[var(--brand-500)] bg-[var(--brand-50)]'
            : 'border-[var(--border)] hover:border-[var(--brand-300)]'
          }
        `.trim().replace(/\s+/g, ' ')}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Upload files"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center justify-center text-center">
          {/* Upload Icon */}
          <svg
            className="w-12 h-12 text-[var(--muted)] mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <p className="text-base text-[var(--text)] mb-2">
            <span className="font-semibold text-[var(--brand-500)]">Click to upload</span>
            {' '}or drag and drop
          </p>

          <p className="text-sm text-[var(--muted)]">
            {accept.split(',').map(t => t.split('/')[1]).join(', ').toUpperCase()} up to {maxSizeMB}MB
          </p>

          {multiple && (
            <p className="text-xs text-[var(--muted)] mt-1">
              Maximum {maxFiles} files
            </p>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploads.map((upload, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--text)] truncate flex-1">
                  {upload.fileName}
                </span>
                <span
                  className={`text-xs ml-2 ${
                    upload.status === 'success'
                      ? 'text-[var(--success)]'
                      : upload.status === 'error'
                      ? 'text-[var(--error)]'
                      : 'text-[var(--muted)]'
                  }`}
                >
                  {upload.status === 'success' && '✓ Uploaded'}
                  {upload.status === 'error' && '✗ Failed'}
                  {upload.status === 'uploading' && `${upload.progress}%`}
                  {upload.status === 'pending' && 'Pending'}
                </span>
              </div>

              {/* Progress Bar */}
              {(upload.status === 'uploading' || upload.status === 'pending') && (
                <div className="w-full bg-[var(--border)] rounded-full h-1.5">
                  <div
                    className="bg-[var(--brand-500)] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              )}

              {/* Error Message */}
              {upload.error && (
                <p className="text-xs text-[var(--error)] mt-1">
                  {upload.error}
                </p>
              )}
            </div>
          ))}

          {/* Clear Button */}
          <button
            onClick={clearUploads}
            className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
