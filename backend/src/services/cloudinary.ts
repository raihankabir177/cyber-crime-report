import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { cloudinaryConfigured, env } from "../config/env";

if (cloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

export interface UploadResult {
  url: string;
  publicId: string;
  bytes: number;
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  originalName: string
): Promise<UploadResult> {
  if (!cloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  const publicId = `${Date.now()}_${sanitizeName(originalName)}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes ?? buffer.length,
        });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}
