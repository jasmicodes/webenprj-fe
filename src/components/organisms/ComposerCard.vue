<!--
  ComposerCard - Smooth expanding post composer

  Architecture:
  - Collapsed: Simple clickable prompt
  - Expanded: Full writing surface with auto-growing textarea
  - Uses JS height measurement for smooth expand/collapse
  - Respects prefers-reduced-motion
-->
<script setup lang="ts">
defineOptions({ name: 'ComposerCard' })

import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import UserAvatar from '@/components/molecules/UserAvatar.vue'
import TagInput from '@/components/molecules/TagInput.vue'
import { useUserStore } from '@/stores/userStore'
import { isValidTag, prepareTagForBackend } from '@/utils/tagUtils'

const userStore = useUserStore()

// ============ State ============
const content = ref('')
const subject = ref('')
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const bodyInnerRef = ref<HTMLElement | null>(null)

const isExpanded = ref(false)
const isAnimating = ref(false)
const bodyHeight = ref<string>('0px')
const showMetadata = ref(false)

// Reduced motion preference
const prefersReducedMotion = ref(false)

// ============ Auto-resize textarea ============
const MIN_TEXTAREA_HEIGHT = 80 // ~3 lines
const MAX_TEXTAREA_HEIGHT = 280

function autoResizeTextarea() {
  const textarea = textareaRef.value
  if (!textarea) return

  // Reset height to auto to get the correct scrollHeight
  textarea.style.height = 'auto'

  // Calculate new height, clamped between min and max
  const newHeight = Math.min(Math.max(textarea.scrollHeight, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT)
  textarea.style.height = `${newHeight}px`

  // Enable scroll only when at max height
  textarea.style.overflowY = textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden'
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (collapseTimeout) clearTimeout(collapseTimeout)
})

// ============ Computed ============
const isContentValid = computed(() => {
  const trimmed = content.value.trim()
  return trimmed.length >= 10 && trimmed.length <= 500
})

const isSubjectValid = computed(() => {
  const trimmed = subject.value.trim()
  if (!trimmed) return true
  return isValidTag(subject.value)
})

const canPost = computed(() => isContentValid.value && isSubjectValid.value)
const charCount = computed(() => content.value.trim().length)
const hasContent = computed(() => content.value.trim().length > 0 || selectedFile.value !== null)

// ============ Emits ============
const emit = defineEmits<{
  post: [{ subject: string; content: string; file: File | null }]
}>()

// ============ Collapse timeout ============
let collapseTimeout: ReturnType<typeof setTimeout> | null = null

function clearCollapseTimeout() {
  if (collapseTimeout) {
    clearTimeout(collapseTimeout)
    collapseTimeout = null
  }
}

// ============ Height Animation ============
async function measureAndAnimate(expanding: boolean) {
  if (!bodyRef.value || !bodyInnerRef.value) return

  if (prefersReducedMotion.value) {
    // Instant toggle for reduced motion
    bodyHeight.value = expanding ? 'auto' : '0px'
    return
  }

  isAnimating.value = true

  if (expanding) {
    // Measure the target height
    bodyRef.value.style.height = 'auto'
    await nextTick()
    const targetHeight = bodyInnerRef.value.scrollHeight
    bodyRef.value.style.height = '0px'

    // Force reflow
    void bodyRef.value.offsetHeight

    // Animate to target
    bodyHeight.value = `${targetHeight}px`
  } else {
    // For collapse: first set explicit height matching current rendered height
    const currentHeight = bodyRef.value.scrollHeight
    bodyHeight.value = `${currentHeight}px`

    // Wait for DOM to apply the explicit height
    await nextTick()

    // Force reflow to ensure the height is painted
    void bodyRef.value.offsetHeight

    // Now animate to 0
    bodyHeight.value = '0px'
  }
}

// Track if we're in the process of collapsing
const isCollapsing = ref(false)

function onTransitionEnd() {
  isAnimating.value = false
  if (isExpanded.value && !isCollapsing.value) {
    // Allow natural height after expand animation completes
    bodyHeight.value = 'auto'
  } else if (isCollapsing.value) {
    // Collapse animation finished - now safe to set isExpanded false
    isExpanded.value = false
    isCollapsing.value = false
  }
}

