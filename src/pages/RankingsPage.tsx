import React, { useEffect, useState } from 'react';
import { publicApi } from '../services/api';
import { PublicTeamScore } from '../types';
import { Award, RefreshCw, Scale, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

export const RankingsPage: React.FC = () => {
  const [rankings, setRankings] = useState<PublicTeamScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const data = await publicApi.getRankings();
      setRankings(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load rankings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-emerald-600 animate-icon-float" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
              Official Leaderboard
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display animate-slide-bottom" style={{ animationDelay: '100ms' }}>
            Event Rankings &amp; Score Matrix
          </h1>
          <p className="text-xs text-slate-500 animate-slide-bottom" style={{ animationDelay: '200ms' }}>
            Computed automatically based on Round 1 (Technical Quiz) and Round 2 (IoT Based Simulation) evaluations.
          </p>
        </div>

        <button
          onClick={fetchRankings}
          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Update Leaderboard</span>
        </button>
      </div>

      {/* Tie-Breaking Notice Card */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3.5 shadow-2xs animate-slide-bottom neon-border-hover" style={{ animationDelay: '200ms' }}>
        <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 animate-icon-float">
          <Scale className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
            Official Tie-Breaking Resolution Protocol
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In cases where two or more teams achieve an identical <strong>Total Score</strong>, rank placement is determined by:
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-semibold text-emerald-900">
            <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 shadow-2xs">
              1. Technical Quiz Score (/40)
            </span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 shadow-2xs">
              2. IoT Simulation Score (/60)
            </span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 shadow-2xs">
              3. Jury/Admin Manual Resolution
            </span>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      {error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-center text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Calculating rank standings...</p>
        </div>
      ) : rankings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <p className="text-slate-700 font-bold text-base">No Evaluated Teams Yet</p>
          <p className="text-xs text-slate-500">Rankings will populate dynamically as soon as judges evaluate teams.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 text-center w-20">Rank</th>
                  <th className="py-4 px-6 text-center w-28">Team No</th>
                  <th className="py-4 px-6">Team Name</th>
                  <th className="py-4 px-6 text-center w-36">Technical Quiz (40M)</th>
                  <th className="py-4 px-6 text-center w-36">IoT Simulation (60M)</th>
                  <th className="py-4 px-6 text-right w-36">Total (100M)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {rankings.map((team, index) => {
                  const isTop3 = team.rank !== null && team.rank <= 3;
                  return (
                    <tr
                      key={team.teamNumber}
                      className={`hover:bg-emerald-50/40 transition-all duration-200 table-row-stagger ${
                        team.rank === 1
                          ? 'bg-amber-50/40 font-medium'
                          : team.rank === 2
                          ? 'bg-slate-100/40'
                          : team.rank === 3
                          ? 'bg-amber-100/30'
                          : ''
                      }`}
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      {/* Rank */}
                      <td className="py-4 px-6 text-center">
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
                            <span className="text-slate-700 font-bold text-sm">
                              {team.rank}
                            </span>
                          )}
                        </div>
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

                      {/* Round 1: Technical Quiz */}
                      <td className="py-4 px-6 text-center font-mono">
                        <span className="text-slate-800 font-semibold">
                          {team.technicalQuizScore ?? 0}
                        </span>
                        <span className="text-xs text-slate-400 font-normal"> / 40</span>
                      </td>

                      {/* Round 2: IoT Simulation */}
                      <td className="py-4 px-6 text-center font-mono">
                        <span className="text-slate-800 font-semibold">
                          {team.iotSimulationScore ?? 0}
                        </span>
                        <span className="text-xs text-slate-400 font-normal"> / 60</span>
                      </td>

                      {/* Total Score */}
                      <td className="py-4 px-6 text-right">
                        <div className="font-black text-emerald-800 text-base font-mono">
                          {team.totalScore}
                          <span className="text-xs text-slate-400 font-normal font-sans"> / 100</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
