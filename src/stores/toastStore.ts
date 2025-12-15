import { defineStore } from 'pinia'

type Variant = 'success' | 'warning' | 'error'

// Auto-dismiss durations (in milliseconds)
const AUTO_DISMISS_DURATIONS: Record<Variant, number> = {
  success: 4000, // 4 seconds - quick positive feedback
  warning: 5000, // 5 seconds - needs a bit more time to read
  error: 6000, // 6 seconds - user needs time to read error details
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    show: false,
    message: '' as string,
    title: '' as string,
    variant: 'success' as Variant,
    timerId: null as number | null,
  }),
  actions: {
    showToast(payload: { message: string; title?: string; variant?: Variant; duration?: number }) {
      // Clear any existing timer
      if (this.timerId !== null) {
        clearTimeout(this.timerId)
        this.timerId = null
      }

      this.message = payload.message
      this.title = payload.title ?? ''
      this.variant = payload.variant ?? 'success'
      this.show = true

      // Set auto-dismiss timer
      const duration = payload.duration ?? AUTO_DISMISS_DURATIONS[this.variant]
      this.timerId = window.setTimeout(() => {
        this.clear()
      }, duration)
    },
    showSuccess(message: string, title?: string) {
      this.showToast({ message, title, variant: 'success' })
    },
    showWarning(message: string, title?: string) {
      this.showToast({ message, title, variant: 'warning' })
    },
    showError(message: string, title?: string) {
      this.showToast({ message, title, variant: 'error' })
    },
    clear() {
      // Clear timer if exists
      if (this.timerId !== null) {
        clearTimeout(this.timerId)
        this.timerId = null
      }

      this.show = false
      this.message = ''
      this.title = ''
    },
  },
})
