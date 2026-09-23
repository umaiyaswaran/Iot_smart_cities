import React, { useState, useEffect } from 'react';
import { Team, UserSession, EventSettings } from '../types';
import { judgeApi } from '../services/api';
import { 
  UserCheck, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Save, 
  AlertCircle, 
  LogOut, 
  Layers, 
  Search, 
  Sliders, 
  Sparkles, 
  FileText 
} from 'lucide-react';

interface JudgeDashboardProps {
  session: UserSession;
  onLogout: () => void;
  eventSettings: EventSettings | null;
}

export const JudgeDashboard: React.FC<JudgeDashboardProps> = ({
  session,
  onLogout,
  eventSettings,
}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form input state keyed by team id
  const [scoreInputs, setScoreInputs] = useState<
    Record<string, {
      quiz: string;
      problemRelevance: string;
      iotImplementation: string;
      simulationWorking: string;
      innovation: string;
      presentationViva: string;
      saving?: boolean;
    }>
  >({});

  const fetchJudgeTeams = async () => {
    setLoading(true);
    try {
      const data = await judgeApi.getMyTeams();
      setTeams(data);

      // Initialize inputs from data
      const initialInputs: Record<string, { quiz: string; simulation: string }> = {};
      data.forEach((t) => {
        initialInputs[t.id] = {
          quiz: t.technicalQuizScore !== null ? String(t.technicalQuizScore) : '',
          problemRelevance: t.problemRelevanceScore !== null && t.problemRelevanceScore !== undefined ? String(t.problemRelevanceScore) : '',
          iotImplementation: t.iotImplementationScore !== null && t.iotImplementationScore !== undefined ? String(t.iotImplementationScore) : '',
          simulationWorking: t.simulationWorkingScore !== null && t.simulationWorkingScore !== undefined ? String(t.simulationWorkingScore) : '',
          innovation: t.innovationScore !== null && t.innovationScore !== undefined ? String(t.innovationScore) : '',
          presentationViva: t.presentationVivaScore !== null && t.presentationVivaScore !== undefined ? String(t.presentationVivaScore) : '',
        };
      });
      setScoreInputs(initialInputs);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to fetch assigned teams' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudgeTeams();
  }, []);

  const handleScoreChange = (
    teamId: string,
    field: 'quiz' | 'problemRelevance' | 'iotImplementation' | 'simulationWorking' | 'innovation' | 'presentationViva',
    value: string
  ) => {
    setScoreInputs((prev) => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [field]: value,
      },
    }));
  };

  const handleSaveEvaluation = async (team: Team) => {
    const inputs = scoreInputs[team.id];
    if (!inputs) return;

    const quizNum = parseFloat(inputs.quiz);
    const criteria = {
      problemRelevanceScore: parseFloat(inputs.problemRelevance),
      iotImplementationScore: parseFloat(inputs.iotImplementation),
      simulationWorkingScore: parseFloat(inputs.simulationWorking),
      innovationScore: parseFloat(inputs.innovation),
      presentationVivaScore: parseFloat(inputs.presentationViva),
    };

    if (isNaN(quizNum) || quizNum < 0 || quizNum > 40) {
      setNotification({
        type: 'error',
        message: `Validation error for Team ${team.teamNumber}: Technical Quiz score must be between 0 and 40.`,
      });
      return;
    }

    const limits: Array<[string, number, number]> = [
      ['Problem & Relevance', criteria.problemRelevanceScore, 10],
      ['IoT Implementation', criteria.iotImplementationScore, 15],
      ['Simulation & Working', criteria.simulationWorkingScore, 15],
      ['Innovation', criteria.innovationScore, 10],
      ['Presentation & Viva', criteria.presentationVivaScore, 10],
    ];
    for (const [label, score, maximum] of limits) {
      if (isNaN(score) || score < 0 || score > maximum) {
        setNotification({
          type: 'error',
          message: `Validation error for Team ${team.teamNumber}: ${label} must be between 0 and ${maximum}.`,
        });
        return;
      }
    }

    // Set saving state
    setScoreInputs((prev) => ({
      ...prev,
      [team.id]: { ...prev[team.id], saving: true },
    }));

    try {
      const updated = await judgeApi.evaluateTeam(team.id, {
        technicalQuizScore: quizNum,
        ...criteria,
      });

      // Update local team state
      setTeams((prev) => prev.map((t) => (t.id === team.id ? updated : t)));

      setNotification({
        type: 'success',
        message: `Evaluation for Team ${team.teamNumber} (${team.teamName}) saved! Total: ${updated.totalScore} / 100. Standings & Scoreboard updated live.`,
      });

      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to save evaluation marks' });
    } finally {
      setScoreInputs((prev) => ({
        ...prev,
        [team.id]: { ...prev[team.id], saving: false },
      }));
    }
  };

  const filteredTeams = teams.filter(
    (t) =>
      t.teamName.toLowerCase().includes(search.toLowerCase()) ||
      t.teamNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-teal-100 text-teal-800 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Judge Workspace • {session.username}</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Technical Evaluation Desk
          </h1>
          <p className="text-xs text-slate-500">
            Assessing Euphoria'26 IoT Based Smart Cities Challenge. Both rounds are evaluated by the same judge for unified grading standard.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={fetchJudgeTeams}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload Assigned Teams</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Global Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs ${
            notification.type === 'success'
              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
              : 'bg-red-100 text-red-950 border border-red-300'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-600 hover:text-black font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Rules Notice */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-0.5 text-xs">
          <p className="font-bold text-teal-300">Official Scoring Bounds &amp; Tie-Breaker Priority:</p>
          <p className="text-slate-300">
            • <strong>Round 1 (Technical Quiz):</strong> Max 40 Marks &nbsp;|&nbsp; • <strong>Round 2 (IoT Simulation):</strong> Max 60 Marks &nbsp;|&nbsp; • <strong>Total:</strong> Max 100 Marks
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-teal-950 border border-teal-500/40 text-teal-300 text-[11px] font-mono font-bold shrink-0">
          Evaluated Teams: {teams.filter((t) => t.evaluationStatus === 'Evaluated').length} / {teams.length}
        </span>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assigned teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold shrink-0">
          Showing {filteredTeams.length} Assigned Teams
        </span>
      </div>

      {/* Assigned Teams Evaluation Cards / List */}
      {loading ? (
        <div className="p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Loading assigned teams...</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
          <p className="text-slate-700 font-bold text-base">No Assigned Teams Found</p>
          <p className="text-xs text-slate-500">
            Admin assigns teams to this Judge account. Click "Reload Assigned Teams" if new assignments were just granted.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTeams.map((team) => {
            const inputs = scoreInputs[team.id] || {
              quiz: '',
              problemRelevance: '',
              iotImplementation: '',
              simulationWorking: '',
              innovation: '',
              presentationViva: '',
              saving: false,
            };
            const qVal = parseFloat(inputs.quiz) || 0;
            const criteriaTotal = [inputs.problemRelevance, inputs.iotImplementation, inputs.simulationWorking, inputs.innovation, inputs.presentationViva]
              .reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
            const calculatedTotal = qVal + criteriaTotal;
            const isEvaluated = team.evaluationStatus === 'Evaluated';

            return (
              <div
                key={team.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition p-6 space-y-6"
              >
                {/* Team Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-md bg-teal-100 text-teal-900 font-mono font-black text-sm">
                        Team {team.teamNumber}
                      </span>
                      <h2 className="text-xl font-bold text-slate-900">
                        {team.teamName}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500">
                      Assigned Judge: <strong className="text-slate-700">{team.assignedJudge}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        isEvaluated
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isEvaluated ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Evaluated</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Evaluation</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Team Members info snippet */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Team Members:</span>
                  {team.members.map((m) => (
                    <span key={m.id} className="inline-flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${m.attendance === 'Present' ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                      <strong>{m.name}</strong>
                      <span className="text-slate-400 font-mono text-[10px]">({m.registerNumber})</span>
                    </span>
                  ))}
                </div>

                {/* Two-Round Marks Scoring Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  
                  {/* Round 1 Score Input */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        ROUND 1: Technical Quiz
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">Max: 50 Marks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="0.5"
                        placeholder="0 - 40"
                        value={inputs.quiz}
                        onChange={(e) => handleScoreChange(team.id, 'quiz', e.target.value)}
                        className="w-full px-3 py-2 text-base font-bold font-mono text-slate-900 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-400 font-mono">/ 40</span>
                    </div>
                    <p className="text-[11px] text-slate-500">IoT standards, sensors &amp; protocols</p>
                  </div>

                  {/* Round 2 Criteria Inputs */}
                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-3 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                        ROUND 2: IoT Simulation
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">Max: 60 Marks</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {([
                        ['problemRelevance', 'Problem & Relevance', 10],
                        ['iotImplementation', 'IoT Implementation', 15],
                        ['simulationWorking', 'Simulation & Working', 15],
                        ['innovation', 'Innovation', 10],
                        ['presentationViva', 'Presentation & Viva', 10],
                      ] as const).map(([field, label, maximum]) => (
                        <label key={field} className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-700">
                          <span>{label} <span className="text-slate-400">/{maximum}</span></span>
                          <input
                            type="number"
                            min="0"
                            max={maximum}
                            step="0.5"
                            value={inputs[field]}
                            onChange={(e) => handleScoreChange(team.id, field, e.target.value)}
                            className="w-20 px-2 py-1.5 text-sm font-bold font-mono rounded-lg border border-teal-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </label>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">Criteria total: {criteriaTotal} / 60</p>
                  </div>

                  {/* Total & Save Actions */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                        Calculated Total Score
                      </span>
                      <span className="text-xs text-slate-400">/ 100 Marks</span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black font-mono text-emerald-400">
                        {calculatedTotal}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({inputs.quiz || 0} + {criteriaTotal})
                      </span>
                    </div>

                    <button
                      id={`judge-save-score-${team.teamNumber}`}
                      onClick={() => handleSaveEvaluation(team)}
                      disabled={inputs.saving}
                      className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-slate-950" />
                      <span>
                        {inputs.saving
                          ? 'Saving Marks...'
                          : isEvaluated
                          ? 'Update Evaluation'
                          : 'Save Evaluation'}
                      </span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
