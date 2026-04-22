import { useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

export default function Profile() {
  const { user } = useAuthStore();
  const [edit, setEdit] = useState(false);
  
  const [data, setData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '--',
    height: user?.heightCm || '--',
    weight: user?.weightKg || '--',
    goal: user?.fitnessGoal === 'fat_loss' ? 'Lose fat' : user?.fitnessGoal === 'muscle_gain' ? 'Build muscle' : 'Maintain',
    pref: user?.dietaryPreferences?.length ? user.dietaryPreferences : ['None'],
    cond: user?.healthConditions?.length ? user.healthConditions : ['None']
  });

  const init = data.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();

  let bmi = '--';
  let isHealthyBMI = true;
  if (data.weight !== '--' && data.height !== '--') {
    bmi = (data.weight / Math.pow(data.height / 100, 2)).toFixed(1);
    isHealthyBMI = bmi >= 18.5 && bmi <= 24.9;
  }

  return (
    <>
      <style>{`
        .profile-page { padding: 20px 24px; max-width: 480px; margin: 0 auto; }
        @media (min-width: 769px) {
          .profile-page { max-width: 640px; padding: 0; }
        }
      `}</style>
      <div className="profile-page page-enter">
      <div className="flex justify-between items-center mb-8">
        <div style={{ width: 44 }}></div>
        <h2 className="space-font" style={{ fontSize: 18, margin: 0 }}>Profile</h2>
        {!edit ? (
          <div onClick={() => setEdit(true)} style={{ color: 'var(--lime)', fontSize: 14, fontWeight: 500, padding: '6px 12px', border: '1px solid var(--lime)', borderRadius: 99, cursor: 'pointer' }}>Edit</div>
        ) : <div style={{ width: 44 }}></div>}
      </div>

      <div className="flex col items-center text-center mb-8">
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--lime)', color: '#0A0A0F', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }} className="space-font">{init}</div>
        {edit ? (
          <input className="input-field" value={data.name} onChange={e => setData({...data, name: e.target.value})} style={{ textAlign: 'center', marginBottom: 8 }} />
        ) : <h2 className="space-font" style={{ fontSize: 20, marginBottom: 4 }}>{data.name}</h2>}
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{data.email}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Member since Apr 2026</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {['Age', 'Height', 'Weight', 'BMI'].map(s => (
          <div key={s} className="card" style={{ padding: 14, borderRadius: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>{s}</div>
            {edit && s !== 'BMI' ? (
              <input type="number" className="input-field" value={data[s.toLowerCase()]} onChange={e => setData({...data, [s.toLowerCase()]: e.target.value})} style={{ height: 36, padding: '0 8px' }} />
            ) : (
              <div className="space-font" style={{ fontSize: 22, color: s === 'BMI' ? (isHealthyBMI ? 'var(--lime)' : 'var(--pink)') : 'var(--text)' }}>
                {s === 'BMI' ? bmi : data[s.toLowerCase()]}
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4, fontFamily: 'Inter' }}>
                  {s === 'Height' ? 'cm' : s === 'Weight' ? 'kg' : ''}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <span className="section-label">Fitness goal</span>
      <div className="card mb-6" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 20 }}>⚖️</div>
        {edit ? (
          <select className="input-field" value={data.goal} onChange={e => setData({...data, goal: e.target.value})} style={{ height: 40, background: 'var(--surface)' }}>
            <option>Lose fat</option><option>Maintain</option><option>Build muscle</option>
          </select>
        ) : <div style={{ fontWeight: 500 }}>{data.goal}</div>}
      </div>

      <span className="section-label">Dietary preferences</span>
      <div className="flex gap-2 mb-6 flex-wrap">
        {data.pref.map(p => <div key={p} style={{ padding: '6px 14px', borderRadius: 99, background: 'var(--lime-dim)', color: 'var(--lime)', fontSize: 13, fontWeight: 500 }}>{p}</div>)}
        {edit && <div style={{ padding: '6px 14px', borderRadius: 99, background: 'var(--raised)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>+ Add preference</div>}
      </div>

      <span className="section-label">Health conditions</span>
      <div className="flex gap-2 mb-8 flex-wrap">
        {data.cond.map(c => <div key={c} style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(255,179,71,0.12)', color: 'var(--amber)', fontSize: 13, fontWeight: 500 }}>{c}</div>)}
        {edit && <div style={{ padding: '6px 14px', borderRadius: 99, background: 'var(--raised)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>+ Add condition</div>}
      </div>

      <span className="section-label">Daily targets</span>
      <div className="card" style={{ padding: '0 20px', marginBottom: 32 }}>
        {[
          { l: 'Calories', v: `${user?.targets?.calories || 2000} kcal` },
          { l: 'Protein', v: `${user?.targets?.protein || 120} g` },
          { l: 'Carbs', v: `${user?.targets?.carbs || 250} g` },
          { l: 'Fats', v: `${user?.targets?.fats || 65} g` },
          { l: 'Sugar', v: `${user?.targets?.sugar || 50} g` }
        ].map((t, i) => (
          <div key={t.l} className="flex justify-between items-center" style={{ padding: '16px 0', borderBottom: i === 4 ? 'none' : '1px solid var(--border)' }}>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>{t.l}</div>
            <div className="space-font" style={{ fontSize: 14, color: 'var(--text)' }}>{t.v}</div>
          </div>
        ))}
      </div>

      {edit ? (
        <div className="flex col gap-4 mt-8" style={{ paddingBottom: 40 }}>
          <button className="btn-primary" onClick={async () => {
            try {
              const payload = {
                name: data.name,
                age: data.age !== '--' ? Number(data.age) : undefined,
                heightCm: data.height !== '--' ? Number(data.height) : undefined,
                weightKg: data.weight !== '--' ? Number(data.weight) : undefined,
                fitnessGoal: data.goal === 'Lose fat' ? 'fat_loss' : data.goal === 'Build muscle' ? 'muscle_gain' : 'maintenance',
              };
              const res = await api.patch('/users/me', payload);
              useAuthStore.getState().setAuth(res.data.data, useAuthStore.getState().accessToken, useAuthStore.getState().refreshToken);
            } catch (err) {
              console.error('Failed to update profile', err);
            }
            setEdit(false);
          }}>Save changes</button>
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, cursor: 'pointer' }} onClick={() => setEdit(false)}>Cancel</div>
        </div>
      ) : (
        <div className="flex col mt-8" style={{ paddingBottom: 40 }}>
          <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--pink)', color: 'var(--pink)' }} onClick={() => { useAuthStore.getState().logout(); window.location.href = '/'; }}>Sign Out</button>
        </div>
      )}
    </div>
    </>
  );
}
