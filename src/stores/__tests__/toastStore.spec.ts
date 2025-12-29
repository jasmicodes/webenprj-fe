import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore } from '../toastStore'

describe('toastStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const store = useToastStore()

      expect(store.show).toBe(false)
      expect(store.message).toBe('')
      expect(store.title).toBe('')
      expect(store.variant).toBe('success')
      expect(store.timerId).toBeNull()
    })
  })

  describe('showToast', () => {
    it('should show toast with message', () => {
      const store = useToastStore()

      store.showToast({ message: 'Test message' })

      expect(store.show).toBe(true)
      expect(store.message).toBe('Test message')
      expect(store.variant).toBe('success')
    })

    it('should show toast with title', () => {
      const store = useToastStore()

      store.showToast({ message: 'Test message', title: 'Test Title' })

      expect(store.title).toBe('Test Title')
    })

    it('should show toast with custom variant', () => {
      const store = useToastStore()

      store.showToast({ message: 'Error occurred', variant: 'error' })

      expect(store.variant).toBe('error')
    })

    it('should auto-dismiss after default duration for success', () => {
      const store = useToastStore()

      store.showToast({ message: 'Success message', variant: 'success' })
      expect(store.show).toBe(true)

      vi.advanceTimersByTime(4000)

      expect(store.show).toBe(false)
    })

    it('should auto-dismiss after default duration for error', () => {
      const store = useToastStore()

      store.showToast({ message: 'Error message', variant: 'error' })
      expect(store.show).toBe(true)

      vi.advanceTimersByTime(6000)

      expect(store.show).toBe(false)
    })

    it('should use custom duration when provided', () => {
      const store = useToastStore()

      store.showToast({ message: 'Custom duration', duration: 2000 })
      expect(store.show).toBe(true)

      vi.advanceTimersByTime(1500)
      expect(store.show).toBe(true)

      vi.advanceTimersByTime(600)
      expect(store.show).toBe(false)
    })

    it('should clear previous timer when showing new toast', () => {
      const store = useToastStore()

      store.showToast({ message: 'First message' })
      vi.advanceTimersByTime(2000)

      store.showToast({ message: 'Second message' })

      expect(store.message).toBe('Second message')

      // First timer should not trigger at 4000ms
      vi.advanceTimersByTime(2000)
      expect(store.show).toBe(true)

      // New timer triggers at 4000ms from second showToast
      vi.advanceTimersByTime(2000)
      expect(store.show).toBe(false)
    })
  })

  describe('showSuccess', () => {
    it('should show success toast', () => {
      const store = useToastStore()

      store.showSuccess('Operation successful')

      expect(store.show).toBe(true)
      expect(store.message).toBe('Operation successful')
      expect(store.variant).toBe('success')
    })

    it('should show success toast with title', () => {
      const store = useToastStore()

      store.showSuccess('Operation successful', 'Success!')

      expect(store.title).toBe('Success!')
    })
  })

  describe('showWarning', () => {
    it('should show warning toast', () => {
      const store = useToastStore()

      store.showWarning('Please review')

      expect(store.show).toBe(true)
      expect(store.message).toBe('Please review')
      expect(store.variant).toBe('warning')
    })
  })

  describe('showError', () => {
    it('should show error toast', () => {
      const store = useToastStore()

      store.showError('Something went wrong')

      expect(store.show).toBe(true)
      expect(store.message).toBe('Something went wrong')
      expect(store.variant).toBe('error')
    })
  })

  describe('clear', () => {
    it('should clear the toast', () => {
      const store = useToastStore()

      store.showToast({ message: 'Test message', title: 'Test Title' })
      expect(store.show).toBe(true)

      store.clear()

      expect(store.show).toBe(false)
      expect(store.message).toBe('')
      expect(store.title).toBe('')
    })

    it('should clear the timer', () => {
      const store = useToastStore()

      store.showToast({ message: 'Test message' })
      store.clear()

      expect(store.timerId).toBeNull()

      // Advance timers - toast should remain cleared
      vi.advanceTimersByTime(5000)
      expect(store.show).toBe(false)
    })
  })
})
