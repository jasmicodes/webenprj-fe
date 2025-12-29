<!--kleine Tag-/Status-Komponente (z. B. #Mathe, #Motivation)-->
<template>
  <span :class="['chip', variantClass]">
    <slot />
  </span>
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseChip' })

interface Props {
  variant?: 'muted' | 'tag'
}
const props = withDefaults(defineProps<Props>(), { variant: 'muted' })

const variantClass = {
  muted: 'chip-muted',
  tag: 'tag',
}[props.variant]
</script>
