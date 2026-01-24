<!-- Dropzone with preview, uses FilePicker atom -->
<template>
  <div class="space-y-2">
    <label v-if="label" class="label">{{ label }}</label>

    <!-- Dropzone container -->
    <div
      class="rounded-2xl border border-neutral-200 bg-neutral-100 p-4 text-center cursor-pointer"
      @drop="onDrop"
      @dragover="onDragOver"
    >
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <div class="text-sm text-neutral-600">Drag & drop or choose a file</div>
          <div class="text-xs text-neutral-600">({{ accept }})</div>
        </div>

        <!-- Preview (small) -->
        <div v-if="isImage && previewUrl" class="w-16 h-16 rounded-xl overflow-hidden shadow">
          <img :src="previewUrl" alt="Preview" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>

    <!-- Fallback/Picker -->
    <FilePicker :accept="accept" @selected="onSelected" />

    <p v-if="error" class="help text-danger-600 flex items-center gap-1">
      <BaseIcon name="ExclamationCircleIcon" size="w-4 h-4" class="flex-shrink-0" />
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'UploadDropZone' })

import { ref, computed, onUnmounted } from 'vue'
import FilePicker from '@/components/atoms/FilePicker.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import { FILE_UPLOAD } from '@/data/constants'
import { useToastStore } from '@/stores/toastStore'

const toastStore = useToastStore()

withDefaults(
  defineProps<{
    label?: string
    accept?: string
    error?: string
  }>(),
  { accept: 'image/*,application/pdf' },
)

const emit = defineEmits<{ selected: [File] }>()
const file = ref<File | null>(null)
const isImage = computed(() => !!file.value && file.value.type.startsWith('image/'))
const previewUrl = ref<string | null>(null)

// Track blob URL for cleanup to prevent memory leaks
let currentBlobUrl: string | null = null

function revokeCurrentBlobUrl() {
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl)
    currentBlobUrl = null
  }
}

// Clean up blob URL on unmount
onUnmounted(() => {
  revokeCurrentBlobUrl()
})

function onSelected(file: File) {
  // Validate file size
  if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
    toastStore.showError(`File too large. Maximum size is ${FILE_UPLOAD.MAX_SIZE_MB}MB.`)
    return
  }

  emit('selected', file)
  // Revoke old blob URL before creating new one
  revokeCurrentBlobUrl()
  if (file.type.startsWith('image/')) {
    currentBlobUrl = URL.createObjectURL(file)
    previewUrl.value = currentBlobUrl
  } else {
    previewUrl.value = null
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const f = e.dataTransfer?.files?.[0]
  if (f) onSelected(f)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}
</script>
