import { ref } from 'vue'
import { useApiError, type UseApiErrorOptions } from './useApiError'

export function useAsyncState<T>(options: UseApiErrorOptions = {}) {
  const loading = ref(false)
  const data = ref<T | null>(null)
  const { error, handleError, clearError } = useApiError(options)

  const execute = async (asyncFn: () => Promise<T>) => {
    loading.value = true
    clearError()

    try {
      data.value = await asyncFn()
      return data.value
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = null
    clearError()
    loading.value = false
  }

  return {
    loading,
    data,
    error,
    execute,
    reset,
  }
}
