import React, { useState } from 'react';
import {
  Home,
  Target,
  BookOpen,
  Users,
  Clock,
  Sparkles,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';
import { NavigationSection } from '../types/lifeos';
import { HomeDashboardView } from './HomeDashboardView';
import {
  AIAssistantBoundaryView,
  GoalsSectionView,
  InsightsSectionView,
  NotesSectionView,
  PeopleSectionView,
  SettingsSectionView,
  TimelineSectionView,
} from './SectionViews';
import { CategoryManagerModal } from './CategoryManagerModal';
import { DashboardCustomizerModal } from './DashboardCustomizerModal';

const PRIMARY_NAV_ITEMS: Array<{
  id: NavigationSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'notes', label: 'Notes', icon: BookOpen },
  { id: 'people', label: 'People', icon: Users },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
];

export const AppShell: React.FC = () => {
  const {
    isLoading,
    error,
    activeSection,
    setActiveSection,
    selectedCategoryId,
    setSelectedCategoryId,
    categories,
    preferences,
    setThemeMode,
  } = useLifeOS();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCustomizerModalOpen, setIsCustomizerModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDarkLight = () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
  };

  const activeCategoryName =
    selectedCategoryId === 'all'
      ? 'All Life Areas'
      : categories.find((c) => c.id === selectedCategoryId)?.name || 'All Life Areas';

  const activeSectionLabel =
    activeSection === 'settings'
      ? 'Settings'
      : PRIMARY_NAV_ITEMS.find((i) => i.id === activeSection)?.label || 'Home';

  const handleSelectNav = (section: NavigationSection) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[#FAF8F5] dark:bg-[#121110] text-stone-900 dark:text-stone-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#F3EFEA] dark:bg-[#171513] border-r border-stone-200 dark:border-stone-800 select-none">
        <div className="px-6 py-5 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveSection('home')}
            className="text-xl font-editorial font-semibold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0"
          >
            Aurea
          </button>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Personal OS
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Primary Navigation */}
          <nav aria-label="Primary sections" className="space-y-0.5">
            {PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Customizable Life Categories */}
          <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800/80 space-y-2">
            <div className="px-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                Life Categories
              </span>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="p-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded transition-colors"
                title="Customize life categories"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setSelectedCategoryId('all')}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors truncate ${
                  selectedCategoryId === 'all'
                    ? 'font-semibold text-amber-800 dark:text-amber-400 bg-amber-500/10'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                All Life Areas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors truncate ${
                    selectedCategoryId === cat.id
                      ? 'font-semibold text-amber-800 dark:text-amber-400 bg-amber-500/10'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Separate Settings & Theme Controls */}
        <div className="p-3 border-t border-stone-200/80 dark:border-stone-800/80 space-y-1">
          <button
            type="button"
            onClick={() => handleSelectNav('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'settings'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#FAF8F5] dark:bg-[#171513] border-r border-stone-200 dark:border-stone-800 p-4 flex flex-col justify-between z-10">
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                <span className="text-lg font-editorial font-semibold">Aurea</span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1">
                {PRIMARY_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectNav(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
                        isActive
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                          : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-1.5">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-semibold text-stone-500">
                    Life Categories
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsCategoryModalOpen(true);
                    }}
                    className="text-xs text-amber-700 dark:text-amber-400"
                  >
                    Edit
                  </button>
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-2 py-1 text-xs text-stone-600 dark:text-stone-400 truncate"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => handleSelectNav('settings')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 rounded-lg"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Bar Contract: Zone 1 Breadcrumb/Brand — Zone 2 Quick Links — Zone 3 Primary Action */}
        <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-[#FAF8F5]/95 dark:bg-[#121110]/95 sticky top-0 z-20 backdrop-blur-xs">
          {/* Zone 1: Single contextual breadcrumb / brand */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 text-stone-600 dark:text-stone-300"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0">
              {activeSectionLabel} / {activeCategoryName}
            </span>
          </div>

          {/* Zone 2: Clean single-line quick section links on desktop */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600 dark:text-stone-400">
            <button
              type="button"
              onClick={() => setActiveSection('home')}
              className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors whitespace-nowrap shrink-0"
            >
              Today Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('goals')}
              className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors whitespace-nowrap shrink-0"
            >
              Goals
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('notes')}
              className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors whitespace-nowrap shrink-0"
            >
              Journal & Notes
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('timeline')}
              className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors whitespace-nowrap shrink-0"
            >
              Timeline
            </button>
          </nav>

          {/* Zone 3: Theme switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleDarkLight}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
              aria-label="Toggle theme"
            >
              {preferences.theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-stone-600" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              Storage notice: {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
              <div className="lg:col-span-2 h-36 bg-stone-200/60 dark:bg-stone-800/50 rounded-xl" />
              <div className="h-64 bg-stone-200/60 dark:bg-stone-800/50 rounded-xl" />
              <div className="h-64 bg-stone-200/60 dark:bg-stone-800/50 rounded-xl" />
            </div>
          ) : (
            <>
              {activeSection === 'home' && (
                <HomeDashboardView
                  onOpenCustomizer={() => setIsCustomizerModalOpen(true)}
                  onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
                />
              )}
              {activeSection === 'goals' && <GoalsSectionView />}
              {activeSection === 'notes' && <NotesSectionView />}
              {activeSection === 'people' && <PeopleSectionView />}
              {activeSection === 'timeline' && <TimelineSectionView />}
              {activeSection === 'assistant' && <AIAssistantBoundaryView />}
              {activeSection === 'insights' && <InsightsSectionView />}
              {activeSection === 'settings' && (
                <SettingsSectionView
                  onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
                  onOpenDashboardCustomizer={() => setIsCustomizerModalOpen(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Compact Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile bottom navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-[#FAF8F5]/95 dark:bg-[#171513]/95 border-t border-stone-200 dark:border-stone-800 px-2 py-1.5 flex items-center justify-around backdrop-blur-xs"
      >
        {PRIMARY_NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap shrink-0 ${
                isActive
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Modals */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
      <DashboardCustomizerModal
        isOpen={isCustomizerModalOpen}
        onClose={() => setIsCustomizerModalOpen(false)}
      />
    </div>
  );
};
