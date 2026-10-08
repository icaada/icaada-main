import { adminApi } from '@/lib/admin/api-client';
import type { SignedUpload } from '@/Services/upload.service';

export interface UploadedAsset {
  url: string;
  publicId: string;
}

const resourceTypeFor = (file: File): SignedUpload['resourceType'] => {
  if (file.type.startsWith('image/')) return 'image';
  // Cloudinary stores audio under the "video" resource type.
  if (file.type.startsWith('video/') || file.type.startsWith('audio/')) return 'video';
  return 'raw';
};

/**
 * Signed direct upload: ask our API for a short-lived signature, then send the
 * file straight to Cloudinary. The API secret never reaches the browser.
 */
export async function uploadToCloudinary(file: File, folder: string): Promise<UploadedAsset> {
  const { data: signed } = await adminApi.post<SignedUpload>('/admin/media/sign-upload', {
    resourceType: resourceTypeFor(file),
    folder,
  });
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signed.apiKey);
  form.append('timestamp', String(signed.timestamp));
  form.append('folder', signed.folder);
  form.append('signature', signed.signature);

  const response = await fetch(signed.uploadUrl, { method: 'POST', body: form });
  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.secure_url) {
    throw new Error(json?.error?.message ? `Upload failed: ${json.error.message}` : 'Upload failed. Please try again.');
  }
  return { url: json.secure_url, publicId: json.public_id };
}
