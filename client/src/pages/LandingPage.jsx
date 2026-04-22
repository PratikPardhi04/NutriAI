import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

const googleFontsImport = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
`;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(!!media.matches);
    onChange();
    if (media.addEventListener) media.addEventListener('change', onChange);
    else media.addListener(onChange);
    return () => {
      if (media.removeEventListener) media.removeEventListener('change', onChange);
      else media.removeListener(onChange);
    };
  }, []);

  return reduced;
}

function useSmoothScroll() {
  return (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

function InlineIcon({ name, className = 'w-5 h-5', title }) {
  const common = {
    className,
    role: 'img',
    'aria-label': title || name,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
  };

  if (name === 'hamburger') {
    return (
      <svg {...common}>
        <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'x') {
    return (
      <svg {...common}>
        <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'arrowRight') {
    return (
      <svg {...common}>
        <path d="M5 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === 'play') {
    return (
      <svg {...common}>
        <path
          d="M10 8.2v7.6a1 1 0 0 0 1.52.86l6.2-3.8a1 1 0 0 0 0-1.72l-6.2-3.8A1 1 0 0 0 10 8.2Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (name === 'camera') {
    return (
      <svg {...common}>
        <path d="M7 7h2l1-2h4l1 2h2a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (name === 'sparkle') {
    return (
      <svg {...common}>
        <path d="M12 2l1.4 5.3L19 9l-5.6 1.7L12 16l-1.4-5.3L5 9l5.6-1.7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M5 3l.6 2.2L8 6l-2.4.8L5 9l-.6-2.2L2 6l2.4-.8L5 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" opacity="0.6" />
      </svg>
    );
  }

  if (name === 'chartUp') {
    return (
      <svg {...common}>
        <path d="M4 18V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 14l4-4 3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === 'signal') {
    return (
      <svg {...common}>
        <path d="M4 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 18h2V14H8v4Z" fill="currentColor" opacity="0.7" />
        <path d="M12 18h2V10h-2v8Z" fill="currentColor" opacity="0.8" />
        <path d="M16 18h2V6h-2v12Z" fill="currentColor" />
      </svg>
    );
  }

  if (name === 'battery') {
    return (
      <svg {...common}>
        <path d="M3 9h15a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3V9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M20 12h1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 11.3h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'star') {
    return (
      <svg {...common}>
        <path
          d="M12 2.4l2.7 6 6.5.6-4.9 4.2 1.5 6.3L12 16.5 6.2 19.5l1.5-6.3L2.8 9l6.5-.6L12 2.4Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (name === 'check') {
    return (
      <svg {...common}>
        <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === 'twitter') {
    return (
      <svg {...common}>
        <path
          d="M18.8 3.6h2.2l-4.9 5.6 5.8 7.6h-4.5l-3.5-4.5-4 4.5H7.8l5.3-6-5.5-7.7h4.6l3.2 4.2 3.4-3.7ZM18 15.3h1.2L11 4.4H9.7L18 15.3Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (name === 'instagram') {
    return (
      <svg {...common}>
        <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z" stroke="currentColor" strokeWidth="2" />
        <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" stroke="currentColor" strokeWidth="2" />
        <path d="M17.6 6.4h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'linkedin') {
    return (
      <svg {...common}>
        <path d="M6.5 9.2V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6.5 6.2h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M10.2 18V9.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10.2 12.2c.7-1.8 2.2-3 4.2-3 2.6 0 3.9 1.7 3.9 4.8V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return null;
}

const CustomCursor = React.memo(function CustomCursor({ enabled }) {
  const dotRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    if (!dot) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;

    const onMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      dot.style.transform = `translate3d(${x - 6}px, ${y - 6}px, 0)`;
      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[999] h-3 w-3 rounded-full bg-[rgba(184,255,87,0.6)] mix-blend-screen"
    />
  );
});

const OrbsBackground = React.memo(function OrbsBackground({ reducedMotion }) {
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  useEffect(() => {
    if (reducedMotion) return;

    const o1 = orb1Ref.current;
    const o2 = orb2Ref.current;
    const o3 = orb3Ref.current;
    if (!o1 || !o2 || !o3) return;

    let raf = 0;
    let mx = 0;
    let my = 0;

    const onMove = (e) => {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      mx = dx;
      my = dy;
    };

    const tick = () => {
      o1.style.transform = `translate3d(${mx * 0.02}px, ${my * 0.02}px, 0)`;
      o2.style.transform = `translate3d(${mx * -0.015}px, ${my * 0.012}px, 0)`;
      o3.style.transform = `translate3d(${mx * 0.01}px, ${my * -0.012}px, 0)`;
      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div
        ref={orb1Ref}
        className="absolute left-[-200px] top-[-200px] h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(184,255,87,0.08) 0%, transparent 70%)',
        }}
      />
      <div
        ref={orb2Ref}
        className="absolute right-[-300px] top-[40%] h-[800px] w-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(87,217,255,0.06) 0%, transparent 70%)',
        }}
      />
      <div
        ref={orb3Ref}
        className="absolute bottom-[10%] left-[20%] h-[500px] w-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,111,190,0.05) 0%, transparent 70%)',
        }}
      />
    </div>
  );
});

const Navbar = React.memo(function Navbar({ reducedMotion }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollTo = useSmoothScroll();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const bgCls = isScrolled
    ? 'bg-[rgba(6,6,10,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]'
    : 'bg-transparent';

  const mobileMenuMotion = reducedMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      };

  return (
    <nav className={`sticky top-0 z-50 transition-colors duration-200 ${bgCls}`}>
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#B8FF57] font-[Syne] text-[20px] font-extrabold text-[#06060A]">
            N
          </div>
          <div className="font-[Syne] text-[18px] font-bold text-[#EEEEF5]">NutriAI</div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#features"
            onClick={scrollTo('features')}
            className="rounded-full px-3 py-2 font-[DM\ Sans] text-[14px] font-normal text-[#6B7280] transition-colors duration-150 hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={scrollTo('how-it-works')}
            className="rounded-full px-3 py-2 font-[DM\ Sans] text-[14px] font-normal text-[#6B7280] transition-colors duration-150 hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
          >
            How it works
          </a>
          <a
            href="#pricing"
            onClick={scrollTo('pricing')}
            className="rounded-full px-3 py-2 font-[DM\ Sans] text-[14px] font-normal text-[#6B7280] transition-colors duration-150 hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
          >
            Pricing
          </a>
          <a
            href="#about"
            onClick={scrollTo('about')}
            className="rounded-full px-3 py-2 font-[DM\ Sans] text-[14px] font-normal text-[#6B7280] transition-colors duration-150 hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
          >
            About
          </a>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/login"
            className="rounded-full px-2 py-2 font-[DM\ Sans] text-[14px] font-normal text-[#6B7280] transition-colors duration-150 hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
          >
            Sign in
          </Link>
          <motion.div whileHover={reducedMotion ? undefined : { scale: 1.03 }} transition={{ duration: 0.2 }}>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#B8FF57,#57D9FF)] px-5 py-[10px] font-[Syne] text-[13px] font-bold text-[#06060A] shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
            >
              Get started free
            </Link>
          </motion.div>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(15,15,26,0.55)] p-2 text-[#EEEEF5] backdrop-blur-xl md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
        >
          <InlineIcon name={open ? 'x' : 'hamburger'} className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            {...mobileMenuMotion}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:hidden"
          >
            <div className="mx-auto max-w-[1100px] px-4 pb-4">
              <div className="rounded-[22px] border border-[rgba(255,255,255,0.06)] bg-[#0F0F1A] p-3">
                <button
                  type="button"
                  onClick={(e) => {
                    scrollTo('features')(e);
                    setOpen(false);
                  }}
                  className="block w-full rounded-xl px-3 py-3 text-left font-[DM\ Sans] text-[14px] text-[#9CA3AF] hover:bg-[#16162A] hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
                >
                  Features
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    scrollTo('how-it-works')(e);
                    setOpen(false);
                  }}
                  className="block w-full rounded-xl px-3 py-3 text-left font-[DM\ Sans] text-[14px] text-[#9CA3AF] hover:bg-[#16162A] hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
                >
                  How it works
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    scrollTo('pricing')(e);
                    setOpen(false);
                  }}
                  className="block w-full rounded-xl px-3 py-3 text-left font-[DM\ Sans] text-[14px] text-[#9CA3AF] hover:bg-[#16162A] hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
                >
                  Pricing
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    scrollTo('about')(e);
                    setOpen(false);
                  }}
                  className="block w-full rounded-xl px-3 py-3 text-left font-[DM\ Sans] text-[14px] text-[#9CA3AF] hover:bg-[#16162A] hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
                >
                  About
                </button>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-[rgba(255,255,255,0.10)] bg-transparent px-4 py-3 font-[DM\ Sans] text-[14px] text-[#EEEEF5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#B8FF57,#57D9FF)] px-4 py-3 font-[Syne] text-[13px] font-bold text-[#06060A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
                  >
                    Get started
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
});

const HeroPhone = React.memo(function HeroPhone({ reducedMotion }) {
  const [tilt, setTilt] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      setTilt(x * 6);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [reducedMotion]);

  const floatAnim = reducedMotion
    ? undefined
    : {
        y: [0, -14, 0],
        transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
      };

  return (
    <div className="relative mx-auto mt-14 flex w-full max-w-[380px] justify-center">
      <div
        className="pointer-events-none absolute -bottom-10 left-1/2 h-[200px] w-[400px] -translate-x-1/2 rounded-full blur-[40px]"
        style={{ background: 'radial-gradient(ellipse, rgba(184,255,87,0.15) 0%, transparent 70%)' }}
      />

      <motion.div
        animate={floatAnim}
        className="relative"
        style={{ transform: `perspective(1200px) rotateY(${tilt}deg)` }}
      >
        <div className="h-[660px] w-[320px] rounded-[44px] border border-[rgba(255,255,255,0.12)] bg-[#0F0F1A] p-[10px] shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
          <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#06060A]">
            <div className="absolute left-1/2 top-3 h-[28px] w-[120px] -translate-x-1/2 rounded-full bg-[#06060A]" />

            <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 pt-4 text-[12px] text-[#6B7280]">
              <div className="font-[DM\ Sans]">9:41</div>
              <div className="flex items-center gap-2">
                <InlineIcon name="signal" className="h-4 w-4" />
                <InlineIcon name="battery" className="h-4 w-4" />
              </div>
            </div>

            <div className="absolute left-1/2 top-[54px] w-[84%] -translate-x-1/2">
              <div className="rounded-[20px] border border-[rgba(184,255,87,0.15)] bg-[#10101C] p-4">
                <div className="text-[9px] font-medium tracking-[0.24em] text-[#6B7280]">HEALTH SCORE</div>
                <div className="mt-2 flex items-end gap-2">
                  <div className="font-[Syne] text-[48px] font-extrabold leading-none text-[#B8FF57]">8.4</div>
                  <div className="pb-[6px] font-[DM\ Sans] text-[20px] text-[#6B7280]">/10</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="rounded-full bg-[rgba(184,255,87,0.10)] px-3 py-[6px] text-[11px] text-[#B8FF57]">
                    Protein <span className="ml-1">✓</span>
                  </div>
                  <div className="rounded-full bg-[rgba(255,111,190,0.10)] px-3 py-[6px] text-[11px] text-[#FF6FBE]">Fiber low</div>
                  <div className="rounded-full bg-[rgba(255,178,64,0.10)] px-3 py-[6px] text-[11px] text-[#FFB240]">On track</div>
                </div>
              </div>
            </div>

            <div className="absolute left-1/2 top-[226px] w-[86%] -translate-x-1/2">
              <div className="rounded-[20px] bg-[linear-gradient(135deg,rgba(15,24,15,1),rgba(10,18,24,1))] p-[14px] shadow-[0_0_0_1px_rgba(184,255,87,0.2)_inset]">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={
                      reducedMotion
                        ? undefined
                        : {
                            scale: [1, 1.08, 1],
                            transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                          }
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(184,255,87,0.12)] text-[#B8FF57]"
                  >
                    <InlineIcon name="camera" className="h-5 w-5" />
                  </motion.div>
                  <div>
                    <div className="font-[Syne] text-[15px] font-bold text-[#EEEEF5]">Scan your meal</div>
                    <div className="font-[DM\ Sans] text-[12px] text-[#6B7280]">AI instantly calculates macros</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-[316px] left-1/2 w-[88%] -translate-x-1/2">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0F0F1A] p-3">
                  <div className="text-[10px] text-[#6B7280]">Protein</div>
                  <div className="mt-1 font-[Syne] text-[16px] font-extrabold text-[#B8FF57]">132g</div>
                  <div className="mt-2 h-[4px] w-full rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div className="h-full w-[78%] rounded-full bg-[#B8FF57]" />
                  </div>
                </div>
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0F0F1A] p-3">
                  <div className="text-[10px] text-[#6B7280]">Carbs</div>
                  <div className="mt-1 font-[Syne] text-[16px] font-extrabold text-[#57D9FF]">210g</div>
                  <div className="mt-2 h-[4px] w-full rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div className="h-full w-[62%] rounded-full bg-[#57D9FF]" />
                  </div>
                </div>
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0F0F1A] p-3">
                  <div className="text-[10px] text-[#6B7280]">Fats</div>
                  <div className="mt-1 font-[Syne] text-[16px] font-extrabold text-[#FF6FBE]">64g</div>
                  <div className="mt-2 h-[4px] w-full rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div className="h-full w-[52%] rounded-full bg-[#FF6FBE]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Bar Graph */}
            <div className="absolute left-1/2 top-[420px] w-[88%] -translate-x-1/2">
              <div className="flex justify-between items-end mb-2 px-1">
                <div className="font-[Syne] font-bold text-[#EEEEF5] text-[14px]">This week</div>
                <div className="font-[DM\ Sans] text-[#6B7280] text-[10px]">Apr 16 – Apr 22</div>
              </div>
              <div className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#0F0F1A] p-4 pt-6">
                <div className="flex justify-between items-end h-[60px] border-b border-[rgba(255,255,255,0.06)] pb-2 relative">
                  <div className="w-[12%] bg-[#FF6FBE] rounded-t-[4px] h-[10%] opacity-20" />
                  <div className="w-[12%] bg-[#FF6FBE] rounded-t-[4px] h-[30%] opacity-20" />
                  <div className="w-[12%] bg-[#FF6FBE] rounded-t-[4px] h-[20%] opacity-20" />
                  <div className="w-[12%] bg-[#FF6FBE] rounded-t-[4px] h-[50%] opacity-20" />
                  <div className="w-[12%] bg-[#FF6FBE] rounded-t-[4px] h-[40%] opacity-20" />
                  <div className="w-[12%] bg-[#FF6FBE] rounded-t-[4px] h-[80%] opacity-20" />
                  <div className="w-[12%] bg-[#FF6FBE] rounded-t-[4px] h-[100%]" />
                </div>
                <div className="flex justify-between mt-2 px-1">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day,i) => (
                    <div key={day} className={`text-[8.5px] font-[DM\ Sans] ${i===6 ? 'text-[#EEEEF5]' : 'text-[#6B7280]'}`}>{day}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Bottom Nav */}
            <div className="absolute bottom-0 left-0 right-0 h-[64px] border-t border-[rgba(255,255,255,0.06)] bg-[#080810] flex justify-around items-center px-4 z-10">
              <div className="flex flex-col items-center gap-1 text-[#B8FF57]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span className="text-[10px] font-medium mt-[2px] font-[DM\ Sans]">Home</span>
              </div>
              
              <div className="relative -top-[14px]">
                <div className="h-[46px] w-[46px] rounded-full bg-[#B8FF57] flex items-center justify-center text-[#06060A] shadow-[0_4px_16px_rgba(184,255,87,0.3)]">
                  <InlineIcon name="camera" className="h-5 w-5" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 text-[#6B7280] relative right-2">
                <InlineIcon name="chartUp" className="h-4 w-4" />
                <span className="text-[10px] font-medium mt-[2px] font-[DM\ Sans]">Reports</span>
              </div>

              <div className="flex flex-col items-center gap-1 text-[#6B7280]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span className="text-[10px] font-medium mt-[2px] font-[DM\ Sans]">Profile</span>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
});

const HeroSection = React.memo(function HeroSection({ reducedMotion }) {
  const container = {
    hidden: {},
    show: {
      transition: reducedMotion ? { staggerChildren: 0 } : { staggerChildren: 0.12 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: reducedMotion ? { duration: 0 } : { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section className="relative min-h-screen px-4 pt-[140px]">
      <motion.div
        variants={container}
        initial={reducedMotion ? 'show' : 'hidden'}
        animate="show"
        className="mx-auto flex max-w-[860px] flex-col items-center text-center"
      >
        <motion.div variants={item} className="inline-flex items-center gap-3 rounded-full border border-[rgba(184,255,87,0.25)] bg-[rgba(184,255,87,0.08)] px-[14px] py-[6px]">
          <motion.div
            animate={
              reducedMotion
                ? undefined
                : {
                    scale: [1, 1.4, 1],
                    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                  }
            }
            className="h-[6px] w-[6px] rounded-full bg-[#B8FF57]"
          />
          <div className="font-[DM\ Sans] text-[13px] font-normal text-[#B8FF57]">AI-Powered Nutrition Intelligence</div>
        </motion.div>

        <motion.h1 variants={item} className="mt-8 font-[Syne] text-[42px] font-extrabold leading-[1.02] text-[#EEEEF5] md:text-[72px]">
          <span className="block">Know exactly</span>
          <span className="block">
            what <span className="bg-[linear-gradient(90deg,#B8FF57,#57D9FF)] bg-clip-text text-transparent">you eat.</span>
          </span>
          <span className="block text-[rgba(238,238,245,0.35)]">Act on it.</span>
        </motion.h1>

        <motion.p variants={item} className="mt-6 max-w-[560px] font-[DM\ Sans] text-[18px] font-light leading-[1.7] text-[#6B7280]">
          Snap a photo of your meal. Claude AI identifies every ingredient, estimates portions using your fist as scale, calculates macros,
          and coaches you toward your goals — all in seconds.
        </motion.p>

        <motion.div variants={item} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-[14px]">
          <motion.div
            whileHover={reducedMotion ? undefined : { scale: 1.04, boxShadow: '0 0 40px rgba(184,255,87,0.30)' }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to="/register"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#B8FF57,#57D9FF)] px-7 font-[Syne] text-[15px] font-bold text-[#06060A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
            >
              Start for free
              <InlineIcon name="arrowRight" className="h-[18px] w-[18px]" />
            </Link>
          </motion.div>

          <motion.button
            type="button"
            whileHover={reducedMotion ? undefined : { scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-transparent px-7 font-[DM\ Sans] text-[15px] font-normal text-[#EEEEF5] transition-colors duration-200 hover:border-[rgba(184,255,87,0.4)] hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
            aria-label="Watch demo"
          >
            Watch demo
            <InlineIcon name="play" className="h-[18px] w-[18px]" />
          </motion.button>
        </motion.div>

        <motion.div variants={item} className="mt-12 flex flex-wrap items-center justify-center gap-6 text-center">
          <div className="flex items-center gap-3">
            <div className="font-[Syne] text-[20px] font-bold text-[#B8FF57]">50K+</div>
            <div className="font-[DM\ Sans] text-[12px] text-[#6B7280]">users</div>
          </div>
          <div className="hidden h-6 w-px bg-[rgba(255,255,255,0.08)] sm:block" />
          <div className="flex items-center gap-3">
            <div className="font-[Syne] text-[20px] font-bold text-[#B8FF57]">4.9</div>
            <div className="flex items-center gap-1 text-[#FFB240]" aria-label="rating">
              <InlineIcon name="star" className="h-4 w-4" />
            </div>
            <div className="font-[DM\ Sans] text-[12px] text-[#6B7280]">rating</div>
          </div>
          <div className="hidden h-6 w-px bg-[rgba(255,255,255,0.08)] sm:block" />
          <div className="flex items-center gap-3">
            <div className="font-[Syne] text-[20px] font-bold text-[#B8FF57]">#1</div>
            <div className="font-[DM\ Sans] text-[12px] text-[#6B7280]">nutrition apps</div>
          </div>
        </motion.div>

        <motion.div variants={item} className="w-full">
          <HeroPhone reducedMotion={reducedMotion} />
        </motion.div>
      </motion.div>
    </section>
  );
});

const SectionPill = React.memo(function SectionPill({ children }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(184,255,87,0.25)] bg-[rgba(184,255,87,0.08)] px-[14px] py-[6px]">
      <div className="h-[6px] w-[6px] rounded-full bg-[#B8FF57]" />
      <div className="font-[DM\ Sans] text-[13px] font-normal text-[#B8FF57]">{children}</div>
    </div>
  );
});

const FeatureCard = React.memo(function FeatureCard({ children, className, delay = 0, reducedMotion }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={reducedMotion ? false : { opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={
        `relative overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[#0F0F1A] p-8 ${className || ''}`
      }
    >
      {children}
    </motion.div>
  );
});

