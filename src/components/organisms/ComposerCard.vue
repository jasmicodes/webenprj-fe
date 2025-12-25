<!-- ComposerCard - Create new posts in the feed -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import CharCounterTextarea from '@/components/molecules/CharCounterTextarea.vue'
import TagInput from '@/components/molecules/TagInput.vue'
import UserAvatar from '@/components/molecules/UserAvatar.vue'
import { useUserStore } from '@/stores/userStore'
import { isValidTag, prepareTagForBackend } from '@/utils/tagUtils'

const userStore = useUserStore()

// Composer state
const isExpanded = ref(false)
const content = ref('')
const subject = ref('') // Renamed from selectedTag to match backend field name
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Validation matching backend PostCreateRequest
const isContentValid = computed(() => {
  const trimmed = content.value.trim()
  return trimmed.length >= 10 && trimmed.length <= 500
})

const isSubjectValid = computed(() => {
  // Subject is required (backend has @NotBlank)
  // If empty, we'll use 'general' as default, so consider it valid
  // If provided, must match the backend pattern
  const trimmed = subject.value.trim()
  if (!trimmed) return true // Will default to 'general' in handlePost
  return isValidTag(subject.value)
})

const canPost = computed(() => {
  return isContentValid.value && isSubjectValid.value
})

const emit = defineEmits<{
  post: [{ subject: string; content: string; file: File | null }]
}>()

function expand() {
  isExpanded.value = true
}

function collapse() {
  isExpanded.value = false
  content.value = ''
  subject.value = ''
  selectedFile.value = null
}

function handlePost() {
  if (!canPost.value) return

  // Prepare tag for backend: normalize and provide default if empty
  const preparedSubject = subject.value.trim() ? prepareTagForBackend(subject.value) : 'general'

  emit('post', {
    subject: preparedSubject,
    content: content.value.trim(),
    file: selectedFile.value,
  })

  collapse()
}

function handleFileSelect() {
  fileInputRef.value?.click()
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

function removeFile() {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<template>
  <!-- Composer with elevated presence - primary action in feed -->
  <article class="composer-card bg-white rounded-2xl border border-slate-200 shadow-md ring-1 ring-slate-900/5">
    <!-- Collapsed State: Inviting input trigger -->
    <div v-if="!isExpanded" class="p-4">
      <button
        @click="expand"
        class="flex items-center gap-3 w-full text-left group"
        type="button"
        aria-label="Share what you learned today"
      >
        <UserAvatar class="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        <div
          class="composer-trigger flex-1 px-4 py-2.5 rounded-xl bg-slate-50/80 text-sm text-slate-500 border border-transparent transition-all duration-200 group-hover:bg-slate-100 group-hover:text-slate-600 group-hover:border-slate-200 group-focus-visible:ring-2 group-focus-visible:ring-blue-500/20 group-focus-visible:border-blue-300 group-focus-visible:bg-white"
        >
          Share a learning moment...
        </div>
      </button>
    </div>

    <!-- Expanded State: Full Composer -->
    <div v-else class="p-4 space-y-4">
      <!-- Header with avatar and username -->
      <div class="flex items-center gap-3">
        <UserAvatar class="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        <p class="text-sm font-medium text-slate-800">
          {{ userStore.user?.username || 'User' }}
        </p>
      </div>

      <!-- Content textarea with helper hint -->
      <div class="space-y-1">
        <CharCounterTextarea
          v-model="content"
          placeholder="What did you learn or work on today?"
          :max="500"
          :max-length="500"
          :rows="3"
          class="composer-textarea"
        />
        <p class="text-xs text-slate-400 pl-0.5">A sentence or two is plenty.</p>
      </div>

      <!-- Tag input -->
      <div>
        <label class="block text-xs font-medium text-slate-600 mb-1">
          Subject
          <span class="text-slate-400 font-normal">(optional)</span>
        </label>
        <TagInput v-model="subject" placeholder="e.g., webengineering, algorithms" />
      </div>

      <!-- Media upload area -->
      <div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*,.pdf"
          class="hidden"
          @change="onFileChange"
        />

        <div v-if="!selectedFile">
          <button
            @click="handleFileSelect"
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <BaseIcon name="PhotoOutlineIcon" class="w-4 h-4" />
            <span>Add image</span>
          </button>
        </div>

        <!-- File preview -->
        <div
          v-else
          class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
        >
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <BaseIcon
              :name="selectedFile.type.startsWith('image/') ? 'PhotoIcon' : 'DocumentIcon'"
              class="w-4 h-4 text-slate-500 flex-shrink-0"
            />
            <span class="text-xs text-slate-600 truncate">{{ selectedFile.name }}</span>
            <span class="text-xs text-slate-400 flex-shrink-0">
              {{ (selectedFile.size / 1024).toFixed(0) }} KB
            </span>
          </div>
          <button
            @click="removeFile"
            type="button"
            class="ml-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
            title="Remove file"
          >
            <BaseIcon name="XMarkIcon" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Actions row -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-100">
        <p class="text-xs text-slate-400">
          {{
            content.trim().length === 0
              ? 'Reflect on your progress'
              : content.trim().length < 10
                ? `${10 - content.trim().length} more characters needed`
                : !isSubjectValid
                  ? 'Subject: letters and numbers only'
                  : 'Visible to your study community'
          }}
        </p>
        <div class="flex items-center gap-2">
          <BaseButton variant="ghost" size="sm" @click="collapse">Cancel</BaseButton>
          <BaseButton variant="primary" size="sm" :disabled="!canPost" @click="handlePost">
            Share
          </BaseButton>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* Elevated composer card - stands out as primary action */
.composer-card {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -2px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.03);
}

/* Focus state for composer trigger */
.composer-trigger:focus-visible {
  outline: none;
}

/* Enhanced textarea focus within composer */
.composer-textarea :deep(textarea) {
  transition: all 0.2s ease;
}

.composer-textarea :deep(textarea:focus) {
  background-color: rgb(248 250 252); /* slate-50 */
  border-color: rgb(203 213 225); /* slate-300 */
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
