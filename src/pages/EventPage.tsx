import React from 'react';
import { EventSettings } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  Cpu, 
  FileText, 
  ShieldCheck, 
  Award, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  BookOpen 
} from 'lucide-react';

interface EventPageProps {
  eventSettings: EventSettings | null;
}

export const EventPage: React.FC<EventPageProps> = ({ eventSettings }) => {
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider animate-badge-pop">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-icon-float" />
          <span>Official Event Specification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display animate-slide-bottom" style={{ animationDelay: '100ms' }}>
          {settings.eventName} — {settings.technicalEvent}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto animate-slide-bottom" style={{ animationDelay: '200ms' }}>
          Organized by <strong>{settings.department}</strong> &amp; <strong>{settings.organizedBy}</strong> at <strong>{settings.college}</strong> ({settings.autonomous}).
        </p>
      </div>

      {/* Event Details Ribbon Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs flex items-center gap-4 card-hover-3d animate-slide-left" style={{ animationDelay: '300ms' }}>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 animate-icon-float">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Date</p>
            <p className="text-base font-bold text-slate-900">{settings.date}</p>
            <p className="text-xs text-emerald-700 font-medium">Competition Day</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs flex items-center gap-4 card-hover-3d animate-slide-bottom" style={{ animationDelay: '400ms' }}>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 animate-icon-float" style={{ animationDelay: '0.5s' }}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Time</p>
            <p className="text-base font-bold text-slate-900">{settings.time}</p>
            <p className="text-xs text-emerald-700 font-medium">Sharp 2 Hours Session</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs flex items-center gap-4 card-hover-3d animate-slide-right" style={{ animationDelay: '500ms' }}>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 animate-icon-float" style={{ animationDelay: '1s' }}>
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Venue</p>
            <p className="text-base font-bold text-slate-900">{settings.venue}</p>
            <p className="text-xs text-emerald-700 font-medium">Civil Engineering Block, MSEC</p>
          </div>
        </div>
      </div>

      {/* Rounds & Marks Breakdown Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-emerald-700" />
              <span>Event Structure &amp; Evaluation Rounds</span>
            </h2>
            <p className="text-xs text-slate-500">
              The competition comprises two rigorous rounds assessed by authorized technical evaluators.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold self-start sm:self-auto">
            Cumulative Total: 100 Marks
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Round 1 Card */}
          <div className="rounded-2xl bg-white border border-emerald-200 shadow-xs p-6 space-y-4 relative overflow-hidden animate-rotate-in" style={{ animationDelay: '200ms' }}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none animate-hero-glow"></div>
            
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                ROUND 1
              </span>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-800">{settings.round1Max}</span>
                <span className="text-xs font-semibold text-slate-500"> Marks</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Technical Quiz
              </h3>
              <p className="text-xs text-emerald-700 font-semibold">
                Theoretical &amp; Algorithmic Foundations of Smart Civil IoT
              </p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Assesses the team’s in-depth understanding of IoT architectures, wireless telemetry protocols (MQTT, CoAP, LoRaWAN), environmental micro-sensors, smart grid civil telemetry, and sustainable municipal infrastructure frameworks.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                Key Assessment Domains:
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-2 animate-slide-left" style={{ animationDelay: '500ms' }}>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-check-pop" style={{ animationDelay: '600ms' }} />
                  <span>Smart City Sensor Placement &amp; Geo-Telemetry</span>
                </li>
                <li className="flex items-center gap-2 animate-slide-left" style={{ animationDelay: '600ms' }}>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-check-pop" style={{ animationDelay: '700ms' }} />
                  <span>Low-Power Wide-Area Networks (LPWAN) for Civil Utilities</span>
                </li>
                <li className="flex items-center gap-2 animate-slide-left" style={{ animationDelay: '700ms' }}>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-check-pop" style={{ animationDelay: '800ms' }} />
                  <span>Automated Stormwater &amp; Structural Health Monitoring Protocols</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Round 2 Card */}
          <div className="rounded-2xl bg-white border border-teal-200 shadow-xs p-6 space-y-4 relative overflow-hidden animate-rotate-in" style={{ animationDelay: '350ms' }}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-bl-full pointer-events-none animate-hero-glow" style={{ animationDelay: '1s' }}></div>

            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-md bg-teal-100 text-teal-800 font-extrabold text-xs uppercase tracking-wider">
                ROUND 2
              </span>
              <div className="text-right">
                <span className="text-2xl font-black text-teal-800">{settings.round2Max}</span>
                <span className="text-xs font-semibold text-slate-500"> Marks</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                IoT Based Simulation
              </h3>
              <p className="text-xs text-teal-700 font-semibold">
                Practical Municipal Infrastructure Modeling &amp; Real-Time Simulation
              </p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Teams configure dynamic simulation platforms or virtual sensor testbeds addressing urban challenges such as intelligent traffic management, smart drainage overflow warning, or municipal energy optimization.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                Key Assessment Domains:
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-2 animate-slide-left" style={{ animationDelay: '650ms' }}>
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 animate-check-pop" style={{ animationDelay: '750ms' }} />
                  <span>Simulation Accuracy &amp; Virtual Hardware Interfacing</span>
                </li>
                <li className="flex items-center gap-2 animate-slide-left" style={{ animationDelay: '750ms' }}>
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 animate-check-pop" style={{ animationDelay: '850ms' }} />
                  <span>Data Flow, Latency &amp; Automation Logic</span>
                </li>
                <li className="flex items-center gap-2 animate-slide-left" style={{ animationDelay: '850ms' }}>
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 animate-check-pop" style={{ animationDelay: '950ms' }} />
                  <span>Eco-Sustainability Impact &amp; Scalability in Civil Engineering</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Total Marks Banner */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              Σ
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold">Combined Challenge Scoring</p>
              <p className="text-sm font-bold text-emerald-950">
                Round 1 (40 Marks) + Round 2 (60 Marks) = <strong>100 Marks Total</strong>
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-600 font-medium max-w-sm">
            Note: The <strong>same authorized judge</strong> evaluates both rounds for each assigned team to guarantee absolute scoring consistency.
          </div>
        </div>
      </div>

      {/* Rules and Guidelines Section */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
            <span>Event Rules &amp; Official Guidelines</span>
          </h2>
          <p className="text-xs text-slate-500">
            All participating teams must strictly adhere to the following regulations set by the organizing committee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 card-hover-3d animate-slide-left neon-border-hover" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>1. Reporting Time &amp; Attendance</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Teams must report to MSEC Civil Block at 9:30 AM for attendance verification by the Admin desk. The event strictly commences at 10:00 AM and concludes at 12:00 PM. Late entries will forfeit Round 1.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 card-hover-3d animate-slide-right neon-border-hover" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>2. Team Composition &amp; Identification</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Each team must present their designated Team Number and college ID cards upon entering the examination block. Substitution of members after registration is strictly prohibited.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 card-hover-3d animate-slide-left neon-border-hover" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>3. Hardware &amp; Software Regulations</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Simulation software environments and network configurations will be provided in the MSEC Civil Computing Labs. Pre-loaded code snippets or external unapproved libraries will lead to immediate disqualification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 card-hover-3d animate-slide-right neon-border-hover" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>4. Tie-Breaking &amp; Final Decisions</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In the case of identical total scores, the team with the higher <strong>Technical Quiz score</strong> will be ranked ahead. If still tied, the IoT Based Simulation score decides. Evaluator and Committee decisions are final.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
