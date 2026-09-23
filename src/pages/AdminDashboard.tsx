import React, { useState, useEffect } from 'react';
import { 
  AdminTab, 
  Team, 
  TeamMember, 
  EventSettings, 
  UserSession 
} from '../types';
import { adminApi, publicApi } from '../services/api';
import { generateAttendanceExcel, generateWinnersPDF } from '../utils/pdfGenerator';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  UserCheck, 
  CalendarCheck, 
  ClipboardCheck, 
  Radio, 
  Award, 
  Trophy, 
  KeyRound, 
  FileDown, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  Clock, 
  LogOut 
} from 'lucide-react';

interface AdminDashboardProps {
  session: UserSession;
  onLogout: () => void;
  eventSettings: EventSettings | null;
  onEventSettingsChange: (settings: EventSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  session,
  onLogout,
  eventSettings,
  onEventSettingsChange,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');

  // Delete team modal state
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add Team Form State
  const [newTeamNumber, setNewTeamNumber] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newAssignedJudge, setNewAssignedJudge] = useState('Judge');
  const [newMembers, setNewMembers] = useState<Array<Omit<TeamMember, 'id'>>>([
    {
      name: '',
      registerNumber: '',
      collegeName: 'Meenakshi Sundarajan Engineering College',
      phoneNumber: '',
      department: 'Civil Engineering',
      academicYear: 'Third Year (III)',
      attendance: 'Absent',
    },
  ]);
  const [addTeamLoading, setAddTeamLoading] = useState(false);

