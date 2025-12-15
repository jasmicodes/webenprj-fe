<!--Post actions – calm and supportive-->
<template>
  <div class="card-actions space-y-3">
    <!-- Main action row with visual separation between groups -->
    <div
      class="flex items-center justify-between border-t border-slate-100 pt-4 text-slate-600"
    >
      <!-- Primary engagement actions -->
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

      <!-- Secondary utility actions (lower emphasis, visually separated) -->
      <div class="flex items-center gap-3 text-slate-500/70 pl-3 border-l border-slate-200/50">
        <!-- Standard actions (all posts) -->
        <button
          class="transition-colors hover:text-slate-700"
          @click="emit('save')"
          aria-label="Bookmark this post"
          title="Bookmark"
        >
          <BaseIcon name="BookmarkIcon" class="w-5 h-5" />
        </button>
        <button
          class="transition-colors hover:text-slate-700"
          @click="emit('share')"
          aria-label="Share this post"
          title="Share"
        >
          <BaseIcon name="ShareIcon" class="w-5 h-5" />
        </button>

        <!-- Kebab menu for management (only for own posts) -->
        <button
          v-if="props.isOwnPost"
          class="transition-colors hover:text-slate-700"
          @click="showManageActions = !showManageActions"
          :aria-label="showManageActions ? 'Hide management options' : 'Show management options'"
          :aria-expanded="showManageActions"
          title="Manage post"
        >
          <BaseIcon name="EllipsisVerticalIcon" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Management actions (revealed when "Manage" is clicked) -->
    <div
      v-if="props.isOwnPost && showManageActions"
      class="flex items-center justify-end gap-2 px-4 py-2.5 bg-slate-50/80 border border-slate-200/60 rounded-lg"
    >
      <span class="text-xs text-slate-500 mr-auto">Post options:</span>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded-md transition-colors"
        @click="handleEdit"
        aria-label="Edit this post"
      >
        <BaseIcon name="PencilIcon" class="w-4 h-4" />
        <span>Edit</span>
      </button>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        @click="handleDelete"
        aria-label="Delete this post"
      >
        <BaseIcon name="TrashIcon" class="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'

const props = withDefaults(
  defineProps<{
    likes?: number
    liked?: boolean
    comments?: number
    streak?: number
    isOwnPost?: boolean
  }>(),
  {
    likes: 0,
    liked: false,
    comments: 0,
    streak: 0,
    isOwnPost: false,
  },
)

const emit = defineEmits<{
  like: []
  comment: []
  share: []
  save: []
  edit: []
  delete: []
}>()

const showManageActions = ref(false)

function handleEdit() {
  showManageActions.value = false
  emit('edit')
}

function handleDelete() {
  showManageActions.value = false
  emit('delete')
}
</script>
