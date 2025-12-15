/**
 * Format a timestamp into a simple, human-friendly string
 * Keeps it calm and minimal - no excessive detail
 *
 * Examples:
 * - "Just now" (< 1 min)
 * - "5 min ago"
 * - "2 hours ago"
 * - "Yesterday"
 * - "3 days ago"
 * - "Dec 10" (this year)
 * - "Jan 2024" (previous year)
 */
export function formatTimeAgo(timestamp: string | Date | undefined | null): string {
  if (!timestamp) return ''

  const now = new Date()
  const date = new Date(timestamp)

  // Invalid date
  if (isNaN(date.getTime())) return ''

  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  // Just now (< 1 minute)
  if (diffMins < 1) {
    return 'Just now'
  }

  // Minutes ago (< 1 hour)
  if (diffMins < 60) {
    return `${diffMins} min ago`
  }

  // Hours ago (< 24 hours)
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  }

  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday'
  }

  // Days ago (< 7 days)
  if (diffDays < 7) {
    return `${diffDays} days ago`
  }

  // This year: "Dec 10"
  if (date.getFullYear() === now.getFullYear()) {
    const month = date.toLocaleString('en', { month: 'short' })
    const day = date.getDate()
    return `${month} ${day}`
  }

  // Previous year: "Jan 2024"
  const month = date.toLocaleString('en', { month: 'short' })
  const year = date.getFullYear()
  return `${month} ${year}`
}
