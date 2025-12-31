<!-- Combines Label + Control + Help/Error into a single form field wrapper -->
<template>
  <div :class="compact ? 'mb-2' : 'mb-4'">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="label" :class="{ 'text-xs': compact }">
      {{ label }}
    </label>

    <!-- Input slot -->
    <slot :id="inputId" />

    <!-- Help text -->
    <slot name="help">
      <p v-if="help" class="help">{{ help }}</p>
    </slot>

    <!-- Error message -->
    <p v-if="error" class="help text-danger-600 flex items-center gap-1" :class="{ 'text-xs': compact }">
      <BaseIcon name="ExclamationCircleIcon" size="w-4 h-4" class="flex-shrink-0" />
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseFormfield' })

import { useId } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'

interface Props {
  label?: string
  help?: string
  error?: string
  compact?: boolean
}
defineProps<Props>()

const inputId = useId()
</script>
