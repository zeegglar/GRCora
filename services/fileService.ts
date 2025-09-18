import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface FileUploadResult {
  url: string;
  key: string;
  size: number;
  type: string;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// File validation
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSizeInMB = 50; // 50MB limit
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (file.size > maxSizeInMB * 1024 * 1024) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeInMB}MB`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload PDF, Word, Excel, PowerPoint, text, CSV, image, or ZIP files.'
    };
  }

  return { isValid: true };
};

// Generate secure filename
const generateSecureFilename = (originalName: string, userId: string, projectId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'bin';
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);

  return `evidence/${projectId}/${userId}/${timestamp}_${random}_${sanitizedName}.${extension}`;
};

// Upload file to Supabase Storage
export const uploadFile = async (
  file: File,
  projectId: string,
  userId: string,
  onProgress?: (progress: FileUploadProgress) => void
): Promise<FileUploadResult> => {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  if (!isSupabaseConfigured) {
    // In demo mode, simulate upload
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) {
          onProgress({
            loaded: (progress / 100) * file.size,
            total: file.size,
            percentage: progress
          });
        }

        if (progress >= 100) {
          clearInterval(interval);
          resolve({
            url: `https://demo-storage.example.com/evidence/${file.name}`,
            key: `demo_${Date.now()}_${file.name}`,
            size: file.size,
            type: file.type
          });
        }
      }, 200);
    });
  }

  const filename = generateSecureFilename(file.name, userId, projectId);

  try {
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('evidence-files')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('evidence-files')
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      key: data.path,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// Delete file from storage
export const deleteFile = async (fileKey: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    // In demo mode, just log the deletion
    // Demo mode: File deletion simulated
    return;
  }

  try {
    const { error } = await supabase.storage
      .from('evidence-files')
      .remove([fileKey]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('File deletion error:', error);
    throw error;
  }
};

// Download file (create download link)
export const downloadFile = async (fileUrl: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('File download error:', error);
    throw error;
  }
};

// Get file info from URL
export const getFileInfo = (url: string): { name: string; extension: string } => {
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  const parts = filename.split('.');
  const extension = parts.length > 1 ? parts.pop()! : '';
  const name = parts.join('.');

  return { name, extension };
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file icon based on type
export const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('zip') || fileType.includes('compressed')) return '🗂️';
  if (fileType.includes('text') || fileType.includes('csv')) return '📋';
  return '📎';
};