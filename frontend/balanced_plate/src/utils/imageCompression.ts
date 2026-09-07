/**
 * Utility to compress and resize images client-side before uploading.
 * Shrinks large mobile photos (typically 4-15MB) down to ~150-300KB
 * with a max dimension of 1024px and JPEG quality 0.82.
 */
export async function compressImage(
  file: File,
  maxDimension = 1024,
  quality = 0.82
): Promise<File> {
  // If not an image or SVG/GIF, return as-is
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new window.Image();

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // If image is already smaller than maxDimension and under 500KB, avoid re-encoding
        if (width <= maxDimension && height <= maxDimension && file.size < 500 * 1024) {
          resolve(file);
          return;
        }

        // Calculate scaled dimensions while preserving aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Create compressed file with .jpg extension
            const originalName = file.name.replace(/\.[^/.]+$/, '');
            const compressedFile = new File([blob], `${originalName}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            // If compressed file is somehow larger than original, keep original
            if (compressedFile.size >= file.size) {
              resolve(file);
            } else {
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        resolve(file);
      };

      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        resolve(file);
      }
    };

    reader.onerror = () => {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}
