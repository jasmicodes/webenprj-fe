<!--Avatar + Name-->
<template>
  <div class="flex items-center gap-3">
    <BaseAvatar :src="src" :size="size" />
    <div class="leading-tight">
      <div class="font-medium text-neutral-900">{{ name }}</div>
      <div v-if="subtitle" class="text-sm text-neutral-600">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseAvatar from '@/components/atoms/BaseAvatar.vue'
withDefaults(
  defineProps<{ src?: string; name: string; subtitle?: string; size?: 'sm' | 'md' | 'lg' }>(),
  { size: 'md' },
)
</script>
