<!-- Page header with title, optional subtitle, and optional right-side action slot -->
<template>
  <header class="mb-6 pb-3" :class="{ 'border-b border-slate-100': bordered }">
    <div class="flex items-center justify-between gap-4">
      <div class="flex-1 min-w-0">
        <h1 class="text-lg font-medium text-slate-800 tracking-tight">{{ title }}</h1>
        <p v-if="subtitle" class="text-sm text-slate-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.default" class="flex-shrink-0">
        <slot />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: 'PageHeader' })

interface Props {
  title: string
  subtitle?: string
  bordered?: boolean
}

withDefaults(defineProps<Props>(), {
  bordered: true,
})
</script>
