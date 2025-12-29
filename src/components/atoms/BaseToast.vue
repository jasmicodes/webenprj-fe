<!--Kurze Erfolg-/Fehlernachrichten-->
<template>
  <div :class="['card p-3 text-white', colorClass]">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseToast' })

interface Props {
  type?: 'success' | 'warning' | 'error'
}
const props = withDefaults(defineProps<Props>(), { type: 'success' })

const colorClass = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-danger-600',
}[props.type]
</script>
