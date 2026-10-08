import { getEnv } from "@/lib/env";
import { cloudinaryUploadUrl, signCloudinaryParams } from "@/lib/cloudinary";
import type { SignUploadInput } from "@/Schemas/media.schema";
import type { Actor } from "@/Services/service-utils";

export interface SignedUpload {
  uploadUrl: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  resourceType: SignUploadInput["resourceType"];
}

export const uploadService = {
  /**
   * Returns everything the browser needs to POST a file to Cloudinary:
   * `file`, `api_key`, `timestamp`, `folder`, `signature` as multipart fields.
   * The response's `secure_url` / `public_id` are then saved on the record.
   */
  signUpload(_actor: Actor, input: SignUploadInput): SignedUpload {
    const { CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME } = getEnv();
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `icaada/${input.folder}`;
    return {
      uploadUrl: cloudinaryUploadUrl(input.resourceType),
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey: CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature: signCloudinaryParams({ folder, timestamp }),
      resourceType: input.resourceType,
    };
  },
};
