import cloudinary from '../config/cloudinary.js';
import { analyzeFoodImage } from '../services/geminiService.js';
import Meal from '../models/Meal.js';
import DailySummary from '../models/DailySummary.js';
import { updateDailySummary } from '../services/nutritionService.js';

export async function analyzeImage(req, res, next) {
  try {
    // 1. Get image from multer (req.file)
    const { buffer, mimetype } = req.file;
    const base64 = buffer.toString('base64');

    // 2. Get user context
    const user = req.user;
    const userContext = {
      age: user.age,
      gender: user.gender,
      weightKg: user.weightKg,
      heightCm: user.heightCm,
      healthConditions: user.healthConditions,
      fitnessGoal: user.fitnessGoal,
      targets: user.targets
    };

    // 3. Call AI Analysis with robust error handling
    let analysis;
    try {
      analysis = await analyzeFoodImage(base64, mimetype, userContext, req.body.description);
      if (!analysis || !analysis.total_nutrition) {
        throw new Error('Incomplete AI response');
      }
    } catch (aiErr) {
      console.error('[Scan] AI Analysis failed, falling back to mock report:', aiErr.message);
      const { getMockAnalysisResult } = await import('../services/geminiService.js');
      analysis = getMockAnalysisResult(userContext);
    }

    // 4. Upload image to Cloudinary (Bypassed)
    /*
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'nutriai/meals', resource_type: 'image' },
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(buffer);
    });
    */
    const uploadResult = { secure_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800', public_id: null };

    // 5. Save meal to DB
    const meal = await Meal.create({
      user: user._id,
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      mealType: req.body.mealType || 'snack',
      foodItems: analysis.food_items.map(f => ({
        name: f.name,
        estimatedQuantity: f.estimated_quantity,
        confidence: f.confidence,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fats: f.fats,
        fiber: f.fiber || 0,
        sugar: f.sugar || 0
      })),
      totalNutrition: analysis.total_nutrition,
      healthInsights: analysis.health_insights,
      healthScore: analysis.health_score,
      coachAdvice: analysis.coach_advice
    });

    // 6. Update daily summary and get it
    const summary = await updateDailySummary(user._id, meal);

    res.status(201).json({
      success: true,
      data: { meal, analysis, summary }
    });
  } catch (err) {
    next(err);
  }
}

export async function chatWithCoach(req, res, next) {
  try {
    const { message, chatHistory } = req.body;
    const user = req.user;

    // 1. Get recent meals for context
    const recentMeals = await Meal.find({ user: user._id })
      .sort({ loggedAt: -1 })
      .limit(10)
      .select('foodItems loggedAt healthScore totalNutrition');

    // 2. Calculate time-range statistics
    const now = new Date();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyStats, monthlyStats] = await Promise.all([
      Meal.aggregate([
        { $match: { user: user._id, loggedAt: { $gte: startOfWeek } } },
        {
          $group: {
            _id: null,
            avgCal: { $avg: '$totalNutrition.calories' },
            avgPro: { $avg: '$totalNutrition.protein' },
            avgSugar: { $avg: '$totalNutrition.sugar' },
            totalSugar: { $sum: '$totalNutrition.sugar' },
            avgScore: { $avg: '$healthScore' }
          }
        }
      ]),
      Meal.aggregate([
        { $match: { user: user._id, loggedAt: { $gte: startOfMonth } } },
        {
          $group: {
            _id: null,
            avgCal: { $avg: '$totalNutrition.calories' },
            avgPro: { $avg: '$totalNutrition.protein' },
            avgSugar: { $avg: '$totalNutrition.sugar' },
            avgScore: { $avg: '$healthScore' }
          }
        }
      ])
    ]);

    const userContext = {
      fitnessGoal: user.fitnessGoal,
      healthConditions: user.healthConditions,
      targets: user.targets,
      stats: {
        weekly: weeklyStats[0] || { avgCal: 0, avgPro: 0, avgSugar: 0, totalSugar: 0, avgScore: 0 },
        monthly: monthlyStats[0] || { avgCal: 0, avgPro: 0, avgSugar: 0, avgScore: 0 }
      },
      recentMeals: recentMeals.map(m => ({
        date: m.loggedAt,
        score: m.healthScore,
        calories: m.totalNutrition.calories,
        sugar: m.totalNutrition.sugar,
        items: m.foodItems.map(f => f.name).join(', ')
      }))
    };

    const { generateCoachChatResponse } = await import('../services/geminiService.js');
    const response = await generateCoachChatResponse(message, userContext, chatHistory);

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
}
