import { Team, EventSettings, PublicTeamScore, UserSession } from '../types';

const TOKEN_STORAGE_KEY = 'euphoria_auth_session';

export function getStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredSession(session: UserSession | null) {
  if (session) {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const session = getStoredSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data as T;
}

// --------------------------------------------------
// PUBLIC API
// --------------------------------------------------
export const publicApi = {
  getEventSettings: () => request<EventSettings>('/api/public/event-settings'),
  getScoreboard: () => request<PublicTeamScore[]>('/api/public/scoreboard'),
  getRankings: () => request<PublicTeamScore[]>('/api/public/rankings'),
  getWinners: () => request<Array<{
    rank: number;
    teamNumber: string;
    teamName: string;
    totalScore: number;
    technicalQuizScore: number;
    iotSimulationScore: number;
    members: Array<{ name: string; collegeName: string }>;
  }>>('/api/public/winners'),
};

// --------------------------------------------------
// AUTH API
// --------------------------------------------------
export const authApi = {
  login: (username: string, password: string, portalType: 'admin' | 'judge') =>
    request<UserSession>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, portalType }),
    }),
  verify: () => request<{ valid: boolean; username: string; role: 'admin' | 'judge' }>('/api/auth/verify'),
  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setStoredSession(null);
    }
  },
};

// --------------------------------------------------
// ADMIN API
// --------------------------------------------------
export const adminApi = {
  getTeams: () => request<Team[]>('/api/admin/teams'),
  getStats: () => request<{
    totalTeams: number;
    totalParticipants: number;
    presentCount: number;
    absentCount: number;
    attendancePercentage: number;
    evaluatedTeams: number;
    pendingTeams: number;
    eventStatus: string;
  }>('/api/admin/stats'),
  addTeam: (teamData: {
    teamNumber: string;
    teamName: string;
    members: any[];
    assignedJudge: string;
  }) =>
    request<Team>('/api/admin/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    }),
  updateTeam: (id: string, teamData: Partial<Team>) =>
    request<Team>(`/api/admin/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    }),
  deleteTeam: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/admin/teams/${id}`, {
      method: 'DELETE',
    }),
  assignJudge: (id: string, assignedJudge: string) =>
    request<Team>(`/api/admin/teams/${id}/assign-judge`, {
      method: 'PUT',
      body: JSON.stringify({ assignedJudge }),
    }),
  updateAttendance: (
    id: string,
    memberAttendance: Array<{ memberId: string; attendance: 'Present' | 'Absent' }>
  ) =>
    request<Team>(`/api/admin/teams/${id}/attendance`, {
      method: 'PUT',
      body: JSON.stringify({ memberAttendance }),
    }),
  changeJudgePassword: (newPassword: string, judgeUsername: string = 'Judge') =>
    request<{ success: boolean; message: string }>('/api/admin/judge-password', {
      method: 'PUT',
      body: JSON.stringify({ newPassword, judgeUsername }),
    }),
  updateEventSettings: (settings: Partial<EventSettings>) =>
    request<EventSettings>('/api/admin/event-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};

// --------------------------------------------------
// JUDGE API
// --------------------------------------------------
export const judgeApi = {
  getMyTeams: () => request<Team[]>('/api/judge/my-teams'),
  evaluateTeam: (
    id: string,
    scores: {
      technicalQuizScore: number;
      problemRelevanceScore: number;
      iotImplementationScore: number;
      simulationWorkingScore: number;
      innovationScore: number;
      presentationVivaScore: number;
    }
  ) =>
    request<Team>(`/api/judge/teams/${id}/evaluate`, {
      method: 'PUT',
      body: JSON.stringify(scores),
    }),
};
