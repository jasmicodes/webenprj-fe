import { ref, computed } from 'vue'
import * as yup from 'yup'
import type { AnyObjectSchema } from 'yup'
import { mapYupErrors } from '@/utils/validation'
import { getErrorMessage } from '@/services/api/client'
import { useToastStore } from '@/stores/toastStore'

/**
 * Lightweight form validation helper.
 * Runs a Yup schema and exposes field errors in a reactive map.
 *
 * @param schema - Yup object schema to validate against
 * @returns errors (reactive map), validate (async), clearErrors
 */
export function useFormValidation(schema: AnyObjectSchema) {
  const errors = ref<Record<string, string>>({})

  const validate = async (payload: unknown) => {
    try {
      errors.value = {}
      await schema.validate(payload, { abortEarly: false })
      return true
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        errors.value = mapYupErrors(err)
        return false
      }
      throw err
    }
  }

  const clearErrors = () => {
    errors.value = {}
  }

  return {
    errors,
    validate,
    clearErrors,
  }
}

export interface UseApiErrorOptions {
  showToast?: boolean
  onError?: (message: string) => void
}

/**
 * API error handling helper.
 * Captures errors, optionally displays toast, and provides reactive error state.
 *
 * @param options.showToast - Show error toast automatically
 * @param options.onError - Custom callback when error occurs
 * @returns error (ref), hasError (computed), handleError, clearError
 */
export function useApiError(options: UseApiErrorOptions = {}) {
  const error = ref<string | null>(null)
  const hasError = computed(() => error.value !== null)
  const toast = options.showToast ? useToastStore() : null

  const handleError = (err: unknown) => {
    const message = getErrorMessage(err)
    error.value = message

    if (toast) {
      toast.showError(message)
    }

    if (options.onError) {
      options.onError(message)
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    error,
    hasError,
    handleError,
    clearError,
  }
}
