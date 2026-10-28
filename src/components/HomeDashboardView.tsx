import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  SlidersHorizontal,
  Trash2,
  ArrowUpRight,
  Calendar,
  Database,
  RotateCcw,
} from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';
import { getTodayDateString } from '../services/seedData';
import { DashboardWidgetId } from '../types/lifeos';

interface HomeDashboardViewProps {
  onOpenCustomizer: () => void;
  onOpenCategoryManager: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onOpenCustomizer,
  onOpenCategoryManager,
}) => {
  const {
    preferences,
    categories,
    priorities,
    goals,
    habits,
    notes,
    people,
    events,
    selectedCategoryId,
    setSelectedCategoryId,
    setActiveSection,
    addPriority,
    togglePriority,
    deletePriority,
    addHabit,
    toggleHabitForToday,
    addNote,
    togglePersonFollowUp,
    loadSampleData,
    clearAllData,
  } = useLifeOS();

  const todayStr = getTodayDateString();

  // Quick-add local states
  const [prioTitle, setPrioTitle] = useState('');
  const [prioCategoryId, setPrioCategoryId] = useState<string>('');
  const [prioGoalId, setPrioGoalId] = useState<string>('');

  const [habitTitle, setHabitTitle] = useState('');
  const [habitCue, setHabitCue] = useState('');
  const [habitCategoryId, setHabitCategoryId] = useState<string>('');
  const [showAddHabit, setShowAddHabit] = useState(false);

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategoryId, setNoteCategoryId] = useState<string>('');
  const [noteGoalId, setNoteGoalId] = useState<string>('');
  const [notePersonId, setNotePersonId] = useState<string>('');
  const [noteIsJournal, setNoteIsJournal] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );
  const goalMap = useMemo(() => new Map(goals.map((g) => [g.id, g])), [goals]);
  const personMap = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

  // Filter records by selected life category
  const matchesCategory = (catId: string | null | undefined) => {
    if (selectedCategoryId === 'all') return true;
    return catId === selectedCategoryId;
  };

  const filteredPriorities = useMemo(
    () => priorities.filter((p) => matchesCategory(p.categoryId)),
    [priorities, selectedCategoryId]
  );

  const filteredHabits = useMemo(
    () => habits.filter((h) => matchesCategory(h.categoryId)),
    [habits, selectedCategoryId]
  );

  const filteredGoals = useMemo(
    () => goals.filter((g) => matchesCategory(g.categoryId)),
    [goals, selectedCategoryId]
  );

  const filteredNotes = useMemo(
    () => notes.filter((n) => matchesCategory(n.categoryId)),
    [notes, selectedCategoryId]
  );

  const filteredPeopleFollowUps = useMemo(
    () =>
      people.filter(
        (p) =>
          matchesCategory(p.categoryId) &&
          Boolean(p.followUpReminder) &&
          !p.followUpCompleted
      ),
    [people, selectedCategoryId]
  );

  const filteredEvents = useMemo(
    () => events.filter((e) => matchesCategory(e.categoryId) && !e.completed),
    [events, selectedCategoryId]
  );

  const totalWorkspaceRecords =
    priorities.length +
    goals.length +
    habits.length +
    notes.length +
    people.length +
    events.length;

  const visibleWidgets = useMemo(
    () =>
      [...preferences.dashboardWidgets]
        .filter((w) => w.visible)
        .sort((a, b) => a.order - b.order),
    [preferences.dashboardWidgets]
  );

  const handleCreatePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prioTitle.trim()) return;
    const defaultCat =
      prioCategoryId ||
      (selectedCategoryId !== 'all' ? selectedCategoryId : categories[0]?.id || null);
    await addPriority({
      title: prioTitle,
      categoryId: defaultCat,
      linkedGoalId: prioGoalId || null,
    });
    setPrioTitle('');
    setPrioGoalId('');
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    const defaultCat =
      habitCategoryId ||
      (selectedCategoryId !== 'all' ? selectedCategoryId : categories[0]?.id || null);
    await addHabit({
      title: habitTitle,
      cueOrRoutine: habitCue,
      categoryId: defaultCat,
    });
    setHabitTitle('');
    setHabitCue('');
    setShowAddHabit(false);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;
    const defaultCat =
      noteCategoryId ||
      (selectedCategoryId !== 'all' ? selectedCategoryId : categories[0]?.id || null);
    await addNote({
      title: noteTitle,
      content: noteContent,
      isJournal: noteIsJournal,
      categoryId: defaultCat,
      linkedGoalId: noteGoalId || null,
      linkedPersonId: notePersonId || null,
    });
    setNoteTitle('');
    setNoteContent('');
    setNoteGoalId('');
    setNotePersonId('');
    setShowAddNote(false);
  };

  // Real statistics calculations
  const completedPrioritiesCount = filteredPriorities.filter((p) => p.completed).length;
  const habitsCompletedTodayCount = filteredHabits.filter((h) =>
    h.completedDates.includes(todayStr)
  ).length;
  const averageGoalProgress =
    filteredGoals.length > 0
      ? Math.round(
          filteredGoals.reduce((sum, g) => sum + g.progress, 0) / filteredGoals.length
        )
      : 0;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const renderWidget = (widgetId: DashboardWidgetId) => {
    switch (widgetId) {
      case 'briefing':
        return (
          <section
            key="briefing"
            className="lg:col-span-2 bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <span>Daily Briefing</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">{formattedDate}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {preferences.usageMode === 'local'
                      ? 'Local Mode (IndexedDB)'
                      : 'Account Sync Preview'}
                  </span>
                </div>
                <h2 className="text-2xl font-editorial font-medium text-stone-900 dark:text-stone-100 tracking-tight text-balance">
                  Steady direction comes from aligning today&apos;s actions with enduring principles.
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {totalWorkspaceRecords === 0
                    ? 'Your local database is initialized and ready. Begin by adding your first priority below, or load realistic sample records to explore how goals, habits, notes, and relationships connect.'
                    : `You have ${
                        filteredPriorities.filter((p) => !p.completed).length
                      } open priorities today, ${habitsCompletedTodayCount} of ${
                        filteredHabits.length
                      } scheduled habits completed, and ${
                        filteredPeopleFollowUps.length
                      } relationship follow-ups pending.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {totalWorkspaceRecords === 0 ? (
                  <button
                    type="button"
                    onClick={loadSampleData}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Database className="w-3.5 h-3.5" />
                    Load Sample Workspace
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => clearAllData(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    title="Clear sample or personal records to start blank"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Records
                  </button>
                )}
              </div>
            </div>

            {preferences.personalValues.length > 0 && (
              <div className="mt-6 pt-5 border-t border-stone-200/80 dark:border-stone-800/80 grid grid-cols-1 md:grid-cols-3 gap-6">
                {preferences.personalValues.slice(0, 3).map((val, idx) => (
                  <div key={val.id} className="space-y-1">
                    <div className="text-xs font-mono-tabular text-amber-700 dark:text-amber-500">
                      0{idx + 1}. Guiding Principle
                    </div>
                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {val.principle}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        );

      case 'stats':
        return (
          <section
            key="stats"
            className="lg:col-span-2 bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Personal Development Statistics
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Computed from live local records
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2 border-t border-stone-100 dark:border-stone-800/70">
              <div>
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  Today&apos;s Priorities
                </div>
                <div className="mt-1 text-2xl font-semibold font-mono-tabular text-stone-900 dark:text-stone-100">
                  {completedPrioritiesCount}/{filteredPriorities.length}
                </div>
                <div className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  {filteredPriorities.length === 0
                    ? 'No tasks scheduled yet'
                    : `${Math.round(
                        (completedPrioritiesCount / filteredPriorities.length) * 100
                      )}% daily completion`}
                </div>
              </div>

              <div>
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  Habit Consistency
                </div>
                <div className="mt-1 text-2xl font-semibold font-mono-tabular text-stone-900 dark:text-stone-100">
                  {habitsCompletedTodayCount}/{filteredHabits.length}
                </div>
                <div className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  Checked in for {todayStr}
                </div>
              </div>

              <div>
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  Active Goal Progress
                </div>
                <div className="mt-1 text-2xl font-semibold font-mono-tabular text-stone-900 dark:text-stone-100">
                  {averageGoalProgress}%
                </div>
                <div className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  Across {filteredGoals.length} active goals
                </div>
              </div>

              <div>
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  Knowledge & Journal
                </div>
                <div className="mt-1 text-2xl font-semibold font-mono-tabular text-stone-900 dark:text-stone-100">
                  {filteredNotes.length}
                </div>
                <div className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  {filteredPeopleFollowUps.length} pending follow-ups
                </div>
              </div>
            </div>
          </section>
        );

      case 'priorities':
        return (
          <section
            key="priorities"
            className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                    Today&apos;s Priorities
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Intentional commitments for {todayStr}
                  </p>
                </div>
                <span className="font-mono-tabular text-xs text-stone-500 dark:text-stone-400">
                  {completedPrioritiesCount} of {filteredPriorities.length} done
                </span>
              </div>

              {filteredPriorities.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
                    No priorities recorded for today
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                    Add 1 to 3 meaningful tasks below and optionally connect them to an active goal.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-stone-200/70 dark:divide-stone-800/70 my-2">
                  {filteredPriorities.map((prio) => {
                    const cat = prio.categoryId ? categoryMap.get(prio.categoryId) : null;
                    const linkedGoal = prio.linkedGoalId
                      ? goalMap.get(prio.linkedGoalId)
                      : null;
                    const linkedPerson = prio.linkedPersonId
                      ? personMap.get(prio.linkedPersonId)
                      : null;

                    return (
                      <li
                        key={prio.id}
                        className="py-3 flex items-start justify-between gap-3 group"
                      >
                        <button
                          type="button"
                          onClick={() => togglePriority(prio.id)}
                          className="flex items-start gap-3 text-left flex-1 min-w-0"
                        >
                          {prio.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-stone-400 hover:text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm ${
                                prio.completed
                                  ? 'line-through text-stone-400 dark:text-stone-500'
                                  : 'text-stone-900 dark:text-stone-100'
                              }`}
                            >
                              {prio.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                              <span>{cat ? cat.name : 'Uncategorized'}</span>
                              {linkedGoal && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>Goal: {linkedGoal.title}</span>
                                </>
                              )}
                              {linkedPerson && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>Person: {linkedPerson.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePriority(prio.id)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                          aria-label="Remove priority"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <form
              onSubmit={handleCreatePriority}
              className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2.5"
            >
              <input
                type="text"
                value={prioTitle}
                onChange={(e) => setPrioTitle(e.target.value)}
                placeholder="Add a daily priority..."
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
              />
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={prioCategoryId}
                  onChange={(e) => setPrioCategoryId(e.target.value)}
                  className="flex-1 min-w-[130px] px-2.5 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300"
                >
                  <option value="">Category (Default)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={prioGoalId}
                  onChange={(e) => setPrioGoalId(e.target.value)}
                  className="flex-1 min-w-[130px] px-2.5 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300"
                >
                  <option value="">Link to Goal (Optional)</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </form>
          </section>
        );

      case 'habits':
        return (
          <section
            key="habits"
            className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                    Scheduled Habits
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Daily rituals and streak consistency
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddHabit((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddHabit ? 'Close' : 'New Habit'}
                </button>
              </div>

              {showAddHabit && (
                <form
                  onSubmit={handleCreateHabit}
                  className="my-3 p-3.5 bg-[#FAF8F5] dark:bg-[#121110] border border-stone-200 dark:border-stone-800 rounded-lg space-y-2.5"
                >
                  <input
                    type="text"
                    value={habitTitle}
                    onChange={(e) => setHabitTitle(e.target.value)}
                    placeholder="Habit title (e.g., 30m morning reading)"
                    className="w-full px-3 py-1.5 text-sm bg-white dark:bg-[#1C1A17] border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100"
                    required
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={habitCue}
                      onChange={(e) => setHabitCue(e.target.value)}
                      placeholder="Trigger or time cue (e.g., After coffee at 07:30)"
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#1C1A17] border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100"
                    />
                    <select
                      value={habitCategoryId}
                      onChange={(e) => setHabitCategoryId(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#1C1A17] border border-stone-300 dark:border-stone-700 rounded-md text-stone-700 dark:text-stone-300"
                    >
                      <option value="">Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-md whitespace-nowrap shrink-0"
                    >
                      Save Habit
                    </button>
                  </div>
                </form>
              )}

              {filteredHabits.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
                    No habits configured yet
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                    Click &ldquo;New Habit&rdquo; above to establish a recurring daily practice.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-stone-200/70 dark:divide-stone-800/70 my-2">
                  {filteredHabits.map((habit) => {
                    const doneToday = habit.completedDates.includes(todayStr);
                    const cat = habit.categoryId ? categoryMap.get(habit.categoryId) : null;
                    return (
                      <li
                        key={habit.id}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <button
                          type="button"
                          onClick={() => toggleHabitForToday(habit.id)}
                          className="flex items-start gap-3 text-left flex-1 min-w-0"
                        >
                          {doneToday ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-stone-400 hover:text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-medium ${
                                doneToday
                                  ? 'text-stone-500 dark:text-stone-400'
                                  : 'text-stone-900 dark:text-stone-100'
                              }`}
                            >
                              {habit.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              <span>{cat ? cat.name : 'General'}</span>
                              <span aria-hidden="true">·</span>
                              <span>{habit.cueOrRoutine}</span>
                            </div>
                          </div>
                        </button>
                        <div className="text-right shrink-0">
                          <span className="font-mono-tabular text-xs font-medium text-stone-800 dark:text-stone-200">
                            {habit.currentStreak}d streak
                          </span>
                          <div className="text-[11px] text-stone-400 dark:text-stone-500">
                            {doneToday ? 'Checked in' : 'Due today'}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/70 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>Check-ins automatically log to your personal timeline</span>
              <button
                type="button"
                onClick={() => setActiveSection('timeline')}
                className="inline-flex items-center gap-1 text-stone-700 dark:text-stone-300 hover:underline whitespace-nowrap shrink-0"
              >
                Timeline
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </section>
        );

      case 'goals':
        return (
          <section
            key="goals"
            className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                    Goal Progress
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Active long-term outcomes and milestones
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('goals')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline whitespace-nowrap shrink-0"
                >
                  Manage Goals
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {filteredGoals.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
                    No active goals in this view
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                    Define clear outcomes and milestones in the Goals section to track progress.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-200/70 dark:divide-stone-800/70 my-2">
                  {filteredGoals.slice(0, 3).map((goal) => {
                    const cat = goal.categoryId ? categoryMap.get(goal.categoryId) : null;
                    const completedMs = goal.milestones.filter((m) => m.completed).length;
                    return (
                      <div key={goal.id} className="py-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100">
                              {goal.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              <span>{cat ? cat.name : 'Uncategorized'}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono-tabular">Target {goal.targetDate}</span>
                              {goal.milestones.length > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono-tabular">
                                    {completedMs}/{goal.milestones.length} milestones
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="font-mono-tabular text-xs font-semibold text-stone-900 dark:text-stone-100">
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-700 dark:bg-amber-500 transition-all duration-200"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/70 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>Goals connect directly to daily priorities and notes</span>
              <button
                type="button"
                onClick={onOpenCategoryManager}
                className="text-stone-700 dark:text-stone-300 hover:underline whitespace-nowrap shrink-0"
              >
                Edit Categories
              </button>
            </div>
          </section>
        );

      case 'follow_ups':
        return (
          <section
            key="follow_ups"
            className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                    Incomplete Follow-ups
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Relationship check-ins and conversation commitments
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('people')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline whitespace-nowrap shrink-0"
                >
                  All People
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {filteredPeopleFollowUps.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
                    No pending relationship follow-ups
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                    Add conversation notes or follow-up reminders in the People section.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-stone-200/70 dark:divide-stone-800/70 my-2">
                  {filteredPeopleFollowUps.map((person) => (
                    <li
                      key={person.id}
                      className="py-3.5 flex items-start justify-between gap-3"
                    >
                      <button
                        type="button"
                        onClick={() => togglePersonFollowUp(person.id)}
                        className="flex items-start gap-3 text-left flex-1 min-w-0"
                      >
                        <Circle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                            {person.followUpReminder}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                            <span className="font-medium text-stone-700 dark:text-stone-300">
                              {person.name}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{person.relationship}</span>
                            {person.followUpDueDate && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono-tabular">
                                  Due {person.followUpDueDate}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/70 text-xs text-stone-500 dark:text-stone-400">
              Checking off a follow-up updates last-contacted date automatically
            </div>
          </section>
        );

      case 'people_events':
        return (
          <section
            key="people_events"
            className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                    Upcoming Birthdays & Important Events
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Scheduled milestones, reminders, and key dates
                  </p>
                </div>
                <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
              </div>

              {filteredEvents.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
                    No upcoming events or birthdays recorded
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                    Birthdays added to People records and milestone dates appear here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-stone-200/70 dark:divide-stone-800/70 my-2">
                  {filteredEvents.map((ev) => {
                    const person = ev.linkedPersonId
                      ? personMap.get(ev.linkedPersonId)
                      : null;
                    const goal = ev.linkedGoalId ? goalMap.get(ev.linkedGoalId) : null;
                    return (
                      <li
                        key={ev.id}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                            {ev.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            <span className="capitalize">{ev.type}</span>
                            {person && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{person.name}</span>
                              </>
                            )}
                            {goal && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{goal.title}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="font-mono-tabular text-xs font-medium text-stone-700 dark:text-stone-300 shrink-0">
                          {ev.date}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/70 text-xs text-stone-500 dark:text-stone-400">
              All dates stored locally in browser IndexedDB
            </div>
          </section>
        );

      case 'recent_notes':
        return (
          <section
            key="recent_notes"
            className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                    Recent Notes & Reflections
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Connected thoughts, lessons, and journal entries
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddNote((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddNote ? 'Close' : 'Quick Note'}
                </button>
              </div>

              {showAddNote && (
                <form
                  onSubmit={handleCreateNote}
                  className="my-3 p-3.5 bg-[#FAF8F5] dark:bg-[#121110] border border-stone-200 dark:border-stone-800 rounded-lg space-y-2.5"
                >
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note or reflection title..."
                    className="w-full px-3 py-1.5 text-sm bg-white dark:bg-[#1C1A17] border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100"
                    required
                  />
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your reflection, decision insight, or meeting takeaway..."
                    rows={3}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1C1A17] border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100"
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={noteCategoryId}
                      onChange={(e) => setNoteCategoryId(e.target.value)}
                      className="px-2 py-1.5 text-xs bg-white dark:bg-[#1C1A17] border border-stone-300 dark:border-stone-700 rounded-md text-stone-700 dark:text-stone-300"
                    >
                      <option value="">Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={noteGoalId}
                      onChange={(e) => setNoteGoalId(e.target.value)}
                      className="px-2 py-1.5 text-xs bg-white dark:bg-[#1C1A17] border border-stone-300 dark:border-stone-700 rounded-md text-stone-700 dark:text-stone-300"
                    >
                      <option value="">Connect Goal</option>
                      {goals.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                    <select
                      value={notePersonId}
                      onChange={(e) => setNotePersonId(e.target.value)}
                      className="px-2 py-1.5 text-xs bg-white dark:bg-[#1C1A17] border border-stone-300 dark:border-stone-700 rounded-md text-stone-700 dark:text-stone-300"
                    >
                      <option value="">Connect Person</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="inline-flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={noteIsJournal}
                        onChange={(e) => setNoteIsJournal(e.target.checked)}
                        className="rounded border-stone-300 text-amber-700 focus:ring-amber-600"
                      />
                      Mark as Personal Journal Reflection
                    </label>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-md whitespace-nowrap shrink-0"
                    >
                      Save Entry
                    </button>
                  </div>
                </form>
              )}

              {filteredNotes.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
                    No notes or reflections yet
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                    Capture knowledge notes or self-reflections and link them to goals or people.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-200/70 dark:divide-stone-800/70 my-2">
                  {filteredNotes.slice(0, 3).map((note) => {
                    const cat = note.categoryId ? categoryMap.get(note.categoryId) : null;
                    const goal = note.linkedGoalId ? goalMap.get(note.linkedGoalId) : null;
                    const person = note.linkedPersonId
                      ? personMap.get(note.linkedPersonId)
                      : null;

                    return (
                      <article key={note.id} className="py-3.5 space-y-1">
                        <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100">
                          {note.title}
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {note.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 pt-1">
                          <span>{note.isJournal ? 'Journal Reflection' : 'Knowledge Note'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{cat ? cat.name : 'General'}</span>
                          {goal && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>Goal: {goal.title}</span>
                            </>
                          )}
                          {person && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>Person: {person.name}</span>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/70 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>{filteredNotes.length} total entries in view</span>
              <button
                type="button"
                onClick={() => setActiveSection('notes')}
                className="inline-flex items-center gap-1 text-stone-700 dark:text-stone-300 hover:underline whitespace-nowrap shrink-0"
              >
                Open Notes
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Life Category Filter Bar + Layout Customizer Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedCategoryId === 'all'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
            }`}
          >
            All Life Areas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategoryId === cat.id
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCategoryManager}
            className="px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            Categories
          </button>
          <button
            type="button"
            onClick={onOpenCustomizer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Customize Dashboard
          </button>
        </div>
      </div>

      {/* Customizable Dashboard Grid */}
      {visibleWidgets.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-12 text-center space-y-3">
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            All Home dashboard modules are currently hidden
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            Open the dashboard customizer to enable the modules you want in your daily overview.
          </p>
          <button
            type="button"
            onClick={onOpenCustomizer}
            className="px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Configure Dashboard Modules
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleWidgets.map((w) => renderWidget(w.id))}
        </div>
      )}
    </div>
  );
};
