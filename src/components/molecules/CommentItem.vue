<!--
  CommentItem - Single comment display with avatar, author link, and like action.
  Reuses PostCardData type since comments have same structure as posts.
-->
<template>
  <div class="bg-slate-50 rounded-lg p-3 space-y-2">
    <!-- Comment header -->
    <div class="flex items-center gap-2">
      <RouterLink
        :to="{ name: 'user-profile', params: { id: comment.userId } }"
        @click.stop
      >
        <img
          :src="avatarSrc"
          :alt="comment.user.name"
          class="w-6 h-6 rounded-full object-cover hover:ring-2 hover:ring-blue-200 transition-shadow"
        />
      </RouterLink>
      <RouterLink
        :to="{ name: 'user-profile', params: { id: comment.userId } }"
        class="text-sm font-medium text-slate-900 hover:text-blue-600 hover:underline transition-colors"
        @click.stop
      >
        {{ comment.user.name }}
      </RouterLink>
      <span class="text-xs text-slate-500">{{ formatTimeAgo(comment.time) }}</span>
    </div>

    <!-- Comment image (if any) -->
    <figure
      v-if="comment.image"
      class="relative w-full max-w-xs aspect-[4/3] bg-neutral-100 overflow-hidden rounded-lg"
    >
      <img
        :src="comment.image"
        alt="Comment image"
        class="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
    </figure>

    <!-- Comment text -->
    <p class="text-sm text-slate-700">{{ comment.text }}</p>

    <!-- Comment actions (like only - no reply) -->
    <div class="flex items-center gap-4 text-xs text-slate-500">
      <button
        class="flex items-center gap-1 hover:text-rose-500 transition-colors"
        :class="{ 'text-rose-500': comment.liked }"
        @click="emit('like')"
      >
        <HeartIcon class="w-4 h-4" :class="{ 'fill-current': comment.liked }" />
        <span>{{ comment.likes }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CommentItem' })

import { RouterLink } from 'vue-router'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { useMediaImage } from '@/composables/useMediaImage'
import { formatTimeAgo } from '@/utils/timeUtils'
import type { PostCardData } from '@/utils/postMapper'
import fallbackAvatar from '@/assets/user1.avif'

const props = defineProps<{
  comment: PostCardData
}>()

const emit = defineEmits<{
  like: []
}>()

// Load avatar via media API (converts /medias/{uuid} to blob URL)
const { imageUrl: avatarSrc } = useMediaImage(() => props.comment.user.avatar, fallbackAvatar)
</script>
