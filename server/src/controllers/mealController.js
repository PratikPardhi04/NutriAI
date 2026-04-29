import Meal from '../models/Meal.js';
import DailySummary from '../models/DailySummary.js';
import cloudinary from '../config/cloudinary.js';

export async function getMeals(req, res, next) {
  try {
    const { date } = req.query;
    let query = { user: req.user._id };

    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      query.loggedAt = { $gte: start, $lte: end };
    }

    const meals = await Meal.find(query).sort({ loggedAt: -1 });
    res.json({ success: true, data: meals });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
}

export async function getDailySummary(req, res, next) {
  try {
    const offsetMs = 5.5 * 60 * 60 * 1000;
    const localDate = new Date(Date.now() + offsetMs).toISOString().split('T')[0];
    const date = req.query.date || localDate;
    
    const summary = await DailySummary.findOne({ user: req.user._id, date });
    res.json({ success: true, data: summary });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
}

export async function getRangeSummary(req, res, next) {
  try {
    const days = parseInt(req.query.days) || 7;
    const offsetMs = 5.5 * 60 * 60 * 1000;
    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date(Date.now() + offsetMs);
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    const summaries = await DailySummary.find({ user: req.user._id, date: { $in: dates } });
    
    if (summaries.length === 0) {
      return res.json({ success: true, data: null });
    }

    const n = summaries.length;
    const totals = summaries.reduce((acc, s) => {
      acc.calories += (s.totals.calories || 0);
      acc.protein += (s.totals.protein || 0);
      acc.carbs += (s.totals.carbs || 0);
      acc.fats += (s.totals.fats || 0);
      acc.fiber += (s.totals.fiber || 0);
      acc.sugar += (s.totals.sugar || 0);
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0 });

    // Average the totals over 'n' active days
    Object.keys(totals).forEach(k => totals[k] = Math.round(totals[k] / n));

    const avgHealthScore = Math.round(summaries.reduce((acc, s) => acc + (s.avgHealthScore || 0), 0) / n);
    
    // Merge deficiencies and suggestions naively
    const deficiencies = [...new Set(summaries.flatMap(s => s.deficiencies || []))].slice(0, 5);
    let suggestions = summaries.map(s => s.suggestions?.[0]).filter(Boolean);
    suggestions = [...new Set(suggestions)].slice(0, 3);
    if(suggestions.length === 0) suggestions = ["No specific insights yet, keep logging."];

    res.json({ success: true, data: { totals, avgHealthScore, deficiencies, suggestions } });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
}

export async function getWeeklyReport(req, res, next) {
  try {
    // Get last 7 days in user's likely local time
    const offsetMs = 5.5 * 60 * 60 * 1000;
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() + offsetMs);
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const summaries = await DailySummary.find({
      user: req.user._id,
      date: { $in: dates }
    });

    const weeklyData = dates.map(date => {
      const day = summaries.find(s => s.date === date);
      return day ? day.totals.calories : 0;
    });

    res.json({ success: true, data: weeklyData });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
}

export async function getMealById(req, res, next) {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json({ success: true, data: meal });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
}

export async function deleteMeal(req, res, next) {
  try {
    const meal = await Meal.findOne({ _id: req.params.id, user: req.user._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });

    // Delete from Cloudinary
    if (meal.imagePublicId) {
      await cloudinary.uploader.destroy(meal.imagePublicId);
    }
    await meal.deleteOne();
    res.json({ success: true, message: 'Meal deleted' });
  } catch (err) { res.status(500).json({ message: "Server error", error: err.message }); }
}
