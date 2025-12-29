<script setup lang="ts">
defineOptions({ name: 'HelpView' })

import { computed } from 'vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import { useAppearanceStore } from '@/stores/appearanceStore'
import { useMediaQuery } from '@/composables/useMediaQuery'

// Ambient mode detection
const appearanceStore = useAppearanceStore()
const isMobile = useMediaQuery('(max-width: 768px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)
</script>

<template>
  <div class="min-h-screen flex items-start justify-center px-8">
    <div
      class="w-full max-w-4xl py-8 content-glass-container"
      :class="{ 'ambient-mode': isAmbientMode }"
    >
      <!-- Page Header -->
      <header class="mb-6 pb-3 border-b border-slate-100">
        <h1 class="text-lg font-medium text-slate-800 tracking-tight">Help & Support</h1>
        <p class="text-sm text-slate-500 mt-0.5">
          Answers to common questions and ways to get assistance
        </p>
      </header>

      <!-- FAQ Items -->
      <div class="space-y-6">
        <BaseCard>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">🧩 How do I create a post?</h3>
          <p class="text-sm text-slate-600">
            Go to your feed and use the composer card at the top. You can add a subject, content,
            and an optional image before publishing.
          </p>
        </BaseCard>

        <BaseCard>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">💬 Can I comment or like other posts?</h3>
          <p class="text-sm text-slate-600">
            Yes! Simply click the heart icon below any post to like it and engage with other users.
          </p>
        </BaseCard>

        <BaseCard>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">🔒 I forgot my password. What can I do?</h3>
          <p class="text-sm text-slate-600">
            On the login page, click <strong>"Forgot password?"</strong> and follow the instructions
            to reset it via email.
          </p>
        </BaseCard>

        <BaseCard>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">🎨 How do I change the background?</h3>
          <p class="text-sm text-slate-600">
            Go to your profile and scroll to the <strong>"Appearance"</strong> section. There you can
            toggle backgrounds on/off and select from curated ambient backgrounds.
          </p>
        </BaseCard>

        <BaseCard>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">📨 Still need help?</h3>
          <p class="text-sm text-slate-600">
            You can reach our support team at
            <a href="mailto:support@motivise.com" class="text-primary-500 hover:text-primary-600 underline">
              support@motivise.com
            </a>.
          </p>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * Help container
 * Clean mode: minimal styling
 * Ambient mode: premium glass panel
 */
.content-glass-container {
  /* Clean mode: very minimal */
  background: transparent;
  border-radius: 24px;
  margin-top: 16px;
  margin-bottom: 16px;
  padding-left: 24px;
  padding-right: 24px;
}

/* Ambient mode: premium glass panel */
.content-glass-container.ambient-mode {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02);
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(10px)) {
  .content-glass-container.ambient-mode {
    background: rgba(255, 255, 255, 0.85);
  }
}
</style>
