import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function getUploadSignature(
  folder: string,
  publicId?: string,
  resourceType: "image" | "video" = "image",
) {
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = { timestamp, folder };
  if (publicId) params.public_id = publicId;

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
    resourceType,
  };
}

export function injectCloudinaryTransforms(url: string, transforms: string): string {
  return url.replace(/\/upload\//, `/upload/${transforms}/`);
}
