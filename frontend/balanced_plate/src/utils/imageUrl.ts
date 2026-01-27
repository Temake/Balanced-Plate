/**
 * Convert relative image paths to full URLs by prepending the backend base URL.
 * Handles both absolute URLs (already complete) and relative paths from the API.
 */
export const getImageUrl = (filePath: string | null | undefined): string => {
  if (!filePath) return '';
  
  // If already an absolute URL, return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // Remove /api suffix from base URL for media files
  const baseURL = (import.meta.env.VITE_API_URL || '').replace('/api', '');
  return `${baseURL}${filePath.startsWith('/') ? filePath : '/' + filePath}`;
};
