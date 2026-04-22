import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getMeals, getMealById, deleteMeal, getDailySummary, getWeeklyReport, getRangeSummary } from '../controllers/mealController.js';

const router = Router();
router.get('/',         protect, getMeals);           // ?date=YYYY-MM-DD
router.get('/summary',  protect, getDailySummary);    // ?date=YYYY-MM-DD
router.get('/summary/range', protect, getRangeSummary); // ?days=7
router.get('/weekly',   protect, getWeeklyReport);
router.get('/:id',      protect, getMealById);
router.delete('/:id',   protect, deleteMeal);
export default router;
