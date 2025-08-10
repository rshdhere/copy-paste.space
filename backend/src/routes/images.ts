import { Router, Request, Response } from "express";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const imagesRouter = Router();

function getEnvConfig() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "";
  const bucket = process.env.S3_BUCKET_NAME || process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET_NAME || "";
  const prefixRaw = process.env.S3_TEMP_PREFIX || "temp/";
  const tempPrefix = prefixRaw.replace(/^\/+|\/+$/g, "") + "/"; // ensure trailing slash
  return { region, bucket, tempPrefix };
}

imagesRouter.get("/upload-url", async (req: Request, res: Response) => {
  try {
    const { region, bucket, tempPrefix } = getEnvConfig();

    if (!region || !bucket) {
      console.error("S3 not configured: ", { region, bucket });
      res.status(500).json({ message: "S3 is not configured" });
      return;
    }

    const filename = (req.query.filename as string) || "image";
    const contentType = (req.query.contentType as string) || "application/octet-stream";

    const s3Client = new S3Client({ region });

    const uniqueId = randomUUID();
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectKey = `${tempPrefix}${uniqueId}-${safeName}`;

    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: contentType,
    });

    const expiresInSeconds = 60 * 5; // 5 minutes
    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: expiresInSeconds });

    res.status(200).json({
      uploadUrl,
      key: objectKey,
      bucket,
      expiresIn: expiresInSeconds,
      region,
    });
  } catch (error: any) {
    console.error("Failed to generate presigned URL:", error);
    res.status(500).json({ message: "Failed to generate presigned URL" });
  }
});

// Generate a presigned GET URL for download, given an object key
imagesRouter.get("/download-url", async (req: Request, res: Response) => {
  try {
    const { region, bucket, tempPrefix } = getEnvConfig();
    const key = (req.query.key as string) || "";

    if (!region || !bucket) {
      console.error("S3 not configured: ", { region, bucket });
      res.status(500).json({ message: "S3 is not configured" });
      return;
    }

    if (!key || !key.startsWith(tempPrefix)) {
      res.status(400).json({ message: "Invalid or missing key" });
      return;
    }

    const s3Client = new S3Client({ region });

    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key.split("/").pop()}"`
    });

    const expiresInSeconds = 60; // short-lived download URL
    const downloadUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: expiresInSeconds });

    res.status(200).json({ downloadUrl, expiresIn: expiresInSeconds });
  } catch (error) {
    console.error("Failed to generate download URL:", error);
    res.status(500).json({ message: "Failed to generate download URL" });
  }
});

export default imagesRouter; 