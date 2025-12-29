<!--für Fehlermeldungen (z. B. „Bitte Feld ausfüllen")-->
<template>
  <p class="help text-danger-600 flex items-center gap-1">
    <BaseIcon name="ExclamationCircleIcon" size="w-4 h-4" class="flex-shrink-0" />
    <slot />
  </p>
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseError' })

import BaseIcon from '@/components/atoms/BaseIcon.vue'
</script>
