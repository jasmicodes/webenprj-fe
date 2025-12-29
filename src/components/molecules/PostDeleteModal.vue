<!-- Delete confirmation modal - calm and safe -->
<template>
  <BaseModal v-model="showModal">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-slate-900">Delete this post?</h2>
        <p class="text-sm text-slate-600">
          This will permanently remove your reflection. This action cannot be undone.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-2 pt-2">
        <BaseButton variant="ghost" size="sm" @click="close" :disabled="isDeleting">
          Cancel
        </BaseButton>
        <BaseButton
          variant="danger"
          size="sm"
          @click="confirm"
          :disabled="isDeleting"
        >
          {{ isDeleting ? 'Deleting...' : 'Delete post' }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
defineOptions({ name: 'PostDeleteModal' })

import { computed } from 'vue'
import BaseModal from '@/components/atoms/BaseModal.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const props = defineProps<{
  show: boolean
  isDeleting?: boolean
}>()

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
