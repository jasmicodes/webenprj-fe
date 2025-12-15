<!--(ActionsBar) – Likes/Comments/Save/Share-->
<template>
  <div
    class="card-actions flex items-center justify-between border-t border-slate-200 pt-4 text-neutral-900"
  >
    <div class="flex items-center gap-5">
      <button
        class="flex items-center gap-1.5 transition-colors hover:text-rose-600"
        :class="props.liked ? 'text-rose-600' : 'text-neutral-900'"
        @click="emit('like')"
      >
        <BaseIcon :name="props.liked ? 'HeartSolidIcon' : 'HeartIcon'" />
        <span class="text-sm font-medium">{{ props.likes }}</span>
      </button>
      <button
        class="flex items-center gap-1.5 transition-colors hover:text-blue-600"
        @click="emit('comment')"
      >
        <BaseIcon name="ChatBubbleOvalLeftIcon" />
        <span class="text-sm font-medium">{{ props.comments }}</span>
      </button>
      <div class="flex items-center gap-1.5 text-amber-600">
        <BaseIcon name="BoltIcon" />
        <span class="text-sm font-medium">{{ props.streak }}</span>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <button class="transition-colors hover:text-blue-600" @click="emit('save')">
        <BaseIcon name="BookmarkIcon" />
      </button>
      <button class="transition-colors hover:text-blue-600" @click="emit('share')">
        <BaseIcon name="ShareIcon" />
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
