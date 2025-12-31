import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ==================== BACKGROUNDS ====================

/**
 * Curated background registry
 */
export const AVAILABLE_BACKGROUNDS = [
  {
    id: 'forest-mist',
    name: 'Forest Mist',
    path: new URL('@/assets/background/background-01.webp', import.meta.url).href,
  },
  {
    id: 'soft-canopy',
    name: 'Soft Canopy',
    path: new URL('@/assets/background/background-02.webp', import.meta.url).href,
  },
  {
    id: 'alpine-horizon',
    name: 'Alpine Horizon',
    path: new URL('@/assets/background/background-03.webp', import.meta.url).href,
  },
] as const

export type BackgroundId = (typeof AVAILABLE_BACKGROUNDS)[number]['id']

// ==================== STORAGE ====================

const NAVBAR_STORAGE_KEY = 'navbar-collapsed'
const APPEARANCE_STORAGE_KEY = 'motivise-appearance'

interface AppearanceState {
  bgEnabled: boolean
  bgId: BackgroundId
}

function loadNavbarState(): boolean {
  try {
    return localStorage.getItem(NAVBAR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function saveNavbarState(collapsed: boolean) {
  try {
    localStorage.setItem(NAVBAR_STORAGE_KEY, String(collapsed))
  } catch {
    // localStorage may be unavailable
  }
}

function loadAppearanceState(): AppearanceState {
  try {
    const stored = localStorage.getItem(APPEARANCE_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AppearanceState>
      return {
        bgEnabled: parsed.bgEnabled ?? false,
        bgId: parsed.bgId ?? AVAILABLE_BACKGROUNDS[0].id,
      }
    }
  } catch {
    // Fall through to defaults
  }
  return { bgEnabled: false, bgId: AVAILABLE_BACKGROUNDS[0].id }
}

function saveAppearanceState(state: AppearanceState) {
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage may be unavailable
  }
}

// ==================== STORE ====================

/**
 * UI Store - manages navbar state and appearance preferences.
 * All settings persisted to localStorage.
 */
export const useUiStore = defineStore('ui', () => {
  // ----- Navbar State -----
  const collapsed = ref(loadNavbarState())
  const isCollapsed = computed(() => collapsed.value)

  function toggleCollapse() {
    collapsed.value = !collapsed.value
    saveNavbarState(collapsed.value)
  }

  function setCollapsed(value: boolean) {
    collapsed.value = value
    saveNavbarState(value)
  }

  // ----- Appearance State -----
  const appearance = ref<AppearanceState>(loadAppearanceState())

  const bgEnabled = computed(() => appearance.value.bgEnabled)
  const bgId = computed(() => appearance.value.bgId)
  const currentBackground = computed(() => {
    return AVAILABLE_BACKGROUNDS.find((bg) => bg.id === appearance.value.bgId) ?? AVAILABLE_BACKGROUNDS[0]
  })

  function setBgEnabled(enabled: boolean) {
    appearance.value.bgEnabled = enabled
    saveAppearanceState(appearance.value)
  }

  function setBgId(id: BackgroundId) {
    appearance.value.bgId = id
    saveAppearanceState(appearance.value)
  }

  function toggleBgEnabled() {
    setBgEnabled(!appearance.value.bgEnabled)
  }

  return {
    // Navbar
    isCollapsed,
    toggleCollapse,
    setCollapsed,

    // Appearance
    bgEnabled,
    bgId,
    currentBackground,
    setBgEnabled,
    setBgId,
    toggleBgEnabled,
  }
})

// Backward compatibility aliases
export const useNavbarStore = useUiStore
export const useAppearanceStore = useUiStore
