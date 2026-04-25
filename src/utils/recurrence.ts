import type { RecurrenceRule } from '../types'
import {
  getDayOfWeek,
  getDayOfMonth,
  isDateAfter,
} from './date'

/** Returns true if a template with the given recurrence rule should have an instance on `dateStr` */
export function occursOn(rule: RecurrenceRule, dateStr: string): boolean {
  if (rule.type === 'none') return false

  if (rule.endDate && isDateAfter(dateStr, rule.endDate)) return false

  if (rule.type === 'daily') return true

  if (rule.type === 'weekly') {
    const dow = getDayOfWeek(dateStr) // 0 = Sun
    const days = rule.daysOfWeek ?? [1, 2, 3, 4, 5] // default Mon–Fri
    return days.includes(dow)
  }

  if (rule.type === 'monthly') {
    const dom = getDayOfMonth(dateStr)
    const target = rule.dayOfMonth ?? 1
    return dom === target
  }

  return false
}
