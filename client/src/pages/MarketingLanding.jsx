import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

// ─── Google Fonts + Global Styles ───────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: #06060A; color: #EEEEF5; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

:root {
  --lime: #B8FF57; --cyan: #57D9FF; --pink: #FF6FBE; --amber: #FFB240;
  --bg: #06060A; --surface: #0F0F1A; --raised: #16162A;
  --border: rgba(255,255,255,0.06); --muted: #6B7280; --muted2: #9CA3AF;
  --lime-dim: rgba(184,255,87,0.10); --cyan-dim: rgba(87,217,255,0.10);
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #06060A; }
::-webkit-scrollbar-thumb { background: rgba(184,255,87,0.3); border-radius: 4px; }
.no-scroll-bar::-webkit-scrollbar { display: none; }
.no-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }

:focus-visible { outline: 2px solid var(--lime); outline-offset: 3px; border-radius: 4px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Custom cursor */
.ncursor {
  pointer-events: none; position: fixed; top: 0; left: 0;
  width: 12px; height: 12px; border-radius: 50%;
  background: rgba(184,255,87,0.65); z-index: 9999;
  transform: translate(-100px,-100px);
  transition: transform 0.08s linear;
  will-change: transform;
  mix-blend-mode: screen;
}

@media (pointer: coarse) {
  .ncursor { display: none !important; }
}

/* Keyframes */
@keyframes pulseGlow   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.5)} }
@keyframes phoneFloat  { 0%,100%{transform:translateY(0) rotateY(var(--tilt,0deg))} 50%{transform:translateY(-13px) rotateY(var(--tilt,0deg))} }
@keyframes camPulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
@keyframes scanMove    { 0%{top:0;opacity:0.8} 100%{top:100%;opacity:0} }
@keyframes fillBar     { from{width:0} to{width:var(--w)} }
@keyframes donutFill   { to{stroke-dashoffset:60} }
@keyframes fadeInUp    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
@keyframes particleA   { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.1)} }
@keyframes particleB   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
@keyframes particleC   { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-24px) rotate(15deg)} }

