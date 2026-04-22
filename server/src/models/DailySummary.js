import mongoose from 'mongoose';

const dailySummarySchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:  { type: String, required: true },  // 'YYYY-MM-DD'

  totals: {
    calories: { type: Number, default: 0 },
    protein:  { type: Number, default: 0 },
    carbs:    { type: Number, default: 0 },
    fats:     { type: Number, default: 0 },
    fiber:    { type: Number, default: 0 },
    sugar:    { type: Number, default: 0 }
  },

  mealCount:   { type: Number, default: 0 },
  avgHealthScore: Number,
  deficiencies: [String],
  suggestions:  [String]
}, { timestamps: true });

dailySummarySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('DailySummary', dailySummarySchema);
