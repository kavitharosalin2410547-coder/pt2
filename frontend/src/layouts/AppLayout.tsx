import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Mic,
  Menu,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Trophy,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { NotificationsBell } from '../components/common/NotificationsBell';
import { useAuth } from '../hooks/useAuth';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/tasks', label: 'Tasks', icon: CheckSquare },
      { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    ],
  },
  {
    label: 'Learning',
    items: [
      { to: '/dsa-tracker', label: 'DSA Tracker', icon: Code2 },
      { to: '/core-cs', label: 'Core CS', icon: BookOpen },
      { to: '/full-stack', label: 'Full Stack', icon: GraduationCap },
      { to: '/study-history', label: 'Study History', icon: History },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Career',
    items: [
      { to: '/placement-tracker', label: 'Placement', icon: BriefcaseBusiness },
      { to: '/interview-prep', label: 'Interviews', icon: BookOpen },
      { to: '/mock-interview', label: 'Mock Interview', icon: Mic },
      { to: '/resume-hub', label: 'Resume Hub', icon: FileText },
      { to: '/hackathons', label: 'Hackathons', icon: Trophy },
    ],
  },
  {
    label: 'AI & Settings',
    items: [
      { to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('placement-theme') === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('placement-theme', theme);
  }, [theme]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const sidebarW = isCollapsed ? 'lg:w-[72px]' : 'lg:w-64';
  const mainPad  = isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64';

  return (
    <div className="min-h-screen bg-[#f1f3fb] text-slate-950 dark:bg-[#07070f] dark:text-slate-100 lg:flex">
      {/* ───── Mobile overlay ───── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ───── Sidebar ───── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0f0f1b] transition-all duration-300 ${sidebarW}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ boxShadow: '4px 0 32px rgba(0,0,0,0.4)' }}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight text-white">Placement</p>
                <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-brand-400">Tracker Pro</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          )}
          {/* Mobile close */}
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setIsMobileOpen(false)}
            type="button"
          >
            <X size={18} />
          </button>
          {/* Desktop collapse toggle */}
          <button
            className="hidden rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white lg:flex"
            onClick={() => setIsCollapsed((c) => !c)}
            type="button"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 no-scrollbar">
          {(isCollapsed ? [{ label: '', items: ALL_ITEMS }] : NAV_GROUPS).map((group) => (
            <div key={group.label} className="mb-1">
              {group.label && !isCollapsed && (
                <p className="px-4 pb-1 pt-3 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `group mx-2 mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-brand-gradient text-white shadow-glow'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center px-0' : ''}
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`h-4 w-4 shrink-0 transition-transform duration-150 ${isActive ? '' : 'group-hover:scale-110'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom user area */}
        <div className="shrink-0 border-t border-white/[0.06] p-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 rounded-xl p-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white shadow-glow">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
                <p className="truncate text-[10px] text-slate-500">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-white/10 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* ───── Main content ───── */}
      <div className={`min-w-0 flex-1 transition-all duration-300 ${mainPad}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/[0.05] dark:bg-[#0f0f1b]/80">
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 lg:hidden"
                type="button"
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Welcome back
                </p>
                <h1 className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</h1>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <NotificationsBell />
              <button
                type="button"
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                aria-label="Toggle theme"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-5 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
