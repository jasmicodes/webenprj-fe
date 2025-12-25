<!--
  BookmarkCard - Study-focused saved post display

  UX improvements applied:
  - Reuses PostHeader component for visual consistency with main feed
  - De-emphasizes social engagement (likes/comments) with opacity + outline icons
  - Matches PostFooter icon order (like, comment, bookmark) for familiarity
  - Kebab menu only visible on hover to reduce visual clutter
  - "Remove from saved" action separated from engagement - prevents accidental deletions
  - Student-friendly copy: "Saved X ago" instead of technical "Bookmarked"
  - Soft dividers and generous spacing for calm, study-appropriate aesthetic
-->
<template>
  <div
    class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative bookmark-card"
  >
    <!-- Reuse PostHeader for consistency with main feed -->
    <PostHeader
      :username="bookmark.post.username"
      :avatar-src="avatarSrc"
      :tag="bookmark.post.subject"
      :time="bookmark.post.createdAt"
    />

    <!-- Actions menu (subtle, appears on hover) -->
    <div class="absolute top-4 right-4 bookmark-card-menu" ref="dropdownRef">
      <button
        class="p-1.5 transition-all hover:text-slate-700 hover:bg-slate-50 rounded-md text-slate-300"
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
          class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50"
        >
          <button
            class="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors text-left"
            @click="handleRemoveClick"
            aria-label="Remove from saved posts"
          >
            <BaseIcon name="BookmarkIcon" class="w-4 h-4" />
            <span>Remove from saved</span>
          </button>
        </div>
      </Transition>
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

    <!-- Footer: engagement stats (de-emphasized) + save time -->
    <div class="border-t border-slate-100 pt-3 mt-3">
      <div class="flex items-center justify-between">
        <!-- De-emphasized engagement stats (matches PostFooter icon order: like, comment, bookmark) -->
        <div class="flex items-center gap-4 text-xs text-slate-400 opacity-60">
          <!-- Like count (read-only, de-emphasized) -->
          <span class="flex items-center gap-1.5" :title="`${bookmark.post.likeCount} likes`">
            <BaseIcon name="HeartOutlineIcon" class="w-4 h-4" />
            <span class="font-medium">{{ bookmark.post.likeCount }}</span>
          </span>

          <!-- Comment count placeholder (kept for consistency, shows 0) -->
          <span class="flex items-center gap-1.5" title="Comments not shown for saved posts">
            <BaseIcon name="ChatBubbleOvalLeftIcon" class="w-4 h-4" />
            <span class="font-medium">0</span>
          </span>
        </div>

        <!-- Saved timestamp (student-friendly copy) -->
        <span class="text-xs text-slate-500" :title="'Saved on ' + formatDateTime(bookmark.createdAt)">
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
import { ref, onMounted, onUnmounted } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import PostHeader from '@/components/molecules/PostHeader.vue'
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

// Load avatar via media API (same pattern as PostCard)
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

<style scoped>
/* Subtle kebab menu: only visible on card hover (UX improvement: reduce visual clutter) */
.bookmark-card-menu {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.bookmark-card:hover .bookmark-card-menu {
  opacity: 1;
}

/* If menu is open, keep it visible even without hover */
.bookmark-card-menu:has(button[aria-expanded="true"]) {
  opacity: 1;
}
</style>
