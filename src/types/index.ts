export type Status = 'pending' | 'in-progress' | 'completed'

export type Priority = 'low' | 'medium' | 'high'

export type CategoryId =
  | 'work'
  | 'personal'
  | 'health'
  | 'learning'
  | 'finance'
  | 'custom'

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

export type ViewMode = 'day' | 'week' | 'month'

export interface Category {
  id: string
  name: string
  color: string // tailwind color token e.g. 'indigo'
  isCustom: boolean
}

export interface RecurrenceRule {
  type: RecurrenceType
  daysOfWeek?: number[] // 0=Sun..6=Sat, for weekly
  dayOfMonth?: number   // 1–31, for monthly
  endDate?: string      // YYYY-MM-DD
}

/** A task template — defines the recurring pattern */
export interface TaskTemplate {
  id: string
  title: string
  description: string
  categoryId: string
  priority: Priority
  recurrence: RecurrenceRule
  createdAt: string
  updatedAt: string
  archived: boolean
}

/** A concrete daily instance of a task */
export interface TaskInstance {
  id: string
  templateId: string | null   // null = one-off task
  title: string
  description: string
  categoryId: string
  priority: Priority
  status: Status
  date: string                // YYYY-MM-DD
  completedAt: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

export interface AppState {
  lang: 'en' | 'zh'
  viewMode: ViewMode
  selectedDate: string        // YYYY-MM-DD
  categoryFilter: string[]    // empty = all
  statusFilter: Status[]      // empty = all
  priorityFilter: Priority[]
}
