import { getCurrentUserId, successResponse, errorResponse } from "@/lib/utils/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return errorResponse("Not authenticated", 401);
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return errorResponse("Cloudinary not configured", 500);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "buddy-script";

    if (!file) {
      return errorResponse("No file provided", 400);
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine resource type (image vs video)
    const fileType = file.type;
    const resourceType = fileType.startsWith("video/") ? "video" : "image";

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          transformation: resourceType === "image"
            ? [{ quality: "auto", fetch_format: "auto" }]
            : undefined,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Write buffer to stream
      const { Readable } = require("stream");
      Readable.from(buffer).pipe(uploadStream);
    });

    return successResponse({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse("Upload failed: " + error.message, 500);
  }
}
