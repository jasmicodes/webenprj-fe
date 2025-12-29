import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppearanceStore, AVAILABLE_BACKGROUNDS } from '../appearanceStore'

describe('appearanceStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should have correct default values', () => {
      const store = useAppearanceStore()

      expect(store.bgEnabled).toBe(false)
      expect(store.bgId).toBe('forest-mist')
    })

    it('should load state from localStorage', () => {
      const savedState = {
        bgEnabled: true,
        bgId: 'alpine-horizon',
      }
      localStorage.setItem('motivise-appearance', JSON.stringify(savedState))

      const store = useAppearanceStore()

      expect(store.bgEnabled).toBe(true)
      expect(store.bgId).toBe('alpine-horizon')
    })

    it('should use defaults for partial localStorage data', () => {
      localStorage.setItem('motivise-appearance', JSON.stringify({ bgEnabled: true }))

      const store = useAppearanceStore()

      expect(store.bgEnabled).toBe(true)
      expect(store.bgId).toBe('forest-mist')
    })

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('motivise-appearance', 'invalid-json')

      const store = useAppearanceStore()

      expect(store.bgEnabled).toBe(false)
      expect(store.bgId).toBe('forest-mist')
    })
  })

  describe('getters', () => {
    it('currentBackground should return the selected background', () => {
      const store = useAppearanceStore()

      const bg = store.currentBackground
      expect(bg.id).toBe('forest-mist')
      expect(bg.name).toBe('Forest Mist')
      expect(bg.path).toContain('background-01')
    })

    it('currentBackground should update when bgId changes', () => {
      const store = useAppearanceStore()
      store.setBgId('soft-canopy')

      const bg = store.currentBackground
      expect(bg.id).toBe('soft-canopy')
      expect(bg.name).toBe('Soft Canopy')
    })

    it('currentBackground should fallback to first background for invalid bgId', () => {
      localStorage.setItem('motivise-appearance', JSON.stringify({ bgId: 'invalid-id' }))

      const store = useAppearanceStore()
      const bg = store.currentBackground

      expect(bg.id).toBe('forest-mist')
    })
  })

  describe('actions', () => {
    describe('setBgEnabled', () => {
      it('should enable background', () => {
        const store = useAppearanceStore()

        store.setBgEnabled(true)

        expect(store.bgEnabled).toBe(true)

        const stored = JSON.parse(localStorage.getItem('motivise-appearance') || '{}')
        expect(stored.bgEnabled).toBe(true)
      })

      it('should disable background', () => {
        const store = useAppearanceStore()
        store.setBgEnabled(true)

        store.setBgEnabled(false)

        expect(store.bgEnabled).toBe(false)

        const stored = JSON.parse(localStorage.getItem('motivise-appearance') || '{}')
        expect(stored.bgEnabled).toBe(false)
      })
    })

    describe('setBgId', () => {
      it('should set background ID', () => {
        const store = useAppearanceStore()

        store.setBgId('alpine-horizon')

        expect(store.bgId).toBe('alpine-horizon')

        const stored = JSON.parse(localStorage.getItem('motivise-appearance') || '{}')
        expect(stored.bgId).toBe('alpine-horizon')
      })

      it('should persist background ID to localStorage', () => {
        const store = useAppearanceStore()

        store.setBgId('soft-canopy')

        const stored = JSON.parse(localStorage.getItem('motivise-appearance') || '{}')
        expect(stored.bgId).toBe('soft-canopy')
      })
    })

    describe('toggleBgEnabled', () => {
      it('should toggle from false to true', () => {
        const store = useAppearanceStore()
        expect(store.bgEnabled).toBe(false)

        store.toggleBgEnabled()

        expect(store.bgEnabled).toBe(true)
      })

      it('should toggle from true to false', () => {
        const store = useAppearanceStore()
        store.setBgEnabled(true)

        store.toggleBgEnabled()

        expect(store.bgEnabled).toBe(false)
      })

      it('should persist toggle state to localStorage', () => {
        const store = useAppearanceStore()

        store.toggleBgEnabled()

        const stored = JSON.parse(localStorage.getItem('motivise-appearance') || '{}')
        expect(stored.bgEnabled).toBe(true)

        store.toggleBgEnabled()

        const stored2 = JSON.parse(localStorage.getItem('motivise-appearance') || '{}')
        expect(stored2.bgEnabled).toBe(false)
      })
    })
  })

  describe('AVAILABLE_BACKGROUNDS', () => {
    it('should have correct number of backgrounds', () => {
      expect(AVAILABLE_BACKGROUNDS.length).toBe(3)
    })

    it('should have unique IDs', () => {
      const ids = AVAILABLE_BACKGROUNDS.map((bg) => bg.id)
      const uniqueIds = [...new Set(ids)]
      expect(ids.length).toBe(uniqueIds.length)
    })

    it('should have required properties for each background', () => {
      AVAILABLE_BACKGROUNDS.forEach((bg) => {
        expect(bg).toHaveProperty('id')
        expect(bg).toHaveProperty('name')
        expect(bg).toHaveProperty('path')
        expect(typeof bg.id).toBe('string')
        expect(typeof bg.name).toBe('string')
        expect(typeof bg.path).toBe('string')
      })
    })
  })
})
