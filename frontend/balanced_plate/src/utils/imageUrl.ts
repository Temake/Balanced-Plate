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

/**
 * Normalize a score value to percentage (0-100).
 * Gemini API returns balance_score as 0.0-1.0, but UI expects 0-100%.
 * This function handles both cases by detecting if the value is already a percentage.
 */
export const normalizeScore = (score: string | number | null | undefined): number => {
  if (score === null || score === undefined) return 0;
  
  const numScore = typeof score === 'string' ? parseFloat(score) : score;
  
  if (isNaN(numScore)) return 0;
  
  // If score is between 0 and 1 (exclusive of values > 1), multiply by 100
  // This handles the Gemini API returning 0.0-1.0 format
  if (numScore >= 0 && numScore <= 1) {
    return numScore * 100;
  }
  
  // Already a percentage (0-100), return as-is
  return numScore;
};
