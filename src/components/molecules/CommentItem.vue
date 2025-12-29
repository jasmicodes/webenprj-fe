<template>
  <div class="bg-slate-50 rounded-lg p-3 space-y-2">
    <!-- Comment header -->
    <div class="flex items-center gap-2">
      <img
        :src="avatarSrc"
        :alt="comment.user.name"
        class="w-6 h-6 rounded-full object-cover"
      />
      <span class="text-sm font-medium text-slate-900">{{ comment.user.name }}</span>
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

    <!-- Comment actions -->
    <div class="flex items-center gap-4 text-xs text-slate-500">
      <button
        class="flex items-center gap-1 hover:text-rose-500 transition-colors"
        :class="{ 'text-rose-500': comment.liked }"
        @click="emit('like')"
      >
        <HeartIcon class="w-4 h-4" :class="{ 'fill-current': comment.liked }" />
        <span>{{ comment.likes }}</span>
      </button>
      <button
        class="flex items-center gap-1 hover:text-blue-500 transition-colors"
        @click="emit('reply')"
      >
        <ChatBubbleLeftIcon class="w-4 h-4" />
        <span>Reply</span>
      </button>
      <!-- View replies button (only if there are replies) -->
      <button
        v-if="replyCount > 0"
        class="flex items-center gap-1 hover:text-slate-700 transition-colors"
        @click="toggleReplies"
      >
        <ChevronDownIcon
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-180': showReplies }"
        />
        <span>{{ replyCount }} {{ replyCount === 1 ? 'reply' : 'replies' }}</span>
      </button>
    </div>

    <!-- Reply input slot -->
    <slot name="reply-input" />

    <!-- Nested replies -->
    <div v-if="showReplies" class="mt-3 pl-4 border-l-2 border-slate-200 space-y-2">
      <!-- Loading -->
      <div v-if="loadingReplies" class="text-xs text-slate-500 py-2">
        Loading replies...
      </div>

      <!-- Replies list (recursive) -->
      <CommentItem
        v-for="reply in replies"
        :key="reply.id"
        :comment="reply"
        @like="handleReplyLike(reply)"
        @reply="emit('replyToReply', reply)"
      />

      <!-- Load more replies -->
      <button
        v-if="hasMoreReplies && !loadingReplies"
        class="text-xs text-blue-500 hover:text-blue-700"
        @click="loadMoreReplies"
      >
        Load more replies
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CommentItem' })

import { ref, computed } from 'vue'
import { HeartIcon, ChatBubbleLeftIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useMediaImage } from '@/composables/useMediaImage'
import { formatTimeAgo } from '@/utils/timeUtils'
import { postsApi } from '@/services/api/posts'
import { mapApiPostToCard, type PostCardData } from '@/utils/postMapper'
import fallbackAvatar from '@/assets/user1.avif'

const props = defineProps<{
  comment: PostCardData
}>()

const emit = defineEmits<{
  like: []
  reply: []
  replyToReply: [reply: PostCardData]
}>()

// Load avatar via media API (converts /medias/{uuid} to blob URL)
const { imageUrl: avatarSrc } = useMediaImage(() => props.comment.user.avatar, fallbackAvatar)

// Reply count (reactive to updates)
const replyCount = computed(() => props.comment.comments)

// Nested replies state
const showReplies = ref(false)
const replies = ref<PostCardData[]>([])
const loadingReplies = ref(false)
const replyPage = ref(0)
const hasMoreReplies = ref(false)

// Toggle replies visibility
async function toggleReplies() {
  showReplies.value = !showReplies.value
  if (showReplies.value && replies.value.length === 0) {
    await loadReplies()
  }
}

// Load replies from API
async function loadReplies() {
  loadingReplies.value = true
  try {
    const result = await postsApi.getComments(String(props.comment.id), replyPage.value, 5)
    const mapped = result.content.map((p) => mapApiPostToCard(p))
    replies.value = [...replies.value, ...mapped]
    hasMoreReplies.value = replyPage.value + 1 < result.totalPages
  } catch (error) {
    console.error('Failed to load replies:', error)
  } finally {
    loadingReplies.value = false
  }
}

// Load more replies
async function loadMoreReplies() {
  replyPage.value++
  await loadReplies()
}

// Handle like on a reply
async function handleReplyLike(reply: PostCardData) {
  try {
    if (reply.liked) {
      await postsApi.unlikePost(String(reply.id))
      reply.liked = false
      reply.likes--
    } else {
      await postsApi.likePost(String(reply.id))
      reply.liked = true
      reply.likes++
    }
  } catch (error) {
    console.error('Failed to toggle reply like:', error)
  }
}
</script>
