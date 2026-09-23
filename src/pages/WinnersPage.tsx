import React, { useEffect, useState } from 'react';
import { publicApi } from '../services/api';
import { Trophy, Award, Medal, Crown, Sparkles, RefreshCw, Star, Building2, User } from 'lucide-react';

interface WinnerTeam {
  rank: number;
  teamNumber: string;
  teamName: string;
  totalScore: number;
  technicalQuizScore: number;
  iotSimulationScore: number;
  members: Array<{ name: string; collegeName: string }>;
}

export const WinnersPage: React.FC = () => {
  const [winners, setWinners] = useState<WinnerTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const data = await publicApi.getWinners();
      setWinners(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch winners podium');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const firstPlace = winners.find((w) => w.rank === 1);
  const secondPlace = winners.find((w) => w.rank === 2);
  const thirdPlace = winners.find((w) => w.rank === 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider animate-badge-pop">
          <Trophy className="w-3.5 h-3.5 text-amber-600 animate-crown-bounce" />
          <span>Championship Hall of Fame</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display animate-slide-bottom" style={{ animationDelay: '100ms' }}>
          Euphoria'26 Top 3 Winners
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto animate-slide-bottom" style={{ animationDelay: '200ms' }}>
          Honoring the exemplary champions of the IoT Based Smart Cities Challenge. Rankings are computed live from judge evaluation marks.
        </p>

        <div className="pt-2">
          <button
            onClick={fetchWinners}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all duration-200 cursor-pointer hover:scale-[1.05] active:scale-[0.95]"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Results</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-center text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Calculating top positions...</p>
        </div>
      ) : winners.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 max-w-md mx-auto">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-lg">Evaluation In Progress</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The top 3 podium will automatically display here as soon as evaluations are completed by the technical judges.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Top 3 Visual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* 2nd Place Card (Silver) */}
            <div className="order-2 md:order-1 animate-podium-rise podium-2">
              <div className="rounded-3xl bg-gradient-to-b from-slate-100 via-white to-slate-50 border-2 border-slate-300 p-6 shadow-sm relative overflow-hidden space-y-4 card-hover-3d">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1 animate-badge-pop" style={{ animationDelay: '400ms' }}>
                    <Medal className="w-3.5 h-3.5 text-slate-600" />
                    2nd Place
                  </span>
                  <span className="text-2xl font-black text-slate-400 animate-number-count" style={{ animationDelay: '500ms' }}>#2</span>
                </div>

                {secondPlace ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        Team {secondPlace.teamNumber}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {secondPlace.teamName}
                      </h3>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Technical Quiz</span>
                        <strong className="font-mono">{secondPlace.technicalQuizScore} / 40</strong>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>IoT Simulation</span>
                        <strong className="font-mono">{secondPlace.iotSimulationScore} / 60</strong>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                        <span>Total Score</span>
                        <strong className="text-emerald-700 font-mono">{secondPlace.totalScore} / 100</strong>
                      </div>
                    </div>

                    {secondPlace.members && secondPlace.members.length > 0 && (
                      <div className="text-xs text-slate-500 pt-1">
                        <strong className="text-slate-700 block mb-1">Team Members:</strong>
                        <ul className="space-y-0.5">
                          {secondPlace.members.map((m, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{m.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    Awaiting 2nd Place Evaluation
                  </div>
                )}
              </div>
            </div>

            {/* 1st Place Card (Gold) - Elevated in Center */}
            <div className="order-1 md:order-2 md:-translate-y-4 animate-podium-rise podium-1">
              <div className="rounded-3xl bg-gradient-to-b from-amber-500/15 via-amber-50/50 to-white border-2 border-amber-400 p-7 shadow-xl relative overflow-hidden space-y-5 animate-glow-pulse">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-bl-full pointer-events-none animate-hero-glow"></div>

                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs animate-badge-pop" style={{ animationDelay: '200ms' }}>
                    <Crown className="w-4 h-4 text-slate-950 animate-crown-bounce" />
                    CHAMPION • 1st Place
                  </span>
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-sm animate-badge-pop" style={{ animationDelay: '300ms' }}>
                    1
                  </div>
                </div>

                {firstPlace ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-950 animate-badge-pop" style={{ animationDelay: '400ms' }}>
                        Team {firstPlace.teamNumber}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 mt-1 animate-glow-text">
                        {firstPlace.teamName}
                      </h3>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 space-y-1.5">
                      <div className="flex justify-between text-xs text-slate-700">
                        <span>Technical Quiz</span>
                        <strong className="font-mono">{firstPlace.technicalQuizScore} / 40</strong>
                      </div>
                      <div className="flex justify-between text-xs text-slate-700">
                        <span>IoT Simulation</span>
                        <strong className="font-mono">{firstPlace.iotSimulationScore} / 60</strong>
                      </div>
                      <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-amber-300/60">
                        <span>Cumulative Score</span>
                        <strong className="text-emerald-800 font-mono text-lg">{firstPlace.totalScore} / 100</strong>
                      </div>
                    </div>

                    {firstPlace.members && firstPlace.members.length > 0 && (
                      <div className="text-xs text-slate-600 pt-1">
                        <strong className="text-slate-800 block mb-1">Champions:</strong>
                        <ul className="space-y-1">
                          {firstPlace.members.map((m, i) => (
                            <li key={i} className="flex items-center gap-1.5 font-medium animate-slide-left" style={{ animationDelay: `${600 + i * 100}ms` }}>
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-icon-float" style={{ animationDelay: `${i * 0.3}s` }} />
                              <span>{m.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    Awaiting 1st Place Evaluation
                  </div>
                )}
              </div>
            </div>

            {/* 3rd Place Card (Bronze) */}
            <div className="order-3 animate-podium-rise podium-3">
              <div className="rounded-3xl bg-gradient-to-b from-amber-900/10 via-white to-amber-50/20 border-2 border-amber-700/30 p-6 shadow-sm relative overflow-hidden space-y-4 card-hover-3d">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1 animate-badge-pop" style={{ animationDelay: '600ms' }}>
                    <Medal className="w-3.5 h-3.5 text-amber-700" />
                    3rd Place
                  </span>
                  <span className="text-2xl font-black text-amber-800/40 animate-number-count" style={{ animationDelay: '700ms' }}>#3</span>
                </div>

                {thirdPlace ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        Team {thirdPlace.teamNumber}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {thirdPlace.teamName}
                      </h3>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Technical Quiz</span>
                        <strong className="font-mono">{thirdPlace.technicalQuizScore} / 40</strong>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>IoT Simulation</span>
                        <strong className="font-mono">{thirdPlace.iotSimulationScore} / 60</strong>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                        <span>Total Score</span>
                        <strong className="text-emerald-700 font-mono">{thirdPlace.totalScore} / 100</strong>
                      </div>
                    </div>

                    {thirdPlace.members && thirdPlace.members.length > 0 && (
                      <div className="text-xs text-slate-500 pt-1">
                        <strong className="text-slate-700 block mb-1">Team Members:</strong>
                        <ul className="space-y-0.5">
                          {thirdPlace.members.map((m, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{m.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    Awaiting 3rd Place Evaluation
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
