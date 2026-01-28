import { Router } from 'express';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';
import { getAllServiceCenters, onboardServiceCenter } from '../controllers/serviceCenterController.js';

const router = Router();

// POST /api/service-center
router.post(
  '/service-center', 
  uploadMiddleware.array('images'), 
  onboardServiceCenter
);
router.get('/',getAllServiceCenters)

export default router;