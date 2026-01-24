<!--
  BookmarkListItem - Compact list row for bookmarks

  Features:
  - Author avatar + username
  - Post title / first line preview
  - Tag chips (max 2 visible + "+N")
  - Saved timestamp
  - Quick actions: open, remove bookmark
  - Responsive: hides tags on small screens
-->
<template>
  <div
    class="group bg-white rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer"
    :class="[
      selected ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
    ]"
    @click="handleClick"
  >
    <div class="flex items-center gap-2.5 px-3 py-2.5">
      <!-- Checkbox (shown in select mode) -->
      <div
        v-if="selectable"
        class="flex-shrink-0"
        @click.stop="handleCheckboxClick"
      >
        <div
          class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer"
          :class="selected
            ? 'bg-blue-600 border-blue-600'
            : 'border-slate-300 hover:border-blue-400'"
        >
          <svg
            v-if="selected"
            class="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="3"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      </div>

      <!-- Avatar -->
      <BaseAvatar
        :src="avatarSrc"
        :alt="`${bookmark.post.username}'s avatar`"
        class="w-8 h-8 rounded-full flex-shrink-0"
      />

      <!-- Content area -->
      <div class="flex-1 min-w-0">
        <!-- Top row: username + tags -->
        <div class="flex items-center gap-1.5 mb-0.5">
          <span class="text-sm font-medium text-slate-900 truncate">
            {{ bookmark.post.username }}
          </span>
          <!-- Inline tags (hidden on small screens) -->
          <div class="hidden md:flex items-center gap-1 flex-shrink-0">
            <span
              v-for="tag in visibleTags"
              :key="tag"
              class="px-1.5 py-px text-[10px] font-medium rounded bg-slate-100 text-slate-500"
            >
              {{ tag }}
            </span>
            <span
              v-if="extraTagCount > 0"
              class="text-[10px] text-slate-400"
            >
              +{{ extraTagCount }}
            </span>
          </div>
        </div>

        <!-- Content preview (max 2 lines) -->
        <p class="text-sm text-slate-600 line-clamp-2">
          {{ bookmark.post.content }}
        </p>
      </div>

      <!-- Right side: timestamp + actions -->
      <div class="flex items-center gap-1 flex-shrink-0">
        <!-- Subtle timestamp -->
        <span
          class="hidden sm:block text-[10px] text-slate-400 mr-1"
          :title="formatDateTime(bookmark.createdAt)"
        >
          {{ formatRelativeTime(bookmark.createdAt) }}
        </span>

        <!-- Action icons (visible on hover, hidden in select mode) -->
        <div
          v-if="!selectable"
          class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button
            type="button"
            class="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Remove"
            aria-label="Remove bookmark"
            @click.stop="handleRemoveClick"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Remove Confirmation Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showConfirmModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showConfirmModal = false"
      >
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showConfirmModal"
            class="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <div class="flex items-start gap-4 mb-4">
              <div class="p-3 bg-red-100 rounded-full">
                <BaseIcon name="ExclamationTriangleIcon" class="w-6 h-6 text-red-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-slate-900 mb-2">Remove from saved posts?</h3>
                <p class="text-sm text-slate-600">
                  This post will be removed from your saved collection. Any personal notes will be lost.
                </p>
              </div>
            </div>

            <div class="flex gap-3 justify-end">
              <button
                @click="showConfirmModal = false"
                class="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                @click="confirmRemove"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Remove from saved
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineOptions({ name: 'BookmarkListItem' })

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import BaseAvatar from '@/components/atoms/BaseAvatar.vue'
import { useMediaImage } from '@/composables/useMediaImage'
import fallbackAvatar from '@/assets/user1.avif'
import type { Bookmark } from '@/services/api/types'

const props = withDefaults(defineProps<{
  bookmark: Bookmark
  selectable?: boolean
  selected?: boolean
}>(), {
  selectable: false,
  selected: false,
})

const emit = defineEmits<{
  remove: [postId: string]
  select: [event: MouseEvent]
}>()

const router = useRouter()

// Modal state
const showConfirmModal = ref(false)

// Load avatar via media API
const { imageUrl: avatarSrc } = useMediaImage(
  () => props.bookmark.post.userProfileImageUrl,
  fallbackAvatar,
)

// Parse tags from subject (assuming comma or space separated)
const allTags = computed(() => {
  const subject = props.bookmark.post.subject || ''
  // Split by common separators and filter empty
  return subject.split(/[,\s]+/).filter(Boolean).slice(0, 5)
})

const visibleTags = computed(() => allTags.value.slice(0, 2))
const extraTagCount = computed(() => Math.max(0, allTags.value.length - 2))

// Format date and time for tooltip
function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

// Format relative time (e.g., "2h ago")
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

// Handle row click (open or select depending on mode)
function handleClick(event: MouseEvent) {
  // Ignore if user is selecting text
  const selection = window.getSelection()
  if (selection && selection.toString().length > 0) {
    return
  }

  if (props.selectable) {
    emit('select', event)
  } else {
    router.push({ name: 'post', params: { id: props.bookmark.post.id } })
  }
}

// Handle checkbox click specifically
function handleCheckboxClick(event: MouseEvent) {
  emit('select', event)
}

// Handle remove click
function handleRemoveClick() {
  showConfirmModal.value = true
}

// Confirm remove
function confirmRemove() {
  showConfirmModal.value = false
  emit('remove', props.bookmark.post.id)
}
</script>
