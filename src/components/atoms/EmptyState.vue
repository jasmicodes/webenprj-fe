<!-- Empty state: icon + title + hint + optional action -->
<template>
  <div class="flex flex-col items-center justify-center text-center py-8 px-4">
    <BaseIcon v-if="icon" :name="icon" class="w-12 h-12 text-slate-300 mb-4" />

    <h3 class="text-base font-semibold text-slate-900 mb-2">{{ title }}</h3>

    <p v-if="hint" class="text-sm text-slate-500 mb-4">{{ hint }}</p>

    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'EmptyState' })

import BaseIcon from '@/components/atoms/BaseIcon.vue'

defineProps<{
  icon?: string
  title: string
  hint?: string
}>()
</script>
