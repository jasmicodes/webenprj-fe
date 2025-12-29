<!--Avatar + Name-->
<template>
  <div class="flex items-center gap-3 min-w-0">
    <BaseAvatar :src="src" :size="size" class="flex-shrink-0" />
    <div class="leading-tight min-w-0 flex-1">
      <div class="font-medium text-neutral-900 truncate">{{ name }}</div>
      <div v-if="subtitle" class="text-sm text-neutral-600 truncate">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'UserBadge' })

import BaseAvatar from '@/components/atoms/BaseAvatar.vue'
withDefaults(
  defineProps<{ src?: string; name: string; subtitle?: string; size?: 'sm' | 'md' | 'lg' }>(),
  { size: 'md' },
)
</script>
