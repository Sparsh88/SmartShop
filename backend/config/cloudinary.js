import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let isCloudinaryConfigured = false;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    isCloudinaryConfigured = true;
    console.log('Cloudinary Configured successfully.');
  } catch (error) {
    console.error('Error configuring Cloudinary:', error.message);
  }
} else {
  console.warn('Cloudinary environment variables missing. Falling back to local upload storage.');
}

/**
 * Unified image upload handler
 * @param {Object} file - The file object from Multer (file.buffer, file.originalname)
 * @param {String} folder - Folder name on Cloudinary
 * @returns {Promise<String>} The uploaded image URL
 */
export const uploadImage = async (file, folder = 'smartshop') => {
  if (!file) return '';

  if (isCloudinaryConfigured) {
    try {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: folder, resource_type: 'auto' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload stream error:', error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        stream.end(file.buffer);
      });
    } catch (error) {
      console.error('Cloudinary upload failed, using local storage fallback:', error.message);
    }
  }

  // Local fallback
  try {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    const localPath = path.join('uploads', filename);
    await fs.promises.writeFile(localPath, file.buffer);
    // Return relative URL that our Express server will serve statically
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Local file write failed:', error.message);
    throw new Error('Failed to upload image file');
  }
};
