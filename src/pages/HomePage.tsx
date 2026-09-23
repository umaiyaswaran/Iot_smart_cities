import React from 'react';
import { PageRoute, EventSettings } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Leaf, 
  Cpu, 
  Radio, 
  Award, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Network, 
  Compass, 
  Binary 
} from 'lucide-react';

interface HomePageProps {
  onRouteChange: (route: PageRoute) => void;
  eventSettings: EventSettings | null;
}

export const HomePage: React.FC<HomePageProps> = ({ onRouteChange, eventSettings }) => {
  const settings = eventSettings || {
    college: 'MEENAKSHI SUNDARAJAN ENGINEERING COLLEGE',
    autonomous: 'Autonomous',
    managedBy: 'I.I.E.T. Society',
    affiliatedTo: 'Anna University',
    department: 'Department of Civil Engineering',
    organizedBy: 'Eco Design Club',
    eventName: "Euphoria'26",
    technicalEvent: 'IoT Based Smart Cities Challenge',
    date: '25/09/2026 – Friday',
    time: '10:00 AM – 12:00 PM',
    venue: 'MSEC Civil Block',
    eventStatus: 'Event Started',
    round1Name: 'Technical Quiz',
    round1Max: 40,
    round2Name: 'IoT Based Simulation',
    round2Max: 60,
    totalMax: 100,
    tieBreakerRule: '',
  };

  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-300">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/60">
        
        {/* Subtle decorative background eco/circuit glow elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-emerald-500/30 blur-3xl animate-hero-glow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl animate-hero-glow" style={{ animationDelay: '2.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl animate-hero-glow" style={{ animationDelay: '1.2s' }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#05966915_1px,transparent_1px),linear-gradient(to_bottom,#05966915_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          
          {/* Institution Crest and Presenter Pill */}
          <div className="inline-flex flex-col items-center gap-2 animate-slide-bottom" style={{ animationDelay: '100ms' }}>
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-900/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md shadow-xs animate-border-glow">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-icon-float" />
              <span>{settings.college}</span>
              <span className="bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                {settings.autonomous}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium animate-fade-in">
              Managed by {settings.managedBy} • Affiliated to {settings.affiliatedTo}
            </p>
          </div>

          {/* Department & Club Announcement */}
          <div className="space-y-2 animate-slide-bottom" style={{ animationDelay: '200ms' }}>
            <p className="text-sm sm:text-base font-semibold text-emerald-400 uppercase tracking-widest font-mono text-reveal" style={{ animationDelay: '400ms' }}>
              {settings.department} &amp; {settings.organizedBy}
            </p>
            <p className="text-xs sm:text-sm font-medium text-slate-300 tracking-wider uppercase text-reveal" style={{ animationDelay: '600ms' }}>
              PROUDLY PRESENTS
            </p>
          </div>

          {/* Main Event Headline Title */}
          <div className="space-y-4 animate-slide-bottom" style={{ animationDelay: '300ms' }}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight font-display hero-shimmer">
              <span className="bg-gradient-to-r from-white via-emerald-100 to-teal-300 bg-clip-text text-transparent text-gradient-animated bg-[length:200%_200%]">
                {settings.eventName}
              </span>
            </h1>
            <div className="inline-block animate-scale-in" style={{ animationDelay: '600ms' }}>
              <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/40 backdrop-blur-md neon-border-hover">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-300 tracking-tight flex items-center justify-center gap-3">
                  <Cpu className="w-6 h-6 text-emerald-400 animate-icon-float" />
                  <span>{settings.technicalEvent}</span>
                  <Leaf className="w-6 h-6 text-emerald-400 animate-icon-float" style={{ animationDelay: '1.5s' }} />
                </h2>
              </div>
            </div>
          </div>

          {/* Key Event Coordinates Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto pt-4 text-left">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-900/80 backdrop-blur-md flex items-center gap-3.5 shadow-sm card-hover-3d animate-slide-left" style={{ animationDelay: '500ms' }}>
              <div className="w-10 h-10 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0 animate-icon-float">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Date</p>
                <p className="text-sm font-bold text-white">{settings.date}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-900/80 backdrop-blur-md flex items-center gap-3.5 shadow-sm card-hover-3d animate-slide-bottom" style={{ animationDelay: '600ms' }}>
              <div className="w-10 h-10 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0 animate-icon-float" style={{ animationDelay: '0.5s' }}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Time</p>
                <p className="text-sm font-bold text-white">{settings.time}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-900/80 backdrop-blur-md flex items-center gap-3.5 shadow-sm card-hover-3d animate-slide-right" style={{ animationDelay: '700ms' }}>
              <div className="w-10 h-10 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0 animate-icon-float" style={{ animationDelay: '1s' }}>
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Venue</p>
                <p className="text-sm font-bold text-white">{settings.venue}</p>
              </div>
            </div>
          </div>

          {/* Live Status Badge & Action Navigation */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 animate-slide-bottom" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-glow-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Status: {settings.eventStatus}</span>
            </div>

            <button
              id="home-btn-view-event"
              onClick={() => onRouteChange('event')}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-950 transition-all duration-200 flex items-center gap-2 group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.03] active:scale-[0.97]"
            >
              <span>Explore Event &amp; Rounds</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:scale-110" />
            </button>

            <button
              id="home-btn-view-scoreboard"
              onClick={() => onRouteChange('scoreboard')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-sm border border-emerald-700/60 transition-all duration-200 flex items-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.03] active:scale-[0.97]"
            >
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Live Scoreboard</span>
            </button>
          </div>

        </div>
      </section>

      {/* Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-widest animate-slide-bottom" style={{ animationDelay: '100ms' }}>
            Event Highlights &amp; Architecture
          </h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight animate-slide-bottom" style={{ animationDelay: '200ms' }}>
            Advancing Eco-Tech &amp; Smart Civil Engineering
          </p>
          <p className="text-sm text-slate-600 animate-slide-bottom" style={{ animationDelay: '300ms' }}>
            Euphoria'26 challenges budding civil engineers to design sustainable, sensor-driven urban infrastructures that monitor environmental health and optimize municipal performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4 card-hover-3d animate-card-tilt" style={{ animationDelay: '200ms' }}>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group">
              <Network className="w-6 h-6 animate-icon-float" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Smart City Sensor Networks
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explores dynamic civil IoT deployments including stormwater runoff telemetry, automated structural integrity probes, and urban air-quality microclimate stations.
            </p>
            <div className="pt-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 animate-check-pop" style={{ animationDelay: '800ms' }} /> Civil &amp; IoT Integration
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4 card-hover-3d animate-card-tilt" style={{ animationDelay: '350ms' }}>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Binary className="w-6 h-6 animate-icon-float" style={{ animationDelay: '0.5s' }} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Two-Phase Comprehensive Scoring
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Teams are evaluated across two stringent rounds: Round 1 Technical Quiz (40 Marks) testing fundamental IoT protocols, and Round 2 Live Simulation (60 Marks) testing design implementation.
            </p>
            <div className="pt-2">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-4 h-4 animate-check-pop" style={{ animationDelay: '950ms' }} /> 100 Marks Cumulative
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4 card-hover-3d animate-card-tilt" style={{ animationDelay: '500ms' }}>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-6 h-6 animate-icon-float" style={{ animationDelay: '1s' }} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Eco Design Club Sustainability
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Focuses on low-power sensor networks, renewable-powered microgrids, carbon footprint reduction, and eco-conscious construction practices in metropolitan corridors.
            </p>
            <div className="pt-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-4 h-4 animate-check-pop" style={{ animationDelay: '1100ms' }} /> Eco Design Club Initiative
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Quick Nav Card Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden animate-slide-bottom neon-border-hover border border-emerald-700/30" style={{ animationDelay: '400ms' }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-hero-glow"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl animate-hero-glow" style={{ animationDelay: '1.5s' }}></div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold uppercase animate-badge-pop" style={{ animationDelay: '500ms' }}>
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-icon-float" />
                <span>Live Event In Progress</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight animate-glow-text">
                Track Real-Time Scores &amp; Standings
              </h3>
              <p className="text-sm text-emerald-100/90 leading-relaxed">
                Evaluated scores and automatic rankings are updated live as judges evaluate both rounds. View the scoreboard or check the current Top 3 podium.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => onRouteChange('scoreboard')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-emerald-950 font-extrabold text-sm hover:bg-emerald-50 shadow-md transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-white/20 hover:scale-[1.04] active:scale-[0.97]"
              >
                Go to Scoreboard
              </button>
              <button
                onClick={() => onRouteChange('winners')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-950/80 text-emerald-200 border border-emerald-700 font-bold text-sm hover:bg-emerald-950 transition-all duration-200 cursor-pointer hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.04] active:scale-[0.97]"
              >
                View Top 3 Winners
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
