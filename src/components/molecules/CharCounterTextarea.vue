<!--Textarea mit Live-Counter (Default 30 Zeichen)-->
<template>
  <div class="space-y-1">
    <BaseTextarea
      :modelValue="modelValue"
      :placeholder="placeholder"
      :invalid="invalid || over"
      :maxlength="maxLength"
      :rows="rows"
      @update:modelValue="(v) => emit('update:modelValue', v)"
    />
    <div class="flex justify-end">
      <small :class="over ? 'text-danger-600' : 'text-neutral-600'"> {{ count }}/{{ max }} </small>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CharCounterTextarea' })

import { computed } from 'vue'
import BaseTextarea from '@/components/atoms/BaseTextarea.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    max?: number
    maxLength?: number
    placeholder?: string
    invalid?: boolean
    rows?: number
  }>(),
  { max: 30, placeholder: 'Text…' },
)

const emit = defineEmits<{ 'update:modelValue': [string] }>()
const count = computed(() => props.modelValue?.length ?? 0)
const over = computed(() => count.value > props.max)
</script>
