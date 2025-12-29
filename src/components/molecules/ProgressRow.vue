<!--Zeile für „Study Progress“ (Subject + linearer Balken + Ring + Button)-->
<template>
  <div class="py-4">
    <!-- Header-Zeile -->
    <div class="flex items-center justify-between mb-3">
      <div class="h-px bg-neutral-200 w-full mr-4"></div>
      <div class="text-sm text-neutral-600">{{ label }}</div>
    </div>

    <!-- Inhalt -->
    <div class="grid grid-cols-[1fr_auto_auto] items-center gap-4">
      <!-- Linearer Progress -->
      <div class="w-full h-2 rounded-full bg-secondary-100 overflow-hidden">
        <div
          class="h-full bg-primary-400"
          :style="{ width: percent + '%' }"
          role="progressbar"
          :aria-valuenow="percent"
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>

      <!-- Ring + Subject -->
      <div class="flex items-center gap-3">
        <BaseProgressRing :progress="percent" :size="56" />
        <div class="font-medium text-neutral-900">{{ subject }}</div>
      </div>

      <!-- Action -->
      <BaseButton variant="ghost" class="shadow"> Share Progress </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ProgressRow' })

import { computed } from 'vue'
import BaseProgressRing from '@/components/atoms/BaseProgressRing.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const props = withDefaults(
  defineProps<{
    subject: string
    posts?: number
    goal?: number
  }>(),
  { posts: 0, goal: 30 },
)

const percent = computed(() => {
  const p = Math.round((props.posts / props.goal) * 100)
  return Math.max(0, Math.min(100, isFinite(p) ? p : 0))
})

const label = computed(() => `Post ${props.posts}/${props.goal}`)
</script>
