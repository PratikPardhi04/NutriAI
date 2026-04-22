import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { analyzeImage, chatWithCoach } from '../controllers/analysisController.js';

const router = Router();
router.post('/analyze', protect, upload.single('image'), analyzeImage);
router.post('/chat', protect, chatWithCoach);
export default router;
