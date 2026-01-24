<!--
  CommentBox - Input field with send button for adding comments.
  Emits 'send' when button clicked, parent handles actual submission.
-->
<template>
  <div class="flex items-stretch gap-2">
    <div class="flex-1 relative">
      <BaseInput
        :modelValue="modelValue"
        :placeholder="placeholder"
        @update:modelValue="(v) => emit('update:modelValue', v)"
      />
      <button
        class="absolute right-2 top-1/2 -translate-y-1/2"
        @click="emit('send')"
        aria-label="Send comment"
      >
        <BaseIcon name="PaperAirplaneIcon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CommentBox' })

import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
withDefaults(defineProps<{ modelValue?: string; placeholder?: string }>(), {
  placeholder: 'Comment…',
})
const emit = defineEmits<{ 'update:modelValue': [string]; send: [] }>()
</script>
