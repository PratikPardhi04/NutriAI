import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import NutritionModal from '../components/NutritionModal';

const useCountUp = (target, duration = 800) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      setCount(progress * target);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
};

const AnimatedBar = ({ color, percentage }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setTimeout(() => setWidth(percentage), 50);
  }, [percentage]);
  return (
    <div className="progress-track" style={{ height: 3 }}>
      <div className="progress-fill" style={{ width: `${width}%`, background: color }} />
    </div>
  );
};

const ChartBar = ({ calValue, targetCal }) => {
  const [h, setH] = useState(0);
  const targetH = Math.min(100, (calValue / targetCal) * 100) || 0;
  const isOverage = calValue > targetCal;
  useEffect(() => { setTimeout(() => setH(targetH), 100); }, [targetH]);
  return <div style={{ flex: 1, background: isOverage ? 'var(--pink)' : targetH > 0 ? 'var(--lime)' : 'rgba(255,255,255,0.05)', height: `${h}%`, borderRadius: '5px 5px 0 0', transition: 'height 600ms ease-out' }} />;
};

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const userName = user?.name || 'Explorer';
  const init = userName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();

  const [db, setDb] = useState({ loading: true, summary: null, meals: [], weekly: [] });
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const localDate = new Date();
        const today = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2,'0')}-${String(localDate.getDate()).padStart(2,'0')}`;
        
        const [sumRes, mealsRes, weekRes] = await Promise.all([
          api.get(`/meals/summary?date=${today}`),
          api.get(`/meals?date=${today}`),
          api.get('/meals/weekly')
        ]);
        setDb({
          loading: false,
          summary: sumRes.data.data,
          meals: mealsRes.data.data,
          weekly: weekRes.data.data
        });
      } catch (err) {
        setDb(prev => ({ ...prev, loading: false }));
      }
    }
    load();
  }, []);

  const hasNoMeals = db.meals.length === 0;

  const sumTotals = db.summary?.totals || { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0 };
  const target = user?.targets || { calories: 2000, protein: 120, carbs: 250, fats: 65, fiber: 25 };
  
  const avgScore = db.meals.length ? (db.meals.reduce((a,b) => a + (b.healthScore||0), 0) / db.meals.length) : 0;

  const score = useCountUp(avgScore).toFixed(1);
  const calories = Math.floor(useCountUp(sumTotals.calories));
  const protein = Math.floor(useCountUp(sumTotals.protein));
  const carbs = Math.floor(useCountUp(sumTotals.carbs));
  const fats = Math.floor(useCountUp(sumTotals.fats));
  const sugar = Math.floor(useCountUp(sumTotals.sugar || 0));
  const fiberVal = Math.floor(useCountUp(sumTotals.fiber || 0));

  const [ringDash, setRingDash] = useState(345.5);
  useEffect(() => {
    if (!db.loading) {
      setTimeout(() => setRingDash(345.5 * (1 - Math.min(1, sumTotals.calories/target.calories))), 100);
    }
  }, [db.loading, sumTotals.calories, target.calories]);

  const pPct = Math.min(100, (sumTotals.protein / target.protein) * 100) || 0;
  const cPct = Math.min(100, (sumTotals.carbs / target.carbs) * 100) || 0;
  const fPct = Math.min(100, (sumTotals.fats / target.fats) * 100) || 0;
  const fiPct = Math.min(100, (sumTotals.fiber / target.fiber) * 100) || 0;

  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if(db.loading) return <div className="page-enter" style={{ padding: '20px 24px' }}>Loading...</div>;

  return (
    <>
      <style>{`
        @keyframes pulseBtn { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }

        .home-layout { padding: 20px 24px; }
        .home-top-row { }
        .home-main-col { }
        .home-side-col { display: none; }

        @media (min-width: 769px) {
          .home-layout { padding: 0; }
          .home-top-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 32px;
          }
          .home-body {
            display: grid;
            grid-template-columns: 1fr 360px;
            gap: 28px;
          }
          .home-side-col {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .home-main-col {
            min-width: 0;
          }
          .hide-desktop { display: none !important; }
        }
      `}</style>

      <div className="home-layout page-enter">
        {/* SECTION A: Top bar — mobile only */}
        <div className="hide-desktop flex justify-between items-center mb-8">
          <div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 4 }}>Good morning,</div>
            <div className="space-font" style={{ fontSize: 24, color: 'var(--text)', lineHeight: 1 }}>{userName}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div 
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--lime)', color: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer' }} 
              className="space-font"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              {init}
            </div>
            {profileMenuOpen && (
              <div 
                style={{ 
                  position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 140, 
                  background: 'rgba(24, 24, 31, 0.95)', backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                  zIndex: 100, padding: 6, overflow: 'hidden'
                }}
              >
                <div onClick={() => navigate('/profile')} style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text)', cursor: 'pointer', borderRadius: 8 }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>Profile</div>
                <div onClick={() => { logout(); navigate('/'); }} style={{ padding: '10px 12px', fontSize: 13, color: 'var(--pink)', cursor: 'pointer', borderRadius: 8 }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,106,176,0.05)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>Logout</div>
              </div>
            )}
          </div>
        </div>

        {/* TOP ROW: Health Score + Scan CTA (side-by-side on desktop) */}
        <div className="home-top-row">
          {/* Health Score */}
          <div className="card flex justify-between items-center mb-4" style={{ borderRadius: 24, padding: 24, boxShadow: 'inset 0 0 60px rgba(163,255,106,0.03)' }}>
            <div style={{ width: '60%' }}>
              <span className="section-label">HEALTH SCORE</span>
              <div className="flex items-baseline mb-2">
                <span className="space-font" style={{ fontSize: 72, color: hasNoMeals ? 'var(--muted)' : 'var(--lime)', lineHeight: 0.9 }}>{score}</span>
                <span className="space-font" style={{ fontSize: 24, color: 'var(--muted)', marginLeft: 4 }}>/10</span>
              </div>
              <div className="flex gap-2 flex-wrap" style={{ marginTop: 8 }}>
                {hasNoMeals && <span style={{ background: 'var(--raised)', color: 'var(--muted)', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500 }}>No data</span>}
                {!hasNoMeals && pPct > 80 && <span style={{ background: 'var(--lime-dim)', color: 'var(--lime)', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500 }}>Protein ✓</span>}
                {!hasNoMeals && (sumTotals.fiber < target.fiber*0.4) && <span style={{ background: 'var(--pink-dim)', color: 'var(--pink)', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500 }}>Fiber low</span>}
              </div>
            </div>
            <div style={{ width: '40%', display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
              <svg width="110" height="110" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(163,255,106,0.12)" strokeWidth="12" />
                <circle cx="60" cy="60" r="55" fill="none" stroke={hasNoMeals ? 'transparent' : 'var(--lime)'} strokeWidth="12" strokeLinecap="round" strokeDasharray="345.5" strokeDashoffset={hasNoMeals ? 345.5 : ringDash} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="space-font" style={{ fontSize: 25, color: hasNoMeals ? 'var(--muted)' : 'white', lineHeight: 1 }}>{calories}</span>
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>kcal</span>
              </div>
            </div>
          </div>

          {/* Scan Food CTA */}
          <div className="card flex justify-between items-center mb-4" style={{ background: 'linear-gradient(135deg, #0F1A0F, #0A1218)', border: '1px solid rgba(163,255,106,0.18)' }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <span className="section-label">AI FOOD SCAN</span>
              <h2 className="space-font" style={{ fontSize: 20, marginBottom: 4 }}>What did you eat?</h2>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>Snap a photo — AI identifies food and estimates portions instantly.</p>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/scan')}>
              <div style={{ animation: 'pulseBtn 2s infinite ease-in-out', display: 'flex' }}><Camera size={24} color="#0A0A0F" /></div>
            </div>
          </div>
        </div>

        {/* BODY: Main + Sidebar (on desktop) */}
        <div className="home-body">
          {/* ======= MAIN COLUMN ======= */}
          <div className="home-main-col">
            {/* Running Total — Cal · Fat · Sugar */}
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontSize: 15, fontWeight: 500 }}>Today's intake</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Running total</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
              <div className="card" style={{ padding: '16px 12px', borderRadius: 16, textAlign: 'center', borderTop: '3px solid var(--lime)' }}>
                <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Calories</div>
                <div className="space-font" style={{ fontSize: 26, color: hasNoMeals ? 'var(--muted)' : 'var(--lime)', lineHeight: 1 }}>{calories}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>kcal</div>
              </div>
              <div className="card" style={{ padding: '16px 12px', borderRadius: 16, textAlign: 'center', borderTop: '3px solid var(--pink)' }}>
                <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Fat</div>
                <div className="space-font" style={{ fontSize: 26, color: hasNoMeals ? 'var(--muted)' : 'var(--pink)', lineHeight: 1 }}>{fats}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>grams</div>
              </div>
              <div className="card" style={{ padding: '16px 12px', borderRadius: 16, textAlign: 'center', borderTop: '3px solid var(--amber)' }}>
                <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Sugar</div>
                <div className="space-font" style={{ fontSize: 26, color: hasNoMeals ? 'var(--muted)' : 'var(--amber)', lineHeight: 1 }}>{sugar}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>grams</div>
              </div>
            </div>

            {/* Weekly Chart */}
            <div className="flex justify-between items-center mb-4" style={{ marginTop: 24 }}>
              <span style={{ fontSize: 15, fontWeight: 500 }}>This week</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                {(() => {
                  const end = new Date(); const start = new Date();
                  start.setDate(end.getDate() - 6);
                  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                })()}
              </span>
            </div>
            <div className="card mb-8" style={{ padding: '20px 20px 16px' }}>
              <div className="flex items-end justify-between" style={{ height: 80, gap: 6, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                {(db.weekly?.length ? db.weekly : [0,0,0,0,0,0,0]).map((calValue, i) => (
                  <ChartBar key={i} calValue={calValue} targetCal={target.calories} />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {(() => {
                  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                  const todayIdx = new Date().getDay();
                  return Array.from({length: 7}, (_, i) => {
                    const idx = (todayIdx - 6 + i + 7) % 7;
                    return <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: i === 6 ? 'var(--lime)' : 'var(--muted)', fontWeight: i === 6 ? 600 : 400 }}>{days[idx]}</span>
                  });
                })()}
              </div>
            </div>

            {/* Today's Macros (Relocated here) */}
            <div className="flex justify-between items-center mb-4">
              <span style={{ fontSize: 15, fontWeight: 500 }}>Key Macros</span>
              <span style={{ fontSize: 12, color: 'var(--lime)', cursor: 'pointer' }} onClick={() => navigate('/reports')}>Details →</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
              {[
                { label: 'Protein', value: protein, target: target.protein, color: 'var(--lime)', pct: pPct },
                { label: 'Carbs', value: carbs, target: target.carbs, color: 'var(--cyan)', pct: cPct },
                { label: 'Fiber', value: fiberVal, target: target.fiber, color: 'var(--amber)', pct: fiPct }
              ].map(m => (
                <div key={m.label} className="card" style={{ padding: 14, borderRadius: 14 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>{m.label}</div>
                  <div className="space-font" style={{ fontSize: 22, color: hasNoMeals ? 'var(--muted)' : m.color, marginBottom: 8, lineHeight: 1 }}>{m.value}<span style={{ fontSize: 14, color: 'var(--muted)', fontFamily: 'Inter' }}>g</span></div>
                  <AnimatedBar color={m.color} percentage={m.pct} />
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>of {m.target}g</div>
                </div>
              ))}
            </div>

            {/* Insights */}
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Today's insights</div>
            <div className="flex col gap-2 mb-8">
              {hasNoMeals ? (
                <div style={{ borderLeft: `3px solid var(--muted)`, background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: '0 12px 12px 0', fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--muted)', flexShrink: 0 }}></div>
                  Log meals to start generating advanced insights.
                </div>
              ) : (
                db.meals.flatMap(m => m.healthInsights || []).concat(
                   [(sumTotals.protein >= target.protein * 0.8) && "Great protein intake! You're hitting your daily goal.",
                    (sumTotals.fiber < target.fiber * 0.4) && "Fiber is low today. Try adding some beans or greens.",
                    (sumTotals.sugar > 25) && `Sugar intake is ${Math.round(sumTotals.sugar)}g — consider cutting sugary drinks or sauces.`,
                    (sumTotals.calories < target.calories) && `Calories on track — ${Math.round(target.calories - sumTotals.calories)} kcal remaining for the day.`]
                ).filter(Boolean).slice(0,4).map((text, i) => {
                  const colors = ['var(--lime)', 'var(--cyan)', 'var(--amber)', 'var(--pink)'];
                  const bgs = ['var(--lime-dim)', 'rgba(106,240,255,0.1)', 'rgba(255,179,71,0.12)', 'var(--pink-dim)'];
                  return (
                    <div key={i} style={{ borderLeft: `3px solid ${colors[i%4]}`, background: bgs[i%4], padding: '14px 16px', borderRadius: '0 12px 12px 0', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i%4], marginTop: 6, flexShrink: 0 }}></div>
                      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{text}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="home-side-col">
            {/* Today's Meals RESTORED */}
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Today's meals</span>
                <span style={{ fontSize: 11, color: 'var(--lime)', cursor: 'pointer' }} onClick={() => navigate('/scan')}>+ Add</span>
              </div>
              <div className="card" style={{ padding: 0 }}>
                {hasNoMeals ? (
                  <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>No meals yet</div>
                ) : (
                  db.meals.map((m, i) => (
                    <div key={m._id} onClick={() => setSelectedMeal(m)} className="flex items-center" style={{ padding: '12px 14px', borderBottom: i === db.meals.length - 1 ? 'none' : '1px solid var(--border)', cursor: 'pointer' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--lime-dim)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {m.mealType === 'breakfast' ? '🍳' : m.mealType === 'lunch' ? '🥗' : m.mealType === 'dinner' ? '🥩' : '☕'}
                      </div>
                      <div style={{ marginLeft: 10, flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.foodItems[0]?.name || 'Meal Logged'}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>{formatTime(m.loggedAt)}</div>
                      </div>
                      <div className="space-font" style={{ fontSize: 12, color: 'var(--lime)' }}>{Math.round(m.totalNutrition.calories)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Macros removed from side because they are now in main column */}
          </div>
        </div>

        {/* MOBILE ONLY: Today's Meals + Macros (shown at bottom) */}
        <div className="hide-desktop">
          <div className="flex justify-between items-center mb-4" style={{ marginTop: 24 }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>Today's meals</span>
            <span style={{ fontSize: 12, color: 'var(--lime)', cursor: 'pointer' }} onClick={() => navigate('/scan')}>+ Add</span>
          </div>
          <div className="card mb-8" style={{ padding: 0 }}>
             {hasNoMeals ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>No meals logged yet</div>
              ) : (
                db.meals.map((m, i) => (
                  <div key={m._id} onClick={() => setSelectedMeal(m)} className="flex items-center" style={{ padding: '14px 18px', borderBottom: i === db.meals.length - 1 ? 'none' : '1px solid var(--border)', cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--lime-dim)', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {m.mealType === 'breakfast' ? '🍳' : m.mealType === 'lunch' ? '🥗' : m.mealType === 'dinner' ? '🥩' : '☕'}
                    </div>
                    <div style={{ marginLeft: 12, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{m.foodItems[0]?.name || 'Meal'}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{formatTime(m.loggedAt)}</div>
                    </div>
                    <div className="space-font" style={{ fontSize: 14, color: 'var(--lime)' }}>{Math.round(m.totalNutrition.calories)} <span style={{fontSize:10, fontFamily:'Inter', color:'var(--muted)'}}>kcal</span></div>
                  </div>
                ))
              )}
          </div>

        </div>

        {/* Nutrition detail modal */}
        {selectedMeal && (
          <NutritionModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
        )}
      </div>
    </>
  );
}
