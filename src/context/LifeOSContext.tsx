import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  DailyPriority,
  DashboardWidgetConfig,
  DashboardWidgetId,
  Goal,
  Habit,
  ImportantEvent,
  LifeCategory,
  LifeOSDatabaseSnapshot,
  NavigationSection,
  Note,
  Person,
  PersonalValue,
  ThemeMode,
  TimelineEntry,
  UsageMode,
  UserPreferences,
} from '../types/lifeos';
import { localDB, STORE_NAMES } from '../services/db';
import { createDefaultPreferences, getTodayDateString } from '../services/seedData';

interface LifeOSContextValue {
  isLoading: boolean;
  error: string | null;
  activeSection: NavigationSection;
  setActiveSection: (section: NavigationSection) => void;
  selectedCategoryId: string | 'all';
  setSelectedCategoryId: (categoryId: string | 'all') => void;
  preferences: UserPreferences;
  categories: LifeCategory[];
  priorities: DailyPriority[];
  goals: Goal[];
  habits: Habit[];
  notes: Note[];
  people: Person[];
  events: ImportantEvent[];
  timeline: TimelineEntry[];

  // Theme & Mode
  setThemeMode: (theme: ThemeMode) => Promise<void>;
  setUsageMode: (mode: UsageMode) => Promise<void>;
  updateUserName: (name: string) => Promise<void>;

  // Dashboard Widget Customization
  toggleWidgetVisibility: (widgetId: DashboardWidgetId) => Promise<void>;
  moveWidgetOrder: (widgetId: DashboardWidgetId, direction: 'up' | 'down') => Promise<void>;
  resetDashboardWidgets: () => Promise<void>;

  // Personal Values
  addPersonalValue: (principle: string, description: string) => Promise<void>;
  deletePersonalValue: (id: string) => Promise<void>;

  // Life Categories
  addCategory: (
    name: string,
    description: string,
    accentToken: LifeCategory['accentToken']
  ) => Promise<void>;
  updateCategory: (
    id: string,
    updates: Partial<Pick<LifeCategory, 'name' | 'description' | 'accentToken'>>
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Priorities
  addPriority: (params: {
    title: string;
    categoryId: string | null;
    linkedGoalId?: string | null;
    linkedPersonId?: string | null;
  }) => Promise<void>;
  togglePriority: (id: string) => Promise<void>;
  deletePriority: (id: string) => Promise<void>;

  // Habits
  addHabit: (params: {
    title: string;
    cueOrRoutine: string;
    categoryId: string | null;
    linkedGoalId?: string | null;
    frequency?: Habit['frequency'];
  }) => Promise<void>;
  toggleHabitForToday: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;

  // Goals
  addGoal: (params: {
    title: string;
    summary: string;
    whyItMatters: string;
    categoryId: string | null;
    targetDate: string;
  }) => Promise<void>;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  addGoalMilestone: (goalId: string, title: string) => Promise<void>;

  // Notes
  addNote: (params: {
    title: string;
    content: string;
    isJournal: boolean;
    categoryId: string | null;
    linkedGoalId?: string | null;
    linkedPersonId?: string | null;
  }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // People & Follow-ups
  addPerson: (params: {
    name: string;
    relationship: string;
    birthday?: string;
    conversationNotes: string;
    followUpReminder?: string;
    followUpDueDate?: string;
    categoryId: string | null;
  }) => Promise<void>;
  togglePersonFollowUp: (personId: string) => Promise<void>;

  // Sample Data & Data Control
  loadSampleData: () => Promise<void>;
  clearAllData: (keepCategories?: boolean) => Promise<void>;
  exportAllData: () => Promise<LifeOSDatabaseSnapshot>;
  importAllData: (snapshot: LifeOSDatabaseSnapshot) => Promise<void>;
}

const LifeOSContext = createContext<LifeOSContextValue | undefined>(undefined);

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export const LifeOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<NavigationSection>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');

  const [preferences, setPreferences] = useState<UserPreferences>(createDefaultPreferences());
  const [categories, setCategories] = useState<LifeCategory[]>([]);
  const [priorities, setPriorities] = useState<DailyPriority[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [events, setEvents] = useState<ImportantEvent[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  const reloadState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await localDB.initializeIfEmpty();
      setPreferences(data.preferences);
      setCategories(data.categories);
      setPriorities(data.priorities);
      setGoals(data.goals);
      setHabits(data.habits);
      setNotes(data.notes);
      setPeople(data.people);
      setEvents(data.events);
      setTimeline(data.timeline);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize local database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadState();
  }, [reloadState]);

  // Apply dark / light / system theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (mode: ThemeMode) => {
      if (mode === 'dark') {
        root.classList.add('dark');
      } else if (mode === 'light') {
        root.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme(preferences.theme);

    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [preferences.theme]);

  const appendTimelineEntry = useCallback(
    async (params: {
      entryType: TimelineEntry['entryType'];
      title: string;
      detail: string;
      categoryId: string | null;
      relatedEntityId?: string | null;
    }) => {
      const now = new Date().toISOString();
      const entry: TimelineEntry = {
        id: generateId('tl'),
        timestamp: now,
        entryType: params.entryType,
        title: params.title,
        detail: params.detail,
        categoryId: params.categoryId,
        relatedEntityId: params.relatedEntityId || null,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'local_only',
        deviceId: preferences.deviceId,
      };
      await localDB.put(STORE_NAMES.timeline, entry);
      setTimeline((prev) => [entry, ...prev]);
    },
    [preferences.deviceId]
  );

  const savePreferences = useCallback(async (updated: UserPreferences) => {
    const withTimestamp = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    await localDB.put(STORE_NAMES.preferences, withTimestamp);
    setPreferences(withTimestamp);
  }, []);

  const setThemeMode = useCallback(
    async (theme: ThemeMode) => {
      await savePreferences({ ...preferences, theme });
    },
    [preferences, savePreferences]
  );

  const setUsageMode = useCallback(
    async (usageMode: UsageMode) => {
      await savePreferences({ ...preferences, usageMode });
    },
    [preferences, savePreferences]
  );

  const updateUserName = useCallback(
    async (userName: string) => {
      const trimmed = userName.trim();
      if (!trimmed) return;
      await savePreferences({ ...preferences, userName: trimmed });
    },
    [preferences, savePreferences]
  );

  const toggleWidgetVisibility = useCallback(
    async (widgetId: DashboardWidgetId) => {
      const updatedWidgets = preferences.dashboardWidgets.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      );
      await savePreferences({ ...preferences, dashboardWidgets: updatedWidgets });
    },
    [preferences, savePreferences]
  );

