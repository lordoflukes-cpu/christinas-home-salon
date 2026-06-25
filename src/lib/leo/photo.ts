'use client';

import { useEffect, useState } from 'react';

export interface DownscaledImage {
  blob: Blob;
  w: number;
  h: number;
}

/**
 * Load an image file, downscale so its longest edge ≤ `max`, and re-encode as
 * JPEG. Keeps on-device storage (and backups) reasonable. Browser-only.
 */
export function downscaleImage(
  file: File,
  max = 1600,
  quality = 0.82,
): Promise<DownscaledImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Could not encode image'));
          resolve({ blob, w, h });
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}

/** Create a stable object URL for a Blob, revoked on change/unmount. */
export function usePhotoUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);
  return url;
}
