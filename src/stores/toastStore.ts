import { defineStore } from 'pinia'

type Variant = 'success' | 'warning' | 'error'

export const useToastStore = defineStore('toast', {
  state: () => ({
    show: false,
    message: '' as string,
    title: '' as string,
    variant: 'success' as Variant,
  }),
  actions: {
    showToast(payload: { message: string; title?: string; variant?: Variant }) {
      this.message = payload.message
      this.title = payload.title ?? ''
      this.variant = payload.variant ?? 'success'
      this.show = true
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
      this.show = false
      this.message = ''
      this.title = ''
    },
  },
})
