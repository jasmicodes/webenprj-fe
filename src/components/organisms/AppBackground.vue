<!-- AppBackground - Curated blurred backgrounds with smooth crossfade transitions -->
<script setup lang="ts">
defineOptions({ name: 'AppBackground' })

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAppearanceStore } from '@/stores/uiStore'
import { logger } from '@/services/logger'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { UI_CONFIG } from '@/data/constants'

const appearanceStore = useAppearanceStore()

// Responsive: disable background on small screens (<= 768px)
// Note: This doesn't change the stored setting, just the rendering
const isMobile = useMediaQuery('(max-width: 768px)')

// Respect user's motion preferences
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

// Effective background state (respects mobile override)
const effectiveBgEnabled = computed(() => {
  return appearanceStore.bgEnabled && !isMobile.value
})

/**
 * Crossfade Implementation
 *
 * Why two layers?
 * CSS cannot smoothly animate background-image changes (it's a discrete property).
 * To achieve smooth crossfade, we use two absolutely positioned layers:
 * - Layer A and Layer B alternate showing the current/next image
 * - We fade opacity between them (opacity IS animatable)
 * - Preload next image before switching to avoid flicker
 */
type Layer = 'A' | 'B'

const activeLayer = ref<Layer>('A')
const layerA_url = ref<string>('')
const layerB_url = ref<string>('')
const layerA_loaded = ref(false)
const layerB_loaded = ref(false)
const imageError = ref(false)
const isTransitioning = ref(false)

// Track transition timeout for cleanup to prevent memory leaks
let transitionTimeout: ReturnType<typeof setTimeout> | null = null

// Clean up timeout on unmount
onUnmounted(() => {
  if (transitionTimeout) {
    clearTimeout(transitionTimeout)
    transitionTimeout = null
  }
})

// Current active URL
const currentUrl = computed(() => {
  return activeLayer.value === 'A' ? layerA_url.value : layerB_url.value
})

