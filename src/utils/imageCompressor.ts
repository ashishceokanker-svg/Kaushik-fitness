/**
 * High-performance browser-based image compressor
 * Resizes images and converts to lightweight JPEG base64 strings (~50KB-80KB).
 * Prevents localStorage QuotaExceededError and Firestore 1MB document limit issues.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.75)
}

/**
 * Compress an image File or Blob down to a compact data URL
 */
export async function compressImageFile(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<string> {
  const { maxWidth = 1000, maxHeight = 1000, quality = 0.75 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('फ़ाइल पढ़ने में त्रुटि हुई'));

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('खाली इमेज फ़ाइल'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('इमेज लोड करने में त्रुटि'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate proportional scale
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original data URL if 2D context fails
            resolve(result);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // White background for transparent PNGs converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw image scaled
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG with given quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          // If canvas fails, fallback to original
          console.warn('[ImageCompressor] Canvas compression failed, using original:', err);
          resolve(result);
        }
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress an existing base64 data URL
 */
export async function compressDataUrl(
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  // If already small (< 120KB), return directly
  if (dataUrl.length < 160000) {
    return dataUrl;
  }

  const { maxWidth = 1000, maxHeight = 1000, quality = 0.75 } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(dataUrl); // fallback
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}
