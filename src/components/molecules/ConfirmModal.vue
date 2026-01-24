<!--
  ConfirmModal - Generic confirmation dialog for dangerous/important actions.

  Props:
  - show: boolean - Controls visibility
  - title: string - Modal title
  - message: string - Description text
  - confirmText: string - Text for confirm button (default: "Confirm")
  - cancelText: string - Text for cancel button (default: "Cancel")
  - variant: 'danger' | 'primary' - Button style (default: "danger")
  - isLoading: boolean - Shows loading state on confirm button

  Emits:
  - close: When modal is closed (cancel, backdrop, ESC)
  - confirm: When user confirms the action
-->
<template>
  <BaseModal v-model="showModal">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
        <p class="text-sm text-slate-600">{{ message }}</p>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-2 pt-2">
        <BaseButton variant="ghost" size="sm" :disabled="isLoading" @click="close">
          {{ cancelText }}
        </BaseButton>
        <BaseButton :variant="variant" size="sm" :disabled="isLoading" @click="confirm">
          {{ isLoading ? 'Please wait...' : confirmText }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
defineOptions({ name: 'ConfirmModal' })

import { computed } from 'vue'
import BaseModal from '@/components/atoms/BaseModal.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'primary'
    isLoading?: boolean
  }>(),
  {
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
    isLoading: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const showModal = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) emit('close')
  },
})

function close() {
  emit('close')
}

function confirm() {
  emit('confirm')
}
</script>