// Preload utility
function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load ${url}`))
    img.src = url
  })
}

// Switch to a new background with smooth crossfade
async function switchBackground(newUrl: string) {
  // If already showing this URL, do nothing
  if (newUrl === currentUrl.value) return

  // Determine which layer is inactive (will be the "next" layer)
  const nextLayer: Layer = activeLayer.value === 'A' ? 'B' : 'A'
  const nextLayerUrl = nextLayer === 'A' ? layerA_url : layerB_url
  const nextLayerLoaded = nextLayer === 'A' ? layerA_loaded : layerB_loaded

  try {
    // Set the next layer's URL
    nextLayerUrl.value = newUrl
    nextLayerLoaded.value = false

    // Preload the image before starting transition
    await preloadImage(newUrl)

    nextLayerLoaded.value = true
    imageError.value = false

    // Start crossfade transition (unless user prefers reduced motion)
    if (!prefersReducedMotion.value) {
      isTransitioning.value = true
    }

    // Switch active layer (CSS will handle the opacity transition)
    activeLayer.value = nextLayer

    // Wait for transition to complete before cleanup
    if (!prefersReducedMotion.value) {
      // Clear any pending transition timeout
      if (transitionTimeout) {
        clearTimeout(transitionTimeout)
      }
      transitionTimeout = setTimeout(() => {
        isTransitioning.value = false
        transitionTimeout = null
      }, UI_CONFIG.TRANSITION_MS) // Match transition duration
    }
  } catch (error) {
    logger.error('Failed to load background image:', error)
    imageError.value = true
  }
}

// Initialize first background
onMounted(() => {
  if (effectiveBgEnabled.value) {
    const initialUrl = appearanceStore.currentBackground.path
    layerA_url.value = initialUrl
    preloadImage(initialUrl)
      .then(() => {
        layerA_loaded.value = true
        imageError.value = false
      })
      .catch(() => {
        imageError.value = true
      })
  }
})

// Watch for background changes from user selection
watch(
  () => appearanceStore.currentBackground.path,
  (newPath) => {
    if (effectiveBgEnabled.value) {
      void switchBackground(newPath)
    }
  },
)

// Watch for effective background enable/disable
watch(effectiveBgEnabled, (enabled) => {
  if (enabled && !currentUrl.value) {
    const initialUrl = appearanceStore.currentBackground.path
    layerA_url.value = initialUrl
    void preloadImage(initialUrl)
      .then(() => {
        layerA_loaded.value = true
        imageError.value = false
      })
      .catch(() => {
        imageError.value = true
      })
  }
})
</script>

<template>
  <!-- Always render background - either image or fallback gradient -->
  <div class="app-background" :class="{ 'app-background--fallback': !effectiveBgEnabled }">
    <!-- Only render image layers when background is enabled -->
    <template v-if="effectiveBgEnabled">
      <!-- Image Layer A -->
      <div
        class="app-background__layer"
        :class="{
          'app-background__layer--active': activeLayer === 'A' && layerA_loaded && !imageError,
          'app-background__layer--transitioning': isTransitioning,
        }"
        :style="{
          backgroundImage: layerA_loaded && layerA_url ? `url(${layerA_url})` : 'none',
        }"
      />

      <!-- Image Layer B -->
      <div
        class="app-background__layer"
        :class="{
          'app-background__layer--active': activeLayer === 'B' && layerB_loaded && !imageError,
          'app-background__layer--transitioning': isTransitioning,
        }"
        :style="{
          backgroundImage: layerB_loaded && layerB_url ? `url(${layerB_url})` : 'none',
        }"
      />

      <!-- Fallback gradient if image fails to load -->
      <div
        v-if="imageError"
        class="app-background__layer app-background__layer--error app-background__layer--active"
      />

      <!-- Tint layer: subtle "glass lift" effect without washing out colors -->
      <div class="app-background__tint" />

      <!-- Overlay layer: guaranteed readability for UI content -->
      <div class="app-background__overlay" />
    </template>
  </div>
</template>

<style scoped>
/**
 * AppBackground Component Styles
 *
 * Architecture:
 * - Fixed fullscreen positioning behind all content (z-index: -1)
 * - Two-layer crossfade system for smooth transitions
 * - Tint layer for subtle "glass" effect
 * - Overlay layer for UI readability
 * - Enforced blur with preserved color vibrancy
 * - Responsive auto-disable on mobile screens
 */

.app-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

/* Image layers (A and B for crossfade) */
.app-background__layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /**
   * Enforced ambient styling - preserves color vibrancy
   *
   * - Do NOT darken the image (brightness: 1.0)
   * - Boost saturation for vibrant colors (saturate: 1.15)
   * - Blur for ambient effect without being overly soft
   * - Color vibrancy is preserved while keeping image ambient
   */
  filter: blur(18px) saturate(1.15) brightness(1.0);

  /* Scale to avoid blur edge artifacts */
  transform: scale(1.06);

  /* Start hidden, will fade in when active */
  opacity: 0;

  /* Smooth crossfade transition (only when transitioning) */
  transition: none;
}

.app-background__layer--transitioning {
  transition: opacity 400ms ease-in-out;
}

/* Respect user's motion preferences - instant transition if reduced motion */
@media (prefers-reduced-motion: reduce) {
  .app-background__layer--transitioning {
    transition: none;
  }
}

.app-background__layer--active {
  opacity: 1;
}

/* Fallback gradient if image fails to load */
.app-background__layer--error {
  /* Subtle gradient fallback - less prominent than image */
  background: linear-gradient(
    135deg,
    rgba(226, 232, 240, 0.5) 0%,
    rgba(203, 213, 225, 0.5) 100%
  );
  filter: none;
  transform: none;
}

/**
 * Tint layer: subtle "glass lift" effect
 *
 * Provides a very light tint that adds depth without washing out colors.
 * Think iOS/macOS frosted glass effect - just a hint of white for lift.
 */
.app-background__tint {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}

/**
 * Overlay layer: guaranteed readability for UI content
 *
 * Semi-transparent overlay ensures all text and UI elements are readable
 * regardless of background image colors/contrast.
 * Reduced to 0.45 to make background WAY more visible and colorful.
 */
.app-background__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(248, 250, 252, 0.45); /* slate-50 with 45% opacity - background is very visible */
  pointer-events: none;
}

/**
 * Fallback background when image backgrounds are disabled
 *
 * Provides a subtle gradient for better contrast with the glass navbar
 * and white content cards. Ensures the app doesn't look washed out.
 */
.app-background--fallback {
  background: linear-gradient(
    135deg,
    #f1f5f9 0%,
    #e2e8f0 50%,
    #cbd5e1 100%
  );
}
</style>
