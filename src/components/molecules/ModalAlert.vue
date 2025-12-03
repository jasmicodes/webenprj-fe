<template>
  <BaseModal v-model="open" :closable="false" :close-on-backdrop="true">
    <div
      class="relative flex items-center justify-between gap-6 p-6 rounded-2xl shadow-lg w-full max-w-lg"
      :style="{ backgroundColor: bgColor }"
    >
      <!-- Schließen-Button (X) oben rechts -->
      <button
        type="button"
        @click="close"
        class="absolute top-3 right-3 text-xl font-bold opacity-60 hover:opacity-100"
        :style="{ color: textColor }"
        aria-label="Close"
      >
        ×
      </button>

      <!-- Text + Button links -->
      <div class="flex flex-col text-left space-y-1">
        <h3 class="text-lg font-semibold" :style="{ color: textColor }">
          {{ title }}
        </h3>
        <p class="text-base leading-relaxed" :style="{ color: textColor }">
          {{ message }}
        </p>

        <button type="button" class="btn mt-3 w-28" :class="buttonClass" @click="close">OK</button>
      </div>

      <!-- Icon (rechts oder links je nach Prop) -->
      <div
        v-if="iconSide === 'left'"
        class="flex items-center justify-center shrink-0 rounded-full w-12 h-12"
        :style="{ backgroundColor: textColor }"
      >
        <BaseIcon :name="icon" class="w-6 h-6" style="color: white" />
      </div>
      <div
        v-else
        class="flex items-center justify-center shrink-0 rounded-full w-12 h-12"
        :style="{ backgroundColor: textColor }"
      >
        <BaseIcon :name="icon" class="w-6 h-6" style="color: white" />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '@/components/atoms/BaseModal.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'

const open = defineModel<boolean>({ required: true })
const props = withDefaults(
  defineProps<{
    title?: string
    message: string
    variant?: 'error' | 'success' | 'info'
    iconSide?: 'left' | 'right'
  }>(),
  {
    title: 'Notice',
    variant: 'info',
    iconSide: 'right',
  },
)

const variants = {
  error: {
    bg: 'var(--color-danger-300)',
    text: 'var(--color-danger-600)',
    icon: 'ExclamationTriangleIcon',
    button: 'btn-danger',
  },
  success: {
    bg: 'var(--color-success-300)',
    text: 'var(--color-success-500)',
    icon: 'CheckCircleIcon',
    button: 'btn-primary',
  },
  info: {
    bg: 'var(--color-warning-300)',
    text: 'var(--color-warning-500)',
    icon: 'InformationCircleIcon',
    button: 'btn-outline',
  },
}

const { bg, text, icon, button } = variants[props.variant]
const bgColor = bg
const textColor = text
const buttonClass = button

function close() {
  open.value = false
}
</script>
