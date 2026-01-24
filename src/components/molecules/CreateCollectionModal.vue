<!--
  CreateCollectionModal - Form modal for creating bookmark collections.
  Includes name (required), description (optional), and color picker.
  Validates name length (min 2 chars) before allowing submit.
-->
<template>
  <BaseModal v-model="showModal">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
      <h2 class="text-xl font-semibold text-slate-900">New Collection</h2>

      <!-- Name input (required) -->
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-slate-700">
          Name
          <span class="text-red-500">*</span>
        </label>
        <input
          v-model="name"
          type="text"
          placeholder="e.g., Study Notes, Exam Prep"
          class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          :class="{ 'border-red-300': nameError }"
          maxlength="50"
        />
        <p v-if="nameError" class="text-xs text-red-500">{{ nameError }}</p>
      </div>

      <!-- Description input (optional) -->
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-slate-700">
          Description
          <span class="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          v-model="description"
          placeholder="What's this collection for?"
          rows="2"
          class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
          maxlength="200"
        />
      </div>

      <!-- Color picker -->
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-slate-700">
          Color
          <span class="text-slate-400 font-normal">(optional)</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in colorPresets"
            :key="preset.value"
            type="button"
            class="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
            :class="selectedColor === preset.value ? 'border-slate-900 ring-2 ring-offset-2 ring-slate-400' : 'border-transparent'"
            :style="{ backgroundColor: preset.value }"
            :title="preset.label"
            @click="selectedColor = preset.value"
          />
          <!-- No color option -->
          <button
            type="button"
            class="w-8 h-8 rounded-full border-2 transition-all hover:scale-110 bg-slate-100 flex items-center justify-center"
            :class="selectedColor === null ? 'border-slate-900 ring-2 ring-offset-2 ring-slate-400' : 'border-slate-300'"
            title="No color"
            @click="selectedColor = null"
          >
            <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <BaseButton variant="ghost" size="sm" @click="close">
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :disabled="!isValid || isSaving"
          @click="handleCreate"
        >
          {{ isSaving ? 'Creating...' : 'Create' }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
defineOptions({ name: 'CreateCollectionModal' })

import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/atoms/BaseModal.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import type { CollectionCreateRequest } from '@/services/api/types'

const props = defineProps<{
  show: boolean
  isSaving?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', data: CollectionCreateRequest): void
}>()

// Form state
const name = ref('')
const description = ref('')
const selectedColor = ref<string | null>(null)

// Color presets
const colorPresets = [
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Teal', value: '#14b8a6' },
]

// Computed property to bridge show prop to v-model
const showModal = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) emit('close')
  },
})

// Validation
const nameError = computed(() => {
  if (name.value.length === 0) return null // Don't show error when empty initially
  if (name.value.trim().length === 0) return 'Name cannot be empty'
  if (name.value.trim().length < 2) return 'Name must be at least 2 characters'
  return null
})

const isValid = computed(() => {
  return name.value.trim().length >= 2
})

// Reset form when modal opens
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      name.value = ''
      description.value = ''
      selectedColor.value = null
    }
  },
)

function close() {
  emit('close')
}

function handleCreate() {
  if (!isValid.value) return

  const data: CollectionCreateRequest = {
    name: name.value.trim(),
    description: description.value.trim() || null,
    color: selectedColor.value,
    iconName: null, // Icon selection can be added later
  }

  emit('create', data)
}
</script>
