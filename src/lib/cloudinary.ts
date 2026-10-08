import { createHash } from "node:crypto";
import { getEnv } from "@/lib/env";

// Signed direct uploads: the browser uploads straight to Cloudinary using a
// short-lived signature generated here, so the API secret never leaves the
// server and no file bytes pass through (or are stored by) this app.

/** Cloudinary signature: SHA-1 of sorted `key=value` pairs joined by "&", plus the secret. */
export function signCloudinaryParams(params: Record<string, string | number>): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + getEnv().CLOUDINARY_API_SECRET).digest("hex");
}

export function cloudinaryUploadUrl(resourceType: "image" | "video" | "raw") {
  return `https://api.cloudinary.com/v1_1/${getEnv().CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
}
