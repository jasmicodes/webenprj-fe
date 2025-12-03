<!--Wrapper für deine Status-Meldungen (success | warning | error). Zeigt Icon, Titel, Text-->
<template>
  <transition name="fade">
    <div v-if="show" class="card p-4" :class="styles[variant].wrap">
      <div class="flex items-start gap-3">
        <BaseIcon :name="styles[variant].icon" class="w-6 h-6" />
        <div class="flex-1">
          <div class="font-medium text-neutral-900" v-if="title">{{ title }}</div>
          <div class="text-neutral-900">{{ message }}</div>
        </div>
        <button class="opacity-70 hover:opacity-100" @click="emit('close')">
          <BaseIcon name="XMarkIcon" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import BaseIcon from '@/components/atoms/BaseIcon.vue'

type Variant = 'success' | 'warning' | 'error'
withDefaults(
  defineProps<{
    variant?: Variant
    title?: string
    message: string
    show?: boolean
  }>(),
  { variant: 'success', show: true },
)

const emit = defineEmits<{ close: [] }>()

const styles: Record<Variant, { wrap: string; icon: string }> = {
  success: { wrap: 'bg-success-300', icon: 'CheckCircleIcon' },
  warning: { wrap: 'bg-warning-300', icon: 'ExclamationCircleIcon' },
  error: { wrap: 'bg-danger-300', icon: 'XCircleIcon' },
}
</script>
