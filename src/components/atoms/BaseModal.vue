<!--
  BaseModal - Teleports content to body with backdrop overlay.
  Supports ESC close, backdrop click, and focus trap for accessibility.
-->
<template>
  <Teleport to="body">
    <div
      v-if="model"
      ref="modalRef"
      class="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      @keydown.esc.prevent="onEsc"
      @keydown.tab="onTab"
    >
      <div class="absolute inset-0 bg-neutral-900/60" @click="onBackdrop"></div>

      <div class="relative z-10">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

defineOptions({ name: 'BaseModal' })

const model = defineModel<boolean>({ required: true })
const props = withDefaults(
  defineProps<{
    closable?: boolean
    closeOnBackdrop?: boolean
  }>(),
  {
    closable: true,
    closeOnBackdrop: true,
  },
)

const modalRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

// Selector for all focusable elements
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function getFocusableElements(): HTMLElement[] {
  if (!modalRef.value) return []
  return Array.from(modalRef.value.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null)
}

function onTab(e: KeyboardEvent) {
  const focusable = getFocusableElements()
  if (focusable.length === 0) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  // Shift+Tab on first element -> go to last
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last?.focus()
  }
  // Tab on last element -> go to first
  else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first?.focus()
  }
}

// Focus management when modal opens/closes
watch(model, async (isOpen) => {
  if (isOpen) {
    // Store currently focused element to restore later
    previouslyFocused = document.activeElement as HTMLElement

    await nextTick()

    // Focus the first focusable element in the modal
    const focusable = getFocusableElements()
    if (focusable[0]) {
      focusable[0].focus()
    } else {
      // If no focusable elements, focus the modal container itself
      modalRef.value?.focus()
    }
  } else {
    // Restore focus when modal closes
    previouslyFocused?.focus()
    previouslyFocused = null
  }
})

function close() {
  model.value = false
}
function onBackdrop() {
  if (props.closeOnBackdrop) close()
}
function onEsc() {
  if (props.closable) close()
}
</script>
