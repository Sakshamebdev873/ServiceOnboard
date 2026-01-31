import type { Request, Response } from "express";
import {
  uploadImagesToCloudinary,
  cleanupLocalFiles,
} from "../services/imageService.js";
import { createServiceCenter } from "../services/serviceCenterService.js";
import { prisma } from "../lib/prisma.js";

export const onboardServiceCenter = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const files = (req.files as Express.Multer.File[]) || [];

  try {
    const {
      centerName,
      phone,
      email,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
    } = req.body;

    // 1. Normalize Categories (Handle FormData array behavior)
    let categories: string[] = [];
    if (req.body.categories) {
      categories = Array.isArray(req.body.categories)
        ? req.body.categories
        : [req.body.categories];
    }

    // 2. Upload Images
    let uploadedImageUrls: string[] = [];
    if (files.length > 0) {
      try {
        uploadedImageUrls = await uploadImagesToCloudinary(files);
        // CRITICAL: Clean up local files immediately after successful upload to Cloudinary
        cleanupLocalFiles(files);
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        res
          .status(500)
          .json({ error: "Failed to upload images to cloud storage" });
        return; // Stop execution
      }
    }

    // 3. Save to Database
    // Convert lat/lng to numbers if they are strings from FormData
    const newCenter = await createServiceCenter({
      centerName,
      phone,
      email,
      city,
      state,
      zipCode,
      country,
      latitude: String(latitude),
      longitude: String(longitude),
      categories,
      imagePaths: uploadedImageUrls,
    });

    res.status(201).json({
      message: "Service center onboarded successfully",
      data: newCenter,
    });
  } catch (error) {
    // Cleanup local files if database save fails
    cleanupLocalFiles(files);

    console.error("Error saving service center:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const getAllServiceCenters = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const centers = await prisma.serviceCenter.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(centers);
  } catch (error) {
    console.error("Error fetching centers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