// ============ Expand/Collapse Logic ============
async function expand() {
  if (isExpanded.value && !isCollapsing.value) return

  clearCollapseTimeout()
  isCollapsing.value = false
  isExpanded.value = true

  await nextTick()
  await measureAndAnimate(true)

  // Focus textarea and initialize size after expansion
  await nextTick()
  textareaRef.value?.focus()
  autoResizeTextarea()
}

function collapse() {
  if (!isExpanded.value || isCollapsing.value) return
  if (hasContent.value) return // Don't collapse if there's content

  isCollapsing.value = true
  showMetadata.value = false
  measureAndAnimate(false)

  // For reduced motion, set isExpanded false immediately
  if (prefersReducedMotion.value) {
    isExpanded.value = false
    isCollapsing.value = false
  }
  // Otherwise, onTransitionEnd will handle setting isExpanded = false
}

function handleHeaderClick() {
  if (!isExpanded.value) {
    expand()
  }
}

function handleBlur(event: FocusEvent) {
  const relatedTarget = event.relatedTarget as HTMLElement | null
  if (relatedTarget?.closest('.composer-card')) {
    return
  }

  // Delayed collapse
  collapseTimeout = setTimeout(() => {
    if (!hasContent.value) {
      collapse()
    }
  }, 600)
}

function handleFocus() {
  clearCollapseTimeout()
  if (!isExpanded.value) {
    expand()
  }
}

// ============ Keyboard ============
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isExpanded.value && !hasContent.value) {
    collapse()
    textareaRef.value?.blur()
  }
}

// ============ Actions ============
function handlePost() {
  if (!canPost.value) return

  const preparedSubject = subject.value.trim() ? prepareTagForBackend(subject.value) : 'general'

  emit('post', {
    subject: preparedSubject,
    content: content.value.trim(),
    file: selectedFile.value,
  })

  // Reset
  content.value = ''
  subject.value = ''
  selectedFile.value = null
  showMetadata.value = false
  collapse()
}

