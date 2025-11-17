<template>
  <component
    :is="as"
    :type="as === 'button' ? type : undefined"
    :class="[base, variantClass, sizeClass]"
    :disabled="disabled"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  as?: 'button' | 'a'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  as: 'button',
  type: 'button',
  disabled: false,
})

const base = 'btn'

const variantClass = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}[props.variant]

const sizeClass = { sm: 'btn-sm', md: '', lg: 'btn-lg' }[props.size]
</script>
