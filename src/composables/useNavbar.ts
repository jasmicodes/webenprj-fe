import { ref, watch, onMounted } from 'vue'

// Shared reactive state for navbar collapse
const isCollapsed = ref(false)

/**
 * Composable for managing navbar collapse state
 * Persists state to localStorage and shares it across components
 */
export function useNavbar() {
  // Initialize from localStorage on first use
  if (typeof window !== 'undefined' && !isCollapsed.value) {
    const saved = localStorage.getItem('navbar-collapsed')
    if (saved !== null) {
      isCollapsed.value = saved === 'true'
    }
  }

  // Watch for changes and persist to localStorage
  watch(
    isCollapsed,
    (newValue) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('navbar-collapsed', String(newValue))
      }
    },
    { immediate: false },
  )

  function toggleCollapse() {
    isCollapsed.value = !isCollapsed.value
  }

  return {
    isCollapsed,
    toggleCollapse,
  }
}
