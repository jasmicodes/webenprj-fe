<!-- Edit post modal with composer-style UI -->
<template>
  <BaseModal :show="show" @close="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-6 space-y-4">
      <h2 class="text-xl font-semibold text-slate-900">Edit your reflection</h2>

      <!-- Content textarea with helper hint -->
      <div class="space-y-1.5">
        <CharCounterTextarea
          v-model="localContent"
          placeholder="What did you study today?"
          :max="500"
          :max-length="500"
          :rows="4"
        />
        <p class="text-xs text-slate-500 pl-1">One sentence is enough.</p>
      </div>

      <!-- Subject input -->
      <div>
        <label class="block text-xs font-medium text-slate-700 mb-1.5">
          Subject
          <span class="text-slate-500 font-normal">(optional)</span>
        </label>
        <TagInput v-model="localSubject" placeholder="e.g., webengineering, algorithms, databases" />
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-100">
        <p
          class="text-xs"
          :class="
            localContent.trim().length === 0
              ? 'text-slate-500'
              : localContent.trim().length < 10
                ? 'text-slate-600'
                : 'text-slate-500'
          "
        >
          {{
            localContent.trim().length === 0
              ? 'Reflect on your learning'
              : localContent.trim().length < 10
                ? `${10 - localContent.trim().length} more characters`
                : 'Your changes will be saved'
          }}
        </p>
        <div class="flex items-center gap-2">
          <BaseButton variant="ghost" size="sm" @click="$emit('close')">Cancel</BaseButton>
          <BaseButton
            variant="primary"
            size="sm"
            :disabled="!isValid || isSaving"
            @click="handleSave"
          >
            {{ isSaving ? 'Saving...' : 'Save changes' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/atoms/BaseModal.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import CharCounterTextarea from '@/components/molecules/CharCounterTextarea.vue'
import TagInput from '@/components/molecules/TagInput.vue'
import { isValidTag } from '@/utils/tagUtils'

const props = defineProps<{
  show: boolean
  content: string
  subject: string
  isSaving?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { content: string; subject: string }): void
}>()

const localContent = ref(props.content)
const localSubject = ref(props.subject)

// Reset local state when modal opens with new data
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      localContent.value = props.content
      localSubject.value = props.subject
    }
  },
)

const isValid = computed(() => {
  const trimmedContent = localContent.value.trim()
  if (trimmedContent.length < 10 || trimmedContent.length > 500) return false

  const trimmedSubject = localSubject.value.trim()
  if (trimmedSubject && !isValidTag(trimmedSubject)) return false

  return true
})

function handleSave() {
  if (!isValid.value) return

  emit('save', {
    content: localContent.value.trim(),
    subject: localSubject.value.trim() || 'general',
  })
}
</script>
