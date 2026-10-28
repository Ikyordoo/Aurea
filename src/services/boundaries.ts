import {
  DailyPriority,
  Goal,
  Habit,
  LifeCategory,
  Note,
  Person,
  PersonalValue,
} from '../types/lifeos';

/**
 * Stage 1 AI Integration Boundary
 *
 * Per Stage 1 instructions:
 * - Do not implement the complete AI assistant in Stage 1.
 * - Design a clean integration boundary so AI features can be added incrementally.
 * - Distinguish between saved facts, user-reported experiences, and interpretations.
 */
export interface AIContextBundle {
  generatedAt: string;
  verifiedFactsCount: {
    categories: number;
    activeGoals: number;
    scheduledHabits: number;
    peopleRecords: number;
    personalValues: number;
  };
  userExperiencesCount: {
    journalReflections: number;
    knowledgeNotes: number;
    completedPriorities: number;
  };
  structuredContextPreview: {
    guidingPrinciples: string[];
    activeGoalsSummary: Array<{ title: string; progress: number; category: string }>;
    pendingFollowUps: Array<{ person: string; reminder: string }>;
  };
}

export function buildLocalAIContextBundle(params: {
  categories: LifeCategory[];
  goals: Goal[];
  habits: Habit[];
  notes: Note[];
  people: Person[];
  priorities: DailyPriority[];
  values: PersonalValue[];
}): AIContextBundle {
  const categoryMap = new Map(params.categories.map((c) => [c.id, c.name]));

  return {
    generatedAt: new Date().toISOString(),
    verifiedFactsCount: {
      categories: params.categories.length,
      activeGoals: params.goals.filter((g) => g.status === 'active').length,
      scheduledHabits: params.habits.length,
      peopleRecords: params.people.length,
      personalValues: params.values.length,
    },
    userExperiencesCount: {
      journalReflections: params.notes.filter((n) => n.isJournal).length,
      knowledgeNotes: params.notes.filter((n) => !n.isJournal).length,
      completedPriorities: params.priorities.filter((p) => p.completed).length,
    },
    structuredContextPreview: {
      guidingPrinciples: params.values.map((v) => v.principle),
      activeGoalsSummary: params.goals
        .filter((g) => g.status === 'active')
        .map((g) => ({
          title: g.title,
          progress: g.progress,
          category: g.categoryId ? categoryMap.get(g.categoryId) || 'Uncategorized' : 'Uncategorized',
        })),
      pendingFollowUps: params.people
        .filter((p) => p.followUpReminder && !p.followUpCompleted)
        .map((p) => ({
          person: p.name,
          reminder: p.followUpReminder || '',
        })),
    },
  };
}

/**
 * Stage 1 Cloud Synchronization Boundary
 *
 * Tracks local record sync states ('local_only' | 'pending_sync' | 'synced' | 'conflict')
 * without pretending cloud synchronization is active in Stage 1.
 */
export interface SyncStatusReport {
  mode: 'local' | 'account_preview';
  cloudSyncImplemented: false;
  localDatabaseEngine: 'IndexedDB (personal_life_os_db v1)';
  totalLocalRecords: number;
  unsyncedLocalRecords: number;
  deviceId: string;
}
