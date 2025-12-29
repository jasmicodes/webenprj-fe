import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useApiError } from '../useApiError'

// Mock the toast store
vi.mock('@/stores/toastStore', () => ({
  useToastStore: vi.fn(() => ({
    showError: vi.fn(),
  })),
}))

// Mock the API client
vi.mock('@/services/api/client', () => ({
  getErrorMessage: vi.fn((err: unknown) => {
    if (err instanceof Error) {
      return err.message
    }
    return 'Unknown error'
  }),
}))

import { useToastStore } from '@/stores/toastStore'
import { getErrorMessage } from '@/services/api/client'

describe('useApiError', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have null error initially', () => {
      const { error, hasError } = useApiError()

      expect(error.value).toBeNull()
      expect(hasError.value).toBe(false)
    })
  })

  describe('handleError', () => {
    it('should set error message', () => {
      const { error, hasError, handleError } = useApiError()

      handleError(new Error('Something went wrong'))

      expect(error.value).toBe('Something went wrong')
      expect(hasError.value).toBe(true)
    })

    it('should call getErrorMessage with the error', () => {
      const { handleError } = useApiError()
      const testError = new Error('Test error')

      handleError(testError)

      expect(getErrorMessage).toHaveBeenCalledWith(testError)
    })

    it('should not show toast by default', () => {
      const { handleError } = useApiError()

      handleError(new Error('Error'))

      expect(useToastStore).not.toHaveBeenCalled()
    })

    it('should show toast when showToast option is true', () => {
      const mockShowError = vi.fn()
      vi.mocked(useToastStore).mockReturnValue({
        showError: mockShowError,
      } as any)

      const { handleError } = useApiError({ showToast: true })

      handleError(new Error('Error message'))

      expect(mockShowError).toHaveBeenCalledWith('Error message')
    })

    it('should call onError callback when provided', () => {
      const onError = vi.fn()
      const { handleError } = useApiError({ onError })

      handleError(new Error('Callback error'))

      expect(onError).toHaveBeenCalledWith('Callback error')
    })

    it('should handle unknown error types', () => {
      vi.mocked(getErrorMessage).mockReturnValue('Unknown error')

      const { error, handleError } = useApiError()

      handleError('string error')

      expect(error.value).toBe('Unknown error')
    })
  })

  describe('clearError', () => {
    it('should clear the error', () => {
      const { error, hasError, handleError, clearError } = useApiError()

      handleError(new Error('Some error'))
      expect(hasError.value).toBe(true)

      clearError()

      expect(error.value).toBeNull()
      expect(hasError.value).toBe(false)
    })
  })

  describe('hasError computed', () => {
    it('should be false when no error', () => {
      const { hasError } = useApiError()

      expect(hasError.value).toBe(false)
    })

    it('should be true when error exists', () => {
      const { hasError, handleError } = useApiError()

      handleError(new Error('Error'))

      expect(hasError.value).toBe(true)
    })

    it('should return to false after clearError', () => {
      const { hasError, handleError, clearError } = useApiError()

      handleError(new Error('Error'))
      expect(hasError.value).toBe(true)

      clearError()
      expect(hasError.value).toBe(false)
    })
  })
})
