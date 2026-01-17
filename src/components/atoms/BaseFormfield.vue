<!-- Combines Label + Control + Help/Error into a single form field wrapper -->
<template>
  <div :class="compact ? 'mb-2' : 'mb-4'">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="label" :class="{ 'text-xs': compact }">
      {{ label }}
    </label>

    <!-- Input slot bekommt jetzt id + describedBy + invalid -->
    <slot :id="inputId" :describedBy="describedBy" :invalid="!!error" />

    <!-- Help text -->
    <slot name="help">
      <p v-if="help" :id="helpId" class="help">{{ help }}</p>
    </slot>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      class="help text-danger-600 flex items-center gap-1"
      :class="{ 'text-xs': compact }"
    >
      <BaseIcon name="ExclamationCircleIcon" size="w-4 h-4" class="flex-shrink-0" />
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'

const props = defineProps<{
  label?: string
  help?: string
  error?: string
  compact?: boolean
}>()

const inputId = useId()
const helpId = `${inputId}-help`
const errorId = `${inputId}-error`

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.help) ids.push(helpId)
  if (props.error) ids.push(errorId)
  return ids.length ? ids.join(' ') : undefined
})
</script>
