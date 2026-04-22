import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/userController.js';

const router = Router();
router.get('/me',    protect, getProfile);
router.patch('/me',  protect, updateProfile);
export default router;
