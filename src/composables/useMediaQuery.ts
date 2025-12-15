import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Simple media query composable for responsive behavior
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns Reactive boolean indicating if the media query matches
 */
export function useMediaQuery(query: string) {
  const matches = ref(false)

  let mediaQuery: MediaQueryList | null = null

  const updateMatches = (e: MediaQueryListEvent | MediaQueryList) => {
    matches.value = e.matches
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      mediaQuery = window.matchMedia(query)
      matches.value = mediaQuery.matches

      // Use modern addEventListener if available, fallback to addListener for older browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateMatches)
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(updateMatches)
      }
    }
  })

  onBeforeUnmount(() => {
    if (mediaQuery) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMatches)
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(updateMatches)
      }
    }
  })

  return matches
}
