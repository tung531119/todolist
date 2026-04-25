import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  getDay,
  getDate,
} from 'date-fns'

export {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  getDay,
  getDate,
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function fromDateString(str: string): Date {
  return parseISO(str)
}

export function todayString(): string {
  return toDateString(new Date())
}

/** Returns all days in the week containing the given date (week starts Monday) */
export function getWeekDays(dateStr: string): string[] {
  const d = fromDateString(dateStr)
  const start = startOfWeek(d, { weekStartsOn: 1 })
  const end = endOfWeek(d, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map(toDateString)
}

/** Returns all days in the month containing the given date */
export function getMonthDays(dateStr: string): string[] {
  const d = fromDateString(dateStr)
  const start = startOfMonth(d)
  const end = endOfMonth(d)
  return eachDayOfInterval({ start, end }).map(toDateString)
}

export function formatDisplay(dateStr: string, pattern: string): string {
  return format(fromDateString(dateStr), pattern)
}

export function navigateDate(dateStr: string, direction: 1 | -1, mode: 'day' | 'week' | 'month'): string {
  const d = fromDateString(dateStr)
  if (mode === 'day') return toDateString(direction === 1 ? addDays(d, 1) : subDays(d, 1))
  if (mode === 'week') return toDateString(direction === 1 ? addWeeks(d, 1) : subWeeks(d, 1))
  return toDateString(direction === 1 ? addMonths(d, 1) : subMonths(d, 1))
}

export function getDayOfWeek(dateStr: string): number {
  return getDay(fromDateString(dateStr))
}

export function getDayOfMonth(dateStr: string): number {
  return getDate(fromDateString(dateStr))
}

export function isDateBefore(a: string, b: string): boolean {
  return isBefore(fromDateString(a), fromDateString(b))
}

export function isDateAfter(a: string, b: string): boolean {
  return isAfter(fromDateString(a), fromDateString(b))
}

export function daysAgo(n: number): string {
  return toDateString(subDays(new Date(), n))
}
