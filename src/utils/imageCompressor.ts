/**
 * High-performance browser-based image compressor
 * Resizes images and converts to lightweight JPEG base64 strings (~50KB-80KB).
 * Prevents localStorage QuotaExceededError and Firestore 1MB document limit issues.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default: 0.75)
  cropSquare?: boolean; // When true, crops center 1:1 square for icon avatars
}

/**
 * Compress an image File or Blob down to a compact data URL
 */
export async function compressImageFile(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<string> {
  const { maxWidth = 1000, maxHeight = 1000, quality = 0.75, cropSquare = false } = options;

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
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          if (cropSquare) {
            const minSide = Math.min(img.width, img.height);
            const sx = Math.round((img.width - minSide) / 2);
            const sy = Math.round((img.height - minSide) / 2);
            const targetDim = Math.min(maxWidth, maxHeight, minSide);

            canvas.width = targetDim;
            canvas.height = targetDim;

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetDim, targetDim);
            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetDim, targetDim);
          } else {
            let { width, height } = img;
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
          }

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
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

  const { maxWidth = 1000, maxHeight = 1000, quality = 0.75, cropSquare = false } = options;

  // Only bypass if neither resizing nor square crop is requested and size is small
  if (!cropSquare && !options.maxWidth && !options.maxHeight && dataUrl.length < 160000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(dataUrl); // fallback
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (cropSquare) {
          const minSide = Math.min(img.width, img.height);
          const sx = Math.round((img.width - minSide) / 2);
          const sy = Math.round((img.height - minSide) / 2);
          const targetDim = Math.min(maxWidth, maxHeight, minSide);

          canvas.width = targetDim;
          canvas.height = targetDim;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetDim, targetDim);
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetDim, targetDim);
        } else {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}

/**
 * Standard Icon Size Avatar Compressor:
 * Resizes to 240x240 px, 1:1 center-cropped icon square, lightweight JPEG (~25KB)
 * Used for Member, Trainer, Admin, and Developer profile avatars.
 */
export async function compressAvatarIcon(
  input: File | Blob | string
): Promise<string> {
  const avatarOptions: CompressionOptions = {
    maxWidth: 240,
    maxHeight: 240,
    quality: 0.85,
    cropSquare: true,
  };

  if (typeof input === 'string') {
    return compressDataUrl(input, avatarOptions);
  }
  return compressImageFile(input, avatarOptions);
}
