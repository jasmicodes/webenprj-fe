<!-- Stat display component: number + label -->
<template>
  <div class="flex flex-col gap-1">
    <span class="text-2xl font-semibold text-slate-900">{{ value ?? '–' }}</span>
    <span class="text-xs font-medium text-slate-500 uppercase tracking-wide">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseStat' })

defineProps<{
  value: number | string | null
  label: string
}>()
</script>
