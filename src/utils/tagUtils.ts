/**
 * Tag utility functions for consistent tag handling across the application.
 *
 * Rules:
 * - Display format: always '#<tagName>' (exactly one '#')
 * - Internal storage: raw name without '#'
 * - Backend communication: raw name (backend accepts with or without '#')
 */

/**
 * Normalizes a tag name by removing all leading '#' characters and trimming whitespace.
 *
 * @param input - The raw tag input (may contain leading '#' or whitespace)
 * @returns The normalized tag name without '#' prefix
 *
 * @example
 * normalizeTagName('#web') // 'web'
 * normalizeTagName('##web') // 'web'
 * normalizeTagName(' #web ') // 'web'
 * normalizeTagName('webengineering') // 'webengineering'
 * normalizeTagName('') // ''
 */
export function normalizeTagName(input: string): string {
  if (!input) return ''

  // Trim whitespace and remove all leading '#' characters
  let normalized = input.trim()
  while (normalized.startsWith('#')) {
    normalized = normalized.slice(1)
  }

  return normalized.trim() // Trim again in case there were spaces after '#'
}

/**
 * Formats a tag name for display with exactly one leading '#'.
 *
 * @param name - The tag name (may or may not have '#' prefix)
 * @returns The formatted tag with exactly one '#' prefix
 *
 * @example
 * formatTagDisplay('web') // '#web'
 * formatTagDisplay('#web') // '#web'
 * formatTagDisplay('##web') // '#web'
 * formatTagDisplay('') // ''
 */
export function formatTagDisplay(name: string): string {
  if (!name) return ''

  const normalized = normalizeTagName(name)
  return normalized ? `#${normalized}` : ''
}

/**
 * Checks if a tag name is valid according to backend constraints.
 * Pattern: ^#?[A-Za-z0-9_\-\s]{2,30}$
 *
 * @param name - The tag name to validate (normalized form without '#')
 * @returns True if the tag is valid
 *
 * @example
 * isValidTag('web') // true
 * isValidTag('webengineering') // true
 * isValidTag('web_dev') // true
 * isValidTag('web-dev') // true
 * isValidTag('a') // false (too short)
 * isValidTag('web@dev') // false (invalid char)
 */
export function isValidTag(name: string): boolean {
  if (!name) return false

  const normalized = normalizeTagName(name)

  // Backend pattern: ^#?[A-Za-z0-9_\-\s]{2,30}$
  // We validate the normalized form (without '#')
  return /^[A-Za-z0-9_\-\s]{2,30}$/.test(normalized)
}

/**
 * Prepares a tag for backend submission.
 * Backend accepts tags with or without '#', so we send the normalized form.
 *
 * @param name - The tag name from UI state
 * @returns The tag name to send to backend
 *
 * @example
 * prepareTagForBackend('#web') // 'web'
 * prepareTagForBackend('web') // 'web'
 */
export function prepareTagForBackend(name: string): string {
  return normalizeTagName(name)
}

/**
 * Processes a tag received from the backend.
 *
 * @param tag - The tag value from backend response
 * @returns The normalized tag name for internal use
 *
 * @example
 * processTagFromBackend('#web') // 'web'
 * processTagFromBackend('web') // 'web'
 */
export function processTagFromBackend(tag: string): string {
  return normalizeTagName(tag)
}
