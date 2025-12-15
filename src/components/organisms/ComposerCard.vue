<!-- ComposerCard - Create new posts in the feed -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
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
  <BaseCard>
    <!-- Collapsed State: Placeholder -->
    <div v-if="!isExpanded" class="px-6 py-4">
      <button
        @click="expand"
        class="flex items-center gap-3 w-full text-left group"
        type="button"
      >
        <UserAvatar class="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        <div
          class="flex-1 px-4 py-3 rounded-xl bg-slate-50 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors"
        >
          Share what you worked on today…
        </div>
      </button>
    </div>

    <!-- Expanded State: Full Composer -->
    <div v-else class="px-6 py-4 space-y-4">
      <!-- Header with avatar -->
      <div class="flex items-center gap-3">
        <UserAvatar class="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        <div class="flex-1">
          <p class="text-sm font-medium text-slate-900">
            {{ userStore.user?.username || 'User' }}
          </p>
        </div>
      </div>

      <!-- Content textarea -->
      <CharCounterTextarea
        v-model="content"
        placeholder="Share your progress, insights, or questions..."
        :max="500"
        :max-length="500"
        :rows="4"
      />

      <!-- Tag input -->
      <div>
        <label class="block text-xs font-medium text-slate-700 mb-1.5">
          Subject/Tag
          <span class="text-slate-500 font-normal">(optional, defaults to 'general')</span>
        </label>
        <TagInput v-model="subject" placeholder="Add a subject (e.g., webengineering)" />
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

        <div v-if="!selectedFile" class="flex items-center gap-2">
          <button
            @click="handleFileSelect"
            type="button"
            class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <BaseIcon name="PhotoIcon" class="w-5 h-5" />
            <span>Add image or PDF</span>
          </button>
        </div>

        <!-- File preview -->
        <div
          v-else
          class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
        >
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <BaseIcon
              :name="selectedFile.type.startsWith('image/') ? 'PhotoIcon' : 'DocumentIcon'"
              class="w-5 h-5 text-slate-600 flex-shrink-0"
            />
            <span class="text-sm text-slate-700 truncate">{{ selectedFile.name }}</span>
            <span class="text-xs text-slate-500 flex-shrink-0">
              ({{ (selectedFile.size / 1024).toFixed(1) }} KB)
            </span>
          </div>
          <button
            @click="removeFile"
            type="button"
            class="ml-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
            title="Remove file"
          >
            <BaseIcon name="XMarkIcon" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Actions row -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-100">
        <p
          class="text-xs"
          :class="
            content.trim().length === 0
              ? 'text-slate-500'
              : content.trim().length < 10
                ? 'text-amber-600'
                : !isSubjectValid
                  ? 'text-red-600'
                  : 'text-slate-500'
          "
        >
          {{
            content.trim().length === 0
              ? 'Minimum 10 characters required for content'
              : content.trim().length < 10
                ? `${10 - content.trim().length} more characters needed for content`
                : !isSubjectValid
                  ? 'Subject must be 2-30 characters (letters, numbers, spaces, dashes, underscores)'
                  : 'Posts are visible to all users'
          }}
        </p>
        <div class="flex items-center gap-2">
          <BaseButton variant="ghost" size="sm" @click="collapse">Cancel</BaseButton>
          <BaseButton variant="primary" size="sm" :disabled="!canPost" @click="handlePost">
            Post
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
