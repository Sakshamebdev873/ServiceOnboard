import { uploadImagesToCloudinary, cleanupLocalFiles } from '../services/imageService.js';
import { createServiceCenter } from '../services/serviceCenterService.js';
export const onboardServiceCenter = async (req, res) => {
    try {
        const { centerName, phone, email, city, state, zipCode, country, latitude, longitude } = req.body;
        // 1. Normalize Categories (Handle FormData array behavior)
        let categories = [];
        if (req.body.categories) {
            categories = Array.isArray(req.body.categories)
                ? req.body.categories
                : [req.body.categories];
        }
        // 2. Upload Images
        const files = req.files;
        let uploadedImageUrls = [];
        try {
            uploadedImageUrls = await uploadImagesToCloudinary(files);
        }
        catch (uploadError) {
            // If image upload fails, stop everything
            return;
        }
        // 3. Save to Database
        const newCenter = await createServiceCenter({
            centerName, phone, email, city, state, zipCode, country, latitude, longitude,
            categories,
            imagePaths: uploadedImageUrls,
        });
        console.log('Successfully onboarded:', newCenter.centerName);
        res.status(201).json({
            message: 'Service center onboarded successfully',
            data: newCenter,
        });
    }
    catch (error) {
        // Cleanup files if DB save fails but images exist locally
        const files = req.files;
        cleanupLocalFiles(files);
        console.error('Error saving service center:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
