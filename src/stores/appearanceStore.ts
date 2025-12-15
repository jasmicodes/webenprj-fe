import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Available curated backgrounds from assets/background folder
export const AVAILABLE_BACKGROUNDS = [
  {
    id: 'bg-01',
    name: 'Gradient Sunset',
    path: new URL('@/assets/background/background-01.webp', import.meta.url).href,
  },
  {
    id: 'bg-02',
    name: 'Soft Blue',
    path: new URL('@/assets/background/background-02.webp', import.meta.url).href,
  },
  {
    id: 'bg-03',
    name: 'Warm Tones',
    path: new URL('@/assets/background/background-03.webp', import.meta.url).href,
  },
] as const

export type BackgroundId = (typeof AVAILABLE_BACKGROUNDS)[number]['id']

interface AppearanceState {
  bgEnabled: boolean
  bgId: BackgroundId
}

const STORAGE_KEY = 'motivise-appearance'

// Load from localStorage with fallback to defaults
function loadFromStorage(): AppearanceState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AppearanceState>
      return {
        bgEnabled: parsed.bgEnabled ?? false,
        bgId: parsed.bgId ?? AVAILABLE_BACKGROUNDS[0].id,
      }
    }
  } catch (error) {
    console.warn('Failed to load appearance settings from localStorage:', error)
  }

  // Default: clean white look (bgEnabled = false)
  return {
    bgEnabled: false,
    bgId: AVAILABLE_BACKGROUNDS[0].id,
  }
}

// Save to localStorage
function saveToStorage(state: AppearanceState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save appearance settings to localStorage:', error)
  }
}

/**
 * Appearance store for managing curated blurred backgrounds.
 *
 * Settings:
 * - bgEnabled: Toggle background image on/off (default: false for clean white look)
 * - bgId: Selected background from curated list
 *
 * Persisted to localStorage for user preferences.
 */
export const useAppearanceStore = defineStore('appearance', () => {
  const state = ref<AppearanceState>(loadFromStorage())

  // Getters
  const bgEnabled = computed(() => state.value.bgEnabled)
  const bgId = computed(() => state.value.bgId)

  const currentBackground = computed(() => {
    return AVAILABLE_BACKGROUNDS.find((bg) => bg.id === state.value.bgId) ?? AVAILABLE_BACKGROUNDS[0]
  })

  // Actions
  function setBgEnabled(enabled: boolean) {
    state.value.bgEnabled = enabled
    saveToStorage(state.value)
  }

  function setBgId(id: BackgroundId) {
    state.value.bgId = id
    saveToStorage(state.value)
  }

  function toggleBgEnabled() {
    setBgEnabled(!state.value.bgEnabled)
  }

  return {
    // State
    bgEnabled,
    bgId,
    currentBackground,

    // Actions
    setBgEnabled,
    setBgId,
    toggleBgEnabled,
  }
})
