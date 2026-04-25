import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  TaskTemplate,
  TaskInstance,
  Category,
  AppState,
  Status,
  ViewMode,
} from '../types'
import { todayString, daysAgo } from '../utils/date'
import { occursOn } from '../utils/recurrence'
import { safeSet } from '../utils/storage'

// ─── nanoid polyfill ──────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work',     name: 'work',     color: 'indigo',  isCustom: false },
  { id: 'personal', name: 'personal', color: 'violet',  isCustom: false },
  { id: 'health',   name: 'health',   color: 'emerald', isCustom: false },
  { id: 'learning', name: 'learning', color: 'amber',   isCustom: false },
  { id: 'finance',  name: 'finance',  color: 'sky',     isCustom: false },
]

interface Store {
  // ── data ──────────────────────────────────────────────────────────────────
  templates: TaskTemplate[]
  instances: TaskInstance[]
  categories: Category[]

  // ── UI state ──────────────────────────────────────────────────────────────
  ui: AppState

  // ── template actions ──────────────────────────────────────────────────────
  addTemplate: (t: Omit<TaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => void
  updateTemplate: (id: string, patch: Partial<TaskTemplate>) => void
  deleteTemplate: (id: string) => void
  archiveTemplate: (id: string, archived: boolean) => void

  // ── instance actions ──────────────────────────────────────────────────────
  addInstance: (i: Omit<TaskInstance, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateInstance: (id: string, patch: Partial<TaskInstance>) => void
  deleteInstance: (id: string) => void
  setStatus: (id: string, status: Status) => void

  // ── generation ────────────────────────────────────────────────────────────
  /** Ensure instances exist for the given date range from active templates */
  ensureInstances: (dates: string[]) => void

  // ── categories ────────────────────────────────────────────────────────────
  addCategory: (name: string, color: string) => void
  deleteCategory: (id: string) => void

  // ── ui ────────────────────────────────────────────────────────────────────
  setUI: (patch: Partial<AppState>) => void
  setLang: (lang: 'en' | 'zh') => void
  setViewMode: (mode: ViewMode) => void
  setSelectedDate: (date: string) => void

  // ── maintenance ───────────────────────────────────────────────────────────
  clearOldCompleted: () => number
}

function now() { return new Date().toISOString() }

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      templates: [],
      instances: [],
      categories: DEFAULT_CATEGORIES,

      ui: {
        lang: 'en',
        viewMode: 'day',
        selectedDate: todayString(),
        categoryFilter: [],
        statusFilter: [],
        priorityFilter: [],
      },

      // ── template actions ────────────────────────────────────────────────
      addTemplate(data) {
        const template: TaskTemplate = {
          ...data,
          id: uid(),
          createdAt: now(),
          updatedAt: now(),
          archived: false,
        }
        set(s => ({ templates: [...s.templates, template] }))
      },

      updateTemplate(id, patch) {
        set(s => ({
          templates: s.templates.map(t =>
            t.id === id ? { ...t, ...patch, updatedAt: now() } : t
          ),
        }))
      },

      deleteTemplate(id) {
        set(s => ({ templates: s.templates.filter(t => t.id !== id) }))
      },

      archiveTemplate(id, archived) {
        set(s => ({
          templates: s.templates.map(t =>
            t.id === id ? { ...t, archived, updatedAt: now() } : t
          ),
        }))
      },

      // ── instance actions ─────────────────────────────────────────────────
      addInstance(data) {
        const inst: TaskInstance = {
          ...data,
          id: uid(),
          createdAt: now(),
          updatedAt: now(),
        }
        set(s => ({ instances: [...s.instances, inst] }))
      },

      updateInstance(id, patch) {
        set(s => ({
          instances: s.instances.map(i =>
            i.id === id ? { ...i, ...patch, updatedAt: now() } : i
          ),
        }))
      },

      deleteInstance(id) {
        set(s => ({ instances: s.instances.filter(i => i.id !== id) }))
      },

      setStatus(id, status) {
        set(s => ({
          instances: s.instances.map(i =>
            i.id === id
              ? {
                  ...i,
                  status,
                  completedAt: status === 'completed' ? now() : null,
                  updatedAt: now(),
                }
              : i
          ),
        }))
      },

      // ── generation ───────────────────────────────────────────────────────
      ensureInstances(dates) {
        const { templates, instances } = get()
        const activeTemplates = templates.filter(t => !t.archived)
        const newInstances: TaskInstance[] = []

        for (const dateStr of dates) {
          for (const tmpl of activeTemplates) {
            if (!occursOn(tmpl.recurrence, dateStr)) continue
            const exists = instances.some(
              i => i.templateId === tmpl.id && i.date === dateStr
            )
            if (!exists) {
              newInstances.push({
                id: uid(),
                templateId: tmpl.id,
                title: tmpl.title,
                description: tmpl.description,
                categoryId: tmpl.categoryId,
                priority: tmpl.priority,
                status: 'pending',
                date: dateStr,
                completedAt: null,
                notes: '',
                createdAt: now(),
                updatedAt: now(),
              })
            }
          }
        }

        if (newInstances.length > 0) {
          set(s => ({ instances: [...s.instances, ...newInstances] }))
        }
      },

      // ── categories ────────────────────────────────────────────────────────
      addCategory(name, color) {
        const cat: Category = { id: uid(), name, color, isCustom: true }
        set(s => ({ categories: [...s.categories, cat] }))
      },

      deleteCategory(id) {
        set(s => ({ categories: s.categories.filter(c => c.id !== id) }))
      },

      // ── ui ────────────────────────────────────────────────────────────────
      setUI(patch) {
        set(s => ({ ui: { ...s.ui, ...patch } }))
      },
      setLang(lang) {
        set(s => ({ ui: { ...s.ui, lang } }))
      },
      setViewMode(viewMode) {
        set(s => ({ ui: { ...s.ui, viewMode } }))
      },
      setSelectedDate(date) {
        set(s => ({ ui: { ...s.ui, selectedDate: date } }))
      },

      // ── maintenance ───────────────────────────────────────────────────────
      clearOldCompleted() {
        const cutoff = daysAgo(30)
        const before = get().instances.length
        set(s => ({
          instances: s.instances.filter(
            i => !(i.status === 'completed' && i.date < cutoff)
          ),
        }))
        return before - get().instances.length
      },
    }),
    {
      name: 'taskflow-store',
      storage: {
        getItem: key => {
          const raw = localStorage.getItem(key)
          return raw ? JSON.parse(raw) : null
        },
        setItem: (key, value) => {
          const ok = safeSet(key, JSON.stringify(value))
          if (!ok) console.warn('localStorage quota exceeded')
        },
        removeItem: key => localStorage.removeItem(key),
      },
    }
  )
)
