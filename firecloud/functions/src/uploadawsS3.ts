import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import * as functions from "firebase-functions";

const REGION = process.env.AWS_REGION;
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const getUploadUrl = async (key: string, contentType: any) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return signedUrl;
};

const uploadToS3 = async (buffer: any, key: string, contentType: any) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3Client.send(command);
};

const createThumbnail = async (imageBuffer: Buffer<ArrayBuffer>) => {
  return sharp(imageBuffer).resize({ width: 250 }).toBuffer();
};

const uploadawsS3 = functions.https.onRequest(async (req, res) => {
  try {
    const { fileName, contentType, imageBase64 } = await req.body;
    const imageBuffer = Buffer.from(imageBase64, "base64");

    // Create a thumbnail from the image buffer
    const thumbnailBuffer = await createThumbnail(imageBuffer);

    // Define S3 keys for the original image and the thumbnail
    const originalKey = `uploads/${fileName}`;
    const thumbnailKey = `thumbnails/${fileName}`;

    // Upload the thumbnail to S3
    await uploadToS3(thumbnailBuffer, thumbnailKey, contentType);

    // Generate a signed URL for the original image upload
    const uploadUrl = await getUploadUrl(originalKey, contentType);

    // Return both upload URL and thumbnail URL
    const thumbnailUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${thumbnailKey}`;

    res.status(200).json({ uploadUrl, thumbnailUrl });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: error });
  }
});

export { uploadawsS3 };
