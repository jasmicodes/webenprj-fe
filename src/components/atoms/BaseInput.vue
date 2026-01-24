<!--
  BaseInput - Text input with v-model support and validation styling.
  Passes through all native input attrs via v-bind="$attrs".
-->
<template>
  <input
    v-bind="$attrs"
    :id="id"
    :type="type || 'text'"
    :class="['input', { invalid }, size === 'sm' ? 'text-sm py-1.5 px-2.5' : '']"
    :value="modelValue"
    :placeholder="placeholder"
    :maxlength="maxlength"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseInput' })

defineProps<{
  id?: string
  modelValue?: string
  invalid?: boolean
  placeholder?: string
  type?: string
  size?: 'sm' | 'md'
  maxlength?: string | number
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>
