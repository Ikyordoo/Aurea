# Personal Life Operating System — Stage 1 Foundation Plan

A privacy-first, local-first personal development workspace that connects goals, daily habits, reflective notes, personal relationships, and life milestones into a unified operating system—starting in Stage 1 with the application shell, customizable Home dashboard, life category engine, and persistent browser database.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and product choices have been locked in based on your preferences for Stage 1:

- **Confirmed Visual Aesthetic**: Warm editorial stone and amber accent palette (`Plus Jakarta Sans` + `Fraunces` display headers + `JetBrains Mono` tabular numbers) with seamless dark and light mode switching.
- **Confirmed Stage 1 Interactivity**: Interactive Home dashboard widgets supporting real local creation, completion toggling, and deletion for daily priorities, scheduled habits, and quick notes/reflections, plus widget visibility/order customization.
- **Confirmed Onboarding & Initialization**: Pre-configured, user-editable default life categories (e.g., *Health & Vitality*, *Deep Work & Career*, *Relationships & Family*, *Mind & Reflection*) paired with a one-click toggle to load or clear realistic sample records so you can test populated states or start from a clean slate immediately.
- **Stage 1 Scope Boundary**: Complete AI assistant chat execution, cloud synchronization, email delivery, and external calendar integrations are intentionally deferred to subsequent stages; however, clean service boundaries and relational schemas are established now so no refactoring is required later.

---

## 1. Overview & Core Concept

