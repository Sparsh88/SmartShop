import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { BadRequestError } from '../utils/errors';

// Ensure local uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage for local upload & fallback
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, uploadDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only image files are allowed!') as any, false);
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

/**
 * Helper to upload a local file to Cloudinary.
 * Falls back to returning the local static route if Cloudinary credentials are default/missing.
 */
export const uploadToCloudinary = async (filePath: string, folder: string): Promise<string> => {
  try {
    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_KEY !== '123456789012345';

    if (!isCloudinaryConfigured) {
      console.log('Cloudinary not configured. Defaulting to local static file.');
      const filename = path.basename(filePath);
      return `/uploads/${filename}`;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `smartshop/${folder}`,
      use_filename: true,
      unique_filename: true,
    });

    // Delete local temp file after successful Cloudinary upload
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error('Error deleting local temp file after Cloudinary upload:', e);
    }

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed. Falling back to local static URL:', error);
    const filename = path.basename(filePath);
    return `/uploads/${filename}`;
  }
};
