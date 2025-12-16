<template>
  <div
    class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
  >
    <!-- Header with avatar and user info -->
    <div class="flex items-start gap-3 mb-3">
      <img
        v-if="avatarSrc"
        :src="avatarSrc"
        :alt="bookmark.post.username"
        class="w-10 h-10 rounded-full object-cover"
      />
      <div
        v-else
        class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm"
      >
        {{ bookmark.post.username[0].toUpperCase() }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-slate-900">{{ bookmark.post.username }}</p>
        <p class="text-xs text-slate-500">{{ bookmark.post.subject }}</p>
      </div>

      <!-- Actions menu -->
      <div class="relative" ref="dropdownRef">
        <button
          class="p-1.5 transition-colors hover:text-slate-700 hover:bg-slate-50 rounded-md text-slate-400"
          :class="{ 'bg-slate-100 text-slate-900': showMenu }"
          @click="showMenu = !showMenu"
          :aria-label="showMenu ? 'Hide options' : 'Show options'"
          :aria-expanded="showMenu"
          title="Options"
        >
          <BaseIcon name="EllipsisVerticalIcon" class="w-5 h-5" />
        </button>

        <!-- Dropdown menu -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div
            v-if="showMenu"
            class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
          >
            <button
              class="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
              @click="handleRemoveClick"
              aria-label="Remove bookmark"
            >
              <BaseIcon name="TrashIcon" class="w-4 h-4" />
              <span>Remove bookmark</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Post content -->
    <p class="text-sm text-slate-700 mb-3 line-clamp-3">{{ bookmark.post.content }}</p>

    <!-- Personal notes (if any) -->
    <div
      v-if="bookmark.notes"
      class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3"
    >
      <p class="text-xs text-amber-800">
        <strong>Note:</strong> {{ bookmark.notes }}
      </p>
    </div>

    <!-- Footer with dates and stats -->
    <div class="space-y-2">
      <!-- Stats row -->
      <div class="flex items-center justify-between text-xs text-slate-500">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1" :title="`${bookmark.post.likeCount} likes`">
            <BaseIcon name="HeartIcon" class="w-4 h-4 text-rose-500" />
            {{ bookmark.post.likeCount }}
          </span>
          <span class="flex items-center gap-1" :title="`${bookmark.post.bookmarkCount} bookmarks`">
            <BaseIcon name="BookmarkIcon" class="w-4 h-4 text-blue-500" />
            {{ bookmark.post.bookmarkCount }}
          </span>
        </div>
      </div>

      <!-- Dates row -->
      <div class="flex items-center justify-between text-xs text-slate-400">
        <span :title="'Posted ' + formatDateTime(bookmark.post.createdAt)">
          <BaseIcon name="ClockIcon" class="w-3 h-3 inline mr-1" />
          Posted {{ formatRelativeTime(bookmark.post.createdAt) }}
        </span>
        <span :title="'Bookmarked ' + formatDateTime(bookmark.createdAt)">
          <BaseIcon name="BookmarkIcon" class="w-3 h-3 inline mr-1" />
          Saved {{ formatRelativeTime(bookmark.createdAt) }}
        </span>
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
                <h3 class="text-lg font-semibold text-slate-900 mb-2">Remove bookmark?</h3>
                <p class="text-sm text-slate-600">
                  This will remove the bookmark for this post. Any personal notes you added will be lost.
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
                Remove bookmark
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import { useMediaImage } from '@/composables/useMediaImage'
import fallbackAvatar from '@/assets/user1.avif'
import type { Bookmark } from '@/services/api/types'

const props = defineProps<{
  bookmark: Bookmark
}>()

const emit = defineEmits<{
  remove: [postId: string]
}>()

// Menu state
const showMenu = ref(false)
const showConfirmModal = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Load avatar via media API
const { imageUrl: avatarSrc } = useMediaImage(
  () => props.bookmark.post.userProfileImageUrl,
  fallbackAvatar,
)

// Format date and time
function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

// Format relative time (e.g., "2 days ago", "just now")
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

// Handle remove button click
function handleRemoveClick() {
  showMenu.value = false
  showConfirmModal.value = true
}

// Confirm remove
function confirmRemove() {
  showConfirmModal.value = false
  emit('remove', props.bookmark.post.id)
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
