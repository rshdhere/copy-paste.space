import cron from "node-cron";
import { S3Client, ListObjectsV2Command, DeleteObjectCommand, ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";

const s3Region = process.env.AWS_REGION as string;
const s3Bucket = process.env.S3_BUCKET_NAME as string;
const tempPrefix = (process.env.S3_TEMP_PREFIX || "temp/").replace(/^\/+|\/+$/g, "") + "/"; // ensure trailing slash

const s3Client = new S3Client({ region: s3Region });

async function deleteExpiredTempObjects(): Promise<void> {
  if (!s3Region || !s3Bucket) {
    console.error("S3 cleanup skipped: S3 is not configured");
    return;
  }

  const now = Date.now();
  const expirationMs = 5 * 60 * 1000; // 5 minutes of time

  try {
    let continuationToken: string | undefined = undefined;
    let totalDeleted = 0;

    do {
      const listResp: ListObjectsV2CommandOutput = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: s3Bucket,
          Prefix: tempPrefix,
          ContinuationToken: continuationToken,
        })
      );

      const contents = listResp.Contents || [];

      for (const obj of contents) {
        const key = obj.Key;
        const lastModified = obj.LastModified?.getTime();
        if (!key || !lastModified) continue;

        if (now - lastModified > expirationMs) {
          try {
            await s3Client.send(
              new DeleteObjectCommand({ Bucket: s3Bucket, Key: key })
            );
            totalDeleted += 1;
          } catch (deleteErr) {
            console.error(`Failed to delete expired object ${key}:`, deleteErr);
          }
        }
      }

      continuationToken = listResp.IsTruncated ? listResp.NextContinuationToken : undefined;
    } while (continuationToken);

    if (totalDeleted > 0) {
      console.log(`S3 cleanup: deleted ${totalDeleted} expired objects from ${tempPrefix}`);
    }
  } catch (err) {
    console.error("S3 cleanup job failed:", err);
  }
}

export function startS3CleanupCron(): void {
  console.log("starting S3 temp/ cleanup cron (every 5 minutes)");
  cron.schedule("*/5 * * * *", deleteExpiredTempObjects);
  // Optionally run once on startup
  deleteExpiredTempObjects();
} 