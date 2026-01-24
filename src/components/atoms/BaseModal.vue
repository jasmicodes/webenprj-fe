<!--
  BaseModal - Teleports content to body with backdrop overlay.
  Supports ESC close and backdrop click (both configurable).
-->
<template>
  <Teleport to="body">
    <div
      v-if="model"
      class="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      @keydown.esc.prevent="onEsc"
    >
      <div class="absolute inset-0 bg-neutral-900/60" @click="onBackdrop"></div>

      <div class="relative z-10">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
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
