<!--Post actions – calm and supportive-->
<template>
  <div
    class="card-actions flex items-center justify-between border-t border-slate-100 pt-4 text-slate-600"
  >
    <div class="flex items-center gap-5">
      <!-- Like button (subtle pink when liked) -->
      <button
        class="flex items-center gap-1.5 transition-colors hover:text-slate-800"
        :class="props.liked ? 'text-rose-500' : 'text-slate-600'"
        @click="emit('like')"
        :aria-label="props.liked ? 'Unlike this post' : 'Like this post'"
      >
        <BaseIcon :name="props.liked ? 'HeartIcon' : 'HeartOutlineIcon'" />
        <span class="text-sm font-medium">{{ props.likes }}</span>
      </button>

      <!-- Comment button -->
      <button
        class="flex items-center gap-1.5 transition-colors hover:text-slate-800"
        @click="emit('comment')"
        aria-label="Comment on this post"
      >
        <BaseIcon name="ChatBubbleOvalLeftIcon" />
        <span class="text-sm font-medium">{{ props.comments }}</span>
      </button>

      <!-- Streak indicator (calm, no bright colors) - only if > 0 -->
      <div
        v-if="props.streak > 0"
        class="flex items-center gap-1.5 text-slate-500"
        :title="`${props.streak} day study streak`"
      >
        <BaseIcon name="BoltIcon" class="w-4 h-4" />
        <span class="text-sm">{{ props.streak }}</span>
      </div>
    </div>

    <!-- Secondary actions (subtle) -->
    <div class="flex items-center gap-4 text-slate-500">
      <button
        class="transition-colors hover:text-slate-700"
        @click="emit('save')"
        aria-label="Bookmark this post"
      >
        <BaseIcon name="BookmarkIcon" class="w-5 h-5" />
      </button>
      <button
        class="transition-colors hover:text-slate-700"
        @click="emit('share')"
        aria-label="Share this post"
      >
        <BaseIcon name="ShareIcon" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseIcon from '@/components/atoms/BaseIcon.vue'
const props = withDefaults(
  defineProps<{ likes?: number; liked?: boolean; comments?: number; streak?: number }>(),
  {
    likes: 0,
    liked: false,
    comments: 0,
    streak: 0,
  },
)
const emit = defineEmits<{ like: []; comment: []; share: []; save: [] }>()
</script>
