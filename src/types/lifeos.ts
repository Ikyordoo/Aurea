export type NavigationSection =
  | 'home'
  | 'goals'
  | 'notes'
  | 'people'
  | 'timeline'
  | 'assistant'
  | 'insights'
  | 'settings';

export type ThemeMode = 'light' | 'dark' | 'system';

export type UsageMode = 'local' | 'account_preview';

export type SyncStatus = 'local_only' | 'pending_sync' | 'synced' | 'conflict';

export interface SyncMetadata {
  id: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
  deviceId: string;
  deletedAt?: string | null;
}

export interface LifeCategory extends SyncMetadata {
  name: string;
  description: string;
  accentToken: 'amber' | 'emerald' | 'stone' | 'sky' | 'rose' | 'indigo';
  order: number;
  isDefault?: boolean;
}

export interface DailyPriority extends SyncMetadata {
  title: string;
  completed: boolean;
  dueDate: string; // YYYY-MM-DD
  categoryId: string | null;
  linkedGoalId?: string | null;
  linkedPersonId?: string | null;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal extends SyncMetadata {
  title: string;
  summary: string;
  whyItMatters: string;
  categoryId: string | null;
  progress: number; // 0 to 100
  targetDate: string; // YYYY-MM-DD
  status: 'active' | 'completed' | 'paused';
  milestones: GoalMilestone[];
}

export interface Habit extends SyncMetadata {
  title: string;
  cueOrRoutine: string;
  categoryId: string | null;
  linkedGoalId?: string | null;
  frequency: 'daily' | 'weekdays' | 'weekly';
  completedDates: string[]; // Array of YYYY-MM-DD
  currentStreak: number;
}

export interface Note extends SyncMetadata {
  title: string;
  content: string;
  isJournal: boolean;
  categoryId: string | null;
  linkedGoalId?: string | null;
  linkedPersonId?: string | null;
}

export interface Person extends SyncMetadata {
  name: string;
  relationship: string;
  birthday?: string; // MM-DD
  importantDateLabel?: string;
  lastContactedAt?: string; // YYYY-MM-DD
  conversationNotes: string;
  followUpReminder?: string;
  followUpDueDate?: string; // YYYY-MM-DD
  followUpCompleted?: boolean;
  categoryId: string | null;
}

export interface ImportantEvent extends SyncMetadata {
  title: string;
  date: string; // YYYY-MM-DD
  type: 'reminder' | 'event' | 'milestone' | 'birthday';
  completed: boolean;
  categoryId: string | null;
  linkedPersonId?: string | null;
  linkedGoalId?: string | null;
}

export interface TimelineEntry extends SyncMetadata {
  timestamp: string; // ISO string
  entryType: 'goal' | 'habit' | 'note' | 'person' | 'priority' | 'value' | 'system';
  title: string;
  detail: string;
  categoryId: string | null;
  relatedEntityId?: string | null;
}

export type DashboardWidgetId =
  | 'briefing'
  | 'stats'
  | 'priorities'
  | 'habits'
  | 'goals'
  | 'people_events'
  | 'follow_ups'
  | 'recent_notes';

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  label: string;
  description: string;
  visible: boolean;
  order: number;
  columnSpan: 1 | 2;
}

export interface PersonalValue {
  id: string;
  principle: string;
  description: string;
}

export interface UserPreferences {
  id: 'user_preferences_singleton';
  userName: string;
  theme: ThemeMode;
  usageMode: UsageMode;
  dashboardWidgets: DashboardWidgetConfig[];
  personalValues: PersonalValue[];
  hasLoadedSampleData: boolean;
  updatedAt: string;
  deviceId: string;
}

export interface LifeOSDatabaseSnapshot {
  exportedAt: string;
  schemaVersion: number;
  preferences: UserPreferences;
  categories: LifeCategory[];
  priorities: DailyPriority[];
  goals: Goal[];
  habits: Habit[];
  notes: Note[];
  people: Person[];
  events: ImportantEvent[];
  timeline: TimelineEntry[];
}
