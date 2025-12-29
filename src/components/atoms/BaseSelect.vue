<!-- für Dropdowns (z. B. Fächer, Tags, Filter) -->
<template>
  <select
    :class="[
      'select',
      { invalid },
      size === 'sm' ? 'text-sm py-1.5 px-2.5' : ''
    ]"
    :value="modelValue"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <slot />
  </select>
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseSelect' })

defineProps<{
  modelValue?: string
  invalid?: boolean
  size?: 'sm' | 'md'
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>
