/**
 * Euphoria'26 - IoT Based Smart Cities Challenge
 * Department of Civil Engineering & Eco Design Club
 * Meenakshi Sundarajan Engineering College (Autonomous)
 */

export interface TeamMember {
  id: string;
  name: string;
  registerNumber: string;
  collegeName: string;
  phoneNumber: string;
  department: string;
  academicYear: string;
  attendance: 'Present' | 'Absent';
}

export interface Team {
  id: string;
  teamNumber: string;
  teamName: string;
  members: TeamMember[];
  assignedJudge: string; // e.g. "Judge"
  technicalQuizScore: number | null; // 0-40
  iotSimulationScore: number | null; // 0-60
  problemRelevanceScore?: number | null; // 0-10
  iotImplementationScore?: number | null; // 0-15
  simulationWorkingScore?: number | null; // 0-15
  innovationScore?: number | null; // 0-10
  presentationVivaScore?: number | null; // 0-10
  totalScore: number | null; // 0-100
  rank: number | null;
  evaluationStatus: 'Not Evaluated' | 'Evaluated';
  evaluatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicTeamScore {
  rank: number;
  teamNumber: string;
  teamName: string;
  technicalQuizScore: number | null;
  iotSimulationScore: number | null;
  totalScore: number | null;
  evaluationStatus: 'Not Evaluated' | 'Evaluated';
}

export interface EventSettings {
  college: string;
  autonomous: string;
  managedBy: string;
  affiliatedTo: string;
  department: string;
  organizedBy: string;
  eventName: string;
  technicalEvent: string;
  date: string;
  time: string;
  venue: string;
  eventStatus: 'Registration Open' | 'Registration Closed' | 'Event Started' | 'Evaluation Started' | 'Evaluation Completed' | 'Results Published';
  round1Name: string;
  round1Max: number;
  round2Name: string;
  round2Max: number;
  totalMax: number;
  tieBreakerRule: string;
}

export interface UserSession {
  token: string;
  username: string;
  role: 'admin' | 'judge';
}

export type PageRoute = 'home' | 'event' | 'scoreboard' | 'rankings' | 'winners' | 'portal';
export type AdminTab = 
  | 'dashboard'
  | 'teams'
  | 'add-team'
  | 'assign-judge'
  | 'attendance'
  | 'evaluations'
  | 'live-scores'
  | 'rankings'
  | 'winners'
  | 'judge-settings'
  | 'pdf-reports'
  | 'event-settings';