/* Phone Animation Styles */
.cam-view { position:absolute; inset:0; z-index:5; background:#000; overflow:hidden; }
.cam-overlay { position:absolute; inset:0; border:2px solid var(--lime); opacity:0.3; pointer-events:none; }
.shutter-btn { position:absolute; bottom:40px; left:50%; transform:translateX(-50%); width:54px; height:54px; border-radius:50%; border:3px solid #fff; display:flex; alignItems:center; justifyContent:center; }
.shutter-inner { width:40px; height:40px; border-radius:50%; background:#fff; }

.report-view { position:absolute; inset:0; z-index:10; background:#06060A; display:flex; flex-direction:column; gap:16px; overflow-y: auto; padding: 20px 16px; }
.report-card { background:var(--surface); border:1px solid var(--border); border-radius:24px; padding:20px; }
.bracket { position: absolute; width: 20px; height: 20px; border: 2.5px solid var(--lime); animation: pulseBracket 2s ease-in-out infinite; }
.tl { top: 12px; left: 12px; border-right: none; border-bottom: none; border-radius: 6px 0 0 0; }
.tr { top: 12px; right: 12px; border-left: none; border-bottom: none; border-radius: 0 6px 0 0; }
.bl { bottom: 12px; left: 12px; border-right: none; border-top: none; border-radius: 0 0 0 6px; }
.br { bottom: 12px; right: 12px; border-left: none; border-top: none; border-radius: 0 0 6px 0; }
@keyframes pulseBracket { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

/* Nav */
.nav-link-btn { background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:400; font-size:14px; color:var(--muted); transition:color 150ms; padding:0; }
.nav-link-btn:hover { color:var(--lime); }

/* Navbar responsive */
.nav-right { display:flex; align-items:center; gap:16px; }
.nav-auth { display:flex; align-items:center; gap:16px; }

.nav-signin {
  font-size: 14px;
  color: var(--muted);
  text-decoration: none;
  transition: color 150ms;
  white-space: nowrap;
}

.nav-signin:hover { color: #EEEEF5; }

.nav-cta {
  padding: 9px 20px;
  border-radius: 99px;
  background: linear-gradient(135deg, var(--lime), var(--cyan));
  color: #06060A;
  font-family: Syne, sans-serif;
  font-weight: 700;
  font-size: 13px;
  text-decoration: none;
  display: inline-block;
  transition: transform 200ms, box-shadow 200ms;
  white-space: nowrap;
}

.nav-cta:hover {
  transform: scale(1.04);
  box-shadow: 0 0 24px rgba(184,255,87,0.3);
}

/* Feature card hover */
.feat-card { background:var(--surface); border:1px solid var(--border); border-radius:24px; padding:28px; position:relative; overflow:hidden; transition:transform 250ms, border-color 250ms; }
.feat-card:hover { transform:translateY(-3px); }
.feat-card.lime:hover { border-color:rgba(184,255,87,0.22); }
.feat-card.cyan:hover { border-color:rgba(87,217,255,0.22); }
.feat-card.pink:hover { border-color:rgba(255,111,190,0.22); }
.feat-card.amber:hover { border-color:rgba(255,178,64,0.22); }

/* Scan animation */
.scan-line { height:1px; background:var(--lime); position:absolute; left:0; right:0; opacity:0.6; animation:scanMove 3s ease-in-out infinite; }
.scan-line:nth-child(1){animation-delay:0s}
.scan-line:nth-child(2){animation-delay:1s}
.scan-line:nth-child(3){animation-delay:2s}

/* Macro bar fill */
.mbar-fill { height:100%; border-radius:99px; animation:fillBar 1.5s ease forwards; }

/* Donut */
circle.donut-prog { stroke-dasharray:283; stroke-dashoffset:283; animation:donutFill 1.5s ease forwards 0.3s; }

/* Chat bubbles */
.bubble-item { background:var(--raised); border-radius:12px; padding:10px 14px; font-size:13px; color:#EEEEF5; line-height:1.6; opacity:0; transform:translateY(6px); transition:opacity 400ms ease, transform 400ms ease; }
.bubble-item.show { opacity:1; transform:none; }

/* Pricing toggle */
.toggle-track { width:48px; height:26px; background:var(--raised); border-radius:99px; border:1px solid var(--border); cursor:pointer; position:relative; transition:background 200ms; }
.toggle-track.on { background:var(--lime-dim); border-color:rgba(184,255,87,0.3); }
.toggle-thumb { width:20px; height:20px; border-radius:50%; background:#EEEEF5; position:absolute; top:3px; left:3px; transition:transform 200ms, background 200ms; }
.toggle-track.on .toggle-thumb { transform:translateX(22px); background:var(--lime); }

/* Testimonial hover */
.testi-card { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:28px; transition:transform 250ms, border-color 250ms; }
.testi-card:hover { transform:translateY(-4px); border-color:rgba(184,255,87,0.18); }

/* Price card */
.price-card { background:var(--surface); border:1px solid var(--border); border-radius:24px; padding:32px; position:relative; transition:transform 250ms; }
.price-card.featured { border-color:rgba(184,255,87,0.3); transform:scale(1.02); }
.price-card.featured:hover { transform:scale(1.04); }
.price-card:not(.featured):hover { transform:translateY(-3px); }

/* Btn variants */
.btn-outline { display:block; width:100%; padding:13px; border-radius:12px; border:1px solid rgba(255,255,255,0.12); background:transparent; color:#EEEEF5; font-family:'Syne',sans-serif; font-weight:700; font-size:14px; cursor:pointer; text-align:center; text-decoration:none; transition:all 200ms; }
.btn-outline:hover { border-color:rgba(184,255,87,0.4); color:var(--lime); }
.btn-gradient { display:block; width:100%; padding:13px; border-radius:12px; background:linear-gradient(135deg,var(--lime),var(--cyan)); color:#06060A; font-family:'Syne',sans-serif; font-weight:700; font-size:14px; cursor:pointer; text-align:center; text-decoration:none; transition:transform 200ms, box-shadow 200ms; border:none; }
.btn-gradient:hover { transform:scale(1.02); box-shadow:0 0 24px rgba(184,255,87,0.3); }
.btn-outline-lime { display:block; width:100%; padding:13px; border-radius:12px; border:1px solid rgba(184,255,87,0.3); background:transparent; color:var(--lime); font-family:'Syne',sans-serif; font-weight:700; font-size:14px; cursor:pointer; text-align:center; text-decoration:none; transition:all 200ms; }
.btn-outline-lime:hover { background:var(--lime-dim); }

/* Step card hover */
.step-card { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:32px; position:relative; overflow:hidden; transition:transform 250ms, border-color 250ms; }
.step-card:hover { transform:translateY(-4px); border-color:rgba(184,255,87,0.2); }

/* Footer link */
.footer-link { font-size:14px; color:var(--muted); text-decoration:none; transition:color 150ms; }
.footer-link:hover { color:#EEEEF5; }

/* Social icon hover */
.social-icon-btn { background:none; border:none; cursor:pointer; color:var(--muted); transition:color 150ms; padding:4px; }
.social-icon-btn:hover { color:var(--lime); }

@media(max-width:768px) {
  .desktop-nav-links { display:none !important; }
  .hamburger-btn { display:flex !important; }
  .nav-right { gap: 10px !important; }
  .nav-auth { gap: 10px !important; }
  .nav-signin { font-size: 12px !important; }
  .nav-cta { padding: 7px 12px !important; font-size: 12px !important; }
  .bento-grid { display:flex !important; flex-direction:column !important; }
  .coach-split { grid-template-columns:1fr !important; }
  .steps-row { grid-template-columns:1fr !important; gap:16px !important; }
  .step-arrow { display:none !important; }
  .testi-grid { grid-template-columns:1fr !important; }
  .pricing-cards { grid-template-columns:1fr !important; }
  .price-card.featured { transform:none !important; }
  .footer-grid { grid-template-columns:1fr 1fr !important; gap:28px !important; }
  .hero-phone { display:flex; justify-content:center; }
}

.hero-phone {
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 64px;
}

/* New Hero Split Layout */
.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 40px;
  width: 100%;
}

.hero-text-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 860px;
}

.hero-mockup-side {
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (min-width: 1025px) {
  .hero-inner {
    flex-direction: row;
    text-align: left;
    justify-content: space-between;
    gap: 80px;
  }
  .hero-text-side {
    flex: 1;
    align-items: flex-start;
    max-width: 650px;
  }
  .hero-mockup-side {
    flex: 0.9;
    display: flex;
    justify-content: flex-end;
    margin-top: -60px;
  }
  .hero-phone {
    margin-top: 10px;
  }
  /* Adjust specific text elements for left alignment */
  .hero-text-side p {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  .hero-text-side .ctas {
    justify-content: flex-start !important;
  }
  .hero-text-side .social-proof {
    justify-content: flex-start !important;
  }
}
`

// ─── Fade-up animation variant ───────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.62, delay, ease: [0.25, 0.46, 0.45, 0.94] },
})

// ─── Custom Cursor ───────────────────────────────────────────────────────────
const CustomCursor = () => {
  const ref = useRef(null)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(pointer: coarse)')
    const apply = () => setEnabled(!mq.matches)
    apply()
    if (mq.addEventListener) mq.addEventListener('change', apply)
    else mq.addListener(apply)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', apply)
      else mq.removeListener(apply)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    const move = e => {
      if (ref.current) ref.current.style.transform = `translate(${e.clientX - 6}px,${e.clientY - 6}px)`
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [enabled])

  if (!enabled) return null
  return <div className="ncursor" ref={ref} aria-hidden="true" />
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(6,6,10,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(22px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      transition: 'background 300ms, backdrop-filter 300ms',
    }}>
      <nav style={{ maxWidth: 1120, margin: '0 auto', padding: '0 18px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: 'var(--lime)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: '#06060A' }}>N</span>
          </div>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#EEEEF5' }}>NutriAI</span>
        </Link>

        {/* Desktop links */}
        <div className="desktop-nav-links" style={{ display: 'flex', gap: 32 }}>
          {[['features','Features'],['how-it-works','How it works'],['pricing','Pricing'],['testimonials','Reviews']].map(([id,label]) => (
            <button key={id} className="nav-link-btn" onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </div>

        {/* Right */}
        <div className="nav-right">
          <div className="nav-auth">
            <Link to="/login" className="nav-signin">Sign in</Link>
            <Link to="/register" className="nav-cta">Get started free</Link>
          </div>

          {/* Hamburger */}
          <button className="hamburger-btn" onClick={() => setOpen(!open)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexDirection: 'column', gap: 5 }}
            aria-label="Toggle menu"
          >
            {[0,1,2].map(i=><div key={i} style={{ width:22, height:2, background:'#EEEEF5', borderRadius:2 }}/>) }
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.18}}
            style={{ background:'rgba(15,15,26,0.97)', backdropFilter:'blur(20px)', borderTop:'1px solid var(--border)', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}
          >
            {[['features','Features'],['how-it-works','How it works'],['pricing','Pricing'],['testimonials','Reviews']].map(([id,label])=>(
              <button key={id} onClick={()=>scrollTo(id)} style={{background:'none',border:'none',cursor:'pointer',textAlign:'left',fontFamily:'DM Sans',fontSize:16,color:'#EEEEF5',padding:0}}>{label}</button>
            ))}
            <Link to="/login" style={{color:'var(--muted)',fontFamily:'DM Sans',textDecoration:'none'}}>Sign in</Link>
            <Link to="/register" style={{padding:'12px 20px',borderRadius:99,textAlign:'center',background:'linear-gradient(135deg,var(--lime),var(--cyan))',color:'#06060A',fontFamily:'Syne',fontWeight:700,fontSize:14,textDecoration:'none'}}>Get started free</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Phone Mockup ─────────────────────────────────────────────────────────────
// ─── Phone Mockup ─────────────────────────────────────────────────────────────
const PhoneMockup = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [step, setStep] = useState(0) // 0: Home, 1: Scan, 2: Report, 3: Rotate
  
  useEffect(() => {
    const delays = { 0: 4500, 1: 2500, 2: 3000, 3: 5000, 4: 2000 }
    const timer = setTimeout(() => {
      setStep(s => (s + 1) % 5)
    }, delays[step] || 3000)
    return () => clearTimeout(timer)
  }, [step])

  useEffect(() => {
    let raf = 0
    let tx = 0
    let ty = 0

    const fn = e => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      ty = nx * 6
      tx = ny * -3
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        setTilt({ x: tx, y: ty })
      })
    }

    window.addEventListener('mousemove', fn)
    return () => {
      window.removeEventListener('mousemove', fn)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  const thaliImage = "/thali.webp";

  return (
    <div className="hero-phone">
      {/* Background Glows */}
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -10, 0], opacity: [0.75, 1, 0.75] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <motion.div
          animate={{ rotate: [-1.2, 1.2, -1.2] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          style={{ textAlign: 'center' }}
        >
          <div
            style={{
              fontFamily: 'Syne',
              fontWeight: 800,
              fontSize: 85,
              letterSpacing: '-0.06em',
              lineHeight: 0.95,
              opacity: 0.08,
              background: 'linear-gradient(90deg, rgba(184,255,87,0.9), rgba(87,217,255,0.9))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'blur(0.2px)',
            }}
          >
            NUTRIAI
          </div>
        </motion.div>
      </motion.div>

      <div style={{ position:'absolute', bottom:-30, left:'50%', transform:'translateX(-50%)', width:360, height:140, background:'radial-gradient(ellipse,rgba(184,255,87,0.18) 0%,transparent 70%)', filter:'blur(28px)', pointerEvents:'none' }} />
      
      <motion.div
        animate={{ 
          y: [0, -13, 0],
          rotateY: step === 4 ? 360 : 0,
          scale: step === 4 ? [1, 0.9, 1] : 1
        }}
        transition={step === 4 ? { duration: 1.5, ease: "easeInOut" } : { y: { repeat: Infinity, duration: 4, ease: 'easeInOut' }, rotateY: { duration: 0 } }}
        style={{
          width: 265,
          height: 575,
          borderRadius: 40,
          background: '#0F0F1A',
          border: '1.5px solid rgba(255,255,255,0.12)',
          position: 'relative',
          overflow: 'hidden',
          transform: `perspective(1000px) rotateX(${tilt.x}deg)`,
          transition: step === 3 ? 'none' : 'transform 120ms ease',
          willChange: 'transform',
          zIndex: 1,
        }}
      >
        {/* Notch */}
        <div style={{ width:100, height:24, background:'#06060A', borderRadius:'0 0 14px 14px', position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', zIndex:50 }} />
        
        <div style={{ position:'absolute', inset:0, background:'#06060A', borderRadius:38, overflow:'hidden', zIndex: 1 }}>
          
          {/* Status Bar */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:50, padding:'14px 20px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start', zIndex:100, background: step === 1 ? 'transparent' : 'linear-gradient(to bottom, #06060A 50%, rgba(6,6,10,0) 100%)', pointerEvents:'none' }}>
            <span style={{ fontFamily:'Syne', fontWeight:700, fontSize:10, color: step === 1 ? '#fff' : 'var(--muted)' }}>9:41</span>
            <div style={{ display:'flex', gap:4, alignItems:'center' }}>
              <svg width="14" height="10" viewBox="0 0 14 10" fill={step === 1 ? "#fff" : "var(--muted)"} aria-hidden="true"><rect x="0" y="4" width="2" height="6" rx="1"/><rect x="3" y="2" width="2" height="8" rx="1"/><rect x="6" y="0" width="2" height="10" rx="1"/><rect x="9" y="2" width="2" height="8" rx="1" opacity=".4"/><rect x="12" y="4" width="2" height="6" rx="1" opacity=".2"/></svg>
              <svg width="22" height="10" viewBox="0 0 22 10" fill="none" aria-hidden="true"><rect x=".5" y=".5" width="18" height="9" rx="2.5" stroke={step === 1 ? "#fff" : "var(--muted)"}/><rect x="19" y="3" width="2" height="4" rx="1" fill={step === 1 ? "#fff" : "var(--muted)"}/><rect x="1.5" y="1.5" width="14" height="7" rx="1.5" fill="var(--lime)"/></svg>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="no-scroll-bar"
                style={{ height:'100%', overflowY:'auto', padding:'54px 14px 80px', display:'flex', flexDirection:'column', gap:12, pointerEvents:'auto', msOverflowStyle:'none', scrollbarWidth:'none' }}
              >
                
                {/* Header (Home.jsx style) */}
                <div style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Good morning,</div>
                  <div style={{ fontFamily: 'Syne', fontSize: 18, color: '#fff', fontWeight: 700 }}>Sarah</div>
                </div>

                {/* Health Score Ring (Home.jsx style) */}
                <div style={{ background: 'var(--surface)', borderRadius: 24, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ width: '55%' }}>
                    <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 6 }}>HEALTH SCORE</div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 44, color: 'var(--lime)', lineHeight: 0.9 }}>8.4</span>
                      <span style={{ fontFamily: 'Syne', fontSize: 16, color: 'var(--muted)', marginLeft: 4 }}>/10</span>
                    </div>
                  </div>
                  <div style={{ position: 'relative', width: 70, height: 70 }}>
                    <svg width="70" height="70" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(184,255,87,0.12)" strokeWidth="12" />
                      <circle cx="60" cy="60" r="55" fill="none" stroke="var(--lime)" strokeWidth="12" strokeLinecap="round" strokeDasharray="345.5" strokeDashoffset="55" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Syne', fontSize: 14, color: '#fff', fontWeight: 700 }}>1,240</span>
                      <span style={{ fontSize: 7, color: 'var(--muted)' }}>kcal</span>
                    </div>
                  </div>
                </div>

                {/* Scan CTA (Home.jsx style) */}
                <motion.div 
                  animate={{ borderColor: ['rgba(184,255,87,0.18)', 'rgba(184,255,87,0.5)', 'rgba(184,255,87,0.18)'] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ background: 'linear-gradient(135deg, #0F1A0F, #0A1218)', border: '1px solid rgba(184,255,87,0.18)', borderRadius: 20, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>AI FOOD SCAN</div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: '#fff' }}>What did you eat?</div>
                  </div>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(184,255,87,0.4)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06060A" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                </motion.div>
                
                {/* Macros (Home.jsx style) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { label: 'Calories', val: '1,240', color: 'var(--lime)', unit: 'kcal' },
                    { label: 'Fat', val: '42', color: 'var(--pink)', unit: 'g' },
                    { label: 'Sugar', val: '18', color: 'var(--amber)', unit: 'g' }
                  ].map(m => (
                    <div key={m.label} style={{ background: 'var(--surface)', borderTop: `2.5px solid ${m.color}`, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 7, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontFamily: 'Syne', fontSize: 16, color: m.color, fontWeight: 700 }}>{m.val}</div>
                      <div style={{ fontSize: 7, color: 'var(--muted)' }}>{m.unit}</div>
                    </div>
                  ))}
                </div>

                {/* Weekly Chart (Home.jsx style) */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 600 }}>This week</span>
                    <span style={{ fontSize: 8, color: 'var(--muted)' }}>Apr 16 – Apr 22</span>
                  </div>
                  <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '16px 12px', border: '1px solid var(--border)' }}>
                    <div style={{ height: 60, display: 'flex', alignItems: 'end', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                      {[40, 70, 50, 90, 60, 100, 85].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 90 ? 'var(--pink)' : 'var(--lime)', borderRadius: '3px 3px 0 0', opacity: i === 6 ? 1 : 0.3 }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Today's meals (Home.jsx style) */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 8 }}>Today's meals</div>
                  <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--lime-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🥗</div>
                      <div style={{ marginLeft: 8, flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>Avocado Toast</div>
                        <div style={{ fontSize: 8, color: 'var(--muted)' }}>08:30 AM</div>
                      </div>
                      <div style={{ fontFamily: 'Syne', fontSize: 11, color: 'var(--lime)', fontWeight: 700 }}>420</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="scan-preview"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'absolute', inset: 0, background: '#06060A', padding: '54px 14px 20px', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                   <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#fff' }}>Scan Food</span>
                </div>

                <div style={{ position: 'relative', width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={thaliImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Thali" />
                  <div className="bracket tl"></div><div className="bracket tr"></div>
                  <div className="bracket bl"></div><div className="bracket br"></div>
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--lime)', color: '#06060A', fontSize: 8, padding: '3px 8px', borderRadius: 20, fontWeight: 700 }}>✓ Image ready</div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                    <span style={{ color: '#fff', fontSize: 10, fontWeight: 500 }}>Tap to change image</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,178,64,0.1)', border: '1px solid rgba(255,178,64,0.2)', borderRadius: 12, padding: 10, marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 14 }}>⚡</span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>Include your fist in frame for accurate portion estimation</span>
                </div>

                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 10, color: '#fff', fontWeight: 600, marginBottom: 8 }}>Meal Description (Optional)</div>
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, height: 60, padding: 10, fontSize: 9, color: 'var(--muted)' }}>
                    e.g. Added a tablespoon of olive oil...
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
                  {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(m => (
                    <div key={m} style={{ flex: 1, padding: '8px 0', textAlign: 'center', borderRadius: 10, border: m === 'Lunch' ? '1px solid var(--lime)' : '1px solid var(--border)', background: m === 'Lunch' ? 'var(--lime-dim)' : 'transparent', color: m === 'Lunch' ? 'var(--lime)' : 'var(--muted)', fontSize: 9, fontWeight: 600 }}>{m}</div>
                  ))}
                </div>

                <motion.div 
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ marginTop: 'auto', background: 'linear-gradient(135deg, var(--lime), var(--cyan))', padding: 14, borderRadius: 12, textAlign: 'center', color: '#06060A', fontFamily: 'Syne', fontWeight: 800, fontSize: 13 }}
                >
                  Analyze with AI →
                </motion.div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: 'absolute', inset: 0, zIndex: 5, background: '#000' }}
              >
                <img 
                  src={thaliImage} 
                  alt="Scanning" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.62)' }} 
                />
                
                <motion.div 
                  initial={{ top: '10%' }}
                  animate={{ top: '90%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  style={{ 
                    position: 'absolute', 
                    left: 0, 
                    right: 0, 
                    height: '3px', 
                    background: 'var(--lime)', 
                    boxShadow: '0 0 20px var(--lime), 0 0 40px var(--lime)',
                    zIndex: 20
                  }}
                />
                
                <div className="bracket tl" style={{ width: 40, height: 40 }}></div><div className="bracket tr" style={{ width: 40, height: 40 }}></div>
                <div className="bracket bl" style={{ width: 40, height: 40 }}></div><div className="bracket br" style={{ width: 40, height: 40 }}></div>
                
                <div style={{ position:'absolute', top:'50%', left:0, right:0, transform: 'translateY(-50%)', textAlign:'center' }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', borderRadius:99, border:'1px solid var(--lime)', color:'var(--lime)', fontSize:13, fontFamily:'Syne', fontWeight:800, boxShadow: '0 0 30px rgba(184,255,87,0.4)' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 14, height: 14, border: '2px solid var(--lime)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    ANALYZING MEAL...
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="report"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="report-view no-scroll-bar"
                style={{ paddingTop: '54px' }}
              >
                {/* Auto-scrolling content wrapper */}
                <motion.div 
                  initial={{ y: 0 }}
                  animate={{ y: -540 }}
                  transition={{ 
                    duration: 4, 
                    delay: 0.6, 
                    ease: [0.45, 0, 0.55, 1]
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  {/* Achievement Banner */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ 
                      background: 'rgba(87,217,255,0.05)', 
                      borderLeft: '4px solid var(--cyan)', 
                      border: '1px solid rgba(87,217,255,0.12)', 
                      borderLeftWidth: '4px',
                      borderRadius: 14, 
                      padding: '14px 18px', 
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--cyan)', fontFamily: 'Syne', fontWeight: 800, fontSize: 13, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          Halfway There! 🚀
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9, lineHeight: 1.5 }}>
                          You've crossed 50% of your daily calorie goal.
                        </div>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, cursor: 'pointer', paddingLeft: 10 }}>✕</div>
                    </div>
                  </motion.div>

                  {/* Header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                    <h3 style={{ fontFamily:'Syne', fontWeight:800, fontSize:18, color:'#fff' }}>Detected Foods</h3>
                    <span style={{ color: 'var(--lime)', fontFamily: 'Syne', fontWeight: 800, fontSize: 14 }}>8 / 10</span>
                  </div>

                  {/* Summary Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { l: 'Calories', v: 1358, c: 'var(--lime)', u: 'kcal', bg: 'rgba(184,255,87,0.08)' },
                      { l: 'Fat', v: 47, c: 'var(--pink)', u: 'grams', bg: 'rgba(255,111,190,0.08)' },
                      { l: 'Sugar', v: 17, c: 'var(--amber)', u: 'grams', bg: 'rgba(255,178,64,0.08)' }
                    ].map(x => (
                      <div key={x.l} style={{ background: x.bg, borderRadius: 12, padding: '10px 4px', textAlign: 'center' }}>
                        <div style={{ fontSize: 7, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>{x.l}</div>
                        <div style={{ fontFamily: 'Syne', fontSize: 16, color: x.c, fontWeight: 700 }}>{x.v}</div>
                        <div style={{ fontSize: 7, color: 'var(--muted)' }}>{x.u}</div>
                      </div>
                    ))}
                  </div>
                  {[
                    { name: 'Paneer Curry', cal: 280, fat: '18g', sugar: '4g', serving: '1 serving (~200g)' },
                    { name: 'Vegetable Curry', cal: 250, fat: '12g', sugar: '5g', serving: '1 serving (~200g)' },
                    { name: 'Dal', cal: 140, fat: '5g', sugar: '3g', serving: '1 serving (~150g)' },
                    { name: 'Yogurt Raita', cal: 120, fat: '4g', sugar: '2g', serving: '1 serving (~100g)' },
                    { name: 'Basmati Rice', cal: 288, fat: '1g', sugar: '0g', serving: '1 cup (~180g)' },
                    { name: 'Naan Bread', cal: 280, fat: '7g', sugar: '3g', serving: '1-2 pieces (~100g)' }
                  ].map(food => (
                    <div key={food.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{food.name} <span style={{ fontWeight: 400, color: 'var(--muted2)', fontSize: 9 }}>({food.serving})</span></div>
                          <div style={{ fontSize: 8, color: 'var(--lime)', background: 'var(--lime-dim)', display: 'inline-block', padding: '1px 5px', borderRadius: 4, marginTop: 3 }}>High Confidence</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                        {[{l:'CAL',v:food.cal,c:'var(--lime)'},{l:'FAT',v:food.fat,c:'var(--pink)'},{l:'SUGAR',v:food.sugar,c:'var(--amber)'}].map(d=>(
                          <div key={d.l} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '6px', textAlign: 'center' }}>
                            <div style={{ fontSize: 6, color: 'var(--muted)', textTransform: 'uppercase' }}>{d.l}</div>
                            <div style={{ fontFamily: 'Syne', fontSize: 11, color: d.c, fontWeight: 700 }}>{d.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* AI Coach Block */}
                  <div style={{ borderLeft: '3.5px solid var(--lime)', background: 'var(--lime-dim)', padding: '12px 14px', borderRadius: '0 12px 12px 0', fontSize: 11, color: '#fff', lineHeight: 1.5, marginTop: 4 }}>
                    <div style={{ fontSize: 8, color: 'var(--lime)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                      AI COACH <div style={{ width: 4, height: 10, background: 'var(--lime)', animation: 'blink 1s infinite' }} />
                    </div>
                    Solid meal! Watch the carb load from rice + naan together — pick one if you're cutting.
                  </div>

                  {/* Action Button */}
                  <div style={{ marginTop: 8, paddingBottom: 40 }}>
                     <div style={{ width:'100%', padding:12, borderRadius:12, background:'linear-gradient(135deg, var(--lime), var(--cyan))', color:'#06060A', textAlign:'center', fontFamily:'Syne', fontWeight:700, fontSize:13, boxShadow: '0 4px 20px rgba(184,255,87,0.3)' }}>View on Dashboard →</div>
                     <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: 'var(--muted)' }}>Scan Another Meal</div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Nav (Hidden in scan/report to look cleaner, or kept for consistency) */}
          {step === 0 && (
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:64, background:'#080810', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'0 8px', zIndex:10 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, color:'var(--lime)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span style={{ fontSize:9, fontFamily:'DM Sans', fontWeight:600 }}>Home</span>
              </div>
              
              <div style={{ position:'relative', top:-16 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--lime)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(184,255,87,0.3)', color:'#06060A' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M7 7h2l1-2h4l1 2h2a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, color:'var(--muted)', position:'relative', right:4 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18V6" /><path d="M4 18h16" /><path d="M7 14l4-4 3 3 5-6" /></svg>
                <span style={{ fontSize:9, fontFamily:'DM Sans', fontWeight:500 }}>Reports</span>
              </div>

              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, color:'var(--muted)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span style={{ fontSize:9, fontFamily:'DM Sans', fontWeight:500 }}>Profile</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
const HeroSection = () => {
  const stagger = { hidden:{}, visible:{ transition:{ staggerChildren:0.11 } } }
  const item = { hidden:{opacity:0,y:30}, visible:{opacity:1,y:0,transition:{duration:0.68,ease:[0.25,0.46,0.45,0.94]}} }

  return (
    <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', padding:'100px 24px', position:'relative', overflow:'hidden' }}>
      {/* Orbs */}
      {[
        {style:{width:600,height:600,top:-200,left:-200,background:'radial-gradient(circle,rgba(184,255,87,0.08) 0%,transparent 70%)'}},
        {style:{width:800,height:800,top:'40%',right:-300,background:'radial-gradient(circle,rgba(87,217,255,0.06) 0%,transparent 70%)'}},
        {style:{width:500,height:500,bottom:'10%',left:'20%',background:'radial-gradient(circle,rgba(255,111,190,0.05) 0%,transparent 70%)'}},
      ].map((o,i)=>(
        <div key={i} style={{ position:'absolute', borderRadius:'50%', pointerEvents:'none', ...o.style }} />
      ))}

      <div className="hero-inner">
        <motion.div className="hero-text-side" variants={stagger} initial="hidden" animate="visible">
          {/* Eyebrow */}
          <motion.div variants={item} style={{ display:'inline-flex', alignItems:'center', gap:8, borderRadius:99, border:'1px solid rgba(184,255,87,0.25)', background:'rgba(184,255,87,0.08)', padding:'6px 14px', marginBottom:28 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--lime)', animation:'pulseGlow 2s ease-in-out infinite' }} />
            <span style={{ fontSize:13, color:'var(--lime)' }}>AI-Powered Nutrition Intelligence</span>
          </motion.div>

          {/* H1 */}
          <motion.h1 variants={item} style={{ fontFamily:'Syne', fontWeight:800, fontSize:'clamp(42px,6vw,72px)', lineHeight:1.05, letterSpacing:'-1.5px', marginBottom:24 }}>
            Know exactly<br/>
            <span style={{ background:'linear-gradient(90deg,var(--lime),var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>what you eat.</span><br/>
            <span style={{ color:'rgba(238,238,245,0.3)' }}>Act on it.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p variants={item} style={{ fontSize:'clamp(15px,2vw,18px)', fontWeight:300, color:'var(--muted)', maxWidth:560, lineHeight:1.7, marginBottom:40 }}>
            Snap a photo of your meal. NutriAI identifies every ingredient, estimates portions using your fist as scale, calculates macros, and coaches you toward your goals — all in seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="ctas" style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center', marginBottom:48 }}>
            <Link to="/register" style={{
              height:52, padding:'0 28px', borderRadius:99, background:'linear-gradient(135deg,var(--lime),var(--cyan))',
              color:'#06060A', fontFamily:'Syne', fontWeight:700, fontSize:15, textDecoration:'none',
              display:'inline-flex', alignItems:'center', transition:'transform 200ms, box-shadow 200ms',
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.04)';e.currentTarget.style.boxShadow='0 0 40px rgba(184,255,87,0.35)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='none'}}
            >Start for free →</Link>
            <a href="#features" style={{
              height:52, padding:'0 28px', borderRadius:99, border:'1px solid rgba(255,255,255,0.12)',
              background:'transparent', color:'#EEEEF5', fontSize:15, textDecoration:'none',
              display:'inline-flex', alignItems:'center', gap:8, transition:'all 200ms',
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(184,255,87,0.4)';e.currentTarget.style.color='var(--lime)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';e.currentTarget.style.color='#EEEEF5'}}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--lime)" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>
              Watch demo
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={item} className="social-proof" style={{ display:'flex', alignItems:'center' }}>
            {[['50K+','Active users'],['4.9★','App store'],['#1','Nutrition AI']].map(([num,lbl],i)=>(
              <div key={num} style={{ display:'flex', alignItems:'center' }}>
                {i>0 && <div style={{ width:1, height:28, background:'rgba(255,255,255,0.08)', margin:'0 20px' }} />}
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:'Syne', fontWeight:700, fontSize:20, color:'var(--lime)' }}>{num}</div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{lbl}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="hero-mockup-side" variants={item}>
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  )
}

// ─── AI Coach chat bubble component ──────────────────────────────────────────
const CoachChat = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [shown, setShown] = useState(0)
  const msgs = [
    'Great start today — your protein is at 89% of your daily goal. 💪',
    'Fiber is the only gap right now — try adding lentils or roasted veggies to dinner.',
    "You're on track for your fat-loss goal this week. One more meal and you're golden. 🎯",
  ]
  useEffect(() => {
    if (!inView) return
    const timers = msgs.map((_, i) => setTimeout(() => setShown(s => s + 1), 400 + i * 700))
    return () => timers.forEach(clearTimeout)
  }, [inView])

  return (
    <div ref={ref} style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {msgs.map((m,i)=>(
        <div key={i} className={`bubble-item ${i < shown ? 'show' : ''}`}>
          <div style={{ fontSize:10, color:'var(--lime)', fontWeight:500, marginBottom:3, fontFamily:'Syne' }}>NutriAI Coach</div>
          {m}
        </div>
      ))}
    </div>
  )
}

// ─── Features Section ─────────────────────────────────────────────────────────
const FeaturesSection = () => {
  return (
    <section id="features" style={{ padding:'100px 0' }}>
      <div style={{ maxWidth:1120, margin:'0 auto', padding:'0 24px', textAlign:'center' }}>
        <motion.div {...fadeUp(0)}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, borderRadius:99, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', padding:'6px 14px', fontSize:11, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--muted2)', marginBottom:20 }}>What NutriAI does</div>
          <h2 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'clamp(36px,4.5vw,52px)', letterSpacing:'-1px', marginBottom:14 }}>Every tool you need.</h2>
          <p style={{ fontSize:16, fontWeight:300, color:'var(--muted)', maxWidth:480, margin:'0 auto 60px', lineHeight:1.7 }}>From snap to insight in under 3 seconds. No manual logging. No guesswork.</p>
        </motion.div>

        <div className="bento-grid" style={{ display:'grid', gridTemplateColumns:'repeat(12,1fr)', gap:16 }}>

          {/* Card 1 — AI Recognition */}
          <motion.div {...fadeUp(0)} className="feat-card lime" style={{ gridColumn:'span 7' }}>
            <div style={{ background:'#06060A', borderRadius:14, padding:14, position:'relative', overflow:'hidden', minHeight:120, marginBottom:0 }}>
              <div className="scan-line" />
              <div className="scan-line" />
              <div className="scan-line" />
              <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  {dot:'var(--lime)',name:'Grilled Chicken Breast',portion:'~180g',conf:'97% sure',med:false},
                  {dot:'var(--cyan)',name:'Brown Rice (cooked)',portion:'~140g',conf:'94% sure',med:false},
                  {dot:'var(--amber)',name:'Extra Virgin Olive Oil',portion:'~12ml',conf:'81% sure',med:true},
                ].map((f,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--muted2)', padding:'6px 8px', background:'rgba(255,255,255,0.03)', borderRadius:8, animation:`fadeInUp 0.5s ease both`, animationDelay:`${0.4+i*0.4}s` }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:f.dot, flexShrink:0 }} />
                    <span style={{ flex:1, fontSize:11 }}>{f.name}</span>
                    <span>{f.portion}</span>
                    <span style={{ padding:'2px 7px', borderRadius:99, fontSize:9, fontWeight:500, background: f.med ? 'rgba(255,178,64,0.12)':'rgba(184,255,87,0.12)', color: f.med ? 'var(--amber)':'var(--lime)' }}>{f.conf}</span>
                  </div>
                ))}
              </div>
            </div>
            <h3 style={{ fontFamily:'Syne', fontWeight:700, fontSize:20, marginBottom:8, marginTop:14 }}>Instant AI Recognition</h3>
            <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.7 }}>Claude AI identifies every ingredient in your meal photo with military precision. Sauces, garnishes, cooking methods — nothing escapes it.</p>
          </motion.div>

          {/* Card 2 — Portion */}
          <motion.div {...fadeUp(0.1)} className="feat-card cyan" style={{ gridColumn:'span 5' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, padding:'16px 0' }}>
              <svg width="48" height="56" viewBox="0 0 48 56" fill="none" aria-label="Fist illustration">
                <rect x="8" y="20" width="10" height="28" rx="5" fill="rgba(87,217,255,0.15)" stroke="var(--cyan)" strokeWidth="1.5"/>
                <rect x="18" y="14" width="10" height="34" rx="5" fill="rgba(87,217,255,0.15)" stroke="var(--cyan)" strokeWidth="1.5"/>
                <rect x="28" y="17" width="10" height="31" rx="5" fill="rgba(87,217,255,0.15)" stroke="var(--cyan)" strokeWidth="1.5"/>
                <rect x="6" y="30" width="10" height="18" rx="5" fill="rgba(87,217,255,0.1)" stroke="var(--cyan)" strokeWidth="1" opacity=".6"/>
              </svg>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontFamily:'Syne', fontWeight:700, fontSize:18, color:'var(--cyan)' }}>1 fist</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>≈ 240ml / 1 cup</div>
              </div>
            </div>
            <h3 style={{ fontFamily:'Syne', fontWeight:700, fontSize:20, marginBottom:8, marginTop:14 }}>Portion Intelligence</h3>
            <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.7 }}>Your fist is the ruler. Include it in the frame — we calculate portion sizes with ±15% accuracy without any measuring tools.</p>
          </motion.div>

          {/* Card 3 — Macros */}
          <motion.div {...fadeUp(0.2)} className="feat-card pink" style={{ gridColumn:'span 5' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:10, padding:'12px 0' }}>
              {[['Protein','68g','var(--lime)','75%'],['Carbohydrates','142g','var(--cyan)','57%'],['Fats','41g','var(--pink)','45%'],['Fiber','8g','var(--amber)','32%']].map(([n,v,c,w])=>(
                <div key={n}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                    <span style={{ color:'var(--muted2)' }}>{n}</span>
                    <span style={{ color:c }}>{v}</span>
                  </div>
                  <div style={{ height:4, borderRadius:99, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                    <div className="mbar-fill" style={{ '--w': w, background: c }} />
                  </div>
                </div>
              ))}
            </div>
            <h3 style={{ fontFamily:'Syne', fontWeight:700, fontSize:20, marginBottom:8, marginTop:14 }}>Real-time Macros</h3>
            <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.7 }}>Every gram tracked. Protein, carbs, fats, fiber — calculated automatically from a single photo.</p>
          </motion.div>

          {/* Card 4 — Health Score */}
          <motion.div {...fadeUp(0.3)} className="feat-card amber" style={{ gridColumn:'span 7' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'12px 0', position:'relative' }}>
              <svg width="110" height="110" viewBox="0 0 110 110" aria-label="Health score donut chart showing 8.4 out of 10">
                <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(184,255,87,0.1)" strokeWidth="12"/>
                <circle className="donut-prog" cx="55" cy="55" r="45" fill="none" stroke="var(--lime)" strokeWidth="12" strokeLinecap="round" transform="rotate(-90 55 55)"/>
              </svg>
              <div style={{ position:'absolute', textAlign:'center' }}>
                <div style={{ fontFamily:'Syne', fontWeight:800, fontSize:26, color:'var(--lime)', lineHeight:1 }}>8.4</div>
                <div style={{ fontSize:11, color:'var(--muted)' }}>/10</div>
              </div>
            </div>
            <h3 style={{ fontFamily:'Syne', fontWeight:700, fontSize:20, marginBottom:8, marginTop:14 }}>Daily Health Score</h3>
            <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.7 }}>One number that summarizes your entire day's nutrition — personalized to your goals, conditions, and activity level.</p>
          </motion.div>

          {/* Card 5 — AI Coach */}
          <motion.div {...fadeUp(0.4)} className="feat-card lime" style={{ gridColumn:'span 12' }}>
            <div className="coach-split" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28, alignItems:'center' }}>
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, borderRadius:99, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', padding:'6px 14px', fontSize:11, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--muted2)', marginBottom:16 }}>AI Coaching</div>
                <h3 style={{ fontFamily:'Syne', fontWeight:700, fontSize:26, marginBottom:10 }}>Your personal<br/>nutrition coach.</h3>
                <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.7, maxWidth:380 }}>Not just data — actual advice. NutriAI coaches you like a personal nutritionist who knows your body, goals, conditions, and preferences.</p>
                <a href="/register" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--lime)', fontSize:14, textDecoration:'none', marginTop:18, fontWeight:500 }}>Learn more →</a>
              </div>
              <CoachChat />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const HowItWorksSection = () => {
  const steps = [
    { num:'01', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2" aria-label="Camera"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>, heading:'Snap your meal', body:'Take a photo of anything you eat. Include your fist in frame for accurate portion sizing. Any lighting, any angle.' },
    { num:'02', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2" aria-label="AI sparkle"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>, heading:'AI does the work', body:'Claude AI identifies every food item, estimates quantities, and calculates full nutritional data instantly — under 3 seconds.' },
    { num:'03', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2" aria-label="Growth chart"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>, heading:'Get coached', body:'Receive personalized health scores, macro insights, and practical advice tailored to your goals, conditions, and lifestyle.' },
  ]
  return (
    <section id="how-it-works" style={{ padding:'100px 0' }}>
      <div style={{ maxWidth:1120, margin:'0 auto', padding:'0 24px', textAlign:'center' }}>
        <motion.div {...fadeUp(0)}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, borderRadius:99, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', padding:'6px 14px', fontSize:11, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--muted2)', marginBottom:20 }}>How it works</div>
          <h2 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'clamp(36px,4.5vw,52px)', letterSpacing:'-1px' }}>Three steps to better eating.</h2>
        </motion.div>
        <div className="steps-row" style={{ display:'grid', gridTemplateColumns:'1fr 40px 1fr 40px 1fr', gap:0, alignItems:'center', marginTop:60 }}>
          {steps.map((s,i) => (
            <motion.div key={s.num} style={{ display: 'contents' }}>
              <motion.div {...fadeUp(i*0.12)} className="step-card">
                <div style={{ fontFamily:'Syne', fontWeight:800, fontSize:72, color:'rgba(184,255,87,0.1)', lineHeight:1, marginBottom:16 }}>{s.num}</div>
                <div style={{ width:48, height:48, borderRadius:14, background:'var(--lime-dim)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>{s.icon}</div>
                <h3 style={{ fontFamily:'Syne', fontWeight:700, fontSize:20, marginBottom:10 }}>{s.heading}</h3>
                <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.7 }}>{s.body}</p>
              </motion.div>
              {i < 2 && <div className="step-arrow" style={{ display:'flex', alignItems:'center', justifyContent:'center', color:'var(--lime)', fontSize:24 }}>→</div>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const StatsBar = () => {
  const stats = [
    ['50K+','Active users','var(--lime)'],
    ['2.3M+','Meals analyzed','var(--cyan)'],
    ['97%','Accuracy rate','var(--lime)'],
    ['4.9★','App store rating','var(--amber)'],
    ['<3s','Analysis time','var(--cyan)'],
    ['#1','Nutrition AI app','var(--lime)'],
  ]
  return (
    <div style={{ padding:'60px 0', background:'linear-gradient(90deg,rgba(184,255,87,0.03),rgba(87,217,255,0.03))', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
      <div style={{ display:'flex', justifyContent:'space-around', alignItems:'center', flexWrap:'wrap', gap:24, maxWidth:1000, margin:'0 auto', padding:'0 24px' }}>
        {stats.map(([n,l,c])=>(
          <motion.div key={n} {...fadeUp(0)} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'Syne', fontWeight:800, fontSize:'clamp(28px,3vw,36px)', lineHeight:1, color:c }}>{n}</div>
            <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>{l}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TestimonialsSection = () => {
  const cards = [
    { init:'SK', name:'Sarah K.', role:'Product Designer', quote:'I lost 8kg in 3 months without counting calories manually. NutriAI just works. The AI accuracy is genuinely shocking.' },
    { init:'MT', name:'Marcus T.', role:'Software Engineer', quote:'As a Type 2 diabetic, the glucose alerts and carb tracking have been life-changing. My doctor is genuinely impressed with my progress.' },
    { init:'PM', name:'Priya M.', role:'Personal Trainer', quote:"I've tried every food tracking app. Nothing comes close to the AI accuracy here. My clients use it too now. This is the future of nutrition." },
  ]
  return (
    <section id="testimonials" style={{ padding:'100px 0' }}>
      <div style={{ maxWidth:1120, margin:'0 auto', padding:'0 24px', textAlign:'center' }}>
        <motion.div {...fadeUp(0)}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, borderRadius:99, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', padding:'6px 14px', fontSize:11, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--muted2)', marginBottom:20 }}>Real results</div>
          <h2 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'clamp(36px,4.5vw,48px)', letterSpacing:'-1px' }}>Real people. Real results.</h2>
        </motion.div>
        <div className="testi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginTop:60 }}>
          {cards.map((c,i)=>(
            <motion.div key={c.name} {...fadeUp(i*0.1)} className="testi-card">
              <div style={{ fontFamily:'Syne', fontWeight:800, fontSize:64, color:'rgba(184,255,87,0.12)', lineHeight:0.8, marginBottom:14 }}>"</div>
              <p style={{ fontStyle:'italic', fontSize:15, fontWeight:300, color:'#EEEEF5', lineHeight:1.7, marginBottom:20, paddingBottom:20, borderBottom:'1px solid var(--border)' }}>{c.quote}</p>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--lime-dim)', border:'1px solid rgba(184,255,87,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne', fontWeight:700, fontSize:13, color:'var(--lime)', flexShrink:0 }}>{c.init}</div>
                <div>
                  <div style={{ fontWeight:500, fontSize:14, color:'#EEEEF5' }}>{c.name}</div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginTop:1 }}>{c.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
const PricingSection = () => {
  const [annual, setAnnual] = useState(false)

  const plans = [
    {
      name:'Free', price:'₹0', period:'forever', featured:false, btnClass:'btn-outline', btnText:'Get started',
      features:[
        {ok:true,text:'5 scans per day'},
        {ok:true,text:'Basic macro tracking'},
        {ok:true,text:'7-day history'},
        {ok:false,text:'AI Coach'},
        {ok:false,text:'Health conditions'},
        {ok:false,text:'Micronutrient tracking'},
      ],
    },
    {
      name:'Pro', price: annual ? '₹599' : '₹999', period:`/month${annual?' · billed annually':''}`, featured:true, btnClass:'btn-gradient', btnText:'Start free trial',
      features:[
        {ok:true,text:'Unlimited scans'},
        {ok:true,text:'Full macro + micronutrient tracking'},
        {ok:true,text:'AI Health Score daily'},
        {ok:true,text:'Personal AI Coach'},
        {ok:true,text:'Health condition integration'},
        {ok:true,text:'90-day history + weekly reports'},
      ],
    },
    {
      name:'Team', price:'₹2999', period:'/month', featured:false, btnClass:'btn-outline-lime', btnText:'Contact sales',
      features:[
        {ok:true,text:'Everything in Pro'},
        {ok:true,text:'Up to 5 family members'},
        {ok:true,text:'Shared meal tracking'},
        {ok:true,text:'Nutritionist dashboard'},
        {ok:true,text:'Priority support'},
        {ok:true,text:'Custom calorie targets per member'},
      ],
    },
  ]

  return (
    <section id="pricing" style={{ padding:'100px 0' }}>
      <div style={{ maxWidth:1120, margin:'0 auto', padding:'0 24px', textAlign:'center' }}>
        <motion.div {...fadeUp(0)}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, borderRadius:99, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', padding:'6px 14px', fontSize:11, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--muted2)', marginBottom:20 }}>Pricing</div>
          <h2 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'clamp(36px,4.5vw,48px)', letterSpacing:'-1px', marginBottom:10 }}>Simple pricing.</h2>
          <p style={{ fontSize:16, fontWeight:300, color:'var(--muted)', marginBottom:0 }}>Start free. Upgrade when you're ready.</p>
        </motion.div>

        {/* Toggle */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:24, marginBottom:52 }}>
          <span style={{ fontSize:14, color: annual ? 'var(--muted)' : '#EEEEF5' }}>Monthly</span>
          <div className={`toggle-track ${annual ? 'on' : ''}`} onClick={() => setAnnual(!annual)} role="switch" aria-checked={annual} aria-label="Annual billing">
            <div className="toggle-thumb" />
          </div>
          <span style={{ fontSize:14, color: annual ? '#EEEEF5' : 'var(--muted)' }}>Annual</span>
          {annual && <span style={{ padding:'3px 10px', borderRadius:99, background:'rgba(184,255,87,0.12)', color:'var(--lime)', fontSize:11, fontWeight:500 }}>Save 40%</span>}
        </div>

        <div className="pricing-cards" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, alignItems:'stretch' }}>
          {plans.map((p,i) => (
            <motion.div key={p.name} {...fadeUp(i*0.1)} className={`price-card ${p.featured ? 'featured' : ''}`}>
              {p.featured && <div style={{ position:'absolute', top:20, right:20, padding:'4px 12px', borderRadius:99, background:'var(--lime)', color:'#06060A', fontFamily:'Syne', fontWeight:700, fontSize:11 }}>Most popular</div>}
              <div style={{ fontFamily:'Syne', fontWeight:700, fontSize:14, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>{p.name}</div>
              <div style={{ fontFamily:'Syne', fontWeight:800, fontSize:40, color:'#EEEEF5', lineHeight:1, marginBottom:4 }}>
                {p.price}<span style={{ fontSize:18, fontWeight:400, color:'var(--muted)' }}></span>
              </div>
              <div style={{ fontSize:13, color:'var(--muted)', marginBottom:24 }}>{p.period}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28, paddingBottom:24, borderBottom:'1px solid var(--border)', minHeight:220 }}>
                {p.features.map(f => (
                  <div key={f.text} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color: f.ok ? '#EEEEF5' : 'var(--muted)', opacity: f.ok ? 1 : 0.45 }}>
                    <div style={{ width:16, height:16, borderRadius:'50%', background: f.ok ? 'var(--lime-dim)' : 'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {f.ok
                        ? <svg width="8" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="var(--lime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round"/></svg>
                      }
                    </div>
                    {f.text}
                  </div>
                ))}
              </div>
              <Link to="/register" className={p.btnClass}>{p.btnText}</Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
const FinalCTA = () => {
  const particles = [
    {size:6,top:'12%',left:'8%',delay:0,anim:'particleA'},
    {size:4,top:'20%',right:'12%',delay:0.5,anim:'particleB'},
    {size:8,bottom:'18%',left:'14%',delay:1,anim:'particleC'},
    {size:5,top:'40%',right:'6%',delay:0.8,anim:'particleA'},
    {size:6,bottom:'30%',right:'18%',delay:0.3,anim:'particleB'},
    {size:4,top:'60%',left:'6%',delay:1.2,anim:'particleC'},
    {size:7,top:'8%',left:'45%',delay:0.6,anim:'particleA'},
    {size:5,bottom:'10%',right:'40%',delay:0.9,anim:'particleB'},
  ]

  return (
    <section style={{ padding:'100px 0' }}>
      <div style={{ maxWidth:820, margin:'0 auto', padding:'0 24px' }}>
        <motion.div {...fadeUp(0)} style={{
          background:'linear-gradient(135deg,rgba(184,255,87,0.06),rgba(87,217,255,0.06))',
          border:'1px solid rgba(184,255,87,0.14)', borderRadius:32, padding:'80px 40px',
          textAlign:'center', position:'relative', overflow:'hidden',
        }}>
          {particles.map((p,i)=>(
            <div key={i} style={{
              position:'absolute', borderRadius:'50%', background:'var(--lime)', pointerEvents:'none', opacity:0.35,
              width:p.size, height:p.size, top:p.top, left:p.left, right:p.right, bottom:p.bottom,
              animation:`${p.anim} ${3+i*0.4}s ease-in-out infinite`,
              animationDelay:`${p.delay}s`,
            }} />
          ))}
          <h2 style={{ fontFamily:'Syne', fontWeight:800, fontSize:'clamp(32px,5vw,52px)', letterSpacing:'-1px', marginBottom:16 }}>Start eating smarter today.</h2>
          <p style={{ fontSize:16, fontWeight:300, color:'var(--muted)', maxWidth:500, margin:'0 auto 36px', lineHeight:1.7 }}>Join 50,000 people who've transformed their health with AI-powered nutrition coaching.</p>
          <Link to="/register" style={{
            display:'inline-flex', alignItems:'center', height:52, padding:'0 32px', borderRadius:99,
            background:'linear-gradient(135deg,var(--lime),var(--cyan))', color:'#06060A',
            fontFamily:'Syne', fontWeight:700, fontSize:15, textDecoration:'none',
            transition:'transform 200ms, box-shadow 200ms',
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.04)';e.currentTarget.style.boxShadow='0 0 40px rgba(184,255,87,0.35)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='none'}}
          >Start for free →</Link>
          <div style={{ fontSize:13, color:'var(--muted)', marginTop:16 }}>No credit card required · Free forever plan · Cancel anytime</div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => {
  const cols = [
    { heading:'Product', links:['Features','How it works','Pricing','Changelog'] },
    { heading:'Company', links:['About','Blog','Careers','Press'] },
    { heading:'Legal', links:['Privacy','Terms','Cookie Policy','GDPR'] },
  ]
  return (
    <footer style={{ padding:'60px 0 36px', borderTop:'1px solid var(--border)' }}>
      <div style={{ maxWidth:1120, margin:'0 auto', padding:'0 24px' }}>
        <div className="footer-grid" style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr 1fr', gap:40, marginBottom:40 }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, textDecoration: 'none' }}>
              <div style={{ width:32, height:32, background:'var(--lime)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontFamily:'Syne', fontWeight:800, fontSize:17, color:'#06060A' }}>N</span>
              </div>
              <span style={{ fontFamily:'Syne', fontWeight:700, fontSize:16, color:'#EEEEF5' }}>NutriAI</span>
            </Link>
            <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6, maxWidth:220, marginBottom:14 }}>Your AI nutrition coach. Snap, analyze, and improve — one meal at a time.</p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, border:'1px solid rgba(255,255,255,0.1)', borderRadius:99, padding:'5px 12px', fontSize:11, color:'var(--muted)' }}>
              ⚡ Powered by NutriAI
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.heading}>
              <div style={{ fontFamily:'Syne', fontWeight:700, fontSize:13, color:'#EEEEF5', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.06em' }}>{col.heading}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {col.links.map(l=>(
                  <a key={l} href="#" className="footer-link">{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:28, borderTop:'1px solid var(--border)', flexWrap:'wrap', gap:12 }}>
          <div style={{ fontSize:13, color:'var(--muted)' }}>© 2026 NutriAI Inc. All rights reserved.</div>
          <div style={{ display:'flex', gap:14 }}>
            {/* Twitter/X */}
            <button className="social-icon-btn" aria-label="Twitter/X">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            {/* Instagram */}
            <button className="social-icon-btn" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </button>
            {/* LinkedIn */}
            <button className="social-icon-btn" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
const LandingPage = () => {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <CustomCursor />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsBar />
        <TestimonialsSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}

export default LandingPage