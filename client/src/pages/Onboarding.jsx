import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

const StepWrapper = ({ step, next, back, children, heading, subtext, optional = false }) => (
  <div key={step} className="page-enter flex col" style={{ animationDuration: '250ms', flex: 1 }}>
    <div className="flex justify-between items-center mb-8">
      {step > 1 ? <ArrowLeft size={24} color="var(--text)" onClick={back} style={{cursor:'pointer'}} /> : <div style={{width:24}}/>}
      {optional ? <span onClick={next} style={{color:'var(--muted)', fontSize:14, cursor:'pointer'}}>Skip</span> : <div style={{width:24}}/>}
    </div>
    <h1 style={{ fontSize: 28, letterSpacing:'-0.5px' }} className="space-font mb-2">{heading}</h1>
    <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 32 }}>{subtext}</p>
    <div className="flex col" style={{ flex: 1, paddingBottom: 32 }}>{children}</div>
    <button onClick={next} className="btn-primary" style={{ marginTop: 'auto', marginBottom: 'max(env(safe-area-inset-bottom), 24px)' }}>
      {step === 9 ? "Let's start →" : "Continue →"}
    </button>
  </div>
);

const SliderUI = ({ val, setVal, min, max, label }) => (
  <div className="flex col items-center justify-center flex-1">
    <div className="space-font" style={{ fontSize: 52, color: 'var(--lime)', marginBottom: 8 }}>{val}</div>
    <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 40 }}>{label}</div>
    <input type="range" min={min} max={max} value={val} onChange={e => setVal(parseInt(e.target.value))} style={{ width: '100%', appearance: 'none', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, outline: 'none' }} />
    <style>{`
      input[type=range]::-webkit-slider-thumb {
        appearance: none; width: 24px; height: 24px; border-radius: 50%;
        background: var(--lime); border: 3px solid var(--bg); cursor: pointer;
      }
    `}</style>
  </div>
);

