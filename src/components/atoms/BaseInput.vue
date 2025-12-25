<template>
  <input
    :type="type || 'text'"
    :class="[
      'input',
      { invalid },
      size === 'sm' ? 'text-sm py-1.5 px-2.5' : ''
    ]"
    :value="modelValue"
    :placeholder="placeholder"
    :maxlength="maxlength"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string
  invalid?: boolean
  placeholder?: string
  type?: string
  size?: 'sm' | 'md'
  maxlength?: string | number
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>
