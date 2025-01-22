import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";

const REGION = process.env.AWS_REGION;
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY || "",
    secretAccessKey: SECRET_KEY || "",
  },
});

const getUploadUrl = async (key: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return signedUrl;
};

const uploadToS3 = async (buffer: Buffer, key: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3Client.send(command);
};

const createThumbnail = async (imageBuffer: Buffer) => {
  return sharp(imageBuffer).resize({ width: 250 }).toBuffer();
};

const uploadawsS3 = functions.https.onRequest(async (req, res) => {
  try {
    const uniqueName = uuidv4();
    // console.log("Request body:", req.body);
    console.log(process.env.AWS_ACCESS_KEY_ID);
    console.log(process.env.AWS_BUCKET_NAME);
    const { imageBase64, contentType } = await req.body;
    const imageBuffer = Buffer.from(imageBase64, "base64");

    // Create a thumbnail from the image buffer
    const thumbnailBuffer = await createThumbnail(imageBuffer);

    // Define S3 keys for the original image and the thumbnail
    const originalKey = `uploads/${uniqueName}`;
    const thumbnailKey = `thumbnails/${uniqueName}`;

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
