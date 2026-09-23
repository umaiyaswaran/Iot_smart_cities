import React, { useEffect, useState } from 'react';
import { publicApi } from '../services/api';
import { PublicTeamScore } from '../types';
import { Radio, RefreshCw, Search, Trophy, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const ScoreboardPage: React.FC = () => {
  const [scores, setScores] = useState<PublicTeamScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchScores = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await publicApi.getScoreboard();
      setScores(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live scoreboard');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores(true);
  }, []);

  // Periodic polling for real-time live scoreboard
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchScores(false);
    }, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredScores = scores.filter(
    (t) =>
      t.teamName.toLowerCase().includes(search.toLowerCase()) ||
      t.teamNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
              Live Official Telemetry
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display animate-slide-bottom" style={{ animationDelay: '100ms' }}>
            Live Event Scoreboard
          </h1>
          <p className="text-xs text-slate-500 animate-slide-bottom" style={{ animationDelay: '200ms' }}>
            Real-time standings for Euphoria'26 IoT Based Smart Cities Challenge. Data synchronized directly with the evaluation database.
          </p>
        </div>

        {/* Controls: Auto-refresh & Manual Refresh */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer select-none bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>Auto-refresh (8s)</span>
          </label>

          <button
            onClick={() => fetchScores(false)}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
            title="Refresh immediately"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Last Sync bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by team number or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Last synchronized: <strong>{lastUpdated.toLocaleTimeString()}</strong>
          </span>
        </div>
      </div>

      {/* Scoreboard Content */}
      {error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-center text-sm">
          {error}
        </div>
      ) : loading && scores.length === 0 ? (
        <div className="p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Loading live scores from database...</p>
        </div>
      ) : filteredScores.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <p className="text-slate-700 font-bold text-base">No matching teams found</p>
          <p className="text-xs text-slate-500">Try searching with a different keyword or check back shortly.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 text-center w-20">Rank</th>
                  <th className="py-4 px-6 text-center w-32">Team No</th>
                  <th className="py-4 px-6">Team Name</th>
                  <th className="py-4 px-6 text-center w-36">Evaluation</th>
                  <th className="py-4 px-6 text-right w-36">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredScores.map((team, index) => {
                  const isTop3 = team.rank !== null && team.rank <= 3;
                  return (
                    <tr
                      key={team.teamNumber}
                      className={`hover:bg-emerald-50/40 transition-all duration-200 table-row-stagger ${
                        team.rank === 1
                          ? 'bg-amber-50/30'
                          : team.rank === 2
                          ? 'bg-slate-100/30'
                          : team.rank === 3
                          ? 'bg-amber-100/20'
                          : ''
                      }`}
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-6 text-center">
                        {team.rank !== null ? (
                          <div className="inline-flex items-center justify-center">
                            {team.rank === 1 ? (
                              <span className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs animate-rank-pop">
                                1
                              </span>
                            ) : team.rank === 2 ? (
                              <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-black flex items-center justify-center text-sm shadow-xs animate-rank-pop" style={{ animationDelay: '100ms' }}>
                                2
                              </span>
                            ) : team.rank === 3 ? (
                              <span className="w-8 h-8 rounded-full bg-amber-700/80 text-white font-black flex items-center justify-center text-sm shadow-xs animate-rank-pop" style={{ animationDelay: '200ms' }}>
                                3
                              </span>
                            ) : (
                              <span className="text-slate-600 font-bold text-sm">
                                {team.rank}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 font-medium text-xs">--</span>
                        )}
                      </td>

                      {/* Team Number */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-bold text-xs font-mono">
                          Team {team.teamNumber}
                        </span>
                      </td>

                      {/* Team Name */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className={isTop3 ? 'animate-glow-text' : ''}>{team.teamName}</span>
                          {isTop3 && (
                            <Trophy className="w-4 h-4 text-amber-500 shrink-0 animate-crown-bounce" />
                          )}
                        </div>
                      </td>

                      {/* Evaluation Status */}
                      <td className="py-4 px-6 text-center">
                        {team.evaluationStatus === 'Evaluated' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Evaluated</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Total Score */}
                      <td className="py-4 px-6 text-right">
                        {team.totalScore !== null ? (
                          <div className="font-black text-emerald-700 text-base">
                            {team.totalScore}
                            <span className="text-xs text-slate-400 font-normal"> / 100</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Awaiting marks</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>* Live scores reflect cumulative marks from Round 1 (Technical Quiz / 40) and Round 2 (IoT Simulation / 60).</span>
        <span className="font-semibold text-emerald-800">100 Marks Maximum</span>
      </div>

    </div>
  );
};
