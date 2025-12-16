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

    <!-- Footer with date and stats -->
    <div class="flex items-center justify-between text-xs text-slate-500">
      <span>{{ formatDate(bookmark.createdAt) }}</span>
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1">
          <BaseIcon name="HeartIcon" class="w-4 h-4 text-rose-500" />
          {{ bookmark.post.likeCount }}
        </span>
        <span class="flex items-center gap-1">
          <BaseIcon name="BookmarkIcon" class="w-4 h-4 text-blue-500" />
          {{ bookmark.post.bookmarkCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import { useMediaImage } from '@/composables/useMediaImage'
import fallbackAvatar from '@/assets/user1.avif'
import type { Bookmark } from '@/services/api/types'

const props = defineProps<{
  bookmark: Bookmark
}>()

// Load avatar via media API
const { imageUrl: avatarSrc } = useMediaImage(
  () => props.bookmark.post.userProfileImageUrl,
  fallbackAvatar,
)

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}
</script>
