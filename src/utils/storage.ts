const STORAGE_WARN_THRESHOLD = 0.7
const STORAGE_CRITICAL_THRESHOLD = 0.9
const STORAGE_QUOTA_ESTIMATE = 5 * 1024 * 1024 // 5 MB conservative estimate

export function getStorageUsage(): { bytes: number; ratio: number; level: 'ok' | 'warn' | 'critical' } {
  let totalBytes = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!
    totalBytes += key.length + (localStorage.getItem(key)?.length ?? 0)
  }
  // multiply by 2 for UTF-16 encoding
  totalBytes *= 2
  const ratio = totalBytes / STORAGE_QUOTA_ESTIMATE
  const level = ratio >= STORAGE_CRITICAL_THRESHOLD ? 'critical' : ratio >= STORAGE_WARN_THRESHOLD ? 'warn' : 'ok'
  return { bytes: totalBytes, ratio, level }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
