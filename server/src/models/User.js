import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  refreshTokens: [String],

  // Profile
  age: Number,
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer not to say'] },
  heightCm: Number,
  weightKg: Number,
  activityLevel: String,

  // Health
  healthConditions: [String],   // e.g. ['diabetes', 'hypertension']
  dietaryPreferences: [String], // e.g. ['Vegan', 'Keto']
  fitnessGoal: {
    type: String,
    enum: ['fat_loss', 'muscle_gain', 'maintenance'],
    default: 'maintenance'
  },

  // Daily targets (auto-calculated or manually set)
  targets: {
    calories: { type: Number, default: 2000 },
    protein:  { type: Number, default: 120 },
    carbs:    { type: Number, default: 250 },
    fats:     { type: Number, default: 65 },
    fiber:    { type: Number, default: 25 },
    sugar:    { type: Number, default: 50 }
  }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

// Remove sensitive fields from JSON output
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.refreshTokens;
    return ret;
  }
});

export default mongoose.model('User', userSchema);
