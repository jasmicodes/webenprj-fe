<!-- kombiniert Label + Control + Help/Error zu einem Paket, für später z. B. im Post-Formular)-->
<template>
  <div :class="compact ? 'mb-2' : 'mb-4'">
    <BaseLabel v-if="label" :html-for="inputId" :class="{ 'text-xs': compact }">{{ label }}</BaseLabel>
    <slot :id="inputId" />
    <slot name="help">
      <BaseHelp v-if="help">{{ help }}</BaseHelp>
    </slot>
    <BaseError v-if="error" :class="{ 'text-xs': compact }">{{ error }}</BaseError>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'BaseFormfield' })

import { useId } from 'vue'
import BaseLabel from '@/components/atoms/BaseLabel.vue'
import BaseHelp from '@/components/atoms/BaseHelp.vue'
import BaseError from '@/components/atoms/BaseError.vue'

interface Props {
  label?: string
  help?: string
  error?: string
  compact?: boolean
}
defineProps<Props>()

const inputId = useId()
</script>
