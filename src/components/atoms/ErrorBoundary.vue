<!-- Global error boundary - catches JavaScript errors in child components -->
<template>
  <slot v-if="!error" />
  <div v-else class="error-fallback p-6 text-center">
    <BaseIcon name="ExclamationTriangleIcon" size="w-12 h-12" class="mx-auto text-danger-600 mb-3" />
    <p class="text-slate-700 mb-4">Something went wrong.</p>
    <BaseButton variant="outline" size="sm" @click="reset">Try again</BaseButton>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ErrorBoundary' })

import { ref, onErrorCaptured } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  console.error('ErrorBoundary caught:', err)
  return false // Prevent propagation
})

function reset() {
  error.value = null
}
</script>
