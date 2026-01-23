import { ref, watch, onUnmounted, type Ref } from 'vue'

/**
 * Creates a debounced ref that updates after a specified delay.
 *
 * @param source - The reactive ref to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns A ref that updates with the debounced value
 *
 * @example
 * const searchInput = ref('')
 * const searchQuery = useDebounce(searchInput, 300)
 * // searchQuery updates 300ms after searchInput stops changing
 */
export function useDebounce<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(source, (newValue) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = newValue
    }, delay)
  })

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })

  return debounced
}