- **What It Does**: Provides a calm, distraction-free personal command center where daily priorities, habits, goals, notes, people, and timeline events live in a relational local database rather than isolated silos.
- **Target Audience / Persona**: Individuals seeking an intentional, disciplined, and private system for self-reflection, habit consistency, relationship care, and long-term goal execution—without mandatory cloud sign-up.
- **Key Value**: Bridges high-level life direction (values, categories, milestones) with daily execution (today's priorities, habit check-ins, follow-ups, recent notes) while keeping 100% of personal records under user control in persistent local storage.

---

## 2. User Experience & Visual Design

### Key User Flows (Stage 1)
1. **First Launch & Mode Selection**: Opens immediately in Local Mode with default life categories ready. Users see clear, actionable empty states on the Home dashboard or can click **"Load Sample Workspace"** in the header/banner to explore how interconnected goals, habits, people, and notes look in action (with a **"Reset to Empty"** option available anytime).
2. **Navigating Primary Sections**:
   - **Desktop (`1440px` baseline)**: Persistent left sidebar (`260px` width) housing the 7 core destinations (*Home, Goals, Notes, People, Timeline, AI Assistant, Insights*), a customizable *Life Categories* filter/manager section, and bottom access to *Settings* and *Theme Toggle*.
   - **Mobile**: Clean top bar with contextual title and quick actions, paired with a compact bottom navigation bar and slide-over drawer so fixed elements stay well under the 15% viewport height budget.
3. **Customizing the Home Dashboard**: Users can toggle visibility and rearrange dashboard modules (*Daily Briefing, Today's Priorities, Scheduled Habits, Goal Progress, Upcoming Birthdays & Events, Incomplete Follow-ups, Recent Notes, Personal Development Statistics*) with preferences saved automatically in IndexedDB.
4. **Interactive Daily Execution**: Directly from the Home screen, users can add a daily priority linked to a Life Category or Goal, check off today's habits (updating streak counters and timeline history), capture a quick note linked to a Goal or Person, and manage custom Life Categories.
5. **Exploring Connected Section Foundations**: Navigating to *Goals, Notes, People, Timeline, AI Assistant,* or *Insights* displays any records created or loaded in the local database, allows filtering by custom Life Categories, and clearly communicates Stage 1 capabilities vs. upcoming stage expansions.

### Visual Identity & Theme
- **Aesthetic Direction**: Calm, refined editorial minimalism. Zero decorative glowing orbs, zero fake system telemetry tickers, and strict **Zero-Pill Metadata Discipline** (categories, dates, and linked entities are rendered as clean inline typography separated by `·` rather than cluttered candy-colored pill badges).
- **Color Palette & 60-30-10 Allocation**:
  - *Light Theme*: Warm alabaster stone canvas (`#FAF8F5` - 60%), crisp parchment structural cards (`#FFFFFF` / `#F3EFEA` with `1px solid #E6E1DA` hairlines - 30%), and warm amber/terracotta bronze intent accents (`#B45309` / `#D97706` - 10%).
  - *Dark Theme*: Deep obsidian-stone canvas (`#121110` - 60%), elevated charcoal-stone surfaces (`#1C1A17` with `1px solid #2E2B26` hairlines - 30%), and luminous warm amber accents (`#F59E0B` - 10%).
  - *Semantic Status*: Paired with explicit text/icons—Emerald (`#16A34A`) for completed/on-track, Amber (`#D97706`) for due soon, Crimson (`#DC2626`) for overdue.
- **Typography & Hierarchy**:
  - *Display / Section Headings*: `Fraunces` (editorial serif for calm, reflective warmth on page titles and daily briefings) paired with `Plus Jakarta Sans` (clean geometric sans for UI structure and navigation).
  - *Body Prose*: `Plus Jakarta Sans` (`15px–16px`, comfortable `1.6` line-height).
  - *Metrics, Dates & Streaks*: `JetBrains Mono` with `tabular-nums` so all statistics, habit counters, and dates align vertically without jitter.
- **Component Styling & Spatial Math**: Single-elevation flat cards with `1px` subtle borders, generous `24px` outer container padding, and `16px`–`20px` grid gaps. No nested bordered boxes inside cards and no thick left accent borders (`border-l-4`).
- **Interactive Feedback & Motion**: Fast `150ms` opacity and transform micro-transitions (`cubic-bezier(0.16, 1, 0.3, 1)`), instant optimistic UI updates backed by IndexedDB transactions, and clear loading skeletons/error boundaries.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native IndexedDB Wrapper with Relational Entity Links**
  - *Chosen Approach*: Build a clean, zero-dependency TypeScript IndexedDB repository layer (`LocalDatabaseService`) with versioned object stores and sync metadata fields (`id`, `createdAt`, `updatedAt`, `syncStatus`, `deviceId`, `deletedAt`).
  - *Why*: Avoids unnecessary third-party bundle bloat while providing real asynchronous browser persistence that survives page reloads, offline sessions, and supports future multi-device conflict resolution.
  - *Alternatives Considered*: `localStorage` (rejected due to 5MB synchronous string limits and poor queryability for timeline/relational records).
- **Decision 2: Unified Cross-Entity Relationship Model**
  - *Chosen Approach*: Every core record (Priority, Goal, Habit, Note, Event/Reminder) supports optional foreign keys (`categoryId`, `linkedGoalId`, `linkedPersonId`) and automatically logs significant milestones to the `timeline_entries` store.
  - *Why*: Ensures the product vision of an interconnected operating system works from Day 1 rather than bolting on relationships later.
- **Decision 3: Honest Service Boundaries for Deferred Features**
  - *Chosen Approach*: Define typed service interfaces for `AIService` and `SyncService` in Stage 1, and render a transparent architectural preview in the *AI Assistant* and *Settings > Sync* views showing what local context is available and what remains unimplemented in Stage 1.
  - *Why*: Honors the strict engineering requirement never to fake cloud sync or pretend AI features are complete before their dedicated implementation stage.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer (React 19)                         │
│                                                                              │
│  ┌────────────────────┐   ┌───────────────────────────────────────────────┐  │
│  │  AppShell & Nav    │   │                Active ViewPort                │  │
│  │ ────────────────── │   │ ───────────────────────────────────────────── │  │
│  │ • Desktop Sidebar  │   │ • HomeDashboardView (Customizable Widget Grid)│  │
│  │ • Mobile BottomBar │   │   ├─ DailyBriefing & PersonalStatsBar         │  │
│  │ • TopBar Contract  │   │   ├─ TodayPrioritiesWidget (Add/Toggle/Link)  │  │
│  │ • Category Manager │   │   ├─ ScheduledHabitsWidget (Check-in/Streak)  │  │
│  │ • Theme Switcher   │   │   ├─ GoalProgress & RecentNotesWidget         │  │
│  └─────────┬──────────┘   │   └─ BirthdaysEvents & FollowUpsWidget        │  │
│            │              │ • Section Views (Goals, Notes, People,        │  │
│            │              │   Timeline, AI Assistant, Insights, Settings) │  │
│            │              └───────────────────────┬───────────────────────┘  │
└────────────┼──────────────────────────────────────┼──────────────────────────┘
             │                                      │
             ▼                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                 Application State & Domain Logic (Context/Hooks)             │
│  • LifeOSContext (Reactive state, active category filter, theme, loading)    │
│  • DashboardCustomizationEngine (Widget order, visibility, reset, seed)      │
│  • TimelineAutoLogger (Records priority/habit completions to timeline)       │
└────────────┬──────────────────────────────────────┬──────────────────────────┘
             │                                      │
             ▼                                      ▼
┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐
│   Data Access Layer (Repository API)    │ │  Integration Boundaries (Stage 1)│
│  • CategoryRepo / GoalRepo / HabitRepo  │ │  • AIServiceBoundary (Read-only  │
│  • NoteRepo / PersonRepo / TimelineRepo │ │    context inspector stub)       │
│  • PreferencesRepo (Theme, Layout, Mode)│ │  • SyncEngineBoundary (Local     │
└────────────┬────────────────────────────┘ │    export/import JSON + status)  │
             │                              └──────────────────────────────────┘
             ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                 Local Persistence Engine (Browser IndexedDB)                 │
│  Database: `personal_life_os_db` (v1)                                        │
│  Stores: `categories`, `priorities`, `goals`, `habits`, `notes`,             │
│          `people`, `reminders`, `timeline`, `preferences`                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State
- **`LifeCategory`**: `id`, `name`, `description`, `colorToken` (subtle semantic indicator), `iconName`, `order`, `isDefault`, `updatedAt`.
- **`DailyPriority`**: `id`, `title`, `completed`, `dueDate`, `categoryId`, `linkedGoalId`, `linkedPersonId`, `createdAt`, `updatedAt`.
- **`Habit`**: `id`, `title`, `categoryId`, `linkedGoalId`, `frequency`, `completedDates` (array of `YYYY-MM-DD`), `currentStreak`, `updatedAt`.
- **`Goal`**: `id`, `title`, `summary`, `categoryId`, `progress` (`0–100`), `targetDate`, `status` (`active | completed | paused`), `milestones`.
- **`Note`**: `id`, `title`, `content`, `categoryId`, `linkedGoalId`, `linkedPersonId`, `isJournal`, `createdAt`, `updatedAt`.
- **`Person`**: `id`, `name`, `relationship`, `birthday` (`MM-DD`), `lastContactedAt`, `followUpNote`, `followUpDate`, `categoryId`.
- **`TimelineEntry`**: `id`, `timestamp`, `type` (`goal | habit | note | person | milestone`), `title`, `detail`, `categoryId`, `relatedEntityId`.
- **`UserPreferences`**: `theme` (`light | dark | system`), `usageMode` (`local | account_preview`), `dashboardWidgets` (array of `{ id, visible, order }`), `hasLoadedSampleData`, `personalValues` (array of guiding principles).

### Interactive Component & State Mapping
- **Home Dashboard Customizer Modal/Drawer**: Toggles `visible` flag and reorders `dashboardWidgets` in `UserPreferences`, immediately persisting to IndexedDB and re-rendering the Home grid.
- **Life Category Customizer**: Accessible from the sidebar and Settings; allows creating new custom categories, renaming or editing existing ones, and deleting categories (safely reassigning affected items to Uncategorized).
- **Quick-Add & Inline Actions on Home**:
  - *Today's Priorities*: Inline input with optional category and goal selector; checking an item marks `completed = true` and appends a `TimelineEntry`.
  - *Scheduled Habits*: One-click daily check-in toggle for today's date (`YYYY-MM-DD`), recalculating `currentStreak` in `tabular-nums`.
  - *Quick Note Capture*: Inline composer on Home and Notes section that links directly to any existing Goal, Person, or Life Category.
- **Data Privacy & Portability Controls (Settings)**: Working **Export All Data (JSON)** and **Delete / Reset Local Database** controls with explicit confirmation so users have full data sovereignty in Stage 1.
