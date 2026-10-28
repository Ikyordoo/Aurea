import {
  DashboardWidgetConfig,
  DailyPriority,
  Goal,
  Habit,
  ImportantEvent,
  LifeCategory,
  Note,
  Person,
  PersonalValue,
  TimelineEntry,
  UserPreferences,
} from '../types/lifeos';

const DEVICE_ID = 'local-browser-node-01';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getUpcomingMonthDay(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  {
    id: 'briefing',
    label: 'Daily Briefing & Principles',
    description: 'Morning intention, active personal values, and focus summary',
    visible: true,
    order: 1,
    columnSpan: 2,
  },
  {
    id: 'stats',
    label: 'Personal Development Statistics',
    description: 'Real-time metrics across priorities, habits, goals, and reflections',
    visible: true,
    order: 2,
    columnSpan: 2,
  },
  {
    id: 'priorities',
    label: "Today's Priorities",
    description: 'High-leverage tasks linked to life categories and long-term goals',
    visible: true,
    order: 3,
    columnSpan: 1,
  },
  {
    id: 'habits',
    label: 'Scheduled Habits',
    description: 'Daily consistency rituals with tabular streak tracking',
    visible: true,
    order: 4,
    columnSpan: 1,
  },
  {
    id: 'goals',
    label: 'Goal Progress & Milestones',
    description: 'Active objectives and measurable milestone completion',
    visible: true,
    order: 5,
    columnSpan: 1,
  },
  {
    id: 'follow_ups',
    label: 'Incomplete Follow-ups',
    description: 'Relationship check-ins and pending conversation action items',
    visible: true,
    order: 6,
    columnSpan: 1,
  },
  {
    id: 'people_events',
    label: 'Upcoming Birthdays & Important Events',
    description: 'Key dates, reminders, and upcoming personal milestones',
    visible: true,
    order: 7,
    columnSpan: 1,
  },
  {
    id: 'recent_notes',
    label: 'Recent Notes & Reflections',
    description: 'Knowledge notes and journal entries connected to goals and people',
    visible: true,
    order: 8,
    columnSpan: 1,
  },
];

export const DEFAULT_PERSONAL_VALUES: PersonalValue[] = [
  {
    id: 'val-1',
    principle: 'Consistency over intensity',
    description: 'Small, deliberate daily actions compound faster than sporadic heroic efforts.',
  },
  {
    id: 'val-2',
    principle: 'Deep presence in relationships',
    description: 'Remember what matters to the people I care about and follow through on promises.',
  },
  {
    id: 'val-3',
    principle: 'Clarity before execution',
    description: 'Write down assumptions, review weekly, and align daily work with enduring goals.',
  },
];

export function createDefaultCategories(): LifeCategory[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'cat-health',
      name: 'Health & Vitality',
      description: 'Physical conditioning, sleep discipline, nutrition, and sustainable energy',
      accentToken: 'emerald',
      order: 1,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'cat-craft',
      name: 'Deep Work & Craft',
      description: 'Professional mastery, focused creation, and long-term career architecture',
      accentToken: 'amber',
      order: 2,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'cat-relationships',
      name: 'Relationships & Family',
      description: 'Intentional friendships, family presence, and thoughtful follow-through',
      accentToken: 'rose',
      order: 3,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'cat-mind',
      name: 'Mind & Knowledge',
      description: 'Reading synthesis, self-reflection, decision clarity, and mental stillness',
      accentToken: 'sky',
      order: 4,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'cat-stewardship',
      name: 'Stewardship & Environment',
      description: 'Financial independence, home order, and personal logistics',
      accentToken: 'stone',
      order: 5,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
  ];
}

export function createDefaultPreferences(): UserPreferences {
  return {
    id: 'user_preferences_singleton',
    userName: 'Local Workspace',
    theme: 'light',
    usageMode: 'local',
    dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
    personalValues: DEFAULT_PERSONAL_VALUES,
    hasLoadedSampleData: false,
    updatedAt: new Date().toISOString(),
    deviceId: DEVICE_ID,
  };
}

