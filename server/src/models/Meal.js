import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  name: String,
  estimatedQuantity: String,   // e.g. "150g"
  confidence: { type: String, enum: ['low', 'medium', 'high'] },
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  fiber: Number,
  sugar: Number
}, { _id: false });

const mealSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: String,
  imagePublicId: String,        // Cloudinary public_id for deletion

  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: 'snack'
  },

  // AI analysis results
  foodItems: [foodItemSchema],
  totalNutrition: {
    calories: { type: Number, default: 0 },
    protein:  { type: Number, default: 0 },
    carbs:    { type: Number, default: 0 },
    fats:     { type: Number, default: 0 },
    fiber:    { type: Number, default: 0 },
    sugar:    { type: Number, default: 0 }
  },
  healthInsights: [String],
  healthScore: { type: Number, min: 0, max: 10 },
  coachAdvice: String,

  loggedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for efficient daily queries
mealSchema.index({ user: 1, loggedAt: -1 });
mealSchema.index({ user: 1, loggedAt: 1 });

export default mongoose.model('Meal', mealSchema);
