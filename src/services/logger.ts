/**
 * Logger service - environment-aware logging utility.
 * Only logs in development mode to keep production console clean.
 */
const isDev = import.meta.env.DEV

export const logger = {
  /**
   * Log error messages (only in development)
   */
  error: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.error(`[ERROR] ${message}`, ...args)
    }
    // In production, could send to error tracking service (e.g., Sentry)
  },

  /**
   * Log warning messages (only in development)
   */
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },

  /**
   * Log info messages (only in development)
   */
  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.info(`[INFO] ${message}`, ...args)
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
}