export function generateSampleWorkspaceData() {
  const now = new Date().toISOString();
  const today = getTodayDateString();
  const yesterday = getRelativeDateString(-1);
  const twoDaysAgo = getRelativeDateString(-2);

  const goals: Goal[] = [
    {
      id: 'goal-1',
      title: 'Publish the Systems Architecture Monograph',
      summary: 'Complete a 4-part technical synthesis on resilient local-first software design.',
      whyItMatters: 'Crystallizes 5 years of engineering lessons and builds durable authority.',
      categoryId: 'cat-craft',
      progress: 65,
      targetDate: getRelativeDateString(30),
      status: 'active',
      milestones: [
        { id: 'm-1', title: 'Complete Part I & II draft', completed: true },
        { id: 'm-2', title: 'Review conflict-resolution state diagrams', completed: true },
        { id: 'm-3', title: 'Draft Part III on privacy boundaries', completed: false },
      ],
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'goal-2',
      title: 'Build a 10km Sub-45m Aerobic Base',
      summary: 'Consistent Zone 2 endurance training and strength stability 4x per week.',
      whyItMatters: 'Sustains mental sharpness and physical resilience for decades.',
      categoryId: 'cat-health',
      progress: 50,
      targetDate: getRelativeDateString(45),
      status: 'active',
      milestones: [
        { id: 'm-4', title: 'Complete 4 consecutive weeks of 25km volume', completed: true },
        { id: 'm-5', title: 'Run 5km tempo benchmark under 22:00', completed: false },
      ],
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'goal-3',
      title: 'Strengthen Core Circle Through Monthly Gatherings',
      summary: 'Host intentional small-group dinners and maintain regular 1-on-1 check-ins.',
      whyItMatters: 'Meaningful relationships require deliberate cadence, not coincidence.',
      categoryId: 'cat-relationships',
      progress: 40,
      targetDate: getRelativeDateString(60),
      status: 'active',
      milestones: [
        { id: 'm-6', title: 'Host autumn dinner at home', completed: true },
        { id: 'm-7', title: 'Reconnect with 3 mentors before quarter end', completed: false },
      ],
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
  ];

  const people: Person[] = [
    {
      id: 'person-1',
      name: 'Elena Rostova',
      relationship: 'Former Engineering Lead & Mentor',
      birthday: getUpcomingMonthDay(5),
      importantDateLabel: 'Birthday',
      lastContactedAt: getRelativeDateString(-14),
      conversationNotes: 'Discussed her transition to advising early-stage climate hardware founders. Recommended reading "Thinking in Systems".',
      followUpReminder: 'Send draft of Part II monograph and ask about her advisory board experience',
      followUpDueDate: getRelativeDateString(1),
      followUpCompleted: false,
      categoryId: 'cat-relationships',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'person-2',
      name: 'Marcus Vance',
      relationship: 'Close Friend & Running Partner',
      birthday: getUpcomingMonthDay(18),
      importantDateLabel: 'Birthday',
      lastContactedAt: getRelativeDateString(-4),
      conversationNotes: 'Training for his first half-marathon in November. Dealing with mild calf tightness.',
      followUpReminder: 'Confirm Saturday morning 8km trail route and share mobility routine',
      followUpDueDate: today,
      followUpCompleted: false,
      categoryId: 'cat-health',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
  ];

  const priorities: DailyPriority[] = [
    {
      id: 'prio-1',
      title: 'Draft section on local-first conflict resolution trade-offs (90 mins)',
      completed: false,
      dueDate: today,
      categoryId: 'cat-craft',
      linkedGoalId: 'goal-1',
      linkedPersonId: null,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'prio-2',
      title: 'Send Part II manuscript notes to Elena Rostova before birthday',
      completed: false,
      dueDate: today,
      categoryId: 'cat-relationships',
      linkedGoalId: 'goal-1',
      linkedPersonId: 'person-1',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'prio-3',
      title: 'Complete 45-minute Zone 2 aerobic run + ankle mobility',
      completed: true,
      dueDate: today,
      categoryId: 'cat-health',
      linkedGoalId: 'goal-2',
      linkedPersonId: 'person-2',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
  ];

  const habits: Habit[] = [
    {
      id: 'habit-1',
      title: '90 minutes of uninterrupted deep work before checking messages',
      cueOrRoutine: 'First cup of espresso at 07:30 with phone in another room',
      categoryId: 'cat-craft',
      linkedGoalId: 'goal-1',
      frequency: 'daily',
      completedDates: [twoDaysAgo, yesterday, today],
      currentStreak: 3,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'habit-2',
      title: 'Zone 2 conditioning or 20-minute mobility protocol',
      cueOrRoutine: 'Immediately after shutting down workstation at 17:30',
      categoryId: 'cat-health',
      linkedGoalId: 'goal-2',
      frequency: 'daily',
      completedDates: [twoDaysAgo, yesterday],
      currentStreak: 2,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'habit-3',
      title: 'Evening synthesis & 5-minute gratitude reflection',
      cueOrRoutine: '21:30 at reading desk before sleep',
      categoryId: 'cat-mind',
      linkedGoalId: null,
      frequency: 'daily',
      completedDates: [yesterday],
      currentStreak: 1,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
  ];

  const notes: Note[] = [
    {
      id: 'note-1',
      title: 'Architectural Notes: Why Local-First Respects Human Agency',
      content:
        'When personal journals, relationship histories, and goals live exclusively on remote servers, users self-censor. Storing primary records in IndexedDB with explicit export/import guarantees longevity and trust.',
      isJournal: false,
      categoryId: 'cat-craft',
      linkedGoalId: 'goal-1',
      linkedPersonId: 'person-1',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'note-2',
      title: 'Weekly Reflection: Energy Management vs Time Management',
      content:
        'Noticed that protecting the first 90 minutes of the morning doubled output on the monograph. Late evening screen time directly degrades next-day aerobic recovery and patience in conversations.',
      isJournal: true,
      categoryId: 'cat-mind',
      linkedGoalId: 'goal-2',
      linkedPersonId: null,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
  ];

  const events: ImportantEvent[] = [
    {
      id: 'event-1',
      title: "Elena Rostova's Birthday",
      date: getRelativeDateString(5),
      type: 'birthday',
      completed: false,
      categoryId: 'cat-relationships',
      linkedPersonId: 'person-1',
      linkedGoalId: null,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'event-2',
      title: '10km Autumn Benchmark Time Trial with Marcus',
      date: getRelativeDateString(10),
      type: 'milestone',
      completed: false,
      categoryId: 'cat-health',
      linkedPersonId: 'person-2',
      linkedGoalId: 'goal-2',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'event-3',
      title: 'Monthly Personal Architecture & Values Review',
      date: getRelativeDateString(3),
      type: 'reminder',
      completed: false,
      categoryId: 'cat-mind',
      linkedPersonId: null,
      linkedGoalId: null,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
  ];

  const timeline: TimelineEntry[] = [
    {
      id: 'tl-1',
      timestamp: now,
      entryType: 'priority',
      title: 'Completed daily priority: 45-minute Zone 2 aerobic run',
      detail: 'Linked to Goal: Build a 10km Sub-45m Aerobic Base · Partner: Marcus Vance',
      categoryId: 'cat-health',
      relatedEntityId: 'prio-3',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'tl-2',
      timestamp: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
      entryType: 'note',
      title: 'Captured knowledge note: Why Local-First Respects Human Agency',
      detail: 'Connected to Monograph Goal & Mentor Elena Rostova',
      categoryId: 'cat-craft',
      relatedEntityId: 'note-1',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
    {
      id: 'tl-3',
      timestamp: new Date(Date.now() - 3600 * 1000 * 22).toISOString(),
      entryType: 'goal',
      title: 'Milestone reached: Review conflict-resolution state diagrams',
      detail: 'Progress updated to 65% on Systems Architecture Monograph',
      categoryId: 'cat-craft',
      relatedEntityId: 'goal-1',
      createdAt: now,
      updatedAt: now,
      syncStatus: 'local_only',
      deviceId: DEVICE_ID,
    },
  ];

  return {
    goals,
    people,
    priorities,
    habits,
    notes,
    events,
    timeline,
  };
}
