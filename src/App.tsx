import React, { useState, useEffect } from 'react';
import { PageRoute, UserSession, EventSettings } from './types';
import { getStoredSession, setStoredSession, authApi, publicApi } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { EventPage } from './pages/EventPage';
import { ScoreboardPage } from './pages/ScoreboardPage';
import { RankingsPage } from './pages/RankingsPage';
import { WinnersPage } from './pages/WinnersPage';
import { PortalPage } from './pages/PortalPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { JudgeDashboard } from './pages/JudgeDashboard';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<PageRoute>('home');
  const [session, setSession] = useState<UserSession | null>(getStoredSession());
  const [eventSettings, setEventSettings] = useState<EventSettings | null>(null);

  // Sync route with URL hash for clean bookmarking and navigation history
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageRoute;
      const validRoutes: PageRoute[] = ['home', 'event', 'scoreboard', 'rankings', 'winners', 'portal'];
      if (validRoutes.includes(hash)) {
        setCurrentRoute(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: PageRoute) => {
    setCurrentRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Verify auth session on load
  useEffect(() => {
    const verifySession = async () => {
      const stored = getStoredSession();
      if (!stored?.token) return;
      try {
        const res = await authApi.verify();
        if (!res.valid) {
          setSession(null);
          setStoredSession(null);
        }
      } catch {
        // Keep the local session during temporary verification or database errors.
        // Protected API requests still reject expired sessions when they are used.
        console.warn('Unable to verify the stored portal session');
      }
    };

    verifySession();
  }, []);

  // Fetch Event Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await publicApi.getEventSettings();
        setEventSettings(settings);
      } catch (err) {
        console.error('Failed to load event settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    navigateTo('portal');
  };

  const handleLogout = async () => {
    await authApi.logout();
    setSession(null);
    navigateTo('portal');
  };

  return (
    <div className="app-shell min-h-screen flex flex-col bg-slate-50/80 text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Universal Top Header and Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onRouteChange={navigateTo}
        session={session}
        onLogout={handleLogout}
      />

      {/* Main Page Dynamic Outlet */}
      <main className="flex-1">
        {currentRoute === 'home' && (
          <HomePage
            onRouteChange={navigateTo}
            eventSettings={eventSettings}
          />
        )}

        {currentRoute === 'event' && (
          <EventPage eventSettings={eventSettings} />
        )}

        {currentRoute === 'scoreboard' && <ScoreboardPage />}

        {currentRoute === 'rankings' && <RankingsPage />}

        {currentRoute === 'winners' && <WinnersPage />}

        {currentRoute === 'portal' && (
          <>
            {!session ? (
              <PortalPage
                session={session}
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
              />
            ) : session.role === 'admin' ? (
              <AdminDashboard
                session={session}
                onLogout={handleLogout}
                eventSettings={eventSettings}
                onEventSettingsChange={setEventSettings}
              />
            ) : (
              <JudgeDashboard
                session={session}
                onLogout={handleLogout}
                eventSettings={eventSettings}
              />
            )}
          </>
        )}
      </main>

      {/* Institutional Global Footer */}
      <Footer onRouteChange={navigateTo} />
    </div>
  );
}
