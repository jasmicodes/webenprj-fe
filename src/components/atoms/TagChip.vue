<!--
  TagChip - Displays a study tag with optional remove button.
  Formats tag label using formatTagDisplay for consistent "#tag" display.
-->
<template>
  <span
    :class="[
      'chip',
      variantClass,
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
  >
    <span>{{ displayLabel }}</span>
    <button
      v-if="removable && !disabled"
      type="button"
      class="ml-1 -mr-1 hover:text-danger-600 transition-colors"
      :aria-label="`Remove tag ${displayLabel}`"
      @click.stop="$emit('remove')"
    >
      <BaseIcon name="XMarkIcon" size="w-3 h-3" />
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import { formatTagDisplay } from '@/utils/tagUtils'

defineOptions({ name: 'TagChip' })

interface Props {
  label: string
  variant?: 'default' | 'primary' | 'muted'
  removable?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  removable: false,
  disabled: false,
})

defineEmits<{ remove: [] }>()

const displayLabel = computed(() => formatTagDisplay(props.label))

const variantClass = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary-400 text-white'
    case 'muted':
      return 'chip-muted'
    default:
      return 'bg-slate-500 text-white'
  }
})
</script>
