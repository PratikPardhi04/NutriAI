import { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { Home, Camera, BarChart2, User, Leaf } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import NutritionChat from '../NutritionChat';

const navItems = [
  { to: '/home', icon: Home, label: 'Dashboard' },
  { to: '/scan', icon: Camera, label: 'Scan Food' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const onPointerDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  const avatarLetter = (() => {
    const name = user?.name || user?.fullName || '';
    const email = user?.email || '';
    const source = (name || email || 'U').trim();
    return source ? source[0].toUpperCase() : 'U';
  })();

  return (
    <>
      <style>{`
        /* ============================================= */
        /* DESKTOP SIDEBAR LAYOUT  (> 768px)             */
        /* ============================================= */
        .desktop-shell {
          display: none;
        }

        @media (min-width: 769px) {
          .desktop-shell {
            display: flex;
            min-height: 100vh;
          }

          /* --- Sidebar --- */
          .desktop-sidebar {
            width: 240px;
            background: var(--surface);
            border-right: 1px solid var(--border);
            position: fixed;
            top: 0; left: 0; bottom: 0;
            display: flex;
            flex-direction: column;
            padding: 28px 16px;
            z-index: 200;
          }

          .sidebar-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 8px;
            margin-bottom: 40px;
          }
          .sidebar-logo-icon {
            width: 36px;
            height: 36px;
            background: var(--lime);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0A0A0F;
          }
          .sidebar-logo-text {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 20px;
            color: var(--text);
          }

          .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
          }

          .sidebar-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 12px;
            color: var(--muted);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: all 150ms ease;
          }
          .sidebar-link:hover {
            background: var(--raised);
            color: var(--text);
          }
          .sidebar-link.active {
            background: var(--lime-dim);
            color: var(--lime);
          }
          .sidebar-link.active svg {
            color: var(--lime);
          }

          .sidebar-scan-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px;
            border-radius: 14px;
            background: linear-gradient(135deg, var(--lime), var(--cyan));
            color: #0A0A0F;
            text-decoration: none;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 14px;
            margin-top: 12px;
            margin-bottom: 12px;
            transition: opacity 150ms ease;
          }
          .sidebar-scan-btn:hover {
            opacity: 0.9;
          }

          .sidebar-footer {
            border-top: 1px solid var(--border);
            padding-top: 16px;
            margin-top: auto;
            font-size: 11px;
            color: var(--muted);
            text-align: center;
          }

          /* --- Main content --- */
          .desktop-main {
            margin-left: 240px;
            flex: 1;
            min-height: 100vh;
            background: var(--bg);
          }

          .desktop-topbar {
            height: 64px;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 40px;
            background: rgba(10,10,15,0.85);
            backdrop-filter: blur(12px);
            position: sticky;
            top: 0;
            z-index: 100;
          }

          .desktop-topbar-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 16px;
            font-weight: 600;
            color: var(--text);
          }

          .desktop-topbar-right {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .desktop-topbar-right .topbar-date {
            font-size: 13px;
            color: var(--muted);
          }

          .topbar-user {
            position: relative;
            display: inline-flex;
            align-items: center;
          }

          .topbar-avatar-btn {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.08);
            background: var(--lime);
            color: #06060A;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: transform 150ms ease, opacity 150ms ease;
          }

          .topbar-avatar-btn:hover { opacity: 0.95; }

          .topbar-avatar-btn:active { transform: scale(0.98); }

          .topbar-menu {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width: 200px;
            border-radius: 14px;
            border: 1px solid var(--border);
            background: rgba(15, 15, 26, 0.92);
            backdrop-filter: blur(12px);
            box-shadow: 0 18px 60px rgba(0,0,0,0.45);
            padding: 8px;
            z-index: 999;
          }

          .topbar-menu-btn {
            width: 100%;
            border: none;
            background: transparent;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 10px 10px;
            border-radius: 12px;
            color: var(--text);
            font-size: 13px;
            font-weight: 500;
          }

          .topbar-menu-btn:hover {
            background: var(--raised);
          }

          .topbar-menu-sub {
            color: var(--muted);
            font-size: 11px;
            margin: 2px 10px 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding: 0;
          }

          .desktop-content {
            padding: 32px 40px;
            max-width: 1200px;
          }

          /* Hide mobile elements on desktop */
          .mobile-shell { display: none !important; }
        }

        /* ============================================= */
        /* MOBILE / TABLET LAYOUT  (≤ 768px)             */
        /* ============================================= */
        .mobile-shell {
          display: block;
        }

        @media (min-width: 769px) {
          .mobile-shell { display: none; }
        }
      `}</style>

      {/* ====== DESKTOP LAYOUT ====== */}
      <div className="desktop-shell">
        {/* Sidebar */}
        <aside className="desktop-sidebar">
          <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
            <div className="sidebar-logo-icon">
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20 }}>N</span>
            </div>
            <span className="sidebar-logo-text">NutriAI</span>
          </Link>

          <nav className="sidebar-nav">
            {navItems.map(({ to, icon: Icon, label }) =>
              to === '/scan' ? (
                <NavLink key={to} to={to} className="sidebar-scan-btn">
                  <Icon size={20} />
                  {label}
                </NavLink>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  {label}
                </NavLink>
              )
            )}
          </nav>

          <div className="sidebar-footer">
            Powered by NutriAI<br/>
            <span style={{ fontSize: 10, opacity: 0.6 }}>© 2026 NutriAI</span>
          </div>
        </aside>

        {/* Main content */}
        <main className="desktop-main">
          <div className="desktop-topbar">
            <span className="desktop-topbar-title">
              {pathname === '/home' && 'Dashboard'}
              {pathname === '/scan' && 'Scan Food'}
              {pathname === '/reports' && 'Daily Analytics'}
              {pathname === '/profile' && 'Profile'}
            </span>
            <div className="desktop-topbar-right">
              <span className="topbar-date">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>

              <div className="topbar-user" ref={menuRef}>
                <button
                  type="button"
                  className="topbar-avatar-btn"
                  aria-label="Open user menu"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(v => !v)}
                >
                  {avatarLetter}
                </button>

                {menuOpen && (
                  <div className="topbar-menu" role="menu" aria-label="User menu">
                    <div className="topbar-menu-sub">{user?.email || ''}</div>
                    <button
                      type="button"
                      className="topbar-menu-btn"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/profile');
                      }}
                    >
                      <span>Profile</span>
                      <span style={{ color: 'var(--muted)' }}>↗</span>
                    </button>
                    <button
                      type="button"
                      className="topbar-menu-btn"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                        navigate('/', { replace: true });
                      }}
                    >
                      <span>Logout</span>
                      <span style={{ color: 'var(--muted)' }}>⎋</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="desktop-content">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ====== MOBILE LAYOUT ====== */}
      <div className="mobile-shell">
        <div className="app-wrapper">
          <div className="page-enter">
            <Outlet />
          </div>
          
          <nav className="bottom-nav">
            <NavLink to="/home" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
              <Home size={22} />
              <span>Home</span>
            </NavLink>
            
            <NavLink to="/scan" className="nav-scan">
              <Camera size={22} />
            </NavLink>
            
            <NavLink to="/reports" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
              <BarChart2 size={22} />
              <span>Reports</span>
            </NavLink>
            
            <NavLink to="/profile" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
              <User size={22} />
              <span>Profile</span>
            </NavLink>
          </nav>
        </div>
      </div>
      {pathname === '/reports' && <NutritionChat />}
    </>
  );
}
