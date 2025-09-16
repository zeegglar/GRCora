import React, { useRef, useState, useCallback } from 'react';
import { uploadFile, validateFile, formatFileSize, getFileIcon, FileUploadResult, FileUploadProgress } from '../../services/fileService';
import { useToast } from './Toast';
import { ProgressBar } from './LoadingStates';
import { TrashIcon, DocumentIcon } from './Icons';

interface FileUploadProps {
  onUploadComplete: (result: FileUploadResult) => void;
  onUploadError?: (error: string) => void;
  projectId: string;
  userId: string;
  accept?: string;
  maxFiles?: number;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: FileUploadProgress;
  id: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  projectId,
  userId,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.zip',
  maxFiles = 5,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { success, error } = useToast();

  const handleFileUpload = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);

    // Check max files limit
    if (uploadingFiles.length + fileArray.length > maxFiles) {
      error('Too many files', `Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of fileArray) {
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        error('Invalid file', `${file.name}: ${validation.error}`);
        continue;
      }

      const uploadingFile: UploadingFile = {
        file,
        progress: { loaded: 0, total: file.size, percentage: 0 },
        id: Math.random().toString(36).substring(2, 15)
      };

      setUploadingFiles(prev => [...prev, uploadingFile]);

      try {
        const result = await uploadFile(
          file,
          projectId,
          userId,
          (progress) => {
            setUploadingFiles(prev =>
              prev.map(f =>
                f.id === uploadingFile.id ? { ...f, progress } : f
              )
            );
          }
        );

        // Remove from uploading files
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));

        // Notify parent component
        onUploadComplete(result);
        success('File uploaded', `${file.name} uploaded successfully`);

      } catch (err) {
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        error('Upload failed', `${file.name}: ${errorMessage}`);
        if (onUploadError) {
          onUploadError(errorMessage);
        }
      }
    }
  }, [uploadingFiles.length, maxFiles, projectId, userId, onUploadComplete, onUploadError, success, error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
    // Reset input value to allow uploading the same file again
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-slate-600 hover:border-slate-500'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className="sr-only"
          id="file-upload"
        />

        <div className="space-y-4">
          <div className="mx-auto h-12 w-12 text-slate-400">
            <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-blue-400 hover:text-blue-300 font-medium">
                Choose files
              </span>
              <span className="text-slate-400"> or drag and drop</span>
            </label>
            <p className="text-xs text-slate-500 mt-1">
              PDF, Word, Excel, PowerPoint, images, text files up to 50MB
            </p>
            <p className="text-xs text-slate-500">
              Maximum {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-slate-300">Uploading Files</h4>
          {uploadingFiles.map((uploadingFile) => (
            <div key={uploadingFile.id} className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <span className="text-lg flex-shrink-0">
                    {getFileIcon(uploadingFile.file.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatFileSize(uploadingFile.file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeUploadingFile(uploadingFile.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                  aria-label="Cancel upload"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <ProgressBar
                progress={uploadingFile.progress.percentage}
                className="h-2"
                showPercentage={false}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{Math.round(uploadingFile.progress.percentage)}%</span>
                <span>
                  {formatFileSize(uploadingFile.progress.loaded)} / {formatFileSize(uploadingFile.progress.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Simple file preview component
export const FilePreview: React.FC<{
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  onDelete?: () => void;
  className?: string;
}> = ({ fileName, fileSize, fileType, fileUrl, onDelete, className = '' }) => {
  const handleDownload = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className={`bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">
            {getFileIcon(fileType)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {fileName}
            </p>
            <p className="text-xs text-slate-400">
              {formatFileSize(fileSize)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            aria-label="Download file"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-slate-400 hover:text-red-400 transition-colors"
              aria-label="Delete file"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;