import { useState, useRef } from 'react';
import { Camera, ArrowLeft, ImageUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

const MOCK_THALI_RESULT = {
  health_score: 8.4,
  total_nutrition: {
    calories: 1358,
    fats: 47,
    sugar: 17,
    protein: 68,
    carbs: 142
  },
  food_items: [
    { name: 'Paneer Curry', estimated_quantity: '1 serving (~200g)', calories: 280, fats: 18, sugar: 4, confidence: 'high' },
    { name: 'Vegetable Curry', estimated_quantity: '1 serving (~200g)', calories: 250, fats: 12, sugar: 5, confidence: 'high' },
    { name: 'Dal', estimated_quantity: '1 serving (~150g)', calories: 140, fats: 5, sugar: 3, confidence: 'high' },
    { name: 'Yogurt Raita', estimated_quantity: '1 serving (~100g)', calories: 120, fats: 4, sugar: 2, confidence: 'high' },
    { name: 'Basmati Rice', estimated_quantity: '1 cup (~180g)', calories: 288, fats: 1, sugar: 0, confidence: 'high' },
    { name: 'Naan Bread', estimated_quantity: '1-2 pieces (~100g)', calories: 280, fats: 7, sugar: 3, confidence: 'high' }
  ],
  coach_advice: "Solid meal! Watch the carb load from rice + naan together — pick one if you're cutting."
};

export default function Scan() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Analyzing...');
  const [complete, setComplete] = useState(false);
  const [mealType, setMealType] = useState('Lunch');

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1200&auto=format&fit=crop');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
    e.target.value = '';
  };

  const compressImageClient = (file) => new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => resolve(blob || file), 'image/jpeg', 0.7);
    };
    img.src = URL.createObjectURL(file);
  });

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('Please tap the viewfinder to upload an image first.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setLoadingMsg('Compressing image...');

    try {
      const compressed = await compressImageClient(imageFile);
      setLoadingMsg('Sending to AI...');
      await new Promise(r => setTimeout(r, 300)); // let UI update before blocking call
      setLoadingMsg('AI is analyzing your meal...');
      const formData = new FormData();
      formData.append('image', compressed, 'meal.jpg');
      formData.append('mealType', mealType.toLowerCase());
      if (description) formData.append('description', description);

      const res = await api.post('/analysis/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });

      setResult(res.data.data.analysis);

      // Goal Notification Logic
      const mealData = res.data.data.meal;
      const summaryData = res.data.data.summary;
      if (mealData && summaryData && user?.targets?.calories) {
        const targetCal = user.targets.calories;
        const newCal = summaryData.totals.calories;
        const oldCal = newCal - mealData.totalNutrition.calories;

        if (oldCal < targetCal && newCal >= targetCal) {
          setNotification({ title: 'Goal Reached! 🎉', msg: `You've hit your daily calorie goal of ${Math.round(targetCal)} kcal.`, type: 'success' });
        } else if (oldCal < (targetCal * 0.5) && newCal >= (targetCal * 0.5)) {
          setNotification({ title: 'Halfway There! 🚀', msg: `You've crossed 50% of your daily calorie goal.`, type: 'info' });
        }
      }

      setComplete(true);
    } catch (err) {
      console.warn('Analysis API failed, falling back to mock report:', err);
      // Fallback to mock Thali result if API fails
      setResult(MOCK_THALI_RESULT);
      setNotification({ 
        title: 'Demo Mode ⚡', 
        msg: 'The AI service is taking a break. Showing a sample report for this meal.', 
        type: 'info' 
      });
      setComplete(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAll = () => {
    setImageFile(null);
    setImagePreview('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop');
    setDescription('');
    setResult(null);
    setComplete(false);
    setNotification(null);
  };

  return (
    <>
      <style>{`
        @keyframes pulseBracket { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .bracket { position: absolute; width: 28px; height: 28px; border: 3px solid var(--lime); animation: pulseBracket 2s ease-in-out infinite; }
        .tl { top: 16px; left: 16px; border-right: none; border-bottom: none; border-radius: 8px 0 0 0; animation-delay: 0s; }
        .tr { top: 16px; right: 16px; border-left: none; border-bottom: none; border-radius: 0 8px 0 0; animation-delay: 0.5s; }
        .bl { bottom: 16px; left: 16px; border-right: none; border-top: none; border-radius: 0 0 0 8px; animation-delay: 1s; }
        .br { bottom: 16px; right: 16px; border-left: none; border-top: none; border-radius: 0 0 8px 0; animation-delay: 1.5s; }

        .scan-page { padding: 20px 24px; }
        .scan-grid { }

        .options-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .options-sheet {
          background: var(--bg);
          width: 100%;
          max-width: 500px;
          border-radius: 24px 24px 0 0;
          padding: 32px 24px;
          border-top: 1px solid var(--border);
          transform: translateY(0);
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .option-btn {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          background: var(--raised);
          border: 1px solid var(--border);
          color: var(--text);
          font-family: 'Space Grotesk';
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: 200ms;
        }

        .option-btn:active { transform: scale(0.98); background: var(--border); }
        .option-btn.primary { background: var(--lime-dim); border-color: var(--lime); color: var(--lime); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

        @media (min-width: 769px) {
          .scan-page { padding: 0; }
          .scan-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            align-items: start;
          }
          .scan-left { position: sticky; top: 96px; }
          .hide-desktop { display: none !important; }
        }
      `}</style>

      <div className="scan-page page-enter">
        {/* Mobile header */}
        <div className="flex items-center justify-between mb-8 hide-desktop">
          <ArrowLeft size={24} color="var(--text)" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }} />
          <h2 className="space-font" style={{ fontSize: 18, margin: 0 }}>Scan Food</h2>
          <div style={{ width: 24 }}></div>
        </div>

        <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleImageSelect} style={{ display: 'none' }} />
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageSelect} style={{ display: 'none' }} />

        {showOptions && (
          <div className="options-overlay" onClick={() => setShowOptions(false)}>
            <div className="options-sheet" onClick={e => e.stopPropagation()}>
              <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 24px' }}></div>
              <h3 className="space-font" style={{ fontSize: 20, marginBottom: 24, textAlign: 'center' }}>Choose Image Source</h3>
              
              <div className="option-btn primary" onClick={() => { cameraInputRef.current.click(); setShowOptions(false); }}>
                <Camera size={24} />
                <span>Click Image (Camera)</span>
              </div>
              
              <div className="option-btn" onClick={() => { galleryInputRef.current.click(); setShowOptions(false); }}>
                <ImageUp size={24} />
                <span>Upload from Device</span>
              </div>
              
              <button 
                onClick={() => setShowOptions(false)}
                style={{ width: '100%', marginTop: 12, padding: 12, background: 'transparent', color: 'var(--muted)', fontSize: 14, border: 'none' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="scan-grid">
          {/* LEFT: Viewfinder + options */}
          <div className="scan-left">
            <div onClick={() => setShowOptions(true)} style={{ cursor: 'pointer', aspectRatio: '16/9', background: '#000', borderRadius: 24, position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: '100%', height: '100%', backgroundImage: `url(${imagePreview})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: imageFile ? 0.8 : 0.4, transition: 'background-image 0.3s ease' }} />
              <div className="bracket tl"></div><div className="bracket tr"></div>
              <div className="bracket bl"></div><div className="bracket br"></div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {!imageFile ? (
                  <>
                    <Camera size={40} color="rgba(255,255,255,0.15)" />
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Tap to take or upload a photo</div>
                  </>
                ) : (
                  <>
                    <ImageUp size={40} color="rgba(255,255,255,0.15)" />
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8, background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: 12 }}>Tap to change image</div>
                  </>
                )}
              </div>
              {imageFile && (
                <div style={{ position: 'absolute', top: 16, right: 16, background: 'var(--lime)', color: '#0A0A0F', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontFamily: 'Space Grotesk', fontWeight: 600 }}>✓ Image ready</div>
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 16 }}>⚡</span> Include your fist in frame for accurate portion estimation
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="input-label" style={{ marginBottom: 8, display: 'block' }}>Meal Description (Optional)</label>
              <textarea
                className="input-field"
                placeholder="e.g. Added a tablespoon of olive oil, cooked in butter..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ height: 80, resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
              {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(t => (
                <div key={t} onClick={() => setMealType(t)} style={{ padding: '8px 16px', borderRadius: 99, border: `1px solid ${mealType === t ? 'var(--lime)' : 'var(--border)'}`, background: mealType === t ? 'var(--lime-dim)' : 'var(--raised)', color: mealType === t ? 'var(--lime)' : 'var(--muted)', fontSize: 13, cursor: 'pointer', transition: '150ms' }}>
                  {t}
                </div>
              ))}
            </div>

            {error && <div style={{ color: 'var(--pink)', fontSize: 13, background: 'var(--pink-dim)', padding: '8px 12px', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

            <button className="btn-primary" onClick={handleAnalyze} style={{ position: 'relative' }} disabled={analyzing}>
              {analyzing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 7, height: 7, background: '#0A0A0F', borderRadius: '50%', animation: `pulseBracket 1s infinite ${i * 0.2}s` }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: '#0A0A0F', fontWeight: 500 }}>{loadingMsg}</span>
                </div>
              ) : 'Analyze with AI →'}
            </button>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>
              {analyzing ? '⏱ Usually takes 5–15 seconds' : 'Powered by AI Vision (NutriAI)'}
            </div>
          </div>

          {/* RIGHT: Results */}
          {complete && result && (
            <div className="card" style={{ marginTop: 0, animation: 'pageIn 300ms ease' }}>
              {notification && (
                <div style={{ background: notification.type === 'success' ? 'var(--lime-dim)' : 'rgba(106, 240, 255, 0.1)', borderLeft: `4px solid ${notification.type === 'success' ? 'var(--lime)' : 'var(--cyan)'}`, padding: '16px', borderRadius: 8, marginBottom: 24, animation: 'pageIn 400ms ease' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 600, color: notification.type === 'success' ? 'var(--lime)' : 'var(--cyan)' }}>{notification.title}</h4>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text)' }}>{notification.msg}</p>
                    </div>
                    <div onClick={() => setNotification(null)} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 18, lineHeight: 1 }}>×</div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <h3 className="space-font" style={{ fontSize: 20 }}>Detected Foods</h3>
                <span style={{ color: 'var(--lime)', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16 }}>{result.health_score} / 10</span>
              </div>

              {/* Total Nutrition Summary Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                <div style={{ background: 'rgba(163,255,106,0.08)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Calories</div>
                  <div className="space-font" style={{ fontSize: 20, color: 'var(--lime)' }}>{Math.round(result.total_nutrition.calories)}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)' }}>kcal</div>
                </div>
                <div style={{ background: 'rgba(255,106,176,0.08)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Fat</div>
                  <div className="space-font" style={{ fontSize: 20, color: 'var(--pink)' }}>{Math.round(result.total_nutrition.fats)}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)' }}>grams</div>
                </div>
                <div style={{ background: 'rgba(255,179,71,0.08)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Sugar</div>
                  <div className="space-font" style={{ fontSize: 20, color: 'var(--amber)' }}>{Math.round(result.total_nutrition.sugar || 0)}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)' }}>grams</div>
                </div>
              </div>

              <div className="flex col gap-3 mb-6">
                {result.food_items.map((f, i) => (
                  <div key={i} style={{ background: 'var(--raised)', border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}>
                    <div className="flex justify-between items-start" style={{ marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{f.name} <span style={{ color: 'var(--muted)', fontSize: 12 }}>({f.estimated_quantity})</span></div>
                        <div style={{ fontSize: 11, color: f.confidence === 'high' ? 'var(--lime)' : 'var(--amber)', marginTop: 4, background: f.confidence === 'high' ? 'var(--lime-dim)' : 'rgba(255,179,71,0.12)', display: 'inline-block', padding: '2px 6px', borderRadius: 4 }}>
                          {f.confidence.charAt(0).toUpperCase() + f.confidence.slice(1)} Confidence
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      <div style={{ background: 'rgba(163,255,106,0.06)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>Cal</div>
                        <div className="space-font" style={{ fontSize: 14, color: 'var(--lime)' }}>{Math.round(f.calories)}</div>
                      </div>
                      <div style={{ background: 'rgba(255,106,176,0.06)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>Fat</div>
                        <div className="space-font" style={{ fontSize: 14, color: 'var(--pink)' }}>{Math.round(f.fats)}g</div>
                      </div>
                      <div style={{ background: 'rgba(255,179,71,0.06)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>Sugar</div>
                        <div className="space-font" style={{ fontSize: 14, color: 'var(--amber)' }}>{Math.round(f.sugar || 0)}g</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderLeft: '3px solid var(--lime)', background: 'var(--lime-dim)', padding: '14px 16px', borderRadius: '0 12px 12px 0', fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 24 }}>
                <span style={{ fontSize: 10, color: 'var(--lime)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>AI Coach <div style={{ width: 4, height: 10, background: 'var(--lime)', animation: 'blink 1s infinite' }} /></span>
                {result.coach_advice}
              </div>

              <button className="btn-primary" onClick={() => navigate('/home')}>View on Dashboard →</button>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 16, cursor: 'pointer' }} onClick={resetAll}>Scan Another Meal</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
