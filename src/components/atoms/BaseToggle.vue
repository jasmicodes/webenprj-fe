<!-- BaseToggle - Accessible toggle/switch component -->
<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    :disabled="disabled"
    class="base-toggle"
    :class="{
      'base-toggle--on': modelValue,
      'base-toggle--off': !modelValue,
      'base-toggle--disabled': disabled,
    }"
    @click="toggle"
  >
    <span class="base-toggle__track">
      <span class="base-toggle__thumb" />
    </span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped>
.base-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.2s;
}

.base-toggle:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 9999px;
}

.base-toggle--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-toggle__track {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  border-radius: 9999px;
  transition: background-color 0.2s;
}

.base-toggle--off .base-toggle__track {
  background-color: #cbd5e1; /* slate-300 */
}

.base-toggle--on .base-toggle__track {
  background-color: #3b82f6; /* blue-500 / primary */
}

.base-toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 9999px;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.base-toggle--on .base-toggle__thumb {
  transform: translateX(20px);
}
</style>