  // Edit Team Modal State
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editingEvaluationTeam, setEditingEvaluationTeam] = useState<Team | null>(null);
  const [evaluationQuizScore, setEvaluationQuizScore] = useState('');
  const [evaluationCriteria, setEvaluationCriteria] = useState({
    problemRelevanceScore: '',
    iotImplementationScore: '',
    simulationWorkingScore: '',
    innovationScore: '',
    presentationVivaScore: '',
  });
  const [evaluationStatus, setEvaluationStatus] = useState<Team['evaluationStatus']>('Evaluated');
  const [evaluationEditLoading, setEvaluationEditLoading] = useState(false);

  const handleAddEditingMember = () => {
    if (!editingTeam) return;
    setEditingTeam({
      ...editingTeam,
      members: [
        ...editingTeam.members,
        {
          id: `draft_${Date.now()}`,
          name: '',
          registerNumber: '',
          collegeName: 'Meenakshi Sundarajan Engineering College',
          phoneNumber: '',
          department: 'Civil Engineering',
          academicYear: 'Third Year (III)',
          attendance: 'Absent',
        },
      ],
    });
  };

  const handleRemoveEditingMember = (index: number) => {
    if (!editingTeam || editingTeam.members.length <= 1) return;
    setEditingTeam({
      ...editingTeam,
      members: editingTeam.members.filter((_, memberIndex) => memberIndex !== index),
    });
  };

  const handleEditingMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    if (!editingTeam) return;
    const members = editingTeam.members.map((member, memberIndex) =>
      memberIndex === index ? { ...member, [field]: value } : member
    );
    setEditingTeam({ ...editingTeam, members });
  };

  const findDuplicateMember = (members: Array<Pick<TeamMember, 'name' | 'registerNumber'>>) => {
    const seen = new Set<string>();
    for (const member of members) {
      const key = member.registerNumber.trim().toLowerCase() || member.name.trim().toLowerCase();
      if (key && seen.has(key)) return member.registerNumber.trim() || member.name.trim();
      if (key) seen.add(key);
    }
    return null;
  };

  const openEvaluationEditor = (team: Team) => {
    setEditingEvaluationTeam(team);
    setEvaluationQuizScore(team.technicalQuizScore === null ? '' : String(team.technicalQuizScore));
    setEvaluationCriteria({
      problemRelevanceScore: team.problemRelevanceScore == null ? '' : String(team.problemRelevanceScore),
      iotImplementationScore: team.iotImplementationScore == null ? '' : String(team.iotImplementationScore),
      simulationWorkingScore: team.simulationWorkingScore == null ? '' : String(team.simulationWorkingScore),
      innovationScore: team.innovationScore == null ? '' : String(team.innovationScore),
      presentationVivaScore: team.presentationVivaScore == null ? '' : String(team.presentationVivaScore),
    });
    setEvaluationStatus(team.evaluationStatus);
  };

  const handleSaveEvaluationEdit = async () => {
    if (!editingEvaluationTeam) return;

    const quizScore = Number(evaluationQuizScore);
    const criteriaScores = Object.fromEntries(
      Object.entries(evaluationCriteria).map(([key, value]) => [key, Number(value)])
    ) as Record<keyof typeof evaluationCriteria, number>;
    const simulationScore = Object.values(criteriaScores).reduce((sum, value) => sum + value, 0);
    if (evaluationStatus === 'Evaluated' && (!Number.isFinite(quizScore) || quizScore < 0 || quizScore > 40)) {
      showNotification('error', 'Technical Quiz score must be between 0 and 40');
      return;
    }
    if (evaluationStatus === 'Evaluated') {
      const limits: Array<[keyof typeof evaluationCriteria, string, number]> = [
        ['problemRelevanceScore', 'Problem & Relevance', 10],
        ['iotImplementationScore', 'IoT Implementation', 15],
        ['simulationWorkingScore', 'Simulation & Working', 15],
        ['innovationScore', 'Innovation', 10],
        ['presentationVivaScore', 'Presentation & Viva', 10],
      ];
      for (const [key, label, maximum] of limits) {
        if (!Number.isFinite(criteriaScores[key]) || criteriaScores[key] < 0 || criteriaScores[key] > maximum) {
          showNotification('error', `${label} must be between 0 and ${maximum}`);
          return;
        }
      }
    }

    setEvaluationEditLoading(true);
    try {
      await adminApi.updateTeam(editingEvaluationTeam.id, {
        technicalQuizScore: evaluationStatus === 'Evaluated' ? quizScore : null,
        iotSimulationScore: evaluationStatus === 'Evaluated' ? simulationScore : null,
        ...Object.fromEntries(
          Object.entries(criteriaScores).map(([key, value]) => [key, evaluationStatus === 'Evaluated' ? value : null])
        ),
        evaluationStatus,
      });
      showNotification('success', `Evaluation for Team ${editingEvaluationTeam.teamNumber} updated successfully`);
      setEditingEvaluationTeam(null);
      await fetchAllAdminData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update evaluation');
    } finally {
      setEvaluationEditLoading(false);
    }
  };

  // Judge Password State
  const [judgeNewPassword, setJudgeNewPassword] = useState('');
  const [judgePasswordLoading, setJudgePasswordLoading] = useState(false);

  // Event Settings Edit State
  const [settingsForm, setSettingsForm] = useState<EventSettings | null>(eventSettings);

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [teamsData, statsData, settingsData] = await Promise.all([
        adminApi.getTeams(),
        adminApi.getStats(),
        publicApi.getEventSettings(),
      ]);
      setTeams(teamsData);
      setStats(statsData);
      setSettingsForm(settingsData);
      onEventSettingsChange(settingsData);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to load administration data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  // Add Team Member Row
  const handleAddMemberRow = () => {
    setNewMembers([
      ...newMembers,
      {
        name: '',
        registerNumber: '',
        collegeName: 'Meenakshi Sundarajan Engineering College',
        phoneNumber: '',
        department: 'Civil Engineering',
        academicYear: 'Third Year (III)',
        attendance: 'Absent',
      },
    ]);
  };

  const handleRemoveMemberRow = (index: number) => {
    if (newMembers.length <= 1) return;
    setNewMembers(newMembers.filter((_, idx) => idx !== index));
  };

  // Submit New Team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamNumber.trim() || !newTeamName.trim()) {
      showNotification('error', 'Team Number and Team Name are required');
      return;
    }

    // Check duplicate team number
    const duplicate = teams.some((t) => t.teamNumber.trim() === newTeamNumber.trim());
    if (duplicate) {
      showNotification('error', `Team Number "${newTeamNumber}" is already registered!`);
      return;
    }

    const submittedMembers = newMembers.filter((member) => member.name.trim().length > 0);
    const duplicateMember = findDuplicateMember(submittedMembers);
    if (duplicateMember) {
      showNotification('error', `Duplicate member detected: ${duplicateMember}`);
      return;
    }

    setAddTeamLoading(true);
    try {
      await adminApi.addTeam({
        teamNumber: newTeamNumber.trim(),
        teamName: newTeamName.trim(),
        assignedJudge: newAssignedJudge,
        members: submittedMembers,
      });

      showNotification('success', `Team ${newTeamNumber} successfully created and permanently stored!`);
      // Reset form
      setNewTeamNumber('');
      setNewTeamName('');
      setNewMembers([
        {
          name: '',
          registerNumber: '',
          collegeName: 'Meenakshi Sundarajan Engineering College',
          phoneNumber: '',
          department: 'Civil Engineering',
          academicYear: 'Third Year (III)',
          attendance: 'Absent',
        },
      ]);
      await fetchAllAdminData();
      setActiveTab('teams');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to create team');
    } finally {
      setAddTeamLoading(false);
    }
  };

  // Delete Team Confirmed
  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteTeam(teamToDelete.id);
      showNotification('success', `Team ${teamToDelete.teamNumber} (${teamToDelete.teamName}) has been permanently deleted.`);
      setTeamToDelete(null);
      await fetchAllAdminData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete team');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Assign Judge to Team
  const handleQuickAssignJudge = async (teamId: string, judgeName: string) => {
    try {
      await adminApi.assignJudge(teamId, judgeName);
      showNotification('success', `Assigned judge updated to "${judgeName}"`);
      await fetchAllAdminData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to assign judge');
    }
  };

  // Toggle Attendance
  const handleToggleAttendance = async (team: Team, memberId: string, currentStatus: 'Present' | 'Absent') => {
    const nextStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
    const payload = team.members.map((m) => ({
      memberId: m.id,
      attendance: m.id === memberId ? nextStatus : m.attendance,
    }));

    try {
      await adminApi.updateAttendance(team.id, payload);
      // Update local state smoothly
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id === team.id) {
            return {
              ...t,
              members: t.members.map((m) => (m.id === memberId ? { ...m, attendance: nextStatus } : m)),
            };
          }
          return t;
        })
      );
      // Refresh stats
      const newStats = await adminApi.getStats();
      setStats(newStats);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update attendance');
    }
  };

  // Change Judge Password
  const handleChangeJudgePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeNewPassword || judgeNewPassword.length < 4) {
      showNotification('error', 'New password must be at least 4 characters long');
      return;
    }

    setJudgePasswordLoading(true);
    try {
      await adminApi.changeJudgePassword(judgeNewPassword, 'Judge');
      showNotification('success', 'Judge password successfully updated in database!');
      setJudgeNewPassword('');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update judge password');
    } finally {
      setJudgePasswordLoading(false);
    }
  };

  // Update Event Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;

    try {
      const updated = await adminApi.updateEventSettings(settingsForm);
      onEventSettingsChange(updated);
      showNotification('success', 'Event settings and status successfully updated!');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update event settings');
    }
  };

  const navMenuItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'teams', label: 'Teams', icon: <Users className="w-4 h-4" /> },
    { id: 'add-team', label: 'Add Team', icon: <UserPlus className="w-4 h-4" /> },
    { id: 'assign-judge', label: 'Assign Judge', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'evaluations', label: 'Evaluations', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'live-scores', label: 'Live Scores', icon: <Radio className="w-4 h-4" /> },
    { id: 'rankings', label: 'Rankings', icon: <Award className="w-4 h-4" /> },
    { id: 'winners', label: 'Winners', icon: <Trophy className="w-4 h-4" /> },
    { id: 'judge-settings', label: 'Judge Account Settings', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'pdf-reports', label: 'Reports', icon: <FileDown className="w-4 h-4" /> },
    { id: 'event-settings', label: 'Event Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const filteredTeams = teams.filter(
    (t) =>
      t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teamNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[85vh] bg-slate-50 flex flex-col md:flex-row animate-in fade-in duration-200">
      
      {/* Admin Sidebar Navigation (Section 7) */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 p-4 space-y-6 shrink-0">
        <div className="px-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
              ADMINISTRATION
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-1">
            Admin Console
          </h2>
          <p className="text-xs text-slate-400">Euphoria'26 Management</p>
        </div>

        <nav className="space-y-1">
          {navMenuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-800 px-2 space-y-2">
          <div className="text-[11px] text-slate-400">
            Current Status: <strong className="text-emerald-400">{eventSettings?.eventStatus}</strong>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-950/50 hover:text-red-300 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Pane */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto space-y-6">
        
        {/* Global Banner Notification */}
        {actionMessage && (
          <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            actionMessage.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-red-100 text-red-900 border border-red-300'
          }`}>
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: DASHBOARD */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Executive Overview</h1>
                <p className="text-xs text-slate-500">Live summary of teams, participants, attendance and scoring progress</p>
              </div>
              <button
                onClick={fetchAllAdminData}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Data</span>
              </button>
            </div>

            {/* Metric KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Teams</span>
                <p className="text-3xl font-black text-slate-900">{stats?.totalTeams ?? teams.length}</p>
                <p className="text-xs text-emerald-700 font-medium">Permanent Registry</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Participants</span>
                <p className="text-3xl font-black text-slate-900">{stats?.totalParticipants ?? 0}</p>
                <p className="text-xs text-slate-500">Registered Students</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
                <p className="text-3xl font-black text-emerald-700">{stats?.attendancePercentage ?? 0}%</p>
                <p className="text-xs text-slate-500">{stats?.presentCount ?? 0} Present / {stats?.absentCount ?? 0} Absent</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Evaluation Completed</span>
                <p className="text-3xl font-black text-teal-700">{stats?.evaluatedTeams ?? 0} / {stats?.totalTeams ?? 0}</p>
                <p className="text-xs text-slate-500">{stats?.pendingTeams ?? 0} Pending</p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Quick Administration Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveTab('add-team')}
                  className="p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-3 transition cursor-pointer"
                >
                  <UserPlus className="w-5 h-5 text-emerald-700" />
                  <div className="text-left">
                    <p className="font-bold">Register New Team</p>
                    <span className="text-[11px] font-normal text-emerald-800">Add team &amp; members</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('attendance')}
                  className="p-4 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-bold text-xs flex items-center gap-3 transition cursor-pointer"
                >
                  <CalendarCheck className="w-5 h-5 text-teal-700" />
                  <div className="text-left">
                    <p className="font-bold">Mark Attendance</p>
                    <span className="text-[11px] font-normal text-teal-800">Toggle Present/Absent</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('pdf-reports')}
                  className="p-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-bold text-xs flex items-center gap-3 transition cursor-pointer"
                >
                  <FileDown className="w-5 h-5 text-slate-700" />
                  <div className="text-left">
                    <p className="font-bold">Download Official Reports</p>
                    <span className="text-[11px] font-normal text-slate-600">Attendance Excel &amp; Winners PDF</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: TEAMS (Section 22) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'teams' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registered Teams Roster</h1>
                <p className="text-xs text-slate-500">Manage, edit, reassign or permanently delete registered teams</p>
              </div>
              <button
                onClick={() => setActiveTab('add-team')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Team</span>
              </button>
            </div>

            {/* Filter */}
            <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by team name or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <span className="text-xs text-slate-500 font-semibold shrink-0">
                {filteredTeams.length} of {teams.length} Teams
              </span>
            </div>

            {/* Teams Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 text-center">Team No</th>
                      <th className="py-3 px-4">Team Name</th>
                      <th className="py-3 px-4">Members</th>
                      <th className="py-3 px-4 text-center">Assigned Judge</th>
                      <th className="py-3 px-4 text-center">Quiz (40)</th>
                      <th className="py-3 px-4 text-center">Simulation (60)</th>
                      <th className="py-3 px-4 text-center">Total (100)</th>
                      <th className="py-3 px-4 text-center">Rank</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeams.map((team) => (
                      <tr key={team.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 text-center font-bold font-mono">
                          <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-900">
                            {team.teamNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {team.teamName}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5 max-w-xs">
                            {team.members.map((m) => (
                              <div key={m.id} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                <span className={`w-1.5 h-1.5 rounded-full ${m.attendance === 'Present' ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                                <span>{m.name}</span>
                                <span className="text-slate-400 font-mono text-[10px]">({m.registerNumber})</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-700">
                          {team.assignedJudge}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {team.technicalQuizScore !== null ? team.technicalQuizScore : '--'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {team.iotSimulationScore !== null ? team.iotSimulationScore : '--'}
                        </td>
                        <td className="py-3 px-4 text-center font-bold font-mono text-emerald-800">
                          {team.totalScore !== null ? `${team.totalScore}` : '--'}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {team.rank !== null ? `#${team.rank}` : '--'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            team.evaluationStatus === 'Evaluated'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {team.evaluationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              id={`admin-edit-team-${team.teamNumber}`}
                              onClick={() => setEditingTeam(team)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                              title="Edit Team"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`admin-delete-team-${team.teamNumber}`}
                              onClick={() => setTeamToDelete(team)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Delete Team"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: ADD TEAM (Section 8) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'add-team' && (
          <div className="max-w-4xl space-y-6 animate-in fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Register New Team</h1>
              <p className="text-xs text-slate-500">
                Add team details and dynamic multiple members. Teams are permanently stored in the database.
              </p>
            </div>

            <form onSubmit={handleCreateTeam} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Team Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. 06"
                    value={newTeamNumber}
                    onChange={(e) => setNewTeamNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Team Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Smart City Innovators"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Assigned Judge</label>
                <select
                  value={newAssignedJudge}
                  onChange={(e) => setNewAssignedJudge(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Judge">Judge (Official Evaluator)</option>
                  <option value="Judge 1">Judge 1</option>
                  <option value="Judge 2">Judge 2</option>
                </select>
              </div>

              {/* Dynamic Members Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Team Members ({newMembers.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddMemberRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Member</span>
                  </button>
                </div>

                {newMembers.map((member, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Member {idx + 1}</span>
                      {newMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberRow(idx)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-500 font-semibold mb-1">Member Name *</label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={member.name}
                          onChange={(e) => {
                            const updated = [...newMembers];
                            updated[idx].name = e.target.value;
                            setNewMembers(updated);
                          }}
                          required
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 font-semibold mb-1">Register Number *</label>
                        <input
                          type="text"
                          placeholder="e.g. 311522103099"
                          value={member.registerNumber}
                          onChange={(e) => {
                            const updated = [...newMembers];
                            updated[idx].registerNumber = e.target.value;
                            setNewMembers(updated);
                          }}
                          required
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 font-semibold mb-1">College Name *</label>
                        <input
                          type="text"
                          value={member.collegeName}
                          onChange={(e) => {
                            const updated = [...newMembers];
                            updated[idx].collegeName = e.target.value;
                            setNewMembers(updated);
                          }}
                          required
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 font-semibold mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          placeholder="e.g. 9840123456"
                          value={member.phoneNumber}
                          onChange={(e) => {
                            const updated = [...newMembers];
                            updated[idx].phoneNumber = e.target.value;
                            setNewMembers(updated);
                          }}
                          required
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 font-semibold mb-1">Department</label>
                        <input
                          type="text"
                          value={member.department}
                          onChange={(e) => {
                            const updated = [...newMembers];
                            updated[idx].department = e.target.value;
                            setNewMembers(updated);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-500 font-semibold mb-1">Academic Year</label>
                        <select
                          value={member.academicYear}
                          onChange={(e) => {
                            const updated = [...newMembers];
                            updated[idx].academicYear = e.target.value;
                            setNewMembers(updated);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="First Year (I)">First Year (I)</option>
                          <option value="Second Year (II)">Second Year (II)</option>
                          <option value="Third Year (III)">Third Year (III)</option>
                          <option value="Final Year (IV)">Final Year (IV)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={addTeamLoading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{addTeamLoading ? 'Saving to Database...' : 'Save Team Permanently'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: ASSIGN JUDGE (Section 12) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'assign-judge' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Judge Assignment</h1>
              <p className="text-xs text-slate-500">
                Assign or reassign teams to technical judges. Assigned teams will instantly appear on the judge's dashboard.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 text-center w-24">Team No</th>
                      <th className="py-3 px-4">Team Name</th>
                      <th className="py-3 px-4 text-center">Current Judge</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Reassign Judge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teams.map((team) => (
                      <tr key={team.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-center font-bold font-mono">
                          Team {team.teamNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {team.teamName}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-emerald-800">
                          {team.assignedJudge}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            team.evaluationStatus === 'Evaluated'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {team.evaluationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={team.assignedJudge}
                            onChange={(e) => handleQuickAssignJudge(team.id, e.target.value)}
                            className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="Judge">Judge</option>
                            <option value="Judge 1">Judge 1</option>
                            <option value="Judge 2">Judge 2</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: ATTENDANCE (Section 17) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Participant Attendance Desk</h1>
                <p className="text-xs text-slate-500">
                  Managed strictly by Admin. Mark Present or Absent for each registered team member.
                </p>
              </div>

              {/* Attendance quick KPI */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold">
                  {stats?.presentCount ?? 0} Present / {stats?.totalParticipants ?? 0} Total ({stats?.attendancePercentage ?? 0}%)
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-xs font-bold font-mono">
                        Team {team.teamNumber}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{team.teamName}</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {team.members.length} Registered Members
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition ${
                          member.attendance === 'Present'
                            ? 'bg-emerald-50/70 border-emerald-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs text-slate-900">{member.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{member.registerNumber}</p>
                          <p className="text-[10px] text-slate-400">{member.department} ({member.academicYear})</p>
                        </div>

                        <button
                          onClick={() => handleToggleAttendance(team, member.id, member.attendance)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            member.attendance === 'Present'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {member.attendance}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: EVALUATIONS (Section 23) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'evaluations' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Evaluation Monitor</h1>
              <p className="text-xs text-slate-500">
                Track real-time evaluation scores submitted by technical judges for each round
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 text-center">Team No</th>
                      <th className="py-3 px-4">Team Name</th>
                      <th className="py-3 px-4 text-center">Assigned Judge</th>
                      <th className="py-3 px-4 text-center">Technical Quiz (/40)</th>
                      <th className="py-3 px-4 text-center">IoT Simulation (/60)</th>
                      <th className="py-3 px-4 text-center">Total (/100)</th>
                      <th className="py-3 px-4 text-center">Rank</th>
                      <th className="py-3 px-4 text-center">Evaluation Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teams.map((team) => (
                      <tr key={team.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-center font-bold font-mono">
                          Team {team.teamNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {team.teamName}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">
                          {team.assignedJudge}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          {team.technicalQuizScore !== null ? `${team.technicalQuizScore} / 40` : '--'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          {team.iotSimulationScore !== null ? `${team.iotSimulationScore} / 60` : '--'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-800 text-sm">
                          {team.totalScore !== null ? `${team.totalScore} / 100` : '--'}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {team.rank !== null ? `#${team.rank}` : '--'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            team.evaluationStatus === 'Evaluated'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {team.evaluationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => openEvaluationEditor(team)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 transition"
                            title="Edit evaluation scores and status"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: LIVE SCORES */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'live-scores' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Administrative Live Scoreboard</h1>
              <p className="text-xs text-slate-500">Live score feed mirror with instant reload capability</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <div key={team.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
                        Team {team.teamNumber}
                      </span>
                      {team.rank && (
                        <span className="text-xs font-bold text-slate-400">Rank #{team.rank}</span>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{team.teamName}</p>
                    <p className="text-xs text-slate-500">
                      Quiz: <strong>{team.technicalQuizScore ?? '--'}</strong> | Simulation: <strong>{team.iotSimulationScore ?? '--'}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-800 font-mono">
                      {team.totalScore ?? '--'}
                    </span>
                    <span className="text-xs text-slate-400 block">/ 100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 8: RANKINGS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'rankings' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Full Leaderboard Rankings</h1>
              <p className="text-xs text-slate-500">Automated ranking matrix using tie-breaking hierarchy</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <strong className="block">Tie-Breaking Protocol Enabled:</strong>
              <span>1st: Technical Quiz score → 2nd: IoT Based Simulation score → 3rd: Admin resolution</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 text-center">Rank</th>
                      <th className="py-3 px-4 text-center">Team No</th>
                      <th className="py-3 px-4">Team Name</th>
                      <th className="py-3 px-4 text-center">Quiz (/40)</th>
                      <th className="py-3 px-4 text-center">Simulation (/60)</th>
                      <th className="py-3 px-4 text-center">Total (/100)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teams
                      .filter((t) => t.evaluationStatus === 'Evaluated' && t.totalScore !== null)
                      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
                      .map((team) => (
                        <tr key={team.id} className="hover:bg-slate-50 font-medium">
                          <td className="py-3 px-4 text-center font-bold">
                            #{team.rank}
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            Team {team.teamNumber}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {team.teamName}
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            {team.technicalQuizScore} / 40
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            {team.iotSimulationScore} / 60
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-emerald-800 text-sm">
                            {team.totalScore} / 100
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 9: WINNERS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'winners' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Championship Winners Podium</h1>
              <p className="text-xs text-slate-500">Live preview of Top 3 winners calculated from database scores</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((place) => {
                const team = teams.find((t) => t.rank === place);
                return (
                  <div key={place} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-900">
                        Rank #{place}
                      </span>
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </div>

                    {team ? (
                      <div className="space-y-2">
                        <span className="text-xs font-mono font-bold text-slate-500">Team {team.teamNumber}</span>
                        <h3 className="font-bold text-slate-900 text-base">{team.teamName}</h3>
                        <p className="text-xs font-mono font-bold text-emerald-800">
                          Total Score: {team.totalScore} / 100
                        </p>
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          {team.members.map((m) => m.name).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-4">Awaiting evaluation</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 10: JUDGE ACCOUNT SETTINGS (Section 6) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'judge-settings' && (
          <div className="max-w-xl space-y-6 animate-in fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Judge Account Settings</h1>
              <p className="text-xs text-slate-500">
                Securely manage and update the Judge evaluator credentials. Passwords are encrypted with SHA-256 and never exposed publicly.
              </p>
            </div>

            <form onSubmit={handleChangeJudgePassword} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Judge Username</label>
                <input
                  type="text"
                  value="Judge"
                  disabled
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  New Judge Password *
                </label>
                <input
                  type="password"
                  placeholder="Enter new judge password (hidden)"
                  value={judgeNewPassword}
                  onChange={(e) => setJudgeNewPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  The actual password will remain encrypted in the database and never be displayed after saving.
                </p>
              </div>

              <button
                type="submit"
                disabled={judgePasswordLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{judgePasswordLoading ? 'Updating...' : 'Change Judge Password'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 11: PDF REPORTS (Sections 24 & 25) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'pdf-reports' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Official Report Generator</h1>
              <p className="text-xs text-slate-500">
                Generate the attendance spreadsheet or official winners PDF with college headers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
                {/* Excel 1: Attendance Report */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Attendance Excel Report</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Official landscape document containing full college header, Euphoria'26 details, date, venue, and complete table of S.No, Team Number, Team Name, Member Name, Reg No, College Name, Phone, Dept, Academic Year, and verified Attendance Status.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (eventSettings) generateAttendanceExcel(eventSettings, teams);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download Attendance Excel</span>
                  </button>
                </div>
              </div>

              {/* PDF 2: Winners & Ranking Report */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Official Winners &amp; Rankings PDF</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Official portrait document with college header, Euphoria'26 challenge details, highlighted Top 3 Champion Podium breakdown with scores and members, followed by the complete official ranking leaderboard.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (eventSettings) generateWinnersPDF(eventSettings, teams);
                    }}
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download Winners PDF</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 12: EVENT SETTINGS (Section 31) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'event-settings' && settingsForm && (
          <div className="max-w-3xl space-y-6 animate-in fade-in">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Event Settings &amp; Lifecycle Status</h1>
              <p className="text-xs text-slate-500">
                Control the current event phase and configure official institutional details
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Event Status (Controls Public Badges) *
                </label>
                <select
                  value={settingsForm.eventStatus}
                  onChange={(e) => setSettingsForm({ ...settingsForm, eventStatus: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 font-bold text-emerald-950 bg-emerald-50/50"
                >
                  <option value="Registration Open">Registration Open</option>
                  <option value="Registration Closed">Registration Closed</option>
                  <option value="Event Started">Event Started</option>
                  <option value="Evaluation Started">Evaluation Started</option>
                  <option value="Evaluation Completed">Evaluation Completed</option>
                  <option value="Results Published">Results Published</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">College Name</label>
                  <input
                    type="text"
                    value={settingsForm.college}
                    onChange={(e) => setSettingsForm({ ...settingsForm, college: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Event Name</label>
                  <input
                    type="text"
                    value={settingsForm.eventName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, eventName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={settingsForm.date}
                    onChange={(e) => setSettingsForm({ ...settingsForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={settingsForm.time}
                    onChange={(e) => setSettingsForm({ ...settingsForm, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={settingsForm.venue}
                    onChange={(e) => setSettingsForm({ ...settingsForm, venue: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={settingsForm.department}
                    onChange={(e) => setSettingsForm({ ...settingsForm, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* ---------------------------------------------------- */}
      {/* DELETE TEAM CONFIRMATION MODAL (Section 10) */}
      {/* ---------------------------------------------------- */}
      {teamToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Are you sure you want to permanently delete this team?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                You are about to delete <strong>Team {teamToDelete.teamNumber} ({teamToDelete.teamName})</strong> and all associated member records and marks. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTeamToDelete(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteLoading ? 'Deleting...' : 'DELETE'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* EDIT EVALUATION MODAL */}
      {/* ---------------------------------------------------- */}
      {editingEvaluationTeam && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Evaluation</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Team {editingEvaluationTeam.teamNumber} · {editingEvaluationTeam.teamName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEvaluationTeam(null)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close evaluation editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900">
              Change the two round scores or reset the evaluation status. Total and rank are recalculated automatically.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Technical Quiz (/40)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={evaluationQuizScore}
                  onChange={(e) => setEvaluationQuizScore(e.target.value)}
                  disabled={evaluationStatus !== 'Evaluated'}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">IoT Simulation Criteria (/60)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {([
                    ['problemRelevanceScore', 'Problem & Relevance', 10],
                    ['iotImplementationScore', 'IoT Implementation', 15],
                    ['simulationWorkingScore', 'Simulation & Working', 15],
                    ['innovationScore', 'Innovation', 10],
                    ['presentationVivaScore', 'Presentation & Viva', 10],
                  ] as const).map(([key, label, maximum]) => (
                    <label key={key} className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-700">
                      <span>{label} /{maximum}</span>
                      <input
                        type="number"
                        min="0"
                        max={maximum}
                        step="0.5"
                        value={evaluationCriteria[key]}
                        onChange={(e) => setEvaluationCriteria((current) => ({ ...current, [key]: e.target.value }))}
                        disabled={evaluationStatus !== 'Evaluated'}
                        className="w-20 px-2 py-1.5 text-sm rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Evaluation Status</label>
              <select
                value={evaluationStatus}
                onChange={(e) => setEvaluationStatus(e.target.value as Team['evaluationStatus'])}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Evaluated">Evaluated</option>
                <option value="Not Evaluated">Not Evaluated</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingEvaluationTeam(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEvaluationEdit}
                disabled={evaluationEditLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs"
              >
                {evaluationEditLoading ? 'Saving...' : 'Save Evaluation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* EDIT TEAM MODAL */}
      {/* ---------------------------------------------------- */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto w-full p-6 rounded-3xl shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Edit Team {editingTeam.teamNumber}
              </h3>
              <button onClick={() => setEditingTeam(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Team Number</label>
                <input
                  type="text"
                  value={editingTeam.teamNumber}
                  onChange={(e) => setEditingTeam({ ...editingTeam, teamNumber: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={editingTeam.teamName}
                  onChange={(e) => setEditingTeam({ ...editingTeam, teamName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Assigned Judge</label>
                <select
                  value={editingTeam.assignedJudge}
                  onChange={(e) => setEditingTeam({ ...editingTeam, assignedJudge: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Judge">Judge</option>
                  <option value="Judge 1">Judge 1</option>
                  <option value="Judge 2">Judge 2</option>
                </select>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Team Members ({editingTeam.members.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddEditingMember}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                </div>

                {editingTeam.members.map((member, index) => (
                  <div key={member.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Member {index + 1}</span>
                      {editingTeam.members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEditingMember(index)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <input
                        aria-label={`Member ${index + 1} name`}
                        placeholder="Member Name"
                        value={member.name}
                        onChange={(e) => handleEditingMemberChange(index, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                      <input
                        aria-label={`Member ${index + 1} register number`}
                        placeholder="Register Number"
                        value={member.registerNumber}
                        onChange={(e) => handleEditingMemberChange(index, 'registerNumber', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                      />
                      <input
                        aria-label={`Member ${index + 1} college`}
                        placeholder="College Name"
                        value={member.collegeName}
                        onChange={(e) => handleEditingMemberChange(index, 'collegeName', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                      <input
                        aria-label={`Member ${index + 1} phone number`}
                        placeholder="Phone Number"
                        value={member.phoneNumber}
                        onChange={(e) => handleEditingMemberChange(index, 'phoneNumber', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                      <input
                        aria-label={`Member ${index + 1} department`}
                        placeholder="Department"
                        value={member.department}
                        onChange={(e) => handleEditingMemberChange(index, 'department', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                      <select
                        aria-label={`Member ${index + 1} academic year`}
                        value={member.academicYear}
                        onChange={(e) => handleEditingMemberChange(index, 'academicYear', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="First Year (I)">First Year (I)</option>
                        <option value="Second Year (II)">Second Year (II)</option>
                        <option value="Third Year (III)">Third Year (III)</option>
                        <option value="Final Year (IV)">Final Year (IV)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingTeam(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const duplicateMember = findDuplicateMember(editingTeam.members);
                  if (duplicateMember) {
                    showNotification('error', `Duplicate member detected: ${duplicateMember}`);
                    return;
                  }

                  setEditLoading(true);
                  try {
                    await adminApi.updateTeam(editingTeam.id, {
                      teamNumber: editingTeam.teamNumber,
                      teamName: editingTeam.teamName,
                      assignedJudge: editingTeam.assignedJudge,
                      members: editingTeam.members,
                    });
                    showNotification('success', 'Team details updated successfully!');
                    setEditingTeam(null);
                    await fetchAllAdminData();
                  } catch (err: any) {
                    showNotification('error', err.message || 'Failed to update team');
                  } finally {
                    setEditLoading(false);
                  }
                }}
                disabled={editLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs"
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
