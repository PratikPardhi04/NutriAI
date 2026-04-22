import DailySummary from '../models/DailySummary.js';
import Meal from '../models/Meal.js';
import { generateDailySummary } from './geminiService.js';
import User from '../models/User.js';

export async function updateDailySummary(userId, meal) {
  const mealDate = meal ? new Date(meal.loggedAt) : new Date();
  
  // Calculate YYYY-MM-DD in the user's likely local time (adding 5.5h for IST or using a generic offset)
  // For a more robust fix in this specific setup, we'll shift the date by the offset before splitting
  // Assuming the user is in IST (UTC+5.5) as seen in metadata
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const localMealDate = new Date(mealDate.getTime() + offsetMs);
  const dateStr = localMealDate.toISOString().split('T')[0]; 

  // Aggregation window for that specific day (UTC window)
  const startOfDay = new Date(mealDate); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay   = new Date(mealDate); endOfDay.setHours(23, 59, 59, 999);

  const meals = await Meal.find({
    user: userId,
    loggedAt: { $gte: startOfDay, $lte: endOfDay }
  });

  const totals = meals.reduce((acc, m) => ({
    calories: acc.calories + (m.totalNutrition.calories || 0),
    protein:  acc.protein  + (m.totalNutrition.protein  || 0),
    carbs:    acc.carbs    + (m.totalNutrition.carbs    || 0),
    fats:     acc.fats     + (m.totalNutrition.fats     || 0),
    fiber:    acc.fiber    + (m.totalNutrition.fiber    || 0),
    sugar:    acc.sugar    + (m.totalNutrition.sugar    || 0)
  }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0 });

  const user = await User.findById(userId);
  const aiSummary = await generateDailySummary(meals, {
    healthConditions: user.healthConditions,
    fitnessGoal: user.fitnessGoal,
    targets: user.targets
  });

  return await DailySummary.findOneAndUpdate(
    { user: userId, date: dateStr },
    {
      totals: {
        calories: Math.round(totals.calories),
        protein:  Math.round(totals.protein),
        carbs:    Math.round(totals.carbs),
        fats:     Math.round(totals.fats),
        fiber:    Math.round(totals.fiber),
        sugar:    Math.round(totals.sugar)
      },
      mealCount:     meals.length,
      avgHealthScore: aiSummary.avgHealthScore,
      deficiencies:  aiSummary.deficiencies,
      suggestions:   aiSummary.suggestions
    },
    { upsert: true, new: true }
  );
}
