/**
 * Cloudinary Media CDN & Dynamic Image Optimization Engine
 * Automates delivery in AVIF / WebP, dynamic compression, and cloud asset uploads.
 */

const CLOUD_NAME =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) ||
  (import.meta.env.CLOUDINARY_CLOUD_NAME as string) ||
  'dpxukzvik';

/**
 * Transforms an image URL into a high-performance WebP/AVIF delivery URL with auto-compression.
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'limit' | 'thumb';
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'avif';
  } = {}
): string {
  if (!url) return '';

  // If already a Cloudinary URL, inject transformations dynamically
  if (url.includes('res.cloudinary.com')) {
    const { width, height, crop = 'limit', quality = 'auto', format = 'auto' } = options;
    const transforms = [`f_${format}`, `q_${quality}`];

    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if (width || height) transforms.push(`c_${crop}`);

    const transformStr = transforms.join(',');
    return url.replace('/upload/', `/upload/${transformStr}/`);
  }

  // If external image (e.g. Unsplash), fetch through Cloudinary CDN with f_auto,q_auto
  if (url.startsWith('http')) {
    const { width, height, quality = 'auto', format = 'auto' } = options;
    const transforms = [`f_${format}`, `q_${quality}`];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    const transformStr = transforms.join(',');

    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformStr}/${encodeURIComponent(url)}`;
  }

  return url;
}

/**
 * Direct Client-Side Image Upload to Cloudinary
 * Enables Admin and Vendors to upload product hamper images directly to the Cloudinary CDN.
 */
export async function uploadToCloudinary(
  file: File,
  folder = 'as_hamper_catalog'
): Promise<{ url: string; secure_url: string; public_id: string; format: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_preset'); // or unsigned asset upload
  formData.append('folder', folder);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // If unsigned upload preset isn't configured in dashboard, convert file to optimized local blob/base64 as resilient fallback
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve({
            url: result,
            secure_url: result,
            public_id: `local_${Date.now()}`,
            format: file.type.split('/')[1] || 'webp',
          });
        };
        reader.readAsDataURL(file);
      });
    }

    const data = await response.json();
    return {
      url: data.url,
      secure_url: data.secure_url,
      public_id: data.public_id,
      format: data.format,
    };
  } catch (err) {
    // Graceful offline/fallback encoding
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({
          url: result,
          secure_url: result,
          public_id: `fallback_${Date.now()}`,
          format: file.type.split('/')[1] || 'webp',
        });
      };
      reader.readAsDataURL(file);
    });
  }
}
