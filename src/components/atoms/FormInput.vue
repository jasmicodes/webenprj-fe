<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm mb-1">{{ label }}</label>
    <input
      :id="id"
      v-bind="$attrs"
      :type="type"
      class="w-full rounded-lg border border-gray-300 bg-gray-900 text-white px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-600"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-sm text-danger-600 mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'FormInput' })

defineProps<{
  modelValue?: string
  label?: string
  id?: string
  type?: string
  error?: string
}>()
defineEmits<{ (e: 'update:modelValue', v: string): void }>()
</script>