const PillSelect = ({ opts, selected, toggle }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
    {opts.map(o => (
      <div key={o} onClick={() => toggle(o)} style={{ padding: '10px 18px', borderRadius: 99, border: `1px solid ${selected.includes(o) ? 'var(--lime)' : 'transparent'}`, background: selected.includes(o) ? 'var(--lime-dim)' : 'var(--raised)', color: selected.includes(o) ? 'var(--lime)' : 'var(--muted)', fontWeight: 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
        {o}
      </div>
    ))}
  </div>
);

export default function Onboarding() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState(1);
  const totalSteps = 9;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('ob_data')) || {
    goal: '', sex: '', age: 25, height: 170, weight: 70, activity: '', preferences: [], conditions: [],
    calories: 2000, protein: 120, sugar: 50
  });

  useEffect(() => { localStorage.setItem('ob_data', JSON.stringify(data)); }, [data]);

  const next = () => {
    if (step === 9) return finish();
    setStep(s => s + 1);
  };
  const back = () => setStep(s => Math.max(1, s - 1));
  const finish = async () => {
    setLoading(true);
    try {
      const payload = {
        gender: data.sex === 'Other' ? 'prefer not to say' : data.sex.toLowerCase(),
        age: data.age,
        heightCm: data.height,
        weightKg: data.weight,
        activityLevel: data.activity,
        healthConditions: data.conditions,
        dietaryPreferences: data.preferences,
        fitnessGoal: data.goal === 'Lose fat' ? 'fat_loss' : data.goal === 'Build muscle' ? 'muscle_gain' : 'maintenance',
        targets: { 
          calories: Number(data.calories) || 2000, 
          protein: Number(data.protein) || 120, 
          sugar: Number(data.sugar) || 50 
        }
      };
      const res = await api.patch('/users/me', payload);
      const { user } = useAuthStore.getState();
      useAuthStore.getState().setAuth(res.data.data, useAuthStore.getState().accessToken, useAuthStore.getState().refreshToken);
      localStorage.removeItem('justRegistered');
      navigate('/home');
    } catch (err) {
      console.error('Failed to save onboarding data', err);
      localStorage.removeItem('justRegistered');
      // Fallback
      navigate('/home');
    }
  };

  const Step1 = () => (
    <StepWrapper step={step} next={next} back={back} heading="What's your main goal?" subtext="We'll personalize your nutrition plan around this.">
      {[{e:'🔥',t:'Lose fat',s:'Burn fat while preserving muscle'}, {e:'💪',t:'Build muscle',s:'Gain lean mass with targeted protein'}, {e:'⚖️',t:'Stay balanced',s:'Maintain current weight and health'}, {e:'🏃',t:'Improve fitness',s:'Fuel performance and recovery'}].map(opt => (
        <div key={opt.t} onClick={() => setData({...data, goal: opt.t})} className="flex items-center p-4 mb-4" style={{ background: data.goal === opt.t ? 'var(--lime-dim)' : 'var(--raised)', border: `1.5px solid ${data.goal === opt.t ? 'var(--lime)' : 'transparent'}`, borderRadius: 16, cursor:'pointer' }}>
          <div style={{ fontSize: 32, marginRight: 16 }}>{opt.e}</div>
          <div className="flex col">
            <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>{opt.t}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{opt.s}</span>
          </div>
        </div>
      ))}
    </StepWrapper>
  );

  const Step2 = () => (
    <StepWrapper step={step} next={next} back={back} heading="What's your biological sex?" subtext="Used for accurate calorie calculations.">
      <div className="flex col gap-4" style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
        <div className="flex gap-4">
          {[{e:'♂',t:'Male'}, {e:'♀',t:'Female'}].map(opt => (
            <div key={opt.t} onClick={() => setData({...data, sex: opt.t})} className="flex col items-center justify-center" style={{ flex: 1, aspectRatio: '1', background: data.sex === opt.t ? 'var(--lime-dim)' : 'var(--raised)', border: `1.5px solid ${data.sex === opt.t ? 'var(--lime)' : 'transparent'}`, borderRadius: 16, cursor:'pointer' }}>
              <span style={{ fontSize: 48, marginBottom: 12, color: data.sex === opt.t ? 'var(--lime)' : 'var(--muted)' }}>{opt.e}</span>
              <span style={{ fontWeight: 600, fontSize: 16 }}>{opt.t}</span>
            </div>
          ))}
        </div>
        <div onClick={() => setData({...data, sex: 'Other'})} className="flex items-center justify-center p-4" style={{ background: data.sex === 'Other' ? 'var(--lime-dim)' : 'var(--raised)', border: `1.5px solid ${data.sex === 'Other' ? 'var(--lime)' : 'transparent'}`, borderRadius: 16, cursor:'pointer', height: 60 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Prefer not to say</span>
        </div>
      </div>
    </StepWrapper>
  );

  const Step3 = () => (
    <StepWrapper step={step} next={next} back={back} heading="How old are you?" subtext="Metabolism changes with age — this helps us calibrate.">
      <div className="flex col items-center justify-center flex-1">
        <button onClick={() => setData({...data, age: Math.min(80, data.age + 1)})} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:24, padding:20, cursor:'pointer' }}>▲</button>
        <div className="space-font" style={{ fontSize: 72, color: 'var(--lime)', lineHeight: 1 }}>{data.age}</div>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>years old</div>
        <button onClick={() => setData({...data, age: Math.max(16, data.age - 1)})} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:24, padding:20, cursor:'pointer' }}>▼</button>
      </div>
    </StepWrapper>
  );

  const Step4 = () => (
    <StepWrapper step={step} next={next} back={back} heading="What's your height?" subtext="Toggle units top-right.">
      <SliderUI val={data.height} setVal={(v) => setData({...data, height: v})} min={140} max={220} label="cm" />
    </StepWrapper>
  );

  const Step5 = () => (
    <StepWrapper step={step} next={next} back={back} heading="What's your current weight?" subtext="Use the slider to set.">
      <SliderUI val={data.weight} setVal={(v) => setData({...data, weight: v})} min={40} max={160} label="kg" />
    </StepWrapper>
  );

  const Step6 = () => (
    <StepWrapper step={step} next={next} back={back} heading="How active are you?" subtext="Be honest — this directly affects your calorie target.">
      {[{e:'🛋️',t:'Sedentary',s:'Little or no exercise, desk job'}, {e:'🚶',t:'Lightly active',s:'Light exercise 1–3 days/week'}, {e:'🏋️',t:'Moderately active',s:'Moderate exercise 3–5 days/week'}, {e:'🏃',t:'Very active',s:'Hard exercise 6–7 days/week'}, {e:'⚡',t:'Athlete',s:'Twice daily training or physical job'}].map(opt => (
        <div key={opt.t} onClick={() => setData({...data, activity: opt.t})} className="flex items-center p-4 mb-4" style={{ background: data.activity === opt.t ? 'var(--lime-dim)' : 'var(--raised)', border: `1.5px solid ${data.activity === opt.t ? 'var(--lime)' : 'transparent'}`, borderRadius: 16, cursor:'pointer' }}>
          <div style={{ fontSize: 24, marginRight: 16 }}>{opt.e}</div>
          <div className="flex col"><span style={{ fontWeight: 600, fontSize: 14 }}>{opt.t}</span><span style={{ fontSize: 12, color: 'var(--muted)' }}>{opt.s}</span></div>
        </div>
      ))}
    </StepWrapper>
  );

  const Step7 = () => (
    <StepWrapper step={step} next={next} back={back} heading="Set your daily targets" subtext="Adjust your exact nutrition goals manually, or stick with these defaults.">
      <div className="flex col gap-4" style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
        <div className="flex col gap-2">
          <label style={{ fontSize: 13, color: 'var(--muted)' }}>Daily Calories (kcal)</label>
          <input type="number" className="input-field" style={{ fontSize: 20 }} value={data.calories} onChange={e => setData({...data, calories: e.target.value})} />
        </div>
        <div className="flex col gap-2">
          <label style={{ fontSize: 13, color: 'var(--muted)' }}>Protein Goal (g)</label>
          <input type="number" className="input-field" style={{ fontSize: 20 }} value={data.protein} onChange={e => setData({...data, protein: e.target.value})} />
        </div>
        <div className="flex col gap-2">
          <label style={{ fontSize: 13, color: 'var(--muted)' }}>Sugar Limit (g)</label>
          <input type="number" className="input-field" style={{ fontSize: 20 }} value={data.sugar} onChange={e => setData({...data, sugar: e.target.value})} />
        </div>
      </div>
    </StepWrapper>
  );

  const Step8 = () => (
    <StepWrapper step={step} next={next} back={back} heading="Any dietary preferences?" subtext="Select all that apply. You can change these anytime." optional>
      <PillSelect opts={['Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Gluten-free', 'Dairy-free', 'Halal', 'Kosher', 'No preference']} selected={data.preferences} toggle={(o) => {
        let arr = [...data.preferences];
        if (arr.includes(o)) arr = arr.filter(x => x !== o); else arr.push(o);
        setData({...data, preferences: arr});
      }} />
    </StepWrapper>
  );

  const Step9 = () => (
    <StepWrapper step={step} next={next} back={back} heading="Any health conditions to be aware of?" subtext="This helps us flag relevant nutritional warnings." optional>
      <PillSelect opts={['Diabetes (Type 2)', 'Hypertension', 'High cholesterol', 'PCOS', 'Hypothyroidism', 'IBS / gut sensitivity', 'Heart condition', 'Food allergies', 'None of these']} selected={data.conditions} toggle={(o) => {
        let arr = [...data.conditions];
        if (arr.includes(o)) arr = arr.filter(x => x !== o); else arr.push(o);
        setData({...data, conditions: arr});
      }} />
    </StepWrapper>
  );

  if (loading) {
    return (
      <div className="app-wrapper flex col items-center justify-center p-6 page-enter" style={{ minHeight: '100vh' }}>
        <div style={{ display:'flex', gap:8, marginBottom: 24 }}>
          {[0,1,2].map(i => <div key={i} style={{ width:12, height:12, background:'var(--lime)', borderRadius:'50%', animation:`pulseBracket 1s infinite ${i*0.2}s` }} />)}
        </div>
        <div style={{ color:'var(--text)', fontSize: 16 }}>Building your personalized nutrition profile...</div>
      </div>
    );
  }

  const renders = [Step1, Step2, Step3, Step4, Step5, Step6, Step7, Step8, Step9];
  const ActiveStep = renders[step - 1];

  return (
    <div className="app-wrapper flex col px-6" style={{ minHeight: '100vh', paddingTop: 20 }}>
      {/* Progress Bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(step / totalSteps) * 100}%`, background: 'var(--lime)', transition: 'width 0.3s' }} />
      </div>
      <div className="text-center mt-2 mb-4" style={{ fontSize: 12, color: 'var(--muted)' }}>Step {step} of {totalSteps}</div>
      {ActiveStep()}
    </div>
  );
}
