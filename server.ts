import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { MongoClient, Db, ObjectId } from 'mongodb';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.disable('x-powered-by');

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    service: "Euphoria'26 Event Portal",
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
  });
});

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let runtimeDb: DatabaseSchema | null = null;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function connectMongoDb() {
  if (mongoDb) {
    return mongoDb;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Add it to your .env file.');
  }

  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  mongoDb = mongoClient.db(process.env.DB_NAME || 'euphoria26');

  const requiredCollections = ['users', 'teams', 'teamMembers', 'evaluations', 'eventSettings', 'auditLogs', 'tokens'];
  const existingCollections = await mongoDb.listCollections().toArray();
  const existingNames = new Set(existingCollections.map((collection) => collection.name));

  for (const name of requiredCollections) {
    if (!existingNames.has(name)) {
      await mongoDb.createCollection(name);
    }
  }

  await mongoDb.collection('users').createIndex({ username: 1 }, { unique: true }).catch(() => undefined);
  await mongoDb.collection('teams').createIndex({ teamNumber: 1 }, { unique: true }).catch(() => undefined);
  await mongoDb.collection('teams').createIndex({ assignedJudgeId: 1 }).catch(() => undefined);
  await mongoDb.collection('teamMembers').createIndex({ teamId: 1 }).catch(() => undefined);
  await mongoDb.collection('teamMembers').createIndex({ registerNumber: 1 }).catch(() => undefined);
  await mongoDb.collection('evaluations').createIndex({ teamId: 1, judgeId: 1 }, { unique: true }).catch(() => undefined);
  await mongoDb.collection('evaluations').createIndex({ totalScore: -1 }).catch(() => undefined);
  await mongoDb.collection('evaluations').createIndex({ judgeId: 1 }).catch(() => undefined);
  await mongoDb.collection('auditLogs').createIndex({ userId: 1 }).catch(() => undefined);
  await mongoDb.collection('auditLogs').createIndex({ createdAt: -1 }).catch(() => undefined);
  await mongoDb.collection('tokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => undefined);

  return mongoDb;
}

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

function comparePassword(password: string, passwordHash: string): boolean {
  return bcrypt.compareSync(password, passwordHash);
}

async function ensureSeedData() {
  if (!mongoDb) {
    return;
  }

  const users = mongoDb.collection('users');
  const eventSettings = mongoDb.collection('eventSettings');

  const adminUser = await users.findOne({ username: 'Admin', role: 'admin' });
  if (!adminUser) {
    await users.insertOne({
      _id: new ObjectId(),
      username: 'Admin',
      passwordHash: hashPassword('admin@123'),
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const judgeUser = await users.findOne({ username: 'Judge', role: 'judge' });
  if (!judgeUser) {
    await users.insertOne({
      _id: new ObjectId(),
      username: 'Judge',
      passwordHash: hashPassword('judge@123'),
      role: 'judge',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const settingsDoc = await eventSettings.findOne({ eventName: "Euphoria'26" });
  if (!settingsDoc) {
    await eventSettings.insertOne({
      _id: new ObjectId(),
      eventName: "Euphoria'26",
      eventType: 'IoT Based Smart Cities Challenge',
      collegeName: 'MEENAKSHI SUNDARAJAN ENGINEERING COLLEGE',
      department: 'Department of Civil Engineering',
      organizer: 'Eco Design Club',
      date: '25/09/2026',
      day: 'Friday',
      time: '10:00 AM – 12:00 PM',
      venue: 'MSEC Civil Block',
      round1Name: 'Technical Quiz',
      round1MaximumMarks: 40,
      round2Name: 'IoT Based Simulation',
      round2MaximumMarks: 60,
      totalMaximumMarks: 100,
      eventStatus: 'registration_open',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

async function syncRuntimeDbToMongo(data: DatabaseSchema) {
  if (!mongoDb) {
    return;
  }

  const usersCollection = mongoDb.collection('users');
  const teamsCollection = mongoDb.collection('teams');
  const teamMembersCollection = mongoDb.collection('teamMembers');
  const evaluationsCollection = mongoDb.collection('evaluations');
  const settingsCollection = mongoDb.collection('eventSettings');
  const tokensCollection = mongoDb.collection('tokens');
  const auditLogsCollection = mongoDb.collection('auditLogs');

  const userMap = new Map<string, any>();
  const judgeMap = new Map<string, any>();

  for (const user of await usersCollection.find({}).toArray()) {
    userMap.set(String(user.username).toLowerCase(), user);
    if (user.role === 'judge') {
      judgeMap.set(String(user.username).toLowerCase(), user);
    }
  }

  for (const user of data.users) {
    const existingUser = userMap.get(String(user.username).toLowerCase());
    if (existingUser) {
      await usersCollection.updateOne(
        { _id: existingUser._id },
        {
          $set: {
            username: user.username,
            passwordHash: user.passwordHash,
            role: user.role,
            isActive: true,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      await usersCollection.insertOne({
        _id: new ObjectId(),
        username: user.username,
        passwordHash: user.passwordHash,
        role: user.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  const teamDocs = await teamsCollection.find({}).toArray();
  for (const teamDoc of teamDocs) {
    const teamKey = String(teamDoc.teamNumber);
    const localTeam = data.teams.find((item) => item.teamNumber === teamKey);
    if (!localTeam) {
      await teamMembersCollection.deleteMany({ teamId: teamDoc._id });
      await evaluationsCollection.deleteMany({ teamId: teamDoc._id });
      await teamsCollection.deleteOne({ _id: teamDoc._id });
    }
  }

  for (const team of data.teams) {
    const judgeUser = judgeMap.get(String(team.assignedJudge || 'Judge').toLowerCase()) || await usersCollection.findOne({ username: 'Judge', role: 'judge' });

    const teamQuery = { teamNumber: String(team.teamNumber) };
    const existingTeam = await teamsCollection.findOne(teamQuery);
    const teamRecord = {
      teamNumber: String(team.teamNumber),
      teamName: String(team.teamName),
      assignedJudgeId: judgeUser ? judgeUser._id : null,
      attendanceStatus: 'not_marked',
      evaluationStatus: team.evaluationStatus === 'Evaluated' ? 'evaluated' : 'not_evaluated',
      createdAt: new Date(team.createdAt || Date.now()),
      updatedAt: new Date(team.updatedAt || Date.now()),
      id: String(team.id || `team_${Date.now()}_${Math.random()}`),
    };

    if (existingTeam) {
      await teamsCollection.updateOne(
        { _id: existingTeam._id },
        { $set: teamRecord }
      );
    } else {
      await teamsCollection.insertOne({
        _id: new ObjectId(),
        ...teamRecord,
      });
    }

    const insertedTeam = await teamsCollection.findOne(teamQuery);
    await teamMembersCollection.deleteMany({ teamId: insertedTeam?._id });
    for (const member of team.members) {
      await teamMembersCollection.insertOne({
        _id: new ObjectId(),
        teamId: insertedTeam?._id,
        name: member.name,
        registerNumber: member.registerNumber,
        collegeName: member.collegeName,
        phoneNumber: member.phoneNumber,
        department: member.department,
        academicYear: member.academicYear,
        attendance: member.attendance === 'Present' ? 'present' : 'absent',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const judgeRecord = await usersCollection.findOne({ username: team.assignedJudge || 'Judge', role: 'judge' });
    if (judgeRecord) {
      const evaluationDoc = {
        teamId: insertedTeam?._id,
        judgeId: judgeRecord._id,
        technicalQuizScore: Number(team.technicalQuizScore ?? 0),
        problemRelevanceScore: Number(team.problemRelevanceScore ?? 0),
        iotImplementationScore: Number(team.iotImplementationScore ?? 0),
        simulationWorkingScore: Number(team.simulationWorkingScore ?? 0),
        innovationScore: Number(team.innovationScore ?? 0),
        presentationVivaScore: Number(team.presentationVivaScore ?? 0),
        iotSimulationScore: Number(team.iotSimulationScore ?? 0),
        totalScore: Number(team.totalScore ?? 0),
        status: team.evaluationStatus === 'Evaluated' ? 'evaluated' : 'not_evaluated',
        evaluatedAt: team.evaluatedAt ? new Date(team.evaluatedAt) : null,
        updatedAt: new Date(team.updatedAt || Date.now()),
      };

      await evaluationsCollection.updateOne(
        { teamId: insertedTeam?._id, judgeId: judgeRecord._id },
        { $set: evaluationDoc },
        { upsert: true }
      );
    }
  }

  const tokenDocs = Object.entries(data.tokens).map(([token, value]) => ({
    token,
    username: value.username,
    role: value.role,
    expiresAt: value.expiresAt,
  }));

  await tokensCollection.deleteMany({});
  if (tokenDocs.length > 0) {
    await tokensCollection.insertMany(tokenDocs);
  }

  const settingsDoc = { ...data.settings };
  await settingsCollection.deleteMany({});
  await settingsCollection.insertOne({
    _id: new ObjectId(),
    eventName: settingsDoc.eventName,
    eventType: settingsDoc.technicalEvent,
    collegeName: settingsDoc.college,
    department: settingsDoc.department,
    organizer: settingsDoc.organizedBy,
    date: settingsDoc.date,
    day: settingsDoc.date.includes('Friday') ? 'Friday' : 'Day',
    time: settingsDoc.time,
    venue: settingsDoc.venue,
    round1Name: settingsDoc.round1Name,
    round1MaximumMarks: settingsDoc.round1Max,
    round2Name: settingsDoc.round2Name,
    round2MaximumMarks: settingsDoc.round2Max,
    totalMaximumMarks: settingsDoc.totalMax,
    eventStatus: settingsDoc.eventStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function saveDbToMongo(data: DatabaseSchema) {
  if (!mongoDb) {
    return;
  }

  await syncRuntimeDbToMongo(data);
  await ensureSeedData();
  const settings = mongoDb.collection('eventSettings');
  const settingsDoc = await settings.findOne({ eventName: data.settings.eventName || "Euphoria'26" });

  if (!settingsDoc) {
    await settings.insertOne({
      _id: new ObjectId(),
      eventName: data.settings.eventName || "Euphoria'26",
      eventType: data.settings.technicalEvent,
      collegeName: data.settings.college,
      department: data.settings.department,
      organizer: data.settings.organizedBy,
      date: data.settings.date,
      day: data.settings.date.includes('Friday') ? 'Friday' : 'Day',
      time: data.settings.time,
      venue: data.settings.venue,
      round1Name: data.settings.round1Name,
      round1MaximumMarks: data.settings.round1Max,
      round2Name: data.settings.round2Name,
      round2MaximumMarks: data.settings.round2Max,
      totalMaximumMarks: data.settings.totalMax,
      eventStatus: data.settings.eventStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    await settings.updateOne(
      { _id: settingsDoc._id },
      {
        $set: {
          eventName: data.settings.eventName || "Euphoria'26",
          eventType: data.settings.technicalEvent,
          collegeName: data.settings.college,
          department: data.settings.department,
          organizer: data.settings.organizedBy,
          date: data.settings.date,
          day: data.settings.date.includes('Friday') ? 'Friday' : 'Day',
          time: data.settings.time,
          venue: data.settings.venue,
          round1Name: data.settings.round1Name,
          round1MaximumMarks: data.settings.round1Max,
          round2Name: data.settings.round2Name,
          round2MaximumMarks: data.settings.round2Max,
          totalMaximumMarks: data.settings.totalMax,
          eventStatus: data.settings.eventStatus,
          updatedAt: new Date(),
        },
      }
    );
  }
}

async function loadDbFromMongo(): Promise<DatabaseSchema | null> {
  if (!mongoDb) {
    return null;
  }

  const [users, teams, teamMembers, evaluations, settingsDocs, tokenDocs] = await Promise.all([
    mongoDb.collection('users').find({}).toArray(),
    mongoDb.collection('teams').find({}).toArray(),
    mongoDb.collection('teamMembers').find({}).toArray(),
    mongoDb.collection('evaluations').find({}).toArray(),
    mongoDb.collection('eventSettings').find({}).toArray(),
    mongoDb.collection('tokens').find({}).toArray(),
  ]);

  const tokens = Object.fromEntries(
    (tokenDocs || []).map((doc:any) => [doc.token, { username: doc.username, role: doc.role, expiresAt: Number(doc.expiresAt) }])
  );

  const loadedTeams: Team[] = await Promise.all(
    teams.map(async (teamDoc: any) => {
      const judgeDoc = teamDoc.assignedJudgeId ? await mongoDb!.collection('users').findOne({ _id: teamDoc.assignedJudgeId }) : null;
      const members = (teamMembers || [])
        .filter((m: any) => m.teamId && teamDoc._id && String(m.teamId) === String(teamDoc._id))
        .map((m: any) => ({
          id: m._id ? String(m._id) : `${teamDoc.teamNumber}_${Math.random()}`,
          name: m.name,
          registerNumber: m.registerNumber,
          collegeName: m.collegeName,
          phoneNumber: m.phoneNumber,
          department: m.department,
          academicYear: m.academicYear,
          attendance: m.attendance === 'present' ? 'Present' : 'Absent',
        }));
      const evaluationDoc = evaluations.find((item: any) => item.teamId && teamDoc._id && String(item.teamId) === String(teamDoc._id));

      return {
        id: String(teamDoc.id || teamDoc._id),
        teamNumber: String(teamDoc.teamNumber),
        teamName: String(teamDoc.teamName),
        assignedJudge: judgeDoc?.username || teamDoc.assignedJudgeName || 'Judge',
        technicalQuizScore: evaluationDoc ? Number(evaluationDoc.technicalQuizScore) : null,
        problemRelevanceScore: evaluationDoc ? Number(evaluationDoc.problemRelevanceScore ?? 0) : null,
        iotImplementationScore: evaluationDoc ? Number(evaluationDoc.iotImplementationScore ?? 0) : null,
        simulationWorkingScore: evaluationDoc ? Number(evaluationDoc.simulationWorkingScore ?? 0) : null,
        innovationScore: evaluationDoc ? Number(evaluationDoc.innovationScore ?? 0) : null,
        presentationVivaScore: evaluationDoc ? Number(evaluationDoc.presentationVivaScore ?? 0) : null,
        iotSimulationScore: evaluationDoc ? Number(evaluationDoc.iotSimulationScore) : null,
        totalScore: evaluationDoc ? Number(evaluationDoc.totalScore) : null,
        rank: null,
        evaluationStatus: evaluationDoc?.status === 'evaluated' ? 'Evaluated' : 'Not Evaluated',
        evaluatedAt: evaluationDoc?.evaluatedAt ? new Date(evaluationDoc.evaluatedAt).toISOString() : undefined,
        createdAt: teamDoc.createdAt ? new Date(teamDoc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: teamDoc.updatedAt ? new Date(teamDoc.updatedAt).toISOString() : new Date().toISOString(),
        members,
      };
    })
  );

  const settings = (settingsDocs[0] || getInitialData().settings) as DatabaseSchema['settings'];

  return {
    users: (users || []).map((user: any) => ({
      id: String(user._id),
      username: user.username,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
    })),
    tokens,
    settings: {
      college: settings.college || 'MEENAKSHI SUNDARAJAN ENGINEERING COLLEGE',
      autonomous: settings.autonomous || 'Autonomous',
      managedBy: settings.managedBy || 'I.I.E.T. Society',
      affiliatedTo: settings.affiliatedTo || 'Anna University',
      department: settings.department || 'Department of Civil Engineering',
      organizedBy: settings.organizedBy || 'Eco Design Club',
      eventName: settings.eventName || "Euphoria'26",
      technicalEvent: settings.technicalEvent || 'IoT Based Smart Cities Challenge',
      date: settings.date || '25/09/2026 – Friday',
      time: settings.time || '10:00 AM – 12:00 PM',
      venue: settings.venue || 'MSEC Civil Block',
      eventStatus: settings.eventStatus || 'Event Started',
      round1Name: settings.round1Name || 'Technical Quiz',
      round1Max: settings.round1Max === 50 ? 40 : (settings.round1Max || 40),
      round2Name: settings.round2Name || 'IoT Based Simulation',
      round2Max: settings.round2Max === 50 ? 60 : (settings.round2Max || 60),
      totalMax: settings.totalMax || 100,
      tieBreakerRule: settings.tieBreakerRule || '1. IoT Based Simulation Score → 2. Technical Quiz Score → 3. Admin Manual Resolution',
    },
    teams: loadedTeams,
  };
}

async function writeAuditLog(userId: string | null, action: string, entityType: string, entityId: string | null, details: Record<string, any> = {}) {
  if (!mongoDb) return;

  await mongoDb.collection('auditLogs').insertOne({
    _id: new ObjectId(),
    userId: userId ? new ObjectId(userId) : null,
    action,
    entityType,
    entityId: entityId ? new ObjectId(entityId) : null,
    details,
    createdAt: new Date(),
  }).catch(() => undefined);
}

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
  assignedJudge: string;
  technicalQuizScore: number | null;
  iotSimulationScore: number | null;
  totalScore: number | null;
  rank: number | null;
  evaluationStatus: 'Not Evaluated' | 'Evaluated';
  evaluatedAt?: string;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
}

export interface DatabaseSchema {
  users: Array<{
    id: string;
    username: string;
    passwordHash: string;
    role: 'admin' | 'judge';
    createdAt: string;
  }>;
  tokens: Record<string, { username: string; role: 'admin' | 'judge'; expiresAt: number }>;
  settings: {
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
  };
  teams: Team[];
}

// Default initial data
function getInitialData(): DatabaseSchema {
  const adminPasswordHash = hashPassword('admin@123');
  const judgePasswordHash = hashPassword('judge@123');
  const now = new Date().toISOString();

  return {
    users: [
      {
        id: 'usr_admin',
        username: 'Admin',
        passwordHash: adminPasswordHash,
        role: 'admin',
        createdAt: now,
      },
      {
        id: 'usr_judge',
        username: 'Judge',
        passwordHash: judgePasswordHash,
        role: 'judge',
        createdAt: now,
      },
    ],
    tokens: {},
    settings: {
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
      tieBreakerRule: '1. IoT Based Simulation Score → 2. Technical Quiz Score → 3. Admin Manual Resolution',
    },
    teams: [
      {
        id: 'team_01',
        teamNumber: '01',
        teamName: 'EcoPulse Smart Grid',
        assignedJudge: 'Judge',
        technicalQuizScore: 46,
        iotSimulationScore: 48,
        totalScore: 94,
        rank: 1,
        evaluationStatus: 'Evaluated',
        evaluatedAt: now,
        createdAt: now,
        updatedAt: now,
        members: [
          {
            id: 'mem_01_1',
            name: 'Kavitha Ramasamy',
            registerNumber: '311522103012',
            collegeName: 'Meenakshi Sundarajan Engineering College',
            phoneNumber: '9840123456',
            department: 'Civil Engineering',
            academicYear: 'Final Year (IV)',
            attendance: 'Present',
          },
          {
            id: 'mem_01_2',
            name: 'Arjun Swaminathan',
            registerNumber: '311522103008',
            collegeName: 'Meenakshi Sundarajan Engineering College',
            phoneNumber: '9840123457',
            department: 'Civil Engineering',
            academicYear: 'Third Year (III)',
            attendance: 'Present',
          },
        ],
      },
      {
        id: 'team_02',
        teamNumber: '02',
        teamName: 'Urban Flow Dynamics',
        assignedJudge: 'Judge',
        technicalQuizScore: 44,
        iotSimulationScore: 47,
        totalScore: 91,
        rank: 2,
        evaluationStatus: 'Evaluated',
        evaluatedAt: now,
        createdAt: now,
        updatedAt: now,
        members: [
          {
            id: 'mem_02_1',
            name: 'Rohit Chandran',
            registerNumber: '311522103045',
            collegeName: 'Meenakshi Sundarajan Engineering College',
            phoneNumber: '9840234567',
            department: 'Civil Engineering',
            academicYear: 'Final Year (IV)',
            attendance: 'Present',
          },
          {
            id: 'mem_02_2',
            name: 'Divya Bharathi',
            registerNumber: '311522103019',
            collegeName: 'Meenakshi Sundarajan Engineering College',
            phoneNumber: '9840234568',
            department: 'Civil Engineering',
            academicYear: 'Third Year (III)',
            attendance: 'Present',
          },
        ],
      },
      {
        id: 'team_03',
        teamNumber: '03',
        teamName: 'AquaSense Drainage IoT',
        assignedJudge: 'Judge',
        technicalQuizScore: 42,
        iotSimulationScore: 45,
        totalScore: 87,
        rank: 3,
        evaluationStatus: 'Evaluated',
        evaluatedAt: now,
        createdAt: now,
        updatedAt: now,
        members: [
          {
            id: 'mem_03_1',
            name: 'Manoj Kumar V',
            registerNumber: '311522103031',
            collegeName: 'Meenakshi Sundarajan Engineering College',
            phoneNumber: '9840345678',
            department: 'Civil Engineering',
            academicYear: 'Final Year (IV)',
            attendance: 'Present',
          },
          {
            id: 'mem_03_2',
            name: 'Sneha Murali',
            registerNumber: '311522103052',
            collegeName: 'Meenakshi Sundarajan Engineering College',
            phoneNumber: '9840345679',
            department: 'Civil Engineering',
            academicYear: 'Third Year (III)',
            attendance: 'Present',
          },
        ],
      },
      {
        id: 'team_04',
        teamNumber: '04',
        teamName: 'TerraCarbon Analytics',
        assignedJudge: 'Judge',
        technicalQuizScore: 39,
        iotSimulationScore: 42,
        totalScore: 81,
        rank: 4,
        evaluationStatus: 'Evaluated',
        evaluatedAt: now,
        createdAt: now,
        updatedAt: now,
        members: [
          {
            id: 'mem_04_1',
            name: 'Praveen Balaji',
            registerNumber: '311522103040',
            collegeName: 'Meenakshi Sundarajan Engineering College',
            phoneNumber: '9840456789',
            department: 'Civil Engineering',
            academicYear: 'Third Year (III)',
            attendance: 'Present',
          },
          {
            id: 'mem_04_2',
            name: 'Ananya Sridhar',
            registerNumber: '311522103005',
            collegeName: 'Meenakshi Sundarajan Engineering College',
            phoneNumber: '9840456790',
            department: 'Civil Engineering',
            academicYear: 'Second Year (II)',
            attendance: 'Present',
          },
        ],
      },
      {
        id: 'team_05',
        teamNumber: '05',
        teamName: 'AeroClean Microclimate',
        assignedJudge: 'Judge',
        technicalQuizScore: null,
        iotSimulationScore: null,
        totalScore: null,
        rank: null,
        evaluationStatus: 'Not Evaluated',
        createdAt: now,
        updatedAt: now,
        members: [
          {
            id: 'mem_05_1',
            name: 'Vigneshwaran K',
            registerNumber: '311522103061',
            collegeName: 'Meenakshi Sundarajan Engineering College',
            phoneNumber: '9840567890',
            department: 'Civil Engineering',
            academicYear: 'Final Year (IV)',
            attendance: 'Present',
          },
          {
            id: 'mem_05_2',
            name: 'Harini S',
            registerNumber: '311522103023',
            collegeName: 'Meenakshi Sundarajan Engineering College',
            phoneNumber: '9840567891',
            department: 'Civil Engineering',
            academicYear: 'Third Year (III)',
            attendance: 'Absent',
          },
        ],
      },
    ],
  };
}

// Database helper functions
function readDb(): DatabaseSchema {
  if (runtimeDb) {
    return runtimeDb;
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    runtimeDb = initial;
    writeDb(initial);
    return initial;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    runtimeDb = data;
    return data;
  } catch (err) {
    console.error('Failed reading db.json, resetting to initial state', err);
    const initial = getInitialData();
    runtimeDb = initial;
    writeDb(initial);
    return initial;
  }
}

function writeDb(data: DatabaseSchema) {
  runtimeDb = data;

  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);

  if (mongoDb) {
    void saveDbToMongo(data);
  }
}

function normalizeMemberKey(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function findDuplicateMember(members: any[]): string | null {
  const seenMemberKeys = new Set<string>();

  for (const member of members) {
    const registerNumber = normalizeMemberKey(member.registerNumber);
    const name = normalizeMemberKey(member.name);
    const memberKey = registerNumber || name;

    if (memberKey && seenMemberKeys.has(memberKey)) {
      return registerNumber
        ? `Register number "${member.registerNumber}" is duplicated`
        : `Member name "${member.name}" is duplicated`;
    }

    if (memberKey) seenMemberKeys.add(memberKey);
  }

  return null;
}

function deduplicateTeamMembers(team: Team): boolean {
  const seenMemberKeys = new Set<string>();
  const originalCount = team.members.length;
  team.members = team.members.filter((member) => {
    const registerNumber = normalizeMemberKey(member.registerNumber);
    const name = normalizeMemberKey(member.name);
    const memberKey = registerNumber || name;
    const duplicate = Boolean(memberKey && seenMemberKeys.has(memberKey));

    if (memberKey) seenMemberKeys.add(memberKey);
    return !duplicate;
  });
  return team.members.length !== originalCount;
}

// Recalculate automatic rankings with strict tie-breaking logic
function recalculateRankings(teams: Team[]): Team[] {
  const evaluated = teams.filter((t) => t.evaluationStatus === 'Evaluated' && t.totalScore !== null);
  const notEvaluated = teams.filter((t) => t.evaluationStatus !== 'Evaluated' || t.totalScore === null);

  // Tie-breaking:
  // 1. Total Score (DESC)
  // 2. Technical Quiz Score (DESC)
  // 3. IoT Simulation Score (DESC)
  // 4. Team Number (ASC)
  evaluated.sort((a, b) => {
    const totalA = a.totalScore ?? 0;
    const totalB = b.totalScore ?? 0;
    if (totalB !== totalA) return totalB - totalA;

    const quizA = a.technicalQuizScore ?? 0;
    const quizB = b.technicalQuizScore ?? 0;
    if (quizB !== quizA) return quizB - quizA;

    const iotA = a.iotSimulationScore ?? 0;
    const iotB = b.iotSimulationScore ?? 0;
    if (iotB !== iotA) return iotB - iotA;

    return a.teamNumber.localeCompare(b.teamNumber);
  });

  evaluated.forEach((team, idx) => {
    team.rank = idx + 1;
  });

  notEvaluated.forEach((team) => {
    team.rank = null;
  });

  return [...evaluated, ...notEvaluated];
}

// Authentication middleware
export interface AuthRequest extends Request {
  user?: {
    username: string;
    role: 'admin' | 'judge';
  };
}

async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  const db = readDb();
  const session = db.tokens[token];

  if (!session || session.expiresAt < Date.now()) {
    if (mongoDb) {
      const mongoToken = await mongoDb.collection('tokens').findOne({ token });
      if (!mongoToken || Number(mongoToken.expiresAt) < Date.now()) {
        return res.status(403).json({ error: 'Session expired or invalid. Please log in again.' });
      }
      req.user = {
        username: mongoToken.username,
        role: mongoToken.role,
      };
      return next();
    }
    return res.status(403).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  req.user = {
    username: session.username,
    role: session.role,
  };
  next();
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin privileges required' });
  }
  next();
}

function requireJudge(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'judge') {
    return res.status(403).json({ error: 'Access denied: Judge privileges required' });
  }
  next();
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Auth: Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password, portalType } = req.body;

  if (!username || !password || !portalType) {
    return res.status(400).json({ error: 'Username, password and portalType are required' });
  }

  const db = readDb();
  const targetUser = db.users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.role === portalType
  );

  if (!targetUser && mongoDb) {
    const mongoUser = await mongoDb.collection('users').findOne({ username: String(username).trim(), role: portalType });
    if (!mongoUser) {
      return res.status(401).json({ error: 'Invalid credentials or unauthorized portal access' });
    }
    if (!comparePassword(password, mongoUser.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = 'tok_' + crypto.randomBytes(24).toString('hex');
    await mongoDb.collection('tokens').insertOne({
      token,
      username: mongoUser.username,
      role: mongoUser.role,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    await writeAuditLog(String(mongoUser._id), portalType === 'admin' ? 'ADMIN_LOGIN' : 'JUDGE_LOGIN', 'users', String(mongoUser._id), { username: mongoUser.username });
    return res.json({ token, username: mongoUser.username, role: mongoUser.role });
  }

  if (!targetUser) {
    return res.status(401).json({ error: 'Invalid credentials or unauthorized portal access' });
  }

  if (!comparePassword(password, targetUser.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = 'tok_' + crypto.randomBytes(24).toString('hex');
  db.tokens[token] = {
    username: targetUser.username,
    role: targetUser.role,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  writeDb(db);

  await writeAuditLog(null, portalType === 'admin' ? 'ADMIN_LOGIN' : 'JUDGE_LOGIN', 'users', null, { username: targetUser.username });

  return res.json({
    token,
    username: targetUser.username,
    role: targetUser.role,
  });
});

// Auth: Verify token
app.get('/api/auth/verify', async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  const db = readDb();
  const session = db.tokens[token];

  if (session && session.expiresAt >= Date.now()) {
    return res.json({
      valid: true,
      username: session.username,
      role: session.role,
    });
  }

  if (mongoDb) {
    const mongoToken = await mongoDb.collection('tokens').findOne({ token });
    if (mongoToken && Number(mongoToken.expiresAt) >= Date.now()) {
      return res.json({
        valid: true,
        username: String(mongoToken.username),
        role: mongoToken.role,
      });
    }
  }

  return res.status(401).json({ valid: false });
});

// Auth: Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const db = readDb();
    delete db.tokens[token];
    writeDb(db);
  }
  return res.json({ success: true });
});

// ----------------------------------------------------
// PUBLIC ROUTES (Strictly Privacy-Preserving)
// ----------------------------------------------------

// Public Event Settings
app.get('/api/public/event-settings', (req: Request, res: Response) => {
  const db = readDb();
  return res.json(db.settings);
});

// Public Live Scoreboard (No personal identifiers like phone or register numbers)
app.get('/api/public/scoreboard', (req: Request, res: Response) => {
  const db = readDb();
  const sorted = [...db.teams].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    return a.teamNumber.localeCompare(b.teamNumber);
  });

  const publicData = sorted.map((t) => ({
    rank: t.rank,
    teamNumber: t.teamNumber,
    teamName: t.teamName,
    totalScore: t.totalScore,
    evaluationStatus: t.evaluationStatus,
  }));

  return res.json(publicData);
});

// Public Rankings
app.get('/api/public/rankings', (req: Request, res: Response) => {
  const db = readDb();
  const ranked = db.teams
    .filter((t) => t.evaluationStatus === 'Evaluated' && t.totalScore !== null)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .map((t) => ({
      rank: t.rank,
      teamNumber: t.teamNumber,
      teamName: t.teamName,
      technicalQuizScore: t.technicalQuizScore,
      iotSimulationScore: t.iotSimulationScore,
      totalScore: t.totalScore,
      evaluationStatus: t.evaluationStatus,
    }));

  return res.json(ranked);
});

// Public Winners (Top 3)
app.get('/api/public/winners', (req: Request, res: Response) => {
  const db = readDb();
  const top3 = db.teams
    .filter((t) => t.evaluationStatus === 'Evaluated' && t.totalScore !== null && t.rank !== null && t.rank <= 3)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .map((t) => ({
      rank: t.rank,
      teamNumber: t.teamNumber,
      teamName: t.teamName,
      totalScore: t.totalScore,
      technicalQuizScore: t.technicalQuizScore,
      iotSimulationScore: t.iotSimulationScore,
      members: t.members.map((m) => ({ name: m.name, collegeName: m.collegeName })),
    }));

  return res.json(top3);
});

// ----------------------------------------------------
// ADMIN ROUTES (Protected)
// ----------------------------------------------------

// Admin: Get all teams with complete data
app.get('/api/admin/teams', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const db = readDb();
  const removedDuplicates = db.teams.some(deduplicateTeamMembers);
  if (removedDuplicates) {
    writeDb(db);
  }
  return res.json(db.teams);
});

// Admin: Add a new team (Permanent storage, checks unique teamNumber)
app.post('/api/admin/teams', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { teamNumber, teamName, members, assignedJudge } = req.body;

  if (!teamNumber || !teamName) {
    return res.status(400).json({ error: 'Team Number and Team Name are required' });
  }

  const db = readDb();

  // Check unique team number
  const existing = db.teams.find((t) => t.teamNumber.trim() === String(teamNumber).trim());
  if (existing) {
    return res.status(400).json({ error: `Team Number "${teamNumber}" is already registered` });
  }

  if (Array.isArray(members)) {
    const duplicateMember = findDuplicateMember(members);
    if (duplicateMember) {
      return res.status(400).json({ error: duplicateMember });
    }
  }

  const now = new Date().toISOString();
  const teamId = 'team_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  const formattedMembers: TeamMember[] = Array.isArray(members)
    ? members.map((m: any, idx: number) => ({
        id: m.id || `mem_${teamId}_${idx + 1}`,
        name: m.name || '',
        registerNumber: m.registerNumber || '',
        collegeName: m.collegeName || 'Meenakshi Sundarajan Engineering College',
        phoneNumber: m.phoneNumber || '',
        department: m.department || 'Civil Engineering',
        academicYear: m.academicYear || 'Third Year (III)',
        attendance: m.attendance || 'Absent',
      }))
    : [];

  const newTeam: Team = {
    id: teamId,
    teamNumber: String(teamNumber).trim(),
    teamName: String(teamName).trim(),
    assignedJudge: assignedJudge || 'Judge',
    technicalQuizScore: null,
    iotSimulationScore: null,
    totalScore: null,
    rank: null,
    evaluationStatus: 'Not Evaluated',
    createdAt: now,
    updatedAt: now,
    members: formattedMembers,
  };

  db.teams.push(newTeam);
  db.teams = recalculateRankings(db.teams);
  writeDb(db);

  return res.status(201).json(newTeam);
});

// Admin: Update team details
app.put('/api/admin/teams/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    teamNumber,
    teamName,
    members,
    assignedJudge,
    technicalQuizScore,
    iotSimulationScore,
    problemRelevanceScore,
    iotImplementationScore,
    simulationWorkingScore,
    innovationScore,
    presentationVivaScore,
    evaluationStatus,
  } = req.body;
  const requestedEvaluationStatus = typeof evaluationStatus === 'string'
    ? evaluationStatus.trim()
    : undefined;

  const db = readDb();
  const teamIndex = db.teams.findIndex((t) => t.id === id);

  if (teamIndex === -1) {
    return res.status(404).json({ error: 'Team not found' });
  }

  if (teamNumber) {
    const duplicate = db.teams.find((t) => t.id !== id && t.teamNumber.trim() === String(teamNumber).trim());
    if (duplicate) {
      return res.status(400).json({ error: `Team Number "${teamNumber}" already taken by another team` });
    }
    db.teams[teamIndex].teamNumber = String(teamNumber).trim();
  }

  if (teamName) db.teams[teamIndex].teamName = String(teamName).trim();
  if (assignedJudge !== undefined) db.teams[teamIndex].assignedJudge = assignedJudge;

  if (Array.isArray(members)) {
    const duplicateMember = findDuplicateMember(members);
    if (duplicateMember) {
      return res.status(400).json({ error: duplicateMember });
    }

    db.teams[teamIndex].members = members.map((m: any, idx: number) => ({
      id: m.id || `mem_${id}_${idx + 1}`,
      name: m.name || '',
      registerNumber: m.registerNumber || '',
      collegeName: m.collegeName || '',
      phoneNumber: m.phoneNumber || '',
      department: m.department || '',
      academicYear: m.academicYear || '',
      attendance: m.attendance || 'Absent',
    }));
  }

  if (technicalQuizScore !== undefined || iotSimulationScore !== undefined || requestedEvaluationStatus !== undefined) {
    const nextStatus = requestedEvaluationStatus ?? db.teams[teamIndex].evaluationStatus;
    if (nextStatus !== 'Evaluated' && nextStatus !== 'Not Evaluated') {
      return res.status(400).json({ error: 'Invalid evaluation status' });
    }

    if (nextStatus === 'Evaluated') {
      const quiz = Number(technicalQuizScore);
      const simulation = Number(iotSimulationScore);
      if (!Number.isFinite(quiz) || quiz < 0 || quiz > 40) {
        return res.status(400).json({ error: 'Technical Quiz Score must be between 0 and 40 marks' });
      }
      if (!Number.isFinite(simulation) || simulation < 0 || simulation > 60) {
        return res.status(400).json({ error: 'IoT Based Simulation Score must be between 0 and 60 marks' });
      }

      db.teams[teamIndex].technicalQuizScore = quiz;
      const adminCriteria = {
        problemRelevanceScore: Number(problemRelevanceScore),
        iotImplementationScore: Number(iotImplementationScore),
        simulationWorkingScore: Number(simulationWorkingScore),
        innovationScore: Number(innovationScore),
        presentationVivaScore: Number(presentationVivaScore),
      };
      const adminCriteriaLimits = [10, 15, 15, 10, 10];
      const adminCriteriaValues = Object.values(adminCriteria);
      if (adminCriteriaValues.some((score, index) => !Number.isFinite(score) || score < 0 || score > adminCriteriaLimits[index])) {
        return res.status(400).json({ error: 'Each IoT Simulation criterion must be within its allocated marks' });
      }
      const criteriaTotal = adminCriteriaValues.reduce((sum, score) => sum + score, 0);
      if (criteriaTotal !== 60 || simulation !== criteriaTotal) {
        return res.status(400).json({ error: 'IoT Simulation criteria must total exactly 60 marks' });
      }
      Object.assign(db.teams[teamIndex], adminCriteria);
      db.teams[teamIndex].iotSimulationScore = simulation;
      db.teams[teamIndex].totalScore = quiz + simulation;
      db.teams[teamIndex].evaluationStatus = 'Evaluated';
      db.teams[teamIndex].evaluatedAt = new Date().toISOString();
    } else {
      db.teams[teamIndex].technicalQuizScore = null;
      db.teams[teamIndex].iotSimulationScore = null;
      db.teams[teamIndex].totalScore = null;
      db.teams[teamIndex].rank = null;
      db.teams[teamIndex].evaluationStatus = 'Not Evaluated';
      delete db.teams[teamIndex].evaluatedAt;
    }
  }

  db.teams[teamIndex].updatedAt = new Date().toISOString();
  db.teams = recalculateRankings(db.teams);
  writeDb(db);

  return res.json(db.teams.find((team) => team.id === id));
});

// Admin: Delete a team permanently with verification
app.delete('/api/admin/teams/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const db = readDb();

  const teamIndex = db.teams.findIndex((t) => t.id === id);
  if (teamIndex === -1) {
    return res.status(404).json({ error: 'Team not found' });
  }

  const deletedTeam = db.teams.splice(teamIndex, 1)[0];
  db.teams = recalculateRankings(db.teams);
  writeDb(db);

  return res.json({ success: true, message: `Team ${deletedTeam.teamNumber} permanently deleted` });
});

// Admin: Assign Judge to Team
app.put('/api/admin/teams/:id/assign-judge', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { assignedJudge } = req.body;

  if (!assignedJudge) {
    return res.status(400).json({ error: 'Assigned Judge is required' });
  }

  const db = readDb();
  const team = db.teams.find((t) => t.id === id);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  team.assignedJudge = assignedJudge;
  team.updatedAt = new Date().toISOString();
  writeDb(db);

  return res.json(team);
});

// Admin: Update Attendance for Team Members
app.put('/api/admin/teams/:id/attendance', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { memberAttendance } = req.body; // Array of { memberId, attendance: 'Present' | 'Absent' }

  if (!Array.isArray(memberAttendance)) {
    return res.status(400).json({ error: 'memberAttendance must be an array' });
  }

  const db = readDb();
  const team = db.teams.find((t) => t.id === id);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  memberAttendance.forEach((item: { memberId: string; attendance: 'Present' | 'Absent' }) => {
    const mem = team.members.find((m) => m.id === item.memberId);
    if (mem && (item.attendance === 'Present' || item.attendance === 'Absent')) {
      mem.attendance = item.attendance;
    }
  });

  team.updatedAt = new Date().toISOString();
  writeDb(db);

  return res.json(team);
});

// Admin: Change Judge Password
app.put('/api/admin/judge-password', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { judgeUsername = 'Judge', newPassword } = req.body;

  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters' });
  }

  const db = readDb();
  const judge = db.users.find((u) => u.username.toLowerCase() === judgeUsername.toLowerCase() && u.role === 'judge');

  if (!judge) {
    return res.status(404).json({ error: `Judge account "${judgeUsername}" not found` });
  }

  judge.passwordHash = hashPassword(newPassword.trim());
  writeDb(db);

  return res.json({ success: true, message: `Password for ${judge.username} updated successfully` });
});

// Admin: Update Event Settings / Status
app.put('/api/admin/event-settings', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const db = readDb();
  const updates = req.body;

  db.settings = {
    ...db.settings,
    ...updates,
  };
  writeDb(db);

  return res.json(db.settings);
});

// Admin: Stats overview
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const db = readDb();
  const totalTeams = db.teams.length;
  let totalParticipants = 0;
  let presentCount = 0;
  let absentCount = 0;

  db.teams.forEach((t) => {
    t.members.forEach((m) => {
      totalParticipants++;
      if (m.attendance === 'Present') presentCount++;
      else absentCount++;
    });
  });

  const evaluatedTeams = db.teams.filter((t) => t.evaluationStatus === 'Evaluated').length;
  const pendingTeams = totalTeams - evaluatedTeams;
  const attendancePercentage = totalParticipants > 0 ? Math.round((presentCount / totalParticipants) * 100) : 0;

  return res.json({
    totalTeams,
    totalParticipants,
    presentCount,
    absentCount,
    attendancePercentage,
    evaluatedTeams,
    pendingTeams,
    eventStatus: db.settings.eventStatus,
  });
});

// ----------------------------------------------------
// JUDGE ROUTES (Protected)
// ----------------------------------------------------

// Judge: Get assigned teams ONLY
app.get('/api/judge/my-teams', authenticateToken, requireJudge, (req: AuthRequest, res: Response) => {
  const db = readDb();
  const judgeUsername = req.user!.username;

  // Judge can ONLY see teams assigned to them
  const myTeams = db.teams.filter(
    (t) => t.assignedJudge && t.assignedJudge.toLowerCase() === judgeUsername.toLowerCase()
  );

  return res.json(myTeams);
});

// Judge: Evaluate BOTH rounds for assigned team
app.put('/api/judge/teams/:id/evaluate', authenticateToken, requireJudge, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    technicalQuizScore,
    problemRelevanceScore,
    iotImplementationScore,
    simulationWorkingScore,
    innovationScore,
    presentationVivaScore,
  } = req.body;

  const quiz = Number(technicalQuizScore);
  const criteria = {
    problemRelevanceScore: Number(problemRelevanceScore),
    iotImplementationScore: Number(iotImplementationScore),
    simulationWorkingScore: Number(simulationWorkingScore),
    innovationScore: Number(innovationScore),
    presentationVivaScore: Number(presentationVivaScore),
  };
  const criteriaLimits = [
    ['Problem & Relevance', criteria.problemRelevanceScore, 10],
    ['IoT Implementation', criteria.iotImplementationScore, 15],
    ['Simulation & Working', criteria.simulationWorkingScore, 15],
    ['Innovation', criteria.innovationScore, 10],
    ['Presentation & Viva', criteria.presentationVivaScore, 10],
  ] as const;
  const iot = Object.values(criteria).reduce((sum, score) => sum + score, 0);

  if (isNaN(quiz) || quiz < 0 || quiz > 40) {
    return res.status(400).json({ error: 'Technical Quiz Score must be between 0 and 40 marks' });
  }

  for (const [label, score, maximum] of criteriaLimits) {
    if (!Number.isFinite(score) || score < 0 || score > maximum) {
      return res.status(400).json({ error: `${label} score must be between 0 and ${maximum} marks` });
    }
  }

  const db = readDb();
  const team = db.teams.find((t) => t.id === id);

  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  // Ensure team is assigned to this judge
  if (team.assignedJudge.toLowerCase() !== req.user!.username.toLowerCase()) {
    return res.status(403).json({ error: 'You are not authorized to evaluate this team' });
  }

  const total = quiz + iot;

  team.technicalQuizScore = quiz;
  team.problemRelevanceScore = criteria.problemRelevanceScore;
  team.iotImplementationScore = criteria.iotImplementationScore;
  team.simulationWorkingScore = criteria.simulationWorkingScore;
  team.innovationScore = criteria.innovationScore;
  team.presentationVivaScore = criteria.presentationVivaScore;
  team.iotSimulationScore = iot;
  team.totalScore = total;
  team.evaluationStatus = 'Evaluated';
  team.evaluatedAt = new Date().toISOString();
  team.updatedAt = new Date().toISOString();

  db.teams = recalculateRankings(db.teams);
  writeDb(db);

  return res.json(team);
});

// ----------------------------------------------------
// VITE / STATIC SERVING
// ----------------------------------------------------

async function initializeDatabase() {
  try {
    await connectMongoDb();
    const mongoData = await loadDbFromMongo();

    if (mongoData) {
      runtimeDb = mongoData;
      fs.writeFileSync(DB_FILE, JSON.stringify(mongoData, null, 2), 'utf-8');
      console.log('Loaded application data from MongoDB.');
      return;
    }

    const initialData = getInitialData();
    runtimeDb = initialData;
    await saveDbToMongo(initialData);
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log('Initialized default application data in MongoDB.');
  } catch (error) {
    console.error('MongoDB connection failed. Please verify MONGODB_URI and Atlas access before starting the app.', error);
    throw error;
  }
}

async function startServer() {
  await initializeDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Euphoria'26 Event Server running on http://0.0.0.0:${PORT} | NODE_ENV=${process.env.NODE_ENV || 'development'}`
    );
  });
}

startServer();