  const moveWidgetOrder = useCallback(
    async (widgetId: DashboardWidgetId, direction: 'up' | 'down') => {
      const sorted = [...preferences.dashboardWidgets].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((w) => w.id === widgetId);
      if (index === -1) return;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) return;

      const tempOrder = sorted[index].order;
      sorted[index] = { ...sorted[index], order: sorted[targetIndex].order };
      sorted[targetIndex] = { ...sorted[targetIndex], order: tempOrder };

      const reordered = sorted.sort((a, b) => a.order - b.order);
      await savePreferences({ ...preferences, dashboardWidgets: reordered });
    },
    [preferences, savePreferences]
  );

  const resetDashboardWidgets = useCallback(async () => {
    const defaults = createDefaultPreferences().dashboardWidgets;
    await savePreferences({ ...preferences, dashboardWidgets: defaults });
  }, [preferences, savePreferences]);

  const addPersonalValue = useCallback(
    async (principle: string, description: string) => {
      if (!principle.trim()) return;
      const newVal: PersonalValue = {
        id: generateId('val'),
        principle: principle.trim(),
        description: description.trim(),
      };
      const updatedValues = [...preferences.personalValues, newVal];
      await savePreferences({ ...preferences, personalValues: updatedValues });
    },
    [preferences, savePreferences]
  );

  const deletePersonalValue = useCallback(
    async (id: string) => {
      const updatedValues = preferences.personalValues.filter((v) => v.id !== id);
      await savePreferences({ ...preferences, personalValues: updatedValues });
    },
    [preferences, savePreferences]
  );

  const addCategory = useCallback(
    async (
      name: string,
      description: string,
      accentToken: LifeCategory['accentToken']
    ) => {
      if (!name.trim()) return;
      const now = new Date().toISOString();
      const newCategory: LifeCategory = {
        id: generateId('cat'),
        name: name.trim(),
        description: description.trim() || 'Custom personal life dimension',
        accentToken,
        order: categories.length + 1,
        isDefault: false,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'local_only',
        deviceId: preferences.deviceId,
      };
      await localDB.put(STORE_NAMES.categories, newCategory);
      setCategories((prev) => [...prev, newCategory]);
    },
    [categories.length, preferences.deviceId]
  );

  const updateCategory = useCallback(
    async (
      id: string,
      updates: Partial<Pick<LifeCategory, 'name' | 'description' | 'accentToken'>>
    ) => {
      const target = categories.find((c) => c.id === id);
      if (!target) return;
      const updated: LifeCategory = {
        ...target,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await localDB.put(STORE_NAMES.categories, updated);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    },
    [categories]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await localDB.delete(STORE_NAMES.categories, id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (selectedCategoryId === id) {
        setSelectedCategoryId('all');
      }
    },
    [selectedCategoryId]
  );

  const addPriority = useCallback(
    async (params: {
      title: string;
      categoryId: string | null;
      linkedGoalId?: string | null;
      linkedPersonId?: string | null;
    }) => {
      if (!params.title.trim()) return;
      const now = new Date().toISOString();
      const newPrio: DailyPriority = {
        id: generateId('prio'),
        title: params.title.trim(),
        completed: false,
        dueDate: getTodayDateString(),
        categoryId: params.categoryId,
        linkedGoalId: params.linkedGoalId || null,
        linkedPersonId: params.linkedPersonId || null,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'local_only',
        deviceId: preferences.deviceId,
      };
      await localDB.put(STORE_NAMES.priorities, newPrio);
      setPriorities((prev) => [newPrio, ...prev]);
    },
    [preferences.deviceId]
  );

  const togglePriority = useCallback(
    async (id: string) => {
      const target = priorities.find((p) => p.id === id);
      if (!target) return;
      const updated: DailyPriority = {
        ...target,
        completed: !target.completed,
        updatedAt: new Date().toISOString(),
      };
      await localDB.put(STORE_NAMES.priorities, updated);
      setPriorities((prev) => prev.map((p) => (p.id === id ? updated : p)));

      if (updated.completed) {
        const goalTitle = updated.linkedGoalId
          ? goals.find((g) => g.id === updated.linkedGoalId)?.title
          : null;
        await appendTimelineEntry({
          entryType: 'priority',
          title: `Completed priority: ${updated.title}`,
          detail: goalTitle ? `Aligned with Goal: ${goalTitle}` : 'Daily priority completed',
          categoryId: updated.categoryId,
          relatedEntityId: updated.id,
        });
      }
    },
    [priorities, goals, appendTimelineEntry]
  );

  const deletePriority = useCallback(async (id: string) => {
    await localDB.delete(STORE_NAMES.priorities, id);
    setPriorities((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addHabit = useCallback(
    async (params: {
      title: string;
      cueOrRoutine: string;
      categoryId: string | null;
      linkedGoalId?: string | null;
      frequency?: Habit['frequency'];
    }) => {
      if (!params.title.trim()) return;
      const now = new Date().toISOString();
      const newHabit: Habit = {
        id: generateId('habit'),
        title: params.title.trim(),
        cueOrRoutine: params.cueOrRoutine.trim() || 'Daily scheduled practice',
        categoryId: params.categoryId,
        linkedGoalId: params.linkedGoalId || null,
        frequency: params.frequency || 'daily',
        completedDates: [],
        currentStreak: 0,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'local_only',
        deviceId: preferences.deviceId,
      };
      await localDB.put(STORE_NAMES.habits, newHabit);
      setHabits((prev) => [...prev, newHabit]);
    },
    [preferences.deviceId]
  );

  const toggleHabitForToday = useCallback(
    async (id: string) => {
      const target = habits.find((h) => h.id === id);
      if (!target) return;
      const today = getTodayDateString();
      const isCompletedToday = target.completedDates.includes(today);
      const nextDates = isCompletedToday
        ? target.completedDates.filter((d) => d !== today)
        : [...target.completedDates, today];

      const nextStreak = isCompletedToday
        ? Math.max(0, target.currentStreak - 1)
        : target.currentStreak + 1;

      const updated: Habit = {
        ...target,
        completedDates: nextDates,
        currentStreak: nextStreak,
        updatedAt: new Date().toISOString(),
      };
      await localDB.put(STORE_NAMES.habits, updated);
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));

      if (!isCompletedToday) {
        await appendTimelineEntry({
          entryType: 'habit',
          title: `Checked in habit: ${updated.title}`,
          detail: `Current streak: ${updated.currentStreak} days`,
          categoryId: updated.categoryId,
          relatedEntityId: updated.id,
        });
      }
    },
    [habits, appendTimelineEntry]
  );

  const deleteHabit = useCallback(async (id: string) => {
    await localDB.delete(STORE_NAMES.habits, id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const addGoal = useCallback(
    async (params: {
      title: string;
      summary: string;
      whyItMatters: string;
      categoryId: string | null;
      targetDate: string;
    }) => {
      if (!params.title.trim()) return;
      const now = new Date().toISOString();
      const newGoal: Goal = {
        id: generateId('goal'),
        title: params.title.trim(),
        summary: params.summary.trim(),
        whyItMatters: params.whyItMatters.trim(),
        categoryId: params.categoryId,
        progress: 0,
        targetDate: params.targetDate || getTodayDateString(),
        status: 'active',
        milestones: [],
        createdAt: now,
        updatedAt: now,
        syncStatus: 'local_only',
        deviceId: preferences.deviceId,
      };
      await localDB.put(STORE_NAMES.goals, newGoal);
      setGoals((prev) => [newGoal, ...prev]);

      await appendTimelineEntry({
        entryType: 'goal',
        title: `Established new goal: ${newGoal.title}`,
        detail: newGoal.summary || 'Target date set',
        categoryId: newGoal.categoryId,
        relatedEntityId: newGoal.id,
      });
    },
    [preferences.deviceId, appendTimelineEntry]
  );

  const toggleGoalMilestone = useCallback(
    async (goalId: string, milestoneId: string) => {
      const target = goals.find((g) => g.id === goalId);
      if (!target) return;
      const updatedMilestones = target.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      const completedCount = updatedMilestones.filter((m) => m.completed).length;
      const progress =
        updatedMilestones.length > 0
          ? Math.round((completedCount / updatedMilestones.length) * 100)
          : target.progress;

      const updatedGoal: Goal = {
        ...target,
        milestones: updatedMilestones,
        progress,
        status: progress === 100 ? 'completed' : 'active',
        updatedAt: new Date().toISOString(),
      };
      await localDB.put(STORE_NAMES.goals, updatedGoal);
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)));
    },
    [goals]
  );

  const addGoalMilestone = useCallback(
    async (goalId: string, title: string) => {
      if (!title.trim()) return;
      const target = goals.find((g) => g.id === goalId);
      if (!target) return;
      const updatedMilestones = [
        ...target.milestones,
        { id: generateId('ms'), title: title.trim(), completed: false },
      ];
      const completedCount = updatedMilestones.filter((m) => m.completed).length;
      const progress = Math.round((completedCount / updatedMilestones.length) * 100);

      const updatedGoal: Goal = {
        ...target,
        milestones: updatedMilestones,
        progress,
        updatedAt: new Date().toISOString(),
      };
      await localDB.put(STORE_NAMES.goals, updatedGoal);
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)));
    },
    [goals]
  );

  const addNote = useCallback(
    async (params: {
      title: string;
      content: string;
      isJournal: boolean;
      categoryId: string | null;
      linkedGoalId?: string | null;
      linkedPersonId?: string | null;
    }) => {
      if (!params.title.trim() && !params.content.trim()) return;
      const now = new Date().toISOString();
      const newNote: Note = {
        id: generateId('note'),
        title: params.title.trim() || 'Untitled Entry',
        content: params.content.trim(),
        isJournal: params.isJournal,
        categoryId: params.categoryId,
        linkedGoalId: params.linkedGoalId || null,
        linkedPersonId: params.linkedPersonId || null,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'local_only',
        deviceId: preferences.deviceId,
      };
      await localDB.put(STORE_NAMES.notes, newNote);
      setNotes((prev) => [newNote, ...prev]);

      await appendTimelineEntry({
        entryType: 'note',
        title: `${newNote.isJournal ? 'Recorded reflection' : 'Saved note'}: ${newNote.title}`,
        detail: newNote.content.slice(0, 100),
        categoryId: newNote.categoryId,
        relatedEntityId: newNote.id,
      });
    },
    [preferences.deviceId, appendTimelineEntry]
  );

  const deleteNote = useCallback(async (id: string) => {
    await localDB.delete(STORE_NAMES.notes, id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addPerson = useCallback(
    async (params: {
      name: string;
      relationship: string;
      birthday?: string;
      conversationNotes: string;
      followUpReminder?: string;
      followUpDueDate?: string;
      categoryId: string | null;
    }) => {
      if (!params.name.trim()) return;
      const now = new Date().toISOString();
      const newPerson: Person = {
        id: generateId('person'),
        name: params.name.trim(),
        relationship: params.relationship.trim() || 'Personal Connection',
        birthday: params.birthday || undefined,
        importantDateLabel: params.birthday ? 'Birthday' : undefined,
        lastContactedAt: getTodayDateString(),
        conversationNotes: params.conversationNotes.trim(),
        followUpReminder: params.followUpReminder?.trim() || undefined,
        followUpDueDate: params.followUpDueDate || getTodayDateString(),
        followUpCompleted: false,
        categoryId: params.categoryId,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'local_only',
        deviceId: preferences.deviceId,
      };
      await localDB.put(STORE_NAMES.people, newPerson);
      setPeople((prev) => [newPerson, ...prev]);

      await appendTimelineEntry({
        entryType: 'person',
        title: `Added relationship record: ${newPerson.name}`,
        detail: newPerson.relationship,
        categoryId: newPerson.categoryId,
        relatedEntityId: newPerson.id,
      });
    },
    [preferences.deviceId, appendTimelineEntry]
  );

  const togglePersonFollowUp = useCallback(
    async (personId: string) => {
      const target = people.find((p) => p.id === personId);
      if (!target) return;
      const updated: Person = {
        ...target,
        followUpCompleted: !target.followUpCompleted,
        lastContactedAt: !target.followUpCompleted ? getTodayDateString() : target.lastContactedAt,
        updatedAt: new Date().toISOString(),
      };
      await localDB.put(STORE_NAMES.people, updated);
      setPeople((prev) => prev.map((p) => (p.id === personId ? updated : p)));

      if (updated.followUpCompleted && updated.followUpReminder) {
        await appendTimelineEntry({
          entryType: 'person',
          title: `Completed follow-up with ${updated.name}`,
          detail: updated.followUpReminder,
          categoryId: updated.categoryId,
          relatedEntityId: updated.id,
        });
      }
    },
    [people, appendTimelineEntry]
  );

  const loadSampleData = useCallback(async () => {
    await localDB.loadSampleWorkspace();
    await reloadState();
  }, [reloadState]);

  const clearAllData = useCallback(
    async (keepCategories = true) => {
      await localDB.clearAllPersonalRecords(keepCategories);
      await reloadState();
    },
    [reloadState]
  );

  const exportAllData = useCallback(async () => {
    return localDB.exportSnapshot();
  }, []);

  const importAllData = useCallback(
    async (snapshot: LifeOSDatabaseSnapshot) => {
      await localDB.importSnapshot(snapshot);
      await reloadState();
    },
    [reloadState]
  );

  return (
    <LifeOSContext.Provider
      value={{
        isLoading,
        error,
        activeSection,
        setActiveSection,
        selectedCategoryId,
        setSelectedCategoryId,
        preferences,
        categories,
        priorities,
        goals,
        habits,
        notes,
        people,
        events,
        timeline,
        setThemeMode,
        setUsageMode,
        updateUserName,
        toggleWidgetVisibility,
        moveWidgetOrder,
        resetDashboardWidgets,
        addPersonalValue,
        deletePersonalValue,
        addCategory,
        updateCategory,
        deleteCategory,
        addPriority,
        togglePriority,
        deletePriority,
        addHabit,
        toggleHabitForToday,
        deleteHabit,
        addGoal,
        toggleGoalMilestone,
        addGoalMilestone,
        addNote,
        deleteNote,
        addPerson,
        togglePersonFollowUp,
        loadSampleData,
        clearAllData,
        exportAllData,
        importAllData,
      }}
    >
      {children}
    </LifeOSContext.Provider>
  );
};

export function useLifeOS(): LifeOSContextValue {
  const ctx = useContext(LifeOSContext);
  if (!ctx) {
    throw new Error('useLifeOS must be used inside a LifeOSProvider');
  }
  return ctx;
}
