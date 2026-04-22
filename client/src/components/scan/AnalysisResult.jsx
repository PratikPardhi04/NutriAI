import { CheckCircle2, RotateCcw } from 'lucide-react';

export default function AnalysisResult({ data, onReset }) {
  const { meal, analysis } = data;
  const { total_nutrition, health_score, health_insights, coach_advice, food_items } = analysis;

  const scoreColor = health_score >= 7 ? 'text-brand-600' : health_score >= 5 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="mt-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-brand-600 font-medium text-sm">
        <CheckCircle2 size={16} />
        Meal logged successfully!
      </div>

      {/* Score + Calories */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Health Score</p>
          <p className={`text-3xl font-display font-bold ${scoreColor}`}>{health_score}</p>
          <p className="text-xs text-gray-400">/10</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Calories</p>
          <p className="text-3xl font-display font-bold text-gray-900">{total_nutrition.calories}</p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
      </div>

      {/* Macros */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Macronutrients</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {['protein', 'carbs', 'fats'].map(macro => (
            <div key={macro}>
              <p className="text-lg font-semibold text-gray-900">{total_nutrition[macro]}g</p>
              <p className="text-xs text-gray-400 capitalize">{macro}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Food items */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Detected Foods</p>
        <div className="space-y-2">
          {food_items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400">{item.estimated_quantity} · <span className="capitalize">{item.confidence}</span> confidence</p>
              </div>
              <p className="text-sm font-semibold text-brand-600">{item.calories} kcal</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Insights</p>
        <ul className="space-y-1.5">
          {health_insights.map((insight, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
              {insight}
            </li>
          ))}
        </ul>
      </div>

      {/* Coach advice */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">AI Coach</p>
        <p className="text-sm text-brand-800 leading-relaxed">{coach_advice}</p>
      </div>

      {/* Reset */}
      <button onClick={onReset}
        className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
        <RotateCcw size={15} />
        Scan Another Meal
      </button>
    </div>
  );
}
