<!--Single-Select für Subjects-->
<template>
  <BaseSelect :modelValue="modelValue" @update:modelValue="(v) => emit('update:modelValue', v)">
    <option value="" disabled v-if="!modelValue">{{ placeholder ?? 'Select subject…' }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </BaseSelect>
</template>

<script setup lang="ts">
import BaseSelect from '@/components/atoms/BaseSelect.vue'

type Option = { label: string; value: string }

defineProps<{
  modelValue?: string
  options: Option[]
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>
