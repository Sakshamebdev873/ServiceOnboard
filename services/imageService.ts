import fs from 'fs';
import cloudinary from '../config/cloudinary.js';

export const uploadImagesToCloudinary = async (files: Express.Multer.File[]): Promise<string[]> => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'service-centers',
      });
      
      // Cleanup: Delete local file after success
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      
      return result.secure_url;
    } catch (error) {
      console.error(`Failed to upload ${file.originalname}:`, error);
      
      // Cleanup: Delete local file on failure too
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw error;
    }
  });

  const results = await Promise.all(uploadPromises);
  return results;
};

// Helper to cleanup files if controller crashes before upload
export const cleanupLocalFiles = (files: Express.Multer.File[]) => {
  if (files) {
    files.forEach(f => {
      if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
    });
  }
};