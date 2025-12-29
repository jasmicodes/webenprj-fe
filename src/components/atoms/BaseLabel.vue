<!-- für Formularbeschriftungen -->
<template>
  <label :for="htmlFor" class="label">
    <slot />
  </label>
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseLabel' })

defineProps<{
  htmlFor?: string
}>()
</script>
