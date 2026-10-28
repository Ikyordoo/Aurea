import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Trash2,
  Download,
  Upload,
  ShieldCheck,
  Database,
  Sliders,
} from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';
import { buildLocalAIContextBundle } from '../services/boundaries';
import { getTodayDateString } from '../services/seedData';
import { LifeOSDatabaseSnapshot, ThemeMode, UsageMode } from '../types/lifeos';

export const GoalsSectionView: React.FC = () => {
  const {
    goals,
    categories,
    selectedCategoryId,
    addGoal,
    toggleGoalMilestone,
    addGoalMilestone,
  } = useLifeOS();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetDate, setTargetDate] = useState(getTodayDateString());
  const [milestoneInputs, setMilestoneInputs] = useState<Record<string, string>>({});

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const visibleGoals = useMemo(
    () =>
      selectedCategoryId === 'all'
        ? goals
        : goals.filter((g) => g.categoryId === selectedCategoryId),
    [goals, selectedCategoryId]
  );

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addGoal({
      title,
      summary,
      whyItMatters,
      categoryId:
        categoryId ||
        (selectedCategoryId !== 'all' ? selectedCategoryId : categories[0]?.id || null),
      targetDate,
    });
    setTitle('');
    setSummary('');
    setWhyItMatters('');
    setShowForm(false);
  };

  const handleAddMilestone = async (goalId: string) => {
    const text = milestoneInputs[goalId] || '';
    if (!text.trim()) return;
    await addGoalMilestone(goalId, text);
    setMilestoneInputs((prev) => ({ ...prev, [goalId]: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-2xl font-editorial font-medium text-stone-900 dark:text-stone-100">
            Personal Goals & Milestones
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Connect long-term direction with measurable milestones and daily priorities.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          {showForm ? 'Cancel' : 'New Goal'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateGoal}
          className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Define New Personal Goal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Goal title (e.g., Publish Architecture Monograph)"
              className="md:col-span-2 px-3 py-2 text-sm bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
              required
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-3 py-2 text-sm bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            >
              <option value="">Select Life Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Concrete scope and outcome summary..."
              className="md:col-span-2 px-3 py-2 text-sm bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            />
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="px-3 py-2 text-sm font-mono-tabular bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={whyItMatters}
              onChange={(e) => setWhyItMatters(e.target.value)}
              placeholder="Why does this goal matter deeply to you?"
              className="flex-1 px-3 py-2 text-sm bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg whitespace-nowrap shrink-0"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {visibleGoals.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-12 text-center space-y-2">
          <p className="text-base font-medium text-stone-900 dark:text-stone-100">
            No goals recorded yet
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            Click &ldquo;New Goal&rdquo; above to establish a meaningful objective and break it down into milestones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleGoals.map((goal) => {
            const cat = goal.categoryId ? categoryMap.get(goal.categoryId) : null;
            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                        {goal.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                        <span>{cat ? cat.name : 'Uncategorized'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">Target {goal.targetDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{goal.status}</span>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-sm font-semibold text-amber-700 dark:text-amber-500">
                      {goal.progress}%
                    </span>
                  </div>

                  {goal.summary && (
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {goal.summary}
                    </p>
                  )}

                  {goal.whyItMatters && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                      Purpose: {goal.whyItMatters}
                    </p>
                  )}

                  <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-700 dark:bg-amber-500 transition-all duration-200"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      Milestones ({goal.milestones.filter((m) => m.completed).length}/
                      {goal.milestones.length})
                    </div>
                    {goal.milestones.length > 0 && (
                      <ul className="space-y-1.5">
                        {goal.milestones.map((ms) => (
                          <li key={ms.id}>
                            <button
                              type="button"
                              onClick={() => toggleGoalMilestone(goal.id, ms.id)}
                              className="flex items-center gap-2.5 text-xs text-left w-full py-1 text-stone-800 dark:text-stone-200 hover:text-amber-700"
                            >
                              {ms.completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              )}
                              <span
                                className={
                                  ms.completed
                                    ? 'line-through text-stone-400 dark:text-stone-500'
                                    : ''
                                }
                              >
                                {ms.title}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center gap-2">
                  <input
                    type="text"
                    value={milestoneInputs[goal.id] || ''}
                    onChange={(e) =>
                      setMilestoneInputs((prev) => ({
                        ...prev,
                        [goal.id]: e.target.value,
                      }))
                    }
                    placeholder="Add milestone checkpoint..."
                    className="flex-1 px-2.5 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddMilestone(goal.id)}
                    className="px-3 py-1.5 text-xs font-medium text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 whitespace-nowrap shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const NotesSectionView: React.FC = () => {
  const { notes, categories, goals, people, selectedCategoryId, addNote, deleteNote } =
    useLifeOS();

  const [filterType, setFilterType] = useState<'all' | 'notes' | 'journal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isJournal, setIsJournal] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [linkedGoalId, setLinkedGoalId] = useState('');
  const [linkedPersonId, setLinkedPersonId] = useState('');

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );
  const goalMap = useMemo(() => new Map(goals.map((g) => [g.id, g])), [goals]);
  const personMap = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (selectedCategoryId !== 'all' && n.categoryId !== selectedCategoryId) {
        return false;
      }
      if (filterType === 'journal' && !n.isJournal) return false;
      if (filterType === 'notes' && n.isJournal) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [notes, selectedCategoryId, filterType, searchQuery]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    await addNote({
      title,
      content,
      isJournal,
      categoryId:
        categoryId ||
        (selectedCategoryId !== 'all' ? selectedCategoryId : categories[0]?.id || null),
      linkedGoalId: linkedGoalId || null,
      linkedPersonId: linkedPersonId || null,
    });
    setTitle('');
    setContent('');
    setLinkedGoalId('');
    setLinkedPersonId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-2xl font-editorial font-medium text-stone-900 dark:text-stone-100">
            Notes, Knowledge & Reflections
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Capture enduring ideas and self-reflection entries linked to your goals and relationships.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-200/70 dark:bg-stone-800 rounded-lg self-start">
          {(['all', 'notes', 'journal'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize whitespace-nowrap shrink-0 ${
                filterType === tab
                  ? 'bg-white dark:bg-[#121110] text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {tab === 'all' ? 'All Entries' : tab === 'notes' ? 'Knowledge' : 'Journal'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-3.5 h-fit"
        >
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Compose Entry
          </h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title..."
            className="w-full px-3 py-2 text-sm bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your synthesis, reflection, or decision rationale..."
            rows={5}
            className="w-full px-3 py-2 text-sm bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            required
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300"
          >
            <option value="">Life Category (Default)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={linkedGoalId}
            onChange={(e) => setLinkedGoalId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300"
          >
            <option value="">Link to Goal (Optional)</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          <select
            value={linkedPersonId}
            onChange={(e) => setLinkedPersonId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300"
          >
            <option value="">Link to Person (Optional)</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isJournal}
              onChange={(e) => setIsJournal(e.target.checked)}
              className="rounded border-stone-300 text-amber-700"
            />
            Classify as Personal Journal Reflection
          </label>
          <button
            type="submit"
            className="w-full py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors"
          >
            Save to Local Vault
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes and reflections..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100"
            />
          </div>

          {filteredNotes.length === 0 ? (
            <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-12 text-center space-y-2">
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                No matching entries found
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Use the composer on the left to record a note or personal reflection.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map((note) => {
                const cat = note.categoryId ? categoryMap.get(note.categoryId) : null;
                const goal = note.linkedGoalId ? goalMap.get(note.linkedGoalId) : null;
                const person = note.linkedPersonId
                  ? personMap.get(note.linkedPersonId)
                  : null;
                return (
                  <article
                    key={note.id}
                    className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                        {note.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => deleteNote(note.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                      {note.content}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      <span>{note.isJournal ? 'Journal Reflection' : 'Knowledge Note'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{cat ? cat.name : 'Uncategorized'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">
                        {note.createdAt.slice(0, 10)}
                      </span>
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
      </div>
    </div>
  );
};

export const PeopleSectionView: React.FC = () => {
  const { people, categories, addPerson, togglePersonFollowUp } = useLifeOS();

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthday, setBirthday] = useState('');
  const [conversationNotes, setConversationNotes] = useState('');
  const [followUpReminder, setFollowUpReminder] = useState('');
  const [followUpDueDate, setFollowUpDueDate] = useState(getTodayDateString());
  const [categoryId, setCategoryId] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addPerson({
      name,
      relationship,
      birthday,
      conversationNotes,
      followUpReminder,
      followUpDueDate,
      categoryId: categoryId || categories[0]?.id || null,
    });
    setName('');
    setRelationship('');
    setBirthday('');
    setConversationNotes('');
    setFollowUpReminder('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-2xl font-editorial font-medium text-stone-900 dark:text-stone-100">
            People & Relationship Stewardship
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Remember birthdays, conversation context, and intentional follow-ups.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAdd ? 'Cancel' : 'Add Person'}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleCreatePerson}
          className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            New Relationship Record
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="px-3 py-2 text-sm bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
              required
            />
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Relationship (e.g., Mentor, Sister)"
              className="px-3 py-2 text-sm bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            />
            <input
              type="text"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              placeholder="Birthday (MM-DD, e.g., 11-04)"
              className="px-3 py-2 text-sm font-mono-tabular bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            />
          </div>
          <textarea
            value={conversationNotes}
            onChange={(e) => setConversationNotes(e.target.value)}
            placeholder="Recent conversation context, family details, or things that matter to them..."
            rows={2}
            className="w-full px-3 py-2 text-sm bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              value={followUpReminder}
              onChange={(e) => setFollowUpReminder(e.target.value)}
              placeholder="Next follow-up action item (optional)"
              className="sm:col-span-2 px-3 py-2 text-sm bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg"
            >
              Save Person
            </button>
          </div>
        </form>
      )}

      {people.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-12 text-center space-y-2">
          <p className="text-base font-medium text-stone-900 dark:text-stone-100">
            No people records saved yet
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Add important people in your life to keep track of conversation notes, birthdays, and follow-ups.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {people.map((person) => (
            <div
              key={person.id}
              className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                    {person.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    <span>{person.relationship}</span>
                    {person.birthday && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">Birthday {person.birthday}</span>
                      </>
                    )}
                    {person.lastContactedAt && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-tabular">
                          Last contact {person.lastContactedAt}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {person.conversationNotes && (
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {person.conversationNotes}
                </p>
              )}

              {person.followUpReminder && (
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80">
                  <button
                    type="button"
                    onClick={() => togglePersonFollowUp(person.id)}
                    className="flex items-start gap-2.5 text-left w-full"
                  >
                    {person.followUpCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs">
                      <span
                        className={`font-medium ${
                          person.followUpCompleted
                            ? 'line-through text-stone-400'
                            : 'text-stone-900 dark:text-stone-100'
                        }`}
                      >
                        Follow-up: {person.followUpReminder}
                      </span>
                      {person.followUpDueDate && (
                        <span className="block font-mono-tabular text-stone-500 mt-0.5">
                          Target date: {person.followUpDueDate}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const TimelineSectionView: React.FC = () => {
  const { timeline, categories } = useLifeOS();
  const [query, setQuery] = useState('');

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const filteredTimeline = useMemo(() => {
    if (!query.trim()) return timeline;
    const q = query.toLowerCase();
    return timeline.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        item.entryType.toLowerCase().includes(q)
    );
  }, [timeline, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-2xl font-editorial font-medium text-stone-900 dark:text-stone-100">
            Searchable Personal Timeline
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Chronological log of completed priorities, habit check-ins, notes, and milestones.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter timeline history..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#1C1A17] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
          />
        </div>
      </div>

      {filteredTimeline.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-12 text-center space-y-2">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
            No timeline events match your view
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Completing priorities, checking in habits, or saving notes automatically builds your personal timeline.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl divide-y divide-stone-200 dark:divide-stone-800">
          {filteredTimeline.map((item) => {
            const cat = item.categoryId ? categoryMap.get(item.categoryId) : null;
            return (
              <div
                key={item.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    {item.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <span className="capitalize">{item.entryType}</span>
                    {cat && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{cat.name}</span>
                      </>
                    )}
                    {item.detail && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{item.detail}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="font-mono-tabular text-xs text-stone-400 dark:text-stone-500 shrink-0">
                  {item.timestamp.replace('T', ' ').slice(0, 16)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const AIAssistantBoundaryView: React.FC = () => {
  const { categories, goals, habits, notes, people, priorities, preferences } =
    useLifeOS();

  const contextBundle = useMemo(
    () =>
      buildLocalAIContextBundle({
        categories,
        goals,
        habits,
        notes,
        people,
        priorities,
        values: preferences.personalValues,
      }),
    [categories, goals, habits, notes, people, priorities, preferences.personalValues]
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <h2 className="text-2xl font-editorial font-medium text-stone-900 dark:text-stone-100">
          AI Personal Assistant — Stage 1 Integration Boundary
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Transparent context separation between verified local facts, user-reported reflections, and future AI synthesis.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Stage 1 Architectural Status: Context Boundary Established
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              In accordance with the Stage 1 engineering plan, live Gemini API execution is intentionally deferred to a subsequent stage. Below is the real, structured local context payload assembled from your IndexedDB database, separating objective records from personal reflections so the assistant never fabricates history or silently alters records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-200 dark:border-stone-800">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              1. Verified Local Facts (Structured Entities)
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
              <li className="flex justify-between">
                <span>Configured Life Categories</span>
                <span className="font-mono-tabular font-medium text-stone-900 dark:text-stone-100">
                  {contextBundle.verifiedFactsCount.categories}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Active Personal Goals</span>
                <span className="font-mono-tabular font-medium text-stone-900 dark:text-stone-100">
                  {contextBundle.verifiedFactsCount.activeGoals}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Scheduled Habits</span>
                <span className="font-mono-tabular font-medium text-stone-900 dark:text-stone-100">
                  {contextBundle.verifiedFactsCount.scheduledHabits}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Relationship Records</span>
                <span className="font-mono-tabular font-medium text-stone-900 dark:text-stone-100">
                  {contextBundle.verifiedFactsCount.peopleRecords}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Guiding Personal Principles</span>
                <span className="font-mono-tabular font-medium text-stone-900 dark:text-stone-100">
                  {contextBundle.verifiedFactsCount.personalValues}
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              2. User-Reported Experiences & Reflections
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
              <li className="flex justify-between">
                <span>Personal Journal Reflections</span>
                <span className="font-mono-tabular font-medium text-stone-900 dark:text-stone-100">
                  {contextBundle.userExperiencesCount.journalReflections}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Knowledge Notes</span>
                <span className="font-mono-tabular font-medium text-stone-900 dark:text-stone-100">
                  {contextBundle.userExperiencesCount.knowledgeNotes}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Completed Priorities</span>
                <span className="font-mono-tabular font-medium text-stone-900 dark:text-stone-100">
                  {contextBundle.userExperiencesCount.completedPriorities}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InsightsSectionView: React.FC = () => {
  const { categories, goals, habits, priorities, notes } = useLifeOS();

  const categoryBreakdown = useMemo(() => {
    return categories.map((cat) => {
      const catGoals = goals.filter((g) => g.categoryId === cat.id);
      const catPriorities = priorities.filter((p) => p.categoryId === cat.id);
      const completedPrio = catPriorities.filter((p) => p.completed).length;
      const catHabits = habits.filter((h) => h.categoryId === cat.id);
      const catNotes = notes.filter((n) => n.categoryId === cat.id);
      const avgProgress =
        catGoals.length > 0
          ? Math.round(
              catGoals.reduce((sum, g) => sum + g.progress, 0) / catGoals.length
            )
          : 0;

      return {
        category: cat,
        goalsCount: catGoals.length,
        avgProgress,
        prioritiesRatio: `${completedPrio}/${catPriorities.length}`,
        habitsCount: catHabits.length,
        notesCount: catNotes.length,
      };
    });
  }, [categories, goals, habits, priorities, notes]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <h2 className="text-2xl font-editorial font-medium text-stone-900 dark:text-stone-100">
          Personal Development Insights
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Quantitative distribution of attention and execution across your customized life categories.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Alignment by Life Category
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
                <th className="py-3 px-6 font-medium">Life Category</th>
                <th className="py-3 px-4 font-medium text-right">Active Goals</th>
                <th className="py-3 px-4 font-medium text-right">Goal Progress</th>
                <th className="py-3 px-4 font-medium text-right">Priorities Done</th>
                <th className="py-3 px-4 font-medium text-right">Scheduled Habits</th>
                <th className="py-3 px-6 font-medium text-right">Notes & Reflections</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/70 dark:divide-stone-800/70 text-sm">
              {categoryBreakdown.map((row) => (
                <tr
                  key={row.category.id}
                  className="hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors"
                >
                  <td className="py-3.5 px-6">
                    <div className="font-medium text-stone-900 dark:text-stone-100">
                      {row.category.name}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {row.category.description}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-tabular text-stone-800 dark:text-stone-200">
                    {row.goalsCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-tabular text-stone-800 dark:text-stone-200">
                    {row.avgProgress}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-tabular text-stone-800 dark:text-stone-200">
                    {row.prioritiesRatio}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-tabular text-stone-800 dark:text-stone-200">
                    {row.habitsCount}
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono-tabular text-stone-800 dark:text-stone-200">
                    {row.notesCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface SettingsSectionViewProps {
  onOpenCategoryManager: () => void;
  onOpenDashboardCustomizer: () => void;
}

export const SettingsSectionView: React.FC<SettingsSectionViewProps> = ({
  onOpenCategoryManager,
  onOpenDashboardCustomizer,
}) => {
  const {
    preferences,
    setThemeMode,
    setUsageMode,
    addPersonalValue,
    deletePersonalValue,
    exportAllData,
    importAllData,
    clearAllData,
    loadSampleData,
  } = useLifeOS();

  const [newPrinciple, setNewPrinciple] = useState('');
  const [newPrincipleDesc, setNewPrincipleDesc] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleAddPrinciple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinciple.trim()) return;
    await addPersonalValue(newPrinciple, newPrincipleDesc);
    setNewPrinciple('');
    setNewPrincipleDesc('');
  };

  const handleExport = async () => {
    const snapshot = await exportAllData();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurea-life-os-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Exported complete local database snapshot as JSON.');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as LifeOSDatabaseSnapshot;
      await importAllData(parsed);
      setStatusMessage('Restored local database from JSON backup.');
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : 'Failed to import JSON backup.'
      );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <h2 className="text-2xl font-editorial font-medium text-stone-900 dark:text-stone-100">
          Settings, Principles & Data Sovereignty
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Configure appearance, personal values, usage modes, and full local data portability.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-600/30 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Appearance & Usage Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Interface Theme
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Choose a warm light stone canvas, deep obsidian dark mode, or follow your operating system.
          </p>
          <div className="flex items-center gap-2">
            {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setThemeMode(mode)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg border capitalize transition-colors ${
                  preferences.theme === mode
                    ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                    : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Usage Mode & Account Separation
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Local Mode stores 100% of records in browser IndexedDB without requiring an account. Cloud synchronization is planned for a future stage.
          </p>
          <div className="flex items-center gap-2">
            {(
              [
                { id: 'local', label: 'Local Mode (Active)' },
                { id: 'account_preview', label: 'Account Sync (Stage 2 Boundary)' },
              ] as Array<{ id: UsageMode; label: string }>
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setUsageMode(opt.id)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  preferences.usageMode === opt.id
                    ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                    : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Workspace Structure Customization */}
      <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Life Categories & Home Layout
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Customize your personal life categories or rearrange Home dashboard modules.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenCategoryManager}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-stone-300 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <Sliders className="w-3.5 h-3.5" />
            Manage Categories
          </button>
          <button
            type="button"
            onClick={onOpenDashboardCustomizer}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-stone-300 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Customize Home
          </button>
        </div>
      </div>

      {/* Personal Values & Principles */}
      <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Personal Values & Principles
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Your core principles anchor the Daily Briefing on the Home dashboard.
          </p>
        </div>

        <ul className="divide-y divide-stone-200 dark:divide-stone-800">
          {preferences.personalValues.map((val) => (
            <li
              key={val.id}
              className="py-3 flex items-start justify-between gap-4"
            >
              <div>
                <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  {val.principle}
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  {val.description}
                </div>
              </div>
              <button
                type="button"
                onClick={() => deletePersonalValue(val.id)}
                className="text-stone-400 hover:text-rose-600 p-1"
                title="Delete principle"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>

        <form
          onSubmit={handleAddPrinciple}
          className="pt-3 border-t border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5"
        >
          <input
            type="text"
            value={newPrinciple}
            onChange={(e) => setNewPrinciple(e.target.value)}
            placeholder="New principle (e.g., Clarity before speed)"
            className="px-3 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
            required
          />
          <input
            type="text"
            value={newPrincipleDesc}
            onChange={(e) => setNewPrincipleDesc(e.target.value)}
            placeholder="Brief explanation..."
            className="px-3 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-lg"
          >
            Add Principle
          </button>
        </form>
      </div>

      {/* Data Export, Import & Deletion */}
      <div className="bg-white dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Local Data Control, Export & Reset
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Export your entire IndexedDB database as a portable JSON file, restore from backup, or clear local records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON Snapshot
          </button>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800">
            <Upload className="w-3.5 h-3.5" />
            Import JSON Backup
            <input
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={async () => {
              await loadSampleData();
              setStatusMessage('Loaded sample workspace records into IndexedDB.');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-amber-800 dark:text-amber-300 border border-amber-600/40 rounded-lg hover:bg-amber-500/10"
          >
            <Database className="w-3.5 h-3.5" />
            Load Sample Records
          </button>

          <button
            type="button"
            onClick={async () => {
              await clearAllData(true);
              setStatusMessage('Cleared all personal records from local database.');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-700 dark:text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete All Personal Records
          </button>
        </div>
      </div>
    </div>
  );
};
