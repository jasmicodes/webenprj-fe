import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'navbar-collapsed'

function loadFromStorage(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'true'
  } catch {
    return false
  }
}

function saveToStorage(collapsed: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  } catch {
    // localStorage may be unavailable in some contexts
  }
}

/**
 * Navbar store for managing sidebar collapse state.
 * Persisted to localStorage for user preference.
 */
export const useNavbarStore = defineStore('navbar', () => {
  const collapsed = ref(loadFromStorage())

  const isCollapsed = computed(() => collapsed.value)

  function toggleCollapse() {
    collapsed.value = !collapsed.value
    saveToStorage(collapsed.value)
  }

  function setCollapsed(value: boolean) {
    collapsed.value = value
    saveToStorage(value)
  }

  return {
    isCollapsed,
    toggleCollapse,
    setCollapsed,
  }
})
