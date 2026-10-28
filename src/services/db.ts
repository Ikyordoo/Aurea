import {
  DailyPriority,
  Goal,
  Habit,
  ImportantEvent,
  LifeCategory,
  LifeOSDatabaseSnapshot,
  Note,
  Person,
  TimelineEntry,
  UserPreferences,
} from '../types/lifeos';
import {
  createDefaultCategories,
  createDefaultPreferences,
  generateSampleWorkspaceData,
} from './seedData';

const DB_NAME = 'personal_life_os_db';
const DB_VERSION = 1;

export const STORE_NAMES = {
  preferences: 'preferences',
  categories: 'categories',
  priorities: 'priorities',
  goals: 'goals',
  habits: 'habits',
  notes: 'notes',
  people: 'people',
  events: 'events',
  timeline: 'timeline',
} as const;

type StoreName = (typeof STORE_NAMES)[keyof typeof STORE_NAMES];

class LocalDatabaseService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported in this browser environment.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        Object.values(STORE_NAMES).forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB.'));
      };
    });

    return this.dbPromise;
  }

  public async getAll<T>(storeName: StoreName): Promise<T[]> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async getById<T>(storeName: StoreName, id: string): Promise<T | null> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as T) || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async put<T extends { id: string }>(storeName: StoreName, record: T): Promise<T> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    });
  }

  public async putMany<T extends { id: string }>(storeName: StoreName, records: T[]): Promise<void> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      for (const item of records) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async delete(storeName: StoreName, id: string): Promise<void> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async clearStore(storeName: StoreName): Promise<void> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async initializeIfEmpty(): Promise<{
    preferences: UserPreferences;
    categories: LifeCategory[];
    priorities: DailyPriority[];
    goals: Goal[];
    habits: Habit[];
    notes: Note[];
    people: Person[];
    events: ImportantEvent[];
    timeline: TimelineEntry[];
  }> {
    let preferences = await this.getById<UserPreferences>(
      STORE_NAMES.preferences,
      'user_preferences_singleton'
    );

    if (!preferences) {
      preferences = createDefaultPreferences();
      await this.put(STORE_NAMES.preferences, preferences);
    }

    let categories = await this.getAll<LifeCategory>(STORE_NAMES.categories);
    if (categories.length === 0) {
      categories = createDefaultCategories();
      await this.putMany(STORE_NAMES.categories, categories);
    }

    const [priorities, goals, habits, notes, people, events, timeline] = await Promise.all([
      this.getAll<DailyPriority>(STORE_NAMES.priorities),
      this.getAll<Goal>(STORE_NAMES.goals),
      this.getAll<Habit>(STORE_NAMES.habits),
      this.getAll<Note>(STORE_NAMES.notes),
      this.getAll<Person>(STORE_NAMES.people),
      this.getAll<ImportantEvent>(STORE_NAMES.events),
      this.getAll<TimelineEntry>(STORE_NAMES.timeline),
    ]);

    return {
      preferences,
      categories: categories.sort((a, b) => a.order - b.order),
      priorities,
      goals,
      habits,
      notes,
      people,
      events,
      timeline: timeline.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    };
  }

  public async loadSampleWorkspace(): Promise<void> {
    const sample = generateSampleWorkspaceData();
    const existingCategories = await this.getAll<LifeCategory>(STORE_NAMES.categories);
    if (existingCategories.length === 0) {
      await this.putMany(STORE_NAMES.categories, createDefaultCategories());
    }

    await Promise.all([
      this.putMany(STORE_NAMES.goals, sample.goals),
      this.putMany(STORE_NAMES.people, sample.people),
      this.putMany(STORE_NAMES.priorities, sample.priorities),
      this.putMany(STORE_NAMES.habits, sample.habits),
      this.putMany(STORE_NAMES.notes, sample.notes),
      this.putMany(STORE_NAMES.events, sample.events),
      this.putMany(STORE_NAMES.timeline, sample.timeline),
    ]);

    const prefs =
      (await this.getById<UserPreferences>(
        STORE_NAMES.preferences,
        'user_preferences_singleton'
      )) || createDefaultPreferences();

    prefs.hasLoadedSampleData = true;
    prefs.updatedAt = new Date().toISOString();
    await this.put(STORE_NAMES.preferences, prefs);
  }

  public async clearAllPersonalRecords(keepCategories = true): Promise<void> {
    const storesToClear: StoreName[] = [
      STORE_NAMES.priorities,
      STORE_NAMES.goals,
      STORE_NAMES.habits,
      STORE_NAMES.notes,
      STORE_NAMES.people,
      STORE_NAMES.events,
      STORE_NAMES.timeline,
    ];

    if (!keepCategories) {
      storesToClear.push(STORE_NAMES.categories);
    }

    await Promise.all(storesToClear.map((store) => this.clearStore(store)));

    if (!keepCategories) {
      await this.putMany(STORE_NAMES.categories, createDefaultCategories());
    }

    const prefs =
      (await this.getById<UserPreferences>(
        STORE_NAMES.preferences,
        'user_preferences_singleton'
      )) || createDefaultPreferences();
    prefs.hasLoadedSampleData = false;
    prefs.updatedAt = new Date().toISOString();
    await this.put(STORE_NAMES.preferences, prefs);
  }

  public async exportSnapshot(): Promise<LifeOSDatabaseSnapshot> {
    const state = await this.initializeIfEmpty();
    return {
      exportedAt: new Date().toISOString(),
      schemaVersion: DB_VERSION,
      preferences: state.preferences,
      categories: state.categories,
      priorities: state.priorities,
      goals: state.goals,
      habits: state.habits,
      notes: state.notes,
      people: state.people,
      events: state.events,
      timeline: state.timeline,
    };
  }

  public async importSnapshot(snapshot: LifeOSDatabaseSnapshot): Promise<void> {
    if (!snapshot || typeof snapshot !== 'object') {
      throw new Error('Invalid backup file format.');
    }

    await this.clearAllPersonalRecords(false);

    if (snapshot.preferences) {
      await this.put(STORE_NAMES.preferences, {
        ...snapshot.preferences,
        id: 'user_preferences_singleton',
      });
    }
    if (Array.isArray(snapshot.categories) && snapshot.categories.length > 0) {
      await this.putMany(STORE_NAMES.categories, snapshot.categories);
    } else {
      await this.putMany(STORE_NAMES.categories, createDefaultCategories());
    }
    if (Array.isArray(snapshot.priorities)) {
      await this.putMany(STORE_NAMES.priorities, snapshot.priorities);
    }
    if (Array.isArray(snapshot.goals)) {
      await this.putMany(STORE_NAMES.goals, snapshot.goals);
    }
    if (Array.isArray(snapshot.habits)) {
      await this.putMany(STORE_NAMES.habits, snapshot.habits);
    }
    if (Array.isArray(snapshot.notes)) {
      await this.putMany(STORE_NAMES.notes, snapshot.notes);
    }
    if (Array.isArray(snapshot.people)) {
      await this.putMany(STORE_NAMES.people, snapshot.people);
    }
    if (Array.isArray(snapshot.events)) {
      await this.putMany(STORE_NAMES.events, snapshot.events);
    }
    if (Array.isArray(snapshot.timeline)) {
      await this.putMany(STORE_NAMES.timeline, snapshot.timeline);
    }
  }
}

export const localDB = new LocalDatabaseService();
