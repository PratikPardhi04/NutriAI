import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/* ---- Animated SVG donut chart ---- */
const DonutChart = ({ segments }) => {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 60); }, []);

  const total = segments.reduce((s, g) => s + g.value, 0) || 1;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="16" />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dashLen = pct * circumference;
        const dashOff = cumulative * circumference;
        cumulative += pct;
        return (
          <circle
            key={i}
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${animated ? dashLen : 0} ${circumference}`}
            strokeDashoffset={-dashOff}
            style={{ transition: 'stroke-dasharray 800ms ease-out' }}
          />
        );
      })}
    </svg>
  );
};

/* ---- Animated horizontal bar ---- */
const NutrientBar = ({ label, value, unit, color, maxValue }) => {
  const [w, setW] = useState(0);
  const pct = Math.min(100, (value / (maxValue || 1)) * 100);
  useEffect(() => { setTimeout(() => setW(pct), 80); }, [pct]);

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="flex justify-between" style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
        <span className="space-font" style={{ fontSize: 13, color }}>{Math.round(value)}{unit}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 3, transition: 'width 700ms ease-out' }} />
      </div>
    </div>
  );
};

/* ---- Per food item card ---- */
const FoodItemCard = ({ item, index }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100 + index * 80); }, [index]);

  return (
    <div style={{
      background: 'var(--raised)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: 16,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 400ms ease-out'
    }}>
      <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{item.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.estimatedQuantity || item.estimated_quantity}</div>
        </div>
        <div style={{
          background: item.confidence === 'high' ? 'var(--lime-dim)' : 'rgba(255,179,71,0.12)',
          color: item.confidence === 'high' ? 'var(--lime)' : 'var(--amber)',
          fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase'
        }}>
          {item.confidence}
        </div>
      </div>

      {/* 3-stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div style={{ background: 'rgba(163,255,106,0.06)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>Cal</div>
          <div className="space-font" style={{ fontSize: 15, color: 'var(--lime)' }}>{Math.round(item.calories)}</div>
        </div>
        <div style={{ background: 'rgba(255,106,176,0.06)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>Fat</div>
          <div className="space-font" style={{ fontSize: 15, color: 'var(--pink)' }}>{Math.round(item.fats)}g</div>
        </div>
        <div style={{ background: 'rgba(255,179,71,0.06)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>Sugar</div>
          <div className="space-font" style={{ fontSize: 15, color: 'var(--amber)' }}>{Math.round(item.sugar || 0)}g</div>
        </div>
      </div>
    </div>
  );
};

/* ================ MAIN MODAL ================ */
export default function NutritionModal({ meal, onClose }) {
  const [fadeIn, setFadeIn] = useState(false);
  
  useEffect(() => {
    // Lock scroll on mount
    document.body.style.overflow = 'hidden';
    setTimeout(() => setFadeIn(true), 10);
    
    // Unlock scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!meal) return null;

  const n = meal.totalNutrition || {};
  const items = meal.foodItems || [];

  // Donut segments
  const segments = [
    { label: 'Protein', value: n.protein || 0, color: 'var(--lime)' },
    { label: 'Carbs', value: n.carbs || 0, color: 'var(--cyan)' },
    { label: 'Fats', value: n.fats || 0, color: 'var(--pink)' },
    { label: 'Sugar', value: n.sugar || 0, color: 'var(--amber)' },
  ];
  const totalMacroG = (n.protein || 0) + (n.carbs || 0) + (n.fats || 0);

  // For bar scaling — find the largest macro value
  const maxBar = Math.max(n.calories || 1, 1);

  const handleClose = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const mealEmoji = meal.mealType === 'breakfast' ? '🍳' : meal.mealType === 'lunch' ? '🥗' : meal.mealType === 'dinner' ? '🥩' : '☕';

  return (
    <>
      <style>{`
        @keyframes modalSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .modal-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(8px);
          display: flex; align-items: flex-end; justify-content: center;
          opacity: 0; transition: opacity 250ms ease;
        }
        .modal-overlay.visible { opacity: 1; }
        .modal-sheet {
          width: 100%; max-width: 480px;
          height: 82vh;
          background: var(--bg);
          border-radius: 24px 24px 0 0;
          border: 1px solid var(--border);
          border-bottom: none;
          overflow-y: auto;
          animation: modalSlideUp 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          padding: 24px 24px 120px; /* Added extra space at bottom for nav */
          position: relative;
        }
        .modal-sheet::-webkit-scrollbar { width: 4px; }
        .modal-sheet::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .modal-close-btn { 
          position: sticky; top: 0; right: 0; float: right; 
          width: 32px; height: 32px; border-radius: 50%; 
          background: rgba(255,255,255,0.06); 
          display: flex; align-items: center; justify-content: center; 
          cursor: pointer; z-index: 10;
          transition: background 0.2s;
        }
        .modal-close-btn:hover { background: rgba(255,255,255,0.12); }
      `}</style>

      <div className={`modal-overlay ${fadeIn ? 'visible' : ''}`} onClick={handleClose}>
        <div className="modal-sheet" onClick={e => e.stopPropagation()}>
          {/* Close button sticky to top right */}
          <div className="modal-close-btn" onClick={onClose}>
            <X size={18} color="var(--text)" />
          </div>

          {/* Handle bar at top */}
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 20px' }} />

          {/* Header */}
          <div className="flex justify-between items-start" style={{ marginBottom: 24, paddingRight: 32 }}>
            <div className="flex items-center gap-3">
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'var(--lime-dim)', fontSize: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{mealEmoji}</div>
              <div>
                <div className="space-font" style={{ fontSize: 18, lineHeight: 1.2 }}>
                  {items.length > 0 ? items.map(f => f.name).join(', ') : 'Meal'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  {meal.mealType?.charAt(0).toUpperCase() + meal.mealType?.slice(1)} • {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: Donut + Quick Stats */}
          <div className="card" style={{ padding: 24, borderRadius: 20, marginBottom: 20, background: 'linear-gradient(135deg, var(--surface), var(--raised))' }}>
            <div className="flex items-center" style={{ gap: 24 }}>
              {/* Donut */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <DonutChart segments={segments} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span className="space-font" style={{ fontSize: 22, color: 'var(--lime)', lineHeight: 1 }}>
                    {Math.round(n.calories || 0)}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>kcal</span>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{ flex: 1 }}>
                {segments.map((seg, i) => (
                  <div key={i} className="flex justify-between items-center" style={{ marginBottom: i < segments.length - 1 ? 10 : 0 }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color }} />
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{seg.label}</span>
                    </div>
                    <span className="space-font" style={{ fontSize: 13, color: 'var(--text)' }}>
                      {Math.round(seg.value)}g
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: Nutrient Bars */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Nutrient Breakdown</div>
            <NutrientBar label="Calories" value={n.calories || 0} unit=" kcal" color="var(--lime)" maxValue={2500} />
            <NutrientBar label="Protein" value={n.protein || 0} unit="g" color="var(--lime)" maxValue={totalMacroG || 100} />
            <NutrientBar label="Carbs" value={n.carbs || 0} unit="g" color="var(--cyan)" maxValue={totalMacroG || 100} />
            <NutrientBar label="Fats" value={n.fats || 0} unit="g" color="var(--pink)" maxValue={totalMacroG || 100} />
            <NutrientBar label="Sugar" value={n.sugar || 0} unit="g" color="var(--amber)" maxValue={totalMacroG || 100} />
            <NutrientBar label="Fiber" value={n.fiber || 0} unit="g" color="var(--cyan)" maxValue={totalMacroG || 50} />
          </div>

          {/* SECTION 3: Per-item cards */}
          {items.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Per Food Item</div>
              <div className="flex col gap-3">
                {items.map((item, i) => (
                  <FoodItemCard key={i} item={item} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: Health Score + Coach Advice */}
          {(meal.healthScore != null || meal.coachAdvice) && (
            <div style={{ marginTop: 24 }}>
              <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--lime)', borderRadius: '0 16px 16px 0' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--lime)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>AI Health Score</span>
                  <span className="space-font" style={{ fontSize: 20, color: 'var(--lime)' }}>{meal.healthScore}/10</span>
                </div>
                {meal.coachAdvice && (
                  <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{meal.coachAdvice}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
