<!--Post actions – calm and supportive-->
<template>
  <div class="card-actions">
    <!-- Main action row -->
    <div class="flex items-center gap-1 border-t border-slate-100 pt-4 text-slate-600">
      <!-- Primary engagement actions -->
      <div class="flex items-center gap-4">
        <!-- Like button (subtle pink when liked) -->
        <button
          class="flex items-center gap-1.5 transition-colors hover:text-slate-800"
          :class="props.liked ? 'text-rose-500' : 'text-slate-600'"
          @click="emit('like')"
          :aria-label="props.liked ? 'Unlike this post' : 'Like this post'"
        >
          <BaseIcon :name="props.liked ? 'HeartIcon' : 'HeartOutlineIcon'" class="w-5 h-5" />
          <span class="text-sm font-medium">{{ props.likes }}</span>
        </button>

        <!-- Comment button -->
        <button
          class="flex items-center gap-1.5 transition-colors hover:text-slate-800"
          @click="emit('comment')"
          aria-label="Comment on this post"
        >
          <BaseIcon name="ChatBubbleOvalLeftIcon" class="w-5 h-5" />
          <span class="text-sm font-medium">{{ props.comments }}</span>
        </button>

        <!-- Streak indicator (calm, no bright colors) - only if > 0 -->
        <div
          v-if="props.streak > 0"
          class="flex items-center gap-1.5 text-slate-600"
          :title="`${props.streak} day study streak`"
        >
          <BaseIcon name="BoltIcon" class="w-5 h-5" />
          <span class="text-sm font-medium">{{ props.streak }}</span>
        </div>
      </div>

      <!-- Spacer to push right side actions to the end -->
      <div class="flex-1"></div>

      <!-- Secondary utility actions -->
      <div class="flex items-center gap-2">
        <!-- Bookmark button with badge (social proof) -->
        <button
          class="p-1.5 transition-colors hover:text-slate-700 hover:bg-slate-50 rounded-md relative"
          :class="props.bookmarked ? 'text-blue-600' : 'text-slate-600'"
          @click="emit('save')"
          :aria-label="props.bookmarked ? 'Remove bookmark' : 'Bookmark this post'"
          :title="props.bookmarked ? 'Remove bookmark' : 'Bookmark'"
        >
          <BaseIcon
            :name="props.bookmarked ? 'BookmarkIcon' : 'BookmarkOutlineIcon'"
            class="w-5 h-5"
          />
          <!-- Bookmark count badge (only if > 0) -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-50"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-50"
          >
            <span
              v-if="props.bookmarkCount > 0"
              class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm"
            >
              {{ props.bookmarkCount > 99 ? '99+' : props.bookmarkCount }}
            </span>
          </Transition>
        </button>
        <button
          class="p-1.5 transition-colors hover:text-slate-700 hover:bg-slate-50 rounded-md"
          @click="emit('share')"
          aria-label="Share this post"
          title="Share"
        >
          <BaseIcon name="ShareIcon" class="w-5 h-5" />
        </button>

        <!-- Kebab menu for management (for own posts or admin) -->
        <div v-if="props.isOwnPost || props.isAdmin" class="relative inline-block" ref="dropdownRef">
          <button
            class="p-1.5 transition-colors hover:text-slate-700 hover:bg-slate-50 rounded-md"
            :class="{ 'bg-slate-100 text-slate-900': showManageActions }"
            @click="showManageActions = !showManageActions"
            :aria-label="showManageActions ? 'Hide management options' : 'Show management options'"
            :aria-expanded="showManageActions"
            title="More options"
          >
            <BaseIcon name="EllipsisVerticalIcon" class="w-5 h-5" />
          </button>

          <!-- Dropdown menu (positioned absolutely) -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showManageActions"
              class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
            >
              <button
                v-if="props.isOwnPost"
                class="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                @click="handleEdit"
                aria-label="Edit this post"
              >
                <BaseIcon name="PencilIcon" class="w-4 h-4" />
                <span>Edit post</span>
              </button>
              <div v-if="props.isOwnPost" class="h-px bg-slate-100 my-1"></div>
              <button
                class="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                @click="handleDelete"
                aria-label="Delete this post"
              >
                <BaseIcon name="TrashIcon" class="w-4 h-4" />
                <span>Delete post</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'

const props = withDefaults(
  defineProps<{
    likes?: number
    liked?: boolean
    comments?: number
    streak?: number
    isOwnPost?: boolean
    isAdmin?: boolean
    bookmarkCount?: number
    bookmarked?: boolean
  }>(),
  {
    likes: 0,
    liked: false,
    comments: 0,
    streak: 0,
    isOwnPost: false,
    isAdmin: false,
    bookmarkCount: 0,
    bookmarked: false,
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
const dropdownRef = ref<HTMLElement | null>(null)

function handleEdit() {
  showManageActions.value = false
  emit('edit')
}

function handleDelete() {
  showManageActions.value = false
  emit('delete')
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showManageActions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
