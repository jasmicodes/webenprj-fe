import { ref, computed } from 'vue'
import { getErrorMessage } from '@/services/api/client'

export interface UseApiErrorOptions {
  showToast?: boolean
  onError?: (message: string) => void
}

export function useApiError(options: UseApiErrorOptions = {}) {
  const error = ref<string | null>(null)
  const hasError = computed(() => error.value !== null)

  const handleError = (err: unknown) => {
    const message = getErrorMessage(err)
    error.value = message

    if (options.showToast) {
      // Show toast notification
      // const toast = useToastStore()
      // toast.error(message)
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
