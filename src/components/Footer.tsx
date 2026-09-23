import React from 'react';
import { PageRoute } from '../types';
import { Building2, Calendar, Clock, MapPin, Award, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onRouteChange: (route: PageRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onRouteChange }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-emerald-950 mt-auto">
      {/* Visual divider with eco-circuit color line */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-[length:200%_100%] animate-shimmer text-shimmer"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: College and Brand */}
          <div className="md:col-span-2 space-y-4 animate-slide-left" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-white font-extrabold text-xl tracking-tight text-gradient-animated bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent bg-[length:200%_200%]">Euphoria'26</h3>
                <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase">
                  IoT Based Smart Cities Challenge
                </p>
              </div>
            </div>

            <div className="text-sm space-y-1 text-slate-400 leading-relaxed max-w-lg">
              <p className="text-slate-200 font-semibold">
                MEENAKSHI SUNDARAJAN ENGINEERING COLLEGE
                <span className="ml-2 text-[11px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-950 rounded">
                  Autonomous
                </span>
              </p>
              <p className="text-xs">Managed by I.I.E.T. Society | Affiliated to Anna University</p>
              <p className="text-xs text-emerald-300/90 font-medium">
                Organized by Department of Civil Engineering & Eco Design Club
              </p>
              <p className="text-xs text-slate-400 pt-2">
                Fostering sustainable urban infrastructure through smart IoT sensing, real-time climate monitoring, and automated municipal simulations.
              </p>
            </div>
          </div>

          {/* Col 2: Event Coordinates */}
          <div className="space-y-3 animate-slide-bottom" style={{ animationDelay: '200ms' }}>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider text-emerald-400">
              Event Details
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5 animate-slide-left" style={{ animationDelay: '300ms' }}>
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-icon-float" />
                <div>
                  <strong className="block text-white font-semibold">25/09/2026 – Friday</strong>
                  <span className="text-slate-400">Technical Competition Day</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">10:00 AM – 12:00 PM</strong>
                  <span className="text-slate-400">Duration: 2 Hours</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-semibold">MSEC Civil Block</strong>
                  <span className="text-slate-400">Civil Engineering Wing, Chennai</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3 animate-slide-bottom" style={{ animationDelay: '300ms' }}>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider text-emerald-400">
              Direct Pages
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onRouteChange('home')}
                  className="hover:text-emerald-400 transition-all duration-200 link-underline-slide"
                >
                  Event Overview & Intro
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onRouteChange('event')}
                  className="hover:text-emerald-400 transition-all duration-200 link-underline-slide"
                >
                  Rounds, Rules & Marks Distribution
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onRouteChange('scoreboard')}
                  className="hover:text-emerald-400 transition-all duration-200 flex items-center gap-1.5 link-underline-slide"
                >
                  <span>Live Scoreboard</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onRouteChange('rankings')}
                  className="hover:text-emerald-400 transition-all duration-200 link-underline-slide"
                >
                  Rankings Leaderboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onRouteChange('winners')}
                  className="hover:text-emerald-400 transition-all duration-200 link-underline-slide"
                >
                  Top 3 Podium
                </button>
              </li>
              <li className="pt-2">
                <button 
                  onClick={() => onRouteChange('portal')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 font-semibold transition-all duration-200 border border-emerald-800 hover:border-emerald-600 hover:shadow-lg hover:shadow-emerald-900/30 hover:scale-[1.03] active:scale-[0.97]"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Central Portal Access</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright banner */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Meenakshi Sundarajan Engineering College (Autonomous). All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Euphoria'26</span>
            <span>•</span>
            <span>Eco Design Club & Civil Engineering</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
