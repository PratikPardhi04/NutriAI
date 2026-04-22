import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChefHat, Info } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import NutritionModal from '../components/NutritionModal';

const MacroDot = ({ color, label, current, target, unit = 'g' }) => {
  const pct = Math.min(100, Math.round((current / target) * 100)) || 0;
  return (
    <div className="card" style={{ padding: '20px 16px', borderRadius: 20 }}>
      <div className="flex justify-between items-start mb-4">
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, marginTop: 4 }}></div>
        <div className="space-font" style={{ fontSize: 20 }}>{pct}%</div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
      <div className="space-font" style={{ fontSize: 16, color: 'var(--text)' }}>
        {current}{unit} <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Inter' }}>/ {target}{unit}</span>
      </div>
    </div>
  );
};

export default function Reports() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [db, setDb] = useState({ loading: true, summary: null, meals: [] });
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    async function load() {
      setDb(prev => ({ ...prev, loading: true }));
      try {
        if (period === 'daily') {
          const localDate = new Date();
          const today = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2,'0')}-${String(localDate.getDate()).padStart(2,'0')}`;
          const [sumRes, mealsRes] = await Promise.all([
            api.get(`/meals/summary?date=${today}`),
            api.get(`/meals?date=${today}`)
          ]);
          setDb({ loading: false, summary: sumRes.data.data, meals: mealsRes.data.data });
        } else {
          const days = period === 'weekly' ? 7 : 30;
          const sumRes = await api.get(`/meals/summary/range?days=${days}`);
          setDb({ loading: false, summary: sumRes.data.data, meals: null }); // null meals array indicates range view
        }
      } catch (err) {
        setDb(prev => ({ ...prev, loading: false }));
      }
    }
    load();
  }, [period]);

  if (db.loading && !db.summary) return <div className="page-enter" style={{ padding: '20px 24px' }}>Loading analytics...</div>;

  const totals = db.summary?.totals || { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0 };
  const target = user?.targets || { calories: 2000, protein: 120, carbs: 250, fats: 65, fiber: 25 };

  return (
    <>
      <style>{`
        .reports-page { padding: 20px 24px; padding-bottom: 100px; max-width: 480px; margin: 0 auto; }
        @media (min-width: 769px) {
          .reports-page { max-width: none; padding: 0; padding-bottom: 40px; }
          .reports-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .reports-full { grid-column: 1 / -1; }
          .hide-desktop { display: none !important; }
        }
      `}</style>
      <div className="reports-page page-enter">
      <div className="flex items-center gap-4 mb-6 hide-desktop">
        <ArrowLeft size={24} onClick={() => navigate('/home')} style={{ cursor: 'pointer' }} />
        <h2 className="space-font" style={{ fontSize: 18, margin: 0 }}>Analytics</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, padding: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
        {['daily', 'weekly', 'monthly'].map(p => (
          <div key={p} onClick={() => setPeriod(p)} style={{ flex: 1, textAlign: 'center', padding: '10px 0', textTransform: 'capitalize', fontSize: 14, fontWeight: 500, borderRadius: 12, cursor: 'pointer', background: period === p ? 'var(--raised)' : 'transparent', color: period === p ? 'var(--lime)' : 'var(--muted)', border: `1px solid ${period === p ? 'var(--border)' : 'transparent'}`, transition: 'all 0.2s' }}>
            {p}
          </div>
        ))}
      </div>


      {/* SECTION 1: Quick Stats — Cal · Fiber · Sugar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        <div className="card" style={{ padding: '16px 10px', borderRadius: 16, textAlign: 'center', borderTop: '3px solid var(--lime)' }}>
          <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Calories</div>
          <div className="space-font" style={{ fontSize: 24, color: 'var(--lime)', lineHeight: 1 }}>{Math.round(totals.calories)}</div>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>kcal</div>
        </div>
        <div className="card" style={{ padding: '16px 10px', borderRadius: 16, textAlign: 'center', borderTop: '3px solid var(--amber)' }}>
          <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Fiber</div>
          <div className="space-font" style={{ fontSize: 24, color: 'var(--amber)', lineHeight: 1 }}>{Math.round(totals.fiber)}</div>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>grams</div>
        </div>
        <div className="card" style={{ padding: '16px 10px', borderRadius: 16, textAlign: 'center', borderTop: '3px solid var(--pink)' }}>
          <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Sugar</div>
          <div className="space-font" style={{ fontSize: 24, color: 'var(--pink)', lineHeight: 1 }}>{Math.round(totals.sugar || 0)}</div>
          <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>grams</div>
        </div>
      </div>

      {/* SECTION 2: Calorie Balance */}
      <div className="card mb-6" style={{ borderRadius: 24, padding: 24, background: 'linear-gradient(135deg, var(--surface), var(--raised))' }}>
        <div style={{ marginBottom: 20 }}>
          <span className="section-label">ENERGY BALANCE</span>
          <div className="flex items-baseline gap-2">
            <h1 className="space-font" style={{ fontSize: 32, margin: 0, color: 'var(--lime)' }}>{totals.calories}</h1>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>kcal consumed</span>
          </div>
        </div>

        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: '100%', width: `${Math.min(100, (totals.calories / target.calories) * 100)}%`, background: 'var(--lime)', transition: '0.8s ease-out' }} />
        </div>
        
        <div className="flex justify-between" style={{ fontSize: 12, color: 'var(--muted)' }}>
          <span>Goal: {target.calories} kcal</span>
          <span style={{ color: totals.calories > target.calories ? 'var(--pink)' : 'var(--lime)', fontWeight: 600 }}>
            {totals.calories > target.calories ? `Over by ${totals.calories - target.calories}` : `${target.calories - totals.calories} remaining`}
          </span>
        </div>
      </div>

      {/* SECTION 3: Macro Grid */}
      <div className="grid col-2 gap-4 mb-6">
        <MacroDot color="var(--lime)" label="Protein" current={totals.protein} target={target.protein} />
        <MacroDot color="var(--cyan)" label="Carbs" current={totals.carbs} target={target.carbs} />
        <MacroDot color="var(--pink)" label="Fats" current={totals.fats} target={target.fats} />
        <MacroDot color="var(--amber)" label="Fiber" current={totals.fiber} target={target.fiber} />
      </div>

      {/* SECTION 4: AI Health Score & Suggestions */}
      <div className="card mb-6" style={{ padding: 20, borderLeft: '4px solid var(--lime)' }}>
        <div className="flex items-center gap-2 mb-4">
          <ChefHat size={18} color="var(--lime)" />
          <span className="space-font" style={{ fontSize: 16 }}>AI COACH INSIGHTS</span>
        </div>
        
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', marginBottom: 20 }}>
          {db.summary?.suggestions?.length > 0 ? db.summary.suggestions[0] : "No specific insights yet. Keep logging your meals to get personalized advice."}
        </div>

        {db.summary?.deficiencies?.length > 0 && (
          <div style={{ background: 'var(--raised)', padding: '12px 16px', borderRadius: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info size={12} /> Focus areas
            </div>
            <div className="flex gap-2 flex-wrap">
              {db.summary.deficiencies.map((d, i) => (
                <span key={i} style={{ fontSize: 11, color: 'var(--cyan)', background: 'rgba(106,240,255,0.1)', padding: '4px 10px', borderRadius: 99 }}>{d}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: Meal Log — Clickable */}
      {period === 'daily' && (
        <>
          <div className="flex justify-between items-center mb-4 mt-8">
            <h3 className="space-font" style={{ fontSize: 16, margin: 0 }}>Meal Breakdown</h3>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Tap for details</span>
          </div>
          <div className="flex col gap-3">
            {(!db.meals || db.meals.length === 0) ? (
              <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No meals logged for today.</div>
            ) : (
              db.meals.map((m) => (
                <div
                  key={m._id}
                  className="card"
                  style={{ padding: 16, cursor: 'pointer', transition: 'transform 150ms ease, border-color 150ms ease' }}
                  onClick={() => setSelectedMeal(m)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = 'rgba(163,255,106,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = ''; }}
                >
                  <div className="flex justify-between mb-3">
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(m.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span style={{ color: 'var(--lime)', fontSize: 12, fontWeight: 600 }}>Score: {m.healthScore}/10</span>
                  </div>
                  <div className="space-font" style={{ fontSize: 15, marginBottom: 12 }}>{m.foodItems.map(f=>f.name).join(', ')}</div>
                  
                  {/* Cal · Fat · Sugar row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: 8, alignItems: 'center' }}>
                    <div style={{ background: 'rgba(163,255,106,0.06)', borderRadius: 8, padding: '4px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>Cal</div>
                      <div className="space-font" style={{ fontSize: 13, color: 'var(--lime)' }}>{Math.round(m.totalNutrition.calories)}</div>
                    </div>
                    <div style={{ background: 'rgba(255,106,176,0.06)', borderRadius: 8, padding: '4px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>Fat</div>
                      <div className="space-font" style={{ fontSize: 13, color: 'var(--pink)' }}>{Math.round(m.totalNutrition.fats)}g</div>
                    </div>
                    <div style={{ background: 'rgba(255,179,71,0.06)', borderRadius: 8, padding: '4px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>Sugar</div>
                      <div className="space-font" style={{ fontSize: 13, color: 'var(--amber)' }}>{Math.round(m.totalNutrition.sugar || 0)}g</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--lime)', textAlign: 'right' }}>→</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Nutrition detail modal */}
      {selectedMeal && (
        <NutritionModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
      )}
    </div>
    </>
  );
}
