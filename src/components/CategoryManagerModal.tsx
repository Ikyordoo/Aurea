import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Edit3 } from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';
import { LifeCategory } from '../types/lifeos';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_OPTIONS: Array<{
  value: LifeCategory['accentToken'];
  label: string;
}> = [
  { value: 'amber', label: 'Warm Amber' },
  { value: 'emerald', label: 'Sage Emerald' },
  { value: 'sky', label: 'Calm Sky' },
  { value: 'rose', label: 'Muted Rose' },
  { value: 'indigo', label: 'Deep Indigo' },
  { value: 'stone', label: 'Neutral Stone' },
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useLifeOS();

  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAccent, setNewAccent] = useState<LifeCategory['accentToken']>('amber');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAccent, setEditAccent] = useState<LifeCategory['accentToken']>('amber');

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addCategory(newName, newDescription, newAccent);
    setNewName('');
    setNewDescription('');
    setNewAccent('amber');
  };

  const startEdit = (cat: LifeCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description);
    setEditAccent(cat.accentToken);
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await updateCategory(id, {
      name: editName.trim(),
      description: editDescription.trim(),
      accentToken: editAccent,
    });
    setEditingId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      <div className="w-full max-w-2xl bg-[#FAF8F5] dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h2
              id="category-modal-title"
              className="text-lg font-semibold text-stone-900 dark:text-stone-100"
            >
              Personal Life Categories
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Customize the core areas of your life. Goals, habits, notes, and relationships connect to these dimensions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <form onSubmit={handleCreate} className="space-y-3 pb-6 border-b border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Add New Life Dimension
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name (e.g., Creative Writing)"
                className="sm:col-span-2 px-3 py-2 text-sm bg-white dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                required
              />
              <select
                value={newAccent}
                onChange={(e) => setNewAccent(e.target.value as LifeCategory['accentToken'])}
                className="px-3 py-2 text-sm bg-white dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
              >
                {ACCENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Tone: {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Brief intention or scope for this life area..."
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-[#121110] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Active Categories ({categories.length})
              </h3>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                 Stored locally in IndexedDB
              </span>
            </div>

            <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-[#121110]">
              {categories.map((cat) => {
                const isEditing = editingId === cat.id;
                return (
                  <div key={cat.id} className="p-4 flex flex-col gap-2">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="sm:col-span-2 px-2.5 py-1.5 text-sm bg-[#FAF8F5] dark:bg-[#1C1A17] border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100"
                          />
                          <select
                            value={editAccent}
                            onChange={(e) =>
                              setEditAccent(e.target.value as LifeCategory['accentToken'])
                            }
                            className="px-2.5 py-1.5 text-sm bg-[#FAF8F5] dark:bg-[#1C1A17] border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100"
                          >
                            {ACCENT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#1C1A17] border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100"
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(cat.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-md whitespace-nowrap shrink-0"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 whitespace-nowrap shrink-0"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-stone-100">
                            <span>{cat.name}</span>
                            <span className="text-stone-400 dark:text-stone-600" aria-hidden="true">
                              ·
                            </span>
                            <span className="text-xs font-normal text-stone-500 dark:text-stone-400 capitalize">
                              {cat.accentToken} tone
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            {cat.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-md transition-colors"
                            title="Edit category"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCategory(cat.id)}
                            className="p-1.5 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end bg-stone-100/60 dark:bg-[#151412]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
