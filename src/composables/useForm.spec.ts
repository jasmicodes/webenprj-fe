import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import * as yup from 'yup'
import { useFormValidation, useApiError } from './useForm'

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

describe('useFormValidation', () => {
  const testSchema = yup.object({
    email: yup.string().required('Email is required').email('Invalid email'),
    password: yup.string().required('Password is required').min(8, 'Password too short'),
  })

  describe('initial state', () => {
    it('should have empty errors initially', () => {
      const { errors } = useFormValidation(testSchema)

      expect(errors.value).toEqual({})
    })
  })

  describe('validate', () => {
    it('should return true for valid data', async () => {
      const { validate, errors } = useFormValidation(testSchema)

      const result = await validate({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toBe(true)
      expect(errors.value).toEqual({})
    })

    it('should return false for invalid data', async () => {
      const { validate } = useFormValidation(testSchema)

      const result = await validate({
        email: '',
        password: '',
      })

      expect(result).toBe(false)
    })

    it('should populate errors for invalid fields', async () => {
      const { validate, errors } = useFormValidation(testSchema)

      await validate({
        email: '',
        password: '',
      })

      expect(errors.value.email).toBe('Email is required')
      expect(errors.value.password).toBe('Password is required')
    })

    it('should show specific validation message for invalid email', async () => {
      const { validate, errors } = useFormValidation(testSchema)

      await validate({
        email: 'invalid-email',
        password: 'password123',
      })

      expect(errors.value.email).toBe('Invalid email')
    })

    it('should show specific validation message for short password', async () => {
      const { validate, errors } = useFormValidation(testSchema)

      await validate({
        email: 'test@example.com',
        password: 'short',
      })

      expect(errors.value.password).toBe('Password too short')
    })

    it('should clear previous errors on new validation', async () => {
      const { validate, errors } = useFormValidation(testSchema)

      await validate({ email: '', password: '' })
      expect(Object.keys(errors.value).length).toBeGreaterThan(0)

      await validate({ email: 'test@example.com', password: 'password123' })
      expect(errors.value).toEqual({})
    })
  })

  describe('clearErrors', () => {
    it('should clear all errors', async () => {
      const { validate, errors, clearErrors } = useFormValidation(testSchema)

      await validate({ email: '', password: '' })
      expect(Object.keys(errors.value).length).toBeGreaterThan(0)

      clearErrors()
      expect(errors.value).toEqual({})
    })
  })

  describe('non-validation errors', () => {
    it('should rethrow non-Yup errors', async () => {
      const errorSchema = yup.object({
        field: yup.string().test('custom', 'error', () => {
          throw new Error('Custom error')
        }),
      })

      const { validate } = useFormValidation(errorSchema)

      await expect(validate({ field: 'test' })).rejects.toThrow('Custom error')
    })
  })
})

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
