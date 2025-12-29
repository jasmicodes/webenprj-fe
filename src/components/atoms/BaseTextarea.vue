<!-- für längere Texteingaben (z. B. Post schreiben, Kommentare) -->
<template>
  <textarea
    :class="['textarea', { invalid }]"
    :value="modelValue"
    :placeholder="placeholder"
    :maxlength="maxlength"
    :rows="rows"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseTextarea' })

defineProps<{
  modelValue?: string
  invalid?: boolean
  placeholder?: string
  maxlength?: number
  rows?: number
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>
