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
    class="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-all relative bookmark-card group cursor-pointer"
    :class="[
      selected ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200'
    ]"
    @click="handleClick"
  >
    <!-- Checkbox overlay (shown in select mode) -->
    <div
      v-if="selectable"
      class="absolute top-3 left-3 z-10"
      @click.stop="handleCheckboxClick"
    >
      <div
        class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer bg-white"
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

    <!-- Header: Avatar + username + tag + actions -->
    <div class="flex items-start gap-2.5 mb-2" :class="{ 'ml-6': selectable }">
      <UserAvatar
        :src="avatarSrc"
        :alt="`${bookmark.post.username}'s avatar`"
        class="w-8 h-8 rounded-full flex-shrink-0"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5">
          <span class="text-sm font-medium text-slate-900 truncate">
            {{ bookmark.post.username }}
          </span>
          <span
            v-if="bookmark.post.subject"
            class="px-1.5 py-px text-[10px] font-medium rounded bg-slate-100 text-slate-500 truncate max-w-[80px]"
          >
            {{ bookmark.post.subject }}
          </span>
        </div>
        <span class="text-[10px] text-slate-400" :title="formatDateTime(bookmark.createdAt)">
          {{ formatRelativeTime(bookmark.createdAt) }}
        </span>
      </div>

      <!-- Action icons (visible on hover, hidden in select mode) -->
      <div
        v-if="!selectable"
        class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        ref="dropdownRef"
      >
        <button
          class="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          @click.stop="handleRemoveClick"
          title="Remove"
          aria-label="Remove bookmark"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Post content (max 2 lines) -->
    <p class="text-sm text-slate-700 line-clamp-2">{{ bookmark.post.content }}</p>

    <!-- Personal notes (if any) -->
    <div
      v-if="bookmark.notes"
      class="bg-amber-50/50 border border-amber-100 rounded-md px-2.5 py-2 mt-2"
    >
      <p class="text-[11px] text-amber-700 line-clamp-2">
        <span class="font-medium">Note:</span> {{ bookmark.notes }}
      </p>
    </div>

    <!-- Footer: subtle metadata -->
    <div class="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
      <!-- De-emphasized engagement stats -->
      <div class="flex items-center gap-3 text-[10px] text-slate-400">
        <span class="flex items-center gap-1" :title="`${bookmark.post.likeCount} likes`">
          <BaseIcon name="HeartOutlineIcon" class="w-3 h-3" />
          {{ bookmark.post.likeCount }}
        </span>
        <span class="flex items-center gap-1" :title="`${bookmark.post.commentCount || 0} comments`">
          <BaseIcon name="ChatBubbleOvalLeftIcon" class="w-3 h-3" />
          {{ bookmark.post.commentCount || 0 }}
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
import UserAvatar from '@/components/molecules/UserAvatar.vue'
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

// Handle card click (select in select mode, no action otherwise)
function handleClick(event: MouseEvent) {
  if (props.selectable) {
    emit('select', event)
  }
}

// Handle checkbox click specifically
function handleCheckboxClick(event: MouseEvent) {
  emit('select', event)
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

