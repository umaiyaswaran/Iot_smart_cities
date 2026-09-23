import React, { useState } from 'react';
import { PageRoute, UserSession } from '../types';
import { 
  Building2, 
  Cpu, 
  Radio, 
  Trophy, 
  Award, 
  LockKeyhole, 
  Menu, 
  X, 
  LogOut, 
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  currentRoute: PageRoute;
  onRouteChange: (route: PageRoute) => void;
  session: UserSession | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onRouteChange,
  session,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { route: PageRoute; label: string; icon: React.ReactNode; isLive?: boolean }[] = [
    { route: 'home', label: 'HOME', icon: <Building2 className="w-4 h-4" /> },
    { route: 'event', label: 'EVENT', icon: <Cpu className="w-4 h-4" /> },
    { 
      route: 'scoreboard', 
      label: 'LIVE SCOREBOARD', 
      icon: <Radio className="w-4 h-4" />,
      isLive: true
    },
    { route: 'rankings', label: 'RANKINGS', icon: <Award className="w-4 h-4" /> },
    { route: 'winners', label: 'WINNERS', icon: <Trophy className="w-4 h-4" /> },
    { route: 'portal', label: 'PORTAL', icon: <LockKeyhole className="w-4 h-4" /> },
  ];

  const handleNavClick = (route: PageRoute) => {
    onRouteChange(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* College Institutional Top Header Banner */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>MEENAKSHI SUNDARAJAN ENGINEERING COLLEGE</span>
            <span className="hidden sm:inline text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-900/60 rounded text-[10px] uppercase">
              Autonomous
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-emerald-300/80 text-[11px]">
            <span>Managed by I.I.E.T. Society</span>
            <span>•</span>
            <span>Affiliated to Anna University</span>
            <span>•</span>
            <span className="text-emerald-300 font-medium">MSEC Civil Block</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Branding / Logo Section */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight font-display bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 bg-clip-text text-transparent text-gradient-animated bg-[length:200%_200%]">
                  Euphoria'26
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 animate-badge-pop">
                  IoT Smart Cities
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-tight">
                Dept of Civil Engineering & Eco Design Club
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  id={`nav-link-${item.route}`}
                  onClick={() => handleNavClick(item.route)}
                  className={`relative px-3.5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 hover:scale-[1.05] active:scale-[0.95] ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-800/20 animate-glow-pulse'
                      : 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/80'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.isLive && (
                    <span className="relative flex h-2 w-2 ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </button>
              );
            })}

            {/* Active session quick badge if logged in */}
            {session && (
              <div className="ml-3 pl-3 border-l border-slate-200 flex items-center gap-2">
                <button
                  id="nav-session-portal-btn"
                  onClick={() => handleNavClick('portal')}
                  className="px-2.5 py-1.5 rounded-md bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-200 transition"
                  title={`Logged in as ${session.role}`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="capitalize">{session.role} Mode</span>
                </button>
                <button
                  id="nav-session-logout-btn"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                  title="Log out of portal"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            {session && (
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase">
                {session.role}
              </span>
            )}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-white px-4 pt-3 pb-6 space-y-1.5 shadow-lg animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                id={`mobile-nav-${item.route}`}
                onClick={() => handleNavClick(item.route)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition ${
                  isActive
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-700 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.isLive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    LIVE
                  </span>
                )}
              </button>
            );
          })}

          {session && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Active Session: <strong className="text-emerald-700 capitalize">{session.role} ({session.username})</strong>
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
