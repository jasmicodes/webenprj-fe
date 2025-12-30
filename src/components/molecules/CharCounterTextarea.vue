<!--Textarea mit Live-Counter (Default 30 Zeichen)-->
<template>
  <div class="space-y-1">
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :rows="rows"
      class="input w-full resize-none"
      :class="{ 'border-danger-500': invalid || over }"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <div class="flex justify-end">
      <small :class="over ? 'text-danger-600' : 'text-neutral-600'"> {{ count }}/{{ max }} </small>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CharCounterTextarea' })

import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    max?: number
    maxLength?: number
    placeholder?: string
    invalid?: boolean
    rows?: number
  }>(),
  { max: 30, placeholder: 'Text…', rows: 3 },
)

const emit = defineEmits<{ 'update:modelValue': [string] }>()
const count = computed(() => props.modelValue?.length ?? 0)
const over = computed(() => count.value > props.max)
</script>