function handleCancel() {
  clearCollapseTimeout()
  content.value = ''
  subject.value = ''
  selectedFile.value = null
  showMetadata.value = false
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

function toggleMetadata() {
  showMetadata.value = !showMetadata.value
}

// Watch for content changes to auto-resize textarea
watch(content, () => {
  if (isExpanded.value) {
    nextTick(autoResizeTextarea)
  }
})
</script>

<template>
  <article
    class="composer-card bg-white rounded-2xl border border-slate-200 shadow-sm transition-shadow duration-200"
    :class="{ 'shadow-md border-slate-300': isExpanded }"
  >
    <!-- Header: Always visible -->
    <div
      class="flex items-center gap-3 p-4"
      :class="isExpanded ? '' : 'cursor-text'"
      @click="handleHeaderClick"
    >
      <UserAvatar class="w-9 h-9 rounded-full flex-shrink-0" :class="isExpanded ? '' : 'opacity-80'" />
      <span v-if="!isExpanded" class="text-sm text-slate-500">Share a learning moment...</span>
      <span v-else class="text-sm font-medium text-slate-700">{{ userStore.user?.username || 'You' }}</span>
    </div>

    <!-- Expandable body -->
    <div
      ref="bodyRef"
      class="body-container transition-height overflow-hidden"
      :class="{ 'no-transition': prefersReducedMotion }"
      :style="{ height: bodyHeight }"
      @transitionend="onTransitionEnd"
    >
      <div ref="bodyInnerRef" class="px-4 pb-4">

        <!-- Main writing area -->
        <div class="mb-3">
          <textarea
            ref="textareaRef"
            v-model="content"
            placeholder="What's on your mind?"
            maxlength="500"
            class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm placeholder:text-slate-400 resize-none focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-150"
            style="min-height: 80px; overflow-y: hidden;"
            @input="autoResizeTextarea"
            @focus="handleFocus"
            @blur="handleBlur"
          />
          <!-- Character count below textarea -->
          <div class="flex justify-end mt-1.5">
            <span
              v-if="charCount > 0"
              class="text-xs tabular-nums"
              :class="{
                'text-red-500': charCount > 500,
                'text-amber-500': charCount > 400 && charCount <= 500,
                'text-slate-500': charCount <= 400
              }"
            >
              {{ charCount }}/500
            </span>
          </div>
        </div>

        <!-- Attachments & metadata section -->
        <div v-if="selectedFile || showMetadata || subject" class="metadata-section">
          <!-- File preview -->
          <div
            v-if="selectedFile"
            class="file-preview"
          >
            <BaseIcon
              :name="selectedFile.type.startsWith('image/') ? 'PhotoIcon' : 'DocumentIcon'"
              class="w-4 h-4 text-slate-400 flex-shrink-0"
            />
            <span class="truncate flex-1 text-slate-600">{{ selectedFile.name }}</span>
            <span class="text-slate-400">{{ (selectedFile.size / 1024).toFixed(0) }} KB</span>
            <button
              type="button"
              class="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
              title="Remove file"
              @click="removeFile"
            >
              <BaseIcon name="XMarkIcon" class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Subject/Tag input -->
          <div v-if="showMetadata || subject" class="subject-row">
            <label class="text-xs text-slate-500 mb-1 block">Subject</label>
            <TagInput
              v-model="subject"
              placeholder="e.g. webengineering"
              class="tag-input"
            />
          </div>
        </div>

        <!-- Validation hint -->
        <p
          v-if="(charCount > 0 && charCount < 10) || !isSubjectValid"
          class="validation-hint"
        >
          <template v-if="charCount > 0 && charCount < 10">
            {{ 10 - charCount }} more characters needed
          </template>
          <template v-else-if="!isSubjectValid">
            Subject: letters and numbers only
          </template>
        </p>

        <!-- Action footer -->
        <div class="action-footer">
          <!-- Left: attachment tools -->
          <div class="flex items-center gap-1">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*,.pdf"
              class="hidden"
              @change="onFileChange"
            />
            <button
              v-if="!selectedFile"
              type="button"
              class="tool-btn"
              title="Add image"
              @click="handleFileSelect"
            >
              <BaseIcon name="PhotoOutlineIcon" class="w-4 h-4" />
            </button>
            <button
              v-if="!showMetadata && !subject"
              type="button"
              class="tool-btn"
              title="Add subject tag"
              @click="toggleMetadata"
            >
              <BaseIcon name="TagIcon" class="w-4 h-4" />
            </button>
          </div>

          <!-- Right: Cancel + Share -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="cancel-btn"
              @click="handleCancel"
            >
              Cancel
            </button>
            <BaseButton
              variant="primary"
              size="sm"
              :disabled="!canPost"
              :title="!canPost ? 'Write at least 10 characters' : ''"
              @click="handlePost"
            >
              Share
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* Card transitions */
.composer-card {
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

/* Height animation for body */
.transition-height {
  transition: height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.no-transition {
  transition: none !important;
}


/* ============ Metadata section ============ */
.metadata-section {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: theme('colors.slate.50');
  border: 1px solid theme('colors.slate.200');
  border-radius: 0.5rem;
  font-size: 0.75rem;
}

.subject-row {
  /* TagInput uses Teleport for dropdown, no z-index needed */
}

/* Validation hint */
.validation-hint {
  margin-top: 0.5rem;
  font-size: 0.6875rem;
  color: theme('colors.amber.600');
}

/* ============ Action footer ============ */
.action-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid theme('colors.slate.100');
}

/* Tool buttons */
.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: theme('colors.slate.400');
  background: transparent;
  border: 1px solid theme('colors.slate.200');
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.tool-btn:hover {
  color: theme('colors.slate.600');
  border-color: theme('colors.slate.300');
  background: theme('colors.slate.50');
}

/* Cancel button */
.cancel-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: theme('colors.slate.600');
  background: transparent;
  border-radius: 0.5rem;
  transition: all 0.15s ease;
}

.cancel-btn:hover {
  color: theme('colors.slate.800');
  background: theme('colors.slate.100');
}
</style>
