import express from  'express';
import type { Request, Response } from 'express'
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from './lib/prisma.js'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
  origin: 'https://service-center-client.onrender.com' // Replace with your actual Frontend Render URL
}));
app.use(express.json());

// --- Cloudinary Configuration (From your snippet) ---
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string, 
  api_key: process.env.CLOUDINARY_API_KEY as string, 
  api_secret: process.env.CLOUDINARY_API_SECRET as string 
});

// --- Multer Config (Temporary Local Storage) ---
// We save files to 'uploads/' temporarily so Cloudinary SDK can read them
const upload = multer({ dest: 'uploads/' });

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (filePath: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'service-centers', // Optional: organize in a folder
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

// --- Routes ---

app.get('/', (req, res) => {
  res.send('Service Center API is running');
});

// POST: Create Service Center
app.post('/api/service-center', upload.array('images'), async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Extract text data
    const { 
      centerName, 
      phone, 
      email, 
      city, 
      state, 
      zipCode, 
      country, 
      latitude, 
      longitude 
    } = req.body;

    // 2. Handle Categories
    let categories: string[] = [];
    if (req.body.categories) {
        if (Array.isArray(req.body.categories)) {
            categories = req.body.categories;
        } else {
            categories = [req.body.categories];
        }
    }

    // 3. Handle Images (The Manual SDK Way)
    const files = req.files as Express.Multer.File[];
    const uploadedImageUrls: string[] = [];

    if (files && files.length > 0) {
      // Process uploads in parallel for speed
      const uploadPromises = files.map(async (file) => {
        // A. Upload to Cloudinary
        const url = await uploadToCloudinary(file.path);
        
        // B. Delete the temporary local file (Cleanup)
        fs.unlinkSync(file.path);
        
        return url;
      });

      // Wait for all uploads to finish
      const results = await Promise.all(uploadPromises);
      uploadedImageUrls.push(...results);
    }

    // 4. Save to NeonDB
    const newCenter = await prisma.serviceCenter.create({
      data: {
        centerName,
        phone,
        email,
        city,
        state,
        zipCode,
        country: country || 'India',
        latitude,
        longitude,
        categories,
        imagePaths: uploadedImageUrls,
      },
    });

    console.log('Successfully onboarded:', newCenter.centerName);
    
    res.status(201).json({
      message: 'Service center onboarded successfully',
      data: newCenter,
    });

  } catch (error) {
    // If error, try to cleanup files that might remain
    const files = req.files as Express.Multer.File[];
    if (files) {
        files.forEach(f => {
            if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
        });
    }

    console.error('Error saving service center:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});