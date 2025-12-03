<!--für Datei-Uploads-->
<template>
  <div>
    <BaseLabel v-if="label">{{ label }}</BaseLabel>
    <input type="file" class="input" :accept="accept" @change="onChange" />
    <BaseError v-if="error">{{ error }}</BaseError>
  </div>
</template>

<script setup lang="ts">
import BaseLabel from '@/components/atoms/BaseLabel.vue'
import BaseError from '@/components/atoms/BaseError.vue'

defineProps<{ label?: string; accept?: string; error?: string }>()
const emit = defineEmits<{ (e: 'selected', file: File): void }>()

function onChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('selected', file)
}
</script>
