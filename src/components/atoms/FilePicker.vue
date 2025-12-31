<!-- File picker input -->
<template>
  <div>
    <label v-if="label" class="label">{{ label }}</label>
    <input type="file" class="input" :accept="accept" @change="onChange" />
    <p v-if="error" class="help text-danger-600 flex items-center gap-1">
      <BaseIcon name="ExclamationCircleIcon" size="w-4 h-4" class="flex-shrink-0" />
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'FilePicker' })

import BaseIcon from '@/components/atoms/BaseIcon.vue'

defineProps<{ label?: string; accept?: string; error?: string }>()
const emit = defineEmits<{ (e: 'selected', file: File): void }>()

function onChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('selected', file)
}
</script>