const ScanAnalysisVisual = React.memo(function ScanAnalysisVisual({ reducedMotion }) {
  return (
    <div className="relative mt-6 rounded-2xl border border-[rgba(184,255,87,0.14)] bg-[#06060A] p-5">
      <div className="absolute inset-x-5 top-5 h-px bg-[rgba(255,255,255,0.06)]" />

      <div className="relative h-[150px] overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0F0F1A]">
        <motion.div
          className="absolute left-0 right-0 h-px bg-[#B8FF57]/70"
          animate={
            reducedMotion
              ? undefined
              : {
                  top: ['10%', '90%'],
                  opacity: [0.2, 1, 0.2],
                  transition: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' },
                }
          }
          style={{ top: '10%' }}
        />
        <motion.div
          className="absolute left-0 right-0 h-px bg-[#B8FF57]/50"
          animate={
            reducedMotion
              ? undefined
              : {
                  top: ['0%', '80%'],
                  opacity: [0.1, 0.8, 0.1],
                  transition: { repeat: Infinity, duration: 2.4, ease: 'easeInOut', delay: 0.25 },
                }
          }
          style={{ top: '0%' }}
        />
        <motion.div
          className="absolute left-0 right-0 h-px bg-[#B8FF57]/40"
          animate={
            reducedMotion
              ? undefined
              : {
                  top: ['20%', '100%'],
                  opacity: [0.1, 0.7, 0.1],
                  transition: { repeat: Infinity, duration: 2.4, ease: 'easeInOut', delay: 0.5 },
                }
          }
          style={{ top: '20%' }}
        />

        <div className="absolute left-4 top-4 right-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#06060A]/60 px-3 py-2"
              animate={
                reducedMotion
                  ? undefined
                  : {
                      opacity: [0.25, 1, 0.25],
                      transition: { repeat: Infinity, duration: 3.2, ease: 'easeInOut', delay: i * 0.35 },
                    }
              }
            >
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${i === 2 ? 'bg-[#FFB240]' : 'bg-[#B8FF57]'}`}
                  aria-hidden="true"
                />
                <div className="font-[DM\ Sans] text-[13px] text-[#EEEEF5]">
                  {i === 0 && 'Grilled Chicken'}
                  {i === 1 && 'Brown Rice'}
                  {i === 2 && 'Olive Oil'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-[DM\ Sans] text-[12px] text-[#6B7280]">
                  {i === 0 && '180g'}
                  {i === 1 && '140g'}
                  {i === 2 && '12ml'}
                </div>
                <div
                  className={`rounded-full px-2 py-[3px] text-[11px] ${
                    i === 2
                      ? 'bg-[rgba(255,178,64,0.12)] text-[#FFB240]'
                      : 'bg-[rgba(184,255,87,0.10)] text-[#B8FF57]'
                  }`}
                >
                  {i === 0 && '97%'}
                  {i === 1 && '94%'}
                  {i === 2 && '81%'}
                  <span className="ml-1 hidden sm:inline">confident</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[12px] text-[#6B7280]">
        <div className="h-1.5 w-1.5 rounded-full bg-[#57D9FF]" />
        <div className="font-[DM\ Sans]">Live analysis · updates in real time</div>
      </div>
    </div>
  );
});

const MacroBarsVisual = React.memo(function MacroBarsVisual({ reducedMotion }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const bars = useMemo(
    () => [
      { label: 'Protein', pct: 0.78, color: '#B8FF57' },
      { label: 'Carbs', pct: 0.62, color: '#57D9FF' },
      { label: 'Fats', pct: 0.52, color: '#FF6FBE' },
    ],
    []
  );

  return (
    <div ref={ref} className="mt-6 space-y-4">
      {bars.map((b) => (
        <div key={b.label} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-[DM\ Sans] text-[13px] text-[#9CA3AF]">{b.label}</div>
            <div className="font-[Syne] text-[13px] font-bold text-[#EEEEF5]">{Math.round(b.pct * 100)}%</div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[rgba(255,255,255,0.06)]">
            <motion.div
              initial={reducedMotion ? false : { width: 0 }}
              animate={inView ? { width: `${Math.round(b.pct * 100)}%` } : undefined}
              transition={reducedMotion ? { duration: 0 } : { duration: 1.1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: b.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
});

const DonutVisual = React.memo(function DonutVisual({ reducedMotion }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = 0.84;
  const offset = c * (1 - pct);

  return (
    <div ref={ref} className="mt-6 flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Health score donut" role="img">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#B8FF57"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={reducedMotion ? false : { strokeDashoffset: c }}
          animate={inView ? { strokeDashoffset: offset } : undefined}
          transition={reducedMotion ? { duration: 0 } : { duration: 1.2, ease: 'easeOut' }}
          style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
        />
      </svg>
      <div>
        <div className="font-[Syne] text-[32px] font-extrabold text-[#B8FF57]">8.4/10</div>
        <div className="mt-1 max-w-[240px] font-[DM\ Sans] text-[13px] leading-[1.6] text-[#6B7280]">
          Personalized score based on your goals, activity, and dietary preferences.
        </div>
      </div>
    </div>
  );
});

const CoachChatVisual = React.memo(function CoachChatVisual({ reducedMotion }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setStep(3);
      return;
    }

    let t1 = 0;
    let t2 = 0;
    let t3 = 0;
    setStep(0);
    t1 = window.setTimeout(() => setStep(1), 300);
    t2 = window.setTimeout(() => setStep(2), 900);
    t3 = window.setTimeout(() => setStep(3), 1500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [reducedMotion]);

  const bubble = (show, text, idx) => (
    <AnimatePresence>
      {show && (
        <motion.div
          key={idx}
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }}
          className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#16162A] p-4"
        >
          <div className="text-[12px] font-medium text-[#B8FF57]">NutriAI</div>
          <div className="mt-1 font-[DM\ Sans] text-[13px] leading-[1.6] text-[#EEEEF5]">{text}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="mt-6 space-y-3">
      {bubble(step >= 1, "Great protein day! You're at 89% of your goal.", 1)}
      {bubble(step >= 2, 'Fiber is the only gap — try adding lentils to dinner.', 2)}
      {bubble(step >= 3, "You're on track for your fat loss goal this week. Keep it up!", 3)}
    </div>
  );
});

const FeaturesSection = React.memo(function FeaturesSection({ reducedMotion }) {
  return (
    <section id="features" className="px-4 py-[140px]">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex flex-col items-center text-center">
          <SectionPill>WHAT NUTRIAI DOES</SectionPill>
          <h2 className="mt-6 font-[Syne] text-[36px] font-extrabold leading-[1.1] text-[#EEEEF5] md:text-[52px]">Every tool you need.</h2>
          <p className="mt-4 max-w-[500px] font-[DM\ Sans] text-[16px] font-normal leading-[1.7] text-[#6B7280]">
            From instant scans to daily coaching, NutriAI turns meals into actionable intelligence.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-12 gap-4">
          <FeatureCard className="col-span-12 md:col-span-7 md:row-span-2" delay={0} reducedMotion={reducedMotion}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-[Syne] text-[24px] font-bold text-[#EEEEF5]">Instant AI Recognition</div>
                <div className="mt-2 max-w-[52ch] font-[DM\ Sans] text-[14px] leading-[1.7] text-[#6B7280]">
                  Claude AI identifies every ingredient in your meal photo with military precision.
                </div>
              </div>
              <div className="hidden items-center justify-center rounded-2xl bg-[rgba(184,255,87,0.10)] p-3 text-[#B8FF57] md:flex">
                <InlineIcon name="sparkle" className="h-6 w-6" />
              </div>
            </div>
            <ScanAnalysisVisual reducedMotion={reducedMotion} />
          </FeatureCard>

          <FeatureCard className="col-span-12 md:col-span-5" delay={0.1} reducedMotion={reducedMotion}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-[Syne] text-[20px] font-bold text-[#EEEEF5]">Portion Intelligence</div>
                <div className="mt-2 font-[DM\ Sans] text-[14px] leading-[1.7] text-[#6B7280]">Your fist is the ruler. We calculate the rest.</div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(87,217,255,0.10)] text-[#57D9FF]">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Hand silhouette"
                >
                  <path
                    d="M9 11V7.7c0-1 .8-1.7 1.7-1.7S12.4 6.7 12.4 7.7V11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12.4 11V7.2c0-1 .8-1.7 1.7-1.7s1.7.8 1.7 1.7V12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 11v-1.2c0-1-.8-1.7-1.7-1.7S5.6 8.8 5.6 9.8V14c0 4 2.6 6.2 6.1 6.2 3.9 0 6.7-2.6 6.7-6.7V12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[rgba(87,217,255,0.18)] bg-[#06060A] p-5">
              <div className="font-[Syne] text-[18px] font-bold text-[#57D9FF]">1 fist ≈ 240ml</div>
              <div className="mt-2 font-[DM\ Sans] text-[13px] leading-[1.6] text-[#6B7280]">A simple scale reference built into the scan flow.</div>
            </div>
          </FeatureCard>

          <FeatureCard className="col-span-12 md:col-span-5" delay={0.2} reducedMotion={reducedMotion}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-[Syne] text-[20px] font-bold text-[#EEEEF5]">Real-time Macros</div>
                <div className="mt-2 font-[DM\ Sans] text-[14px] leading-[1.7] text-[#6B7280]">
                  Every gram tracked. Protein, carbs, fats, fiber — all calculated automatically.
                </div>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(255,111,190,0.10)] text-[#FF6FBE] md:flex">
                <InlineIcon name="chartUp" className="h-6 w-6" />
              </div>
            </div>
            <MacroBarsVisual reducedMotion={reducedMotion} />
          </FeatureCard>

          <FeatureCard className="col-span-12 md:col-span-7" delay={0.3} reducedMotion={reducedMotion}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-[Syne] text-[22px] font-bold text-[#EEEEF5]">Daily Health Score</div>
                <div className="mt-2 font-[DM\ Sans] text-[14px] leading-[1.7] text-[#6B7280]">
                  One number that summarizes your entire day's nutrition, personalized to your goals.
                </div>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(255,178,64,0.10)] text-[#FFB240] md:flex">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Donut ring"
                >
                  <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="2" opacity="0.7" />
                  <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <DonutVisual reducedMotion={reducedMotion} />
          </FeatureCard>

          <FeatureCard className="col-span-12" delay={0.4} reducedMotion={reducedMotion}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
              <div>
                <div className="font-[Syne] text-[26px] font-bold text-[#EEEEF5]">Your Personal AI Nutrition Coach</div>
                <div className="mt-3 font-[DM\ Sans] text-[14px] leading-[1.7] text-[#6B7280]">
                  Not just data — actual advice. NutriAI coaches you like a personal nutritionist who knows your body, goals, and preferences.
                </div>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(184,255,87,0.22)] bg-[rgba(184,255,87,0.08)] px-4 py-2 font-[DM\ Sans] text-[13px] text-[#B8FF57] hover:bg-[rgba(184,255,87,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
                >
                  Read more
                  <InlineIcon name="arrowRight" className="h-4 w-4" />
                </button>
              </div>
              <div>
                <CoachChatVisual reducedMotion={reducedMotion} />
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
});

const HowStepCard = React.memo(function HowStepCard({ n, title, body, icon, delay, reducedMotion }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={reducedMotion ? false : { opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#0F0F1A] p-8"
    >
      <div className="absolute -right-4 -top-8 font-[Syne] text-[64px] font-extrabold text-[rgba(184,255,87,0.15)]">{String(n).padStart(2, '0')}</div>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(184,255,87,0.10)] text-[#B8FF57]">{icon}</div>
        <div className="font-[Syne] text-[20px] font-bold text-[#EEEEF5]">{title}</div>
      </div>
      <div className="mt-4 font-[DM\ Sans] text-[14px] leading-[1.7] text-[#6B7280]">{body}</div>
    </motion.div>
  );
});

const HowItWorksSection = React.memo(function HowItWorksSection({ reducedMotion }) {
  return (
    <section id="how-it-works" className="px-4 py-[140px]">
      <div className="mx-auto max-w-[900px]">
        <div className="text-center">
          <h2 className="font-[Syne] text-[36px] font-extrabold leading-[1.1] text-[#EEEEF5] md:text-[52px]">Three steps to better eating.</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
          <HowStepCard
            n={1}
            title="Snap your meal"
            body="Take a photo of anything you eat. Include your fist for accurate portion sizing."
            delay={0}
            reducedMotion={reducedMotion}
            icon={<InlineIcon name="camera" className="h-6 w-6" />}
          />

          <div className="hidden items-center justify-center md:flex">
            <div className="text-[#B8FF57]" aria-hidden="true">
              <InlineIcon name="arrowRight" className="h-6 w-6" />
            </div>
          </div>

          <HowStepCard
            n={2}
            title="AI does the work"
            body="Claude AI identifies every food item, estimates quantities, and calculates full nutritional data instantly."
            delay={0.1}
            reducedMotion={reducedMotion}
            icon={<InlineIcon name="sparkle" className="h-6 w-6" />}
          />

          <div className="hidden items-center justify-center md:flex">
            <div className="text-[#B8FF57]" aria-hidden="true">
              <InlineIcon name="arrowRight" className="h-6 w-6" />
            </div>
          </div>

          <HowStepCard
            n={3}
            title="Get coached"
            body="Receive personalized insights, health scores, and practical advice tailored to your goals and conditions."
            delay={0.2}
            reducedMotion={reducedMotion}
            icon={<InlineIcon name="chartUp" className="h-6 w-6" />}
          />
        </div>
      </div>
    </section>
  );
});

function useCountUp(inView, target, reducedMotion) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, reducedMotion]);

  return value;
}

const StatItem = React.memo(function StatItem({ label, value, color, suffix = '', reducedMotion }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-120px' });
  const v = useCountUp(inView, value, reducedMotion);

  const display = useMemo(() => {
    if (suffix === '+') return `${Math.round(v).toLocaleString()}+`;
    if (suffix === '%') return `${Math.round(v)}%`;
    if (suffix === 's') return `< ${Math.max(1, Math.round(v))}s`;
    return `${Math.round(v)}`;
  }, [v, suffix]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 px-3 py-2">
      <div className="font-[Syne] text-[36px] font-extrabold" style={{ color }}>
        {display}
      </div>
      <div className="font-[DM\ Sans] text-[13px] text-[#6B7280]">{label}</div>
    </div>
  );
});

const StatsBar = React.memo(function StatsBar({ reducedMotion }) {
  return (
    <section className="border-y border-[rgba(255,255,255,0.06)] bg-[linear-gradient(90deg,rgba(184,255,87,0.03),rgba(87,217,255,0.03))] px-4 py-[60px]">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-evenly gap-6">
        <StatItem label="Users active" value={50000} suffix="+" color="#B8FF57" reducedMotion={reducedMotion} />
        <StatItem label="Meals analyzed" value={2300000} suffix="+" color="#57D9FF" reducedMotion={reducedMotion} />
        <StatItem label="Accuracy rate" value={97} suffix="%" color="#B8FF57" reducedMotion={reducedMotion} />
        <StatItem label="App store rating" value={4.9} suffix="" color="#FFB240" reducedMotion={reducedMotion} />
        <StatItem label="Analysis time" value={3} suffix="s" color="#57D9FF" reducedMotion={reducedMotion} />
        <StatItem label="Nutrition AI app" value={1} suffix="" color="#B8FF57" reducedMotion={reducedMotion} />
      </div>
    </section>
  );
});

const TestimonialCard = React.memo(function TestimonialCard({ quote, name, role }) {
  return (
    <div className="group rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-[#0F0F1A] p-7 transition-transform duration-200 hover:-translate-y-1 hover:border-[rgba(184,255,87,0.20)]">
      <div className="font-[Syne] text-[72px] font-extrabold leading-none text-[rgba(184,255,87,0.15)]">“</div>
      <div className="-mt-6 font-[DM\ Sans] text-[15px] italic leading-[1.7] text-[#EEEEF5]">{quote}</div>
      <div className="my-6 h-px bg-[rgba(255,255,255,0.06)]" />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(184,255,87,0.10)] font-[Syne] text-[14px] font-bold text-[#B8FF57]">
          {name
            .split(' ')
            .slice(0, 2)
            .map((p) => p[0])
            .join('')}
        </div>
        <div>
          <div className="font-[Syne] text-[14px] font-bold text-[#EEEEF5]">{name}</div>
          <div className="font-[DM\ Sans] text-[13px] text-[#6B7280]">{role}</div>
        </div>
      </div>
    </div>
  );
});

const TestimonialsSection = React.memo(function TestimonialsSection() {
  return (
    <section id="testimonials" className="px-4 py-[120px]">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center">
          <h2 className="font-[Syne] text-[34px] font-extrabold text-[#EEEEF5] md:text-[48px]">Real people. Real results.</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <TestimonialCard
            quote="I lost 8kg in 3 months without counting calories manually. NutriAI just works."
            name="Sarah K."
            role="Product Designer"
          />
          <TestimonialCard
            quote="As a Type 2 diabetic, the glucose alerts and carb tracking have been life-changing. My doctor is impressed."
            name="Marcus T."
            role="Software Engineer"
          />
          <TestimonialCard
            quote="I've tried every food tracking app. Nothing comes close to the AI accuracy. This is the future."
            name="Priya M."
            role="Personal Trainer"
          />
        </div>
      </div>
    </section>
  );
});

const PricingSection = React.memo(function PricingSection({ reducedMotion }) {
  const [annual, setAnnual] = useState(true);

  const pricePro = annual ? 5.4 : 9;

  return (
    <section id="pricing" className="px-4 py-[120px]">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center">
          <h2 className="font-[Syne] text-[34px] font-extrabold text-[#EEEEF5] md:text-[48px]">Simple pricing.</h2>
          <p className="mt-3 font-[DM\ Sans] text-[16px] text-[#6B7280]">Start free. Upgrade when you're ready.</p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#0F0F1A] p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-2 font-[DM\ Sans] text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57] ${
                !annual ? 'bg-[#16162A] text-[#EEEEF5]' : 'text-[#6B7280]'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`relative rounded-full px-4 py-2 font-[DM\ Sans] text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57] ${
                annual ? 'bg-[#16162A] text-[#EEEEF5]' : 'text-[#6B7280]'
              }`}
            >
              Annual
              <span className="ml-2 rounded-full bg-[rgba(184,255,87,0.12)] px-2 py-[2px] font-[Syne] text-[11px] font-bold text-[#B8FF57]">Save 40%</span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[#0F0F1A] p-8">
            <div className="font-[Syne] text-[18px] font-bold text-[#EEEEF5]">Free</div>
            <div className="mt-4 font-[Syne] text-[40px] font-extrabold text-[#EEEEF5]">$0<span className="text-[14px] font-bold text-[#6B7280]">/mo</span></div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 font-[DM\ Sans] text-[14px] text-[#9CA3AF]"><span className="text-[#B8FF57]"><InlineIcon name="check" className="h-4 w-4" /></span> 5 scans per day</div>
              <div className="flex items-center gap-2 font-[DM\ Sans] text-[14px] text-[#9CA3AF]"><span className="text-[#B8FF57]"><InlineIcon name="check" className="h-4 w-4" /></span> Basic macro tracking</div>
              <div className="flex items-center gap-2 font-[DM\ Sans] text-[14px] text-[#9CA3AF]"><span className="text-[#B8FF57]"><InlineIcon name="check" className="h-4 w-4" /></span> 7-day history</div>
              <div className="flex items-center gap-2 font-[DM\ Sans] text-[14px] text-[rgba(107,114,128,0.6)]">✗ AI Coach</div>
              <div className="flex items-center gap-2 font-[DM\ Sans] text-[14px] text-[rgba(107,114,128,0.6)]">✗ Health conditions</div>
            </div>
            <Link
              to="/register"
              className="mt-8 inline-flex h-[48px] w-full items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] bg-transparent font-[DM\ Sans] text-[14px] text-[#EEEEF5] hover:border-[rgba(184,255,87,0.4)] hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
            >
              Start free
            </Link>
          </div>

          <motion.div
            whileHover={reducedMotion ? undefined : { scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-[24px] border border-[rgba(184,255,87,0.30)] bg-[#0F0F1A] p-8 shadow-[0_0_0_1px_rgba(184,255,87,0.18)_inset]"
          >
            <div className="absolute right-5 top-5 rounded-full bg-[#B8FF57] px-3 py-1 font-[Syne] text-[11px] font-bold text-[#06060A]">Most popular</div>
            <div className="font-[Syne] text-[18px] font-bold text-[#EEEEF5]">Pro</div>
            <div className="mt-4 font-[Syne] text-[40px] font-extrabold text-[#EEEEF5]">
              ${pricePro.toFixed(annual ? 2 : 0)}
              <span className="text-[14px] font-bold text-[#6B7280]">/mo</span>
            </div>
            <div className="mt-1 font-[DM\ Sans] text-[13px] text-[#6B7280]">{annual ? 'Billed annually' : 'Billed monthly'}</div>
            <div className="mt-6 space-y-3">
              {[
                'Unlimited scans',
                'Full macro + micronutrient tracking',
                'AI Health Score daily',
                'Personal AI Coach',
                'Health condition integration',
                '90-day history + weekly reports',
              ].map((t) => (
                <div key={t} className="flex items-center gap-2 font-[DM\ Sans] text-[14px] text-[#9CA3AF]">
                  <span className="text-[#B8FF57]">
                    <InlineIcon name="check" className="h-4 w-4" />
                  </span>
                  {t}
                </div>
              ))}
            </div>
            <Link
              to="/register"
              className="mt-8 inline-flex h-[48px] w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#B8FF57,#57D9FF)] font-[Syne] text-[14px] font-bold text-[#06060A] shadow-[0_0_40px_rgba(184,255,87,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
            >
              Upgrade to Pro
            </Link>
          </motion.div>

          <div className="rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[#0F0F1A] p-8">
            <div className="font-[Syne] text-[18px] font-bold text-[#EEEEF5]">Team</div>
            <div className="mt-4 font-[Syne] text-[40px] font-extrabold text-[#EEEEF5]">$29<span className="text-[14px] font-bold text-[#6B7280]">/mo</span></div>
            <div className="mt-6 space-y-3">
              {[
                'Everything in Pro',
                'Up to 5 family members',
                'Shared meal tracking',
                'Nutritionist dashboard',
                'Priority support',
              ].map((t) => (
                <div key={t} className="flex items-center gap-2 font-[DM\ Sans] text-[14px] text-[#9CA3AF]">
                  <span className="text-[#B8FF57]">
                    <InlineIcon name="check" className="h-4 w-4" />
                  </span>
                  {t}
                </div>
              ))}
            </div>
            <Link
              to="/register"
              className="mt-8 inline-flex h-[48px] w-full items-center justify-center rounded-full border border-[rgba(184,255,87,0.30)] bg-transparent font-[DM\ Sans] text-[14px] text-[#B8FF57] hover:bg-[rgba(184,255,87,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});

const FinalCTA = React.memo(function FinalCTA({ reducedMotion }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        top: `${10 + (i * 11) % 70}%`,
        left: `${8 + (i * 17) % 84}%`,
        size: 4 + (i % 3) * 2,
        dur: 3.2 + (i % 4) * 0.7,
        delay: (i % 5) * 0.2,
      })),
    []
  );

  return (
    <section className="px-4 py-[120px]">
      <div className="mx-auto max-w-[800px]">
        <div className="relative overflow-hidden rounded-[32px] border border-[rgba(184,255,87,0.15)] bg-[linear-gradient(135deg,rgba(184,255,87,0.06),rgba(87,217,255,0.06))] px-6 py-16 md:px-[60px] md:py-[80px]">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-[#B8FF57]"
              style={{ top: p.top, left: p.left, width: p.size, height: p.size, opacity: 0.35 }}
              animate={
                reducedMotion
                  ? undefined
                  : {
                      y: [0, -10, 0],
                      transition: { repeat: Infinity, duration: p.dur, delay: p.delay, ease: 'easeInOut' },
                    }
              }
            />
          ))}

          <div className="relative text-center">
            <h2 className="font-[Syne] text-[40px] font-extrabold leading-[1.05] text-[#EEEEF5] md:text-[56px]">Start eating smarter today.</h2>
            <p className="mx-auto mt-4 max-w-[62ch] font-[DM\ Sans] text-[16px] leading-[1.7] text-[#6B7280]">
              Join 50,000 people who've transformed their health with AI-powered nutrition coaching.
            </p>

            <motion.div
              whileHover={reducedMotion ? undefined : { scale: 1.04, boxShadow: '0 0 40px rgba(184,255,87,0.30)' }}
              transition={{ duration: 0.2 }}
              className="mt-8 inline-block"
            >
              <Link
                to="/register"
                className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#B8FF57,#57D9FF)] px-7 font-[Syne] text-[15px] font-bold text-[#06060A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
              >
                Get started free
                <InlineIcon name="arrowRight" className="h-[18px] w-[18px]" />
              </Link>
            </motion.div>

            <div className="mt-4 font-[DM\ Sans] text-[13px] text-[#6B7280]">No credit card required · Free forever plan · Cancel anytime</div>
          </div>
        </div>
      </div>
    </section>
  );
});

const Footer = React.memo(function Footer() {
  const scrollTo = useSmoothScroll();

  const col = (title, items) => (
    <div>
      <div className="font-[Syne] text-[14px] font-bold text-[#EEEEF5]">{title}</div>
      <div className="mt-4 space-y-2">
        {items.map((it) => (
          <a
            key={it.label}
            href={it.href}
            onClick={it.onClick}
            className="block font-[DM\ Sans] text-[14px] text-[#6B7280] transition-colors duration-150 hover:text-[#EEEEF5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
          >
            {it.label}
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] px-4 pb-10 pt-14" id="about">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#B8FF57] font-[Syne] text-[20px] font-extrabold text-[#06060A]">N</div>
              <div>
                <div className="font-[Syne] text-[18px] font-bold text-[#EEEEF5]">NutriAI</div>
                <div className="mt-1 font-[DM\ Sans] text-[13px] text-[#6B7280]">AI-powered nutrition tracking that feels effortless.</div>
              </div>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.10)] bg-transparent px-3 py-2 font-[DM\ Sans] text-[12px] text-[#6B7280]">
              <span className="text-[#B8FF57]">⚡</span> Powered by Claude AI
            </div>
          </div>

          {col('Product', [
            { label: 'Features', href: '#features', onClick: scrollTo('features') },
            { label: 'How it works', href: '#how-it-works', onClick: scrollTo('how-it-works') },
            { label: 'Pricing', href: '#pricing', onClick: scrollTo('pricing') },
            { label: 'Changelog', href: '#', onClick: (e) => e.preventDefault() },
          ])}

          {col('Company', [
            { label: 'About', href: '#about', onClick: scrollTo('about') },
            { label: 'Blog', href: '#', onClick: (e) => e.preventDefault() },
            { label: 'Careers', href: '#', onClick: (e) => e.preventDefault() },
            { label: 'Press', href: '#', onClick: (e) => e.preventDefault() },
          ])}

          {col('Legal', [
            { label: 'Privacy', href: '#', onClick: (e) => e.preventDefault() },
            { label: 'Terms', href: '#', onClick: (e) => e.preventDefault() },
            { label: 'Cookie Policy', href: '#', onClick: (e) => e.preventDefault() },
            { label: 'GDPR', href: '#', onClick: (e) => e.preventDefault() },
          ])}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
          <div className="font-[DM\ Sans] text-[13px] text-[#6B7280]">© 2026 NutriAI Inc.</div>
          <div className="flex items-center gap-3 text-[#6B7280]">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              aria-label="Twitter"
              className="rounded-full p-2 transition-colors duration-150 hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
            >
              <InlineIcon name="twitter" className="h-5 w-5" />
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              aria-label="Instagram"
              className="rounded-full p-2 transition-colors duration-150 hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
            >
              <InlineIcon name="instagram" className="h-5 w-5" />
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              aria-label="LinkedIn"
              className="rounded-full p-2 transition-colors duration-150 hover:text-[#B8FF57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8FF57]"
            >
              <InlineIcon name="linkedin" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

const LandingPage = () => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <>
      <style>{googleFontsImport}</style>
      <div className="min-h-screen bg-[#06060A] text-[#EEEEF5] [font-family:'DM_Sans',sans-serif]">
        <OrbsBackground reducedMotion={reducedMotion} />
        <CustomCursor enabled={!reducedMotion} />

        <Navbar reducedMotion={reducedMotion} />

        <main>
          <HeroSection reducedMotion={reducedMotion} />
          <FeaturesSection reducedMotion={reducedMotion} />
          <HowItWorksSection reducedMotion={reducedMotion} />
          <StatsBar reducedMotion={reducedMotion} />
          <TestimonialsSection />
          <PricingSection reducedMotion={reducedMotion} />
          <FinalCTA reducedMotion={reducedMotion} />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
