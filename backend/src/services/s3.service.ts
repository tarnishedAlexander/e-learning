import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "thetarnisheds3";
const REGION = process.env.AWS_REGION || "us-east-1";
const ACCESS_POINT_ALIAS = process.env.AWS_S3_ACCESS_POINT_ALIAS;

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadVideoToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string = "video/mp4"
): Promise<string> {
  const key = `videos/${Date.now()}-${fileName}`;
  // Use Access Point for upload if available
  const bucketOrAccessPoint = ACCESS_POINT_ALIAS || BUCKET_NAME;

  const command = new PutObjectCommand({
    Bucket: bucketOrAccessPoint,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  console.log("Video uploaded to S3:", key);
  return key;
}

export async function getVideoUrl(s3Key: string): Promise<string> {
  console.log("Getting video URL for:", s3Key);
  
  // For reading, always use the bucket directly (not Access Point)
  // because Access Point may not have read permissions configured
  const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${s3Key}`;
  console.log("Using bucket URL for reading:", url);
  return url;
}

export function getS3PublicUrl(s3Key: string): string {
  // For public URLs, use bucket directly
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${s3Key}`;
}
