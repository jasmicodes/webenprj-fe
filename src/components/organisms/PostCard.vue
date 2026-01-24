<!--
  PostCard - Full post display with expandable comment section.

  Features:
  - Header with author info and tag
  - Image and text content (clickable to detail view)
  - Action bar (like, comment, bookmark, share, edit/delete)
  - Inline comment list with pagination and reply support

  Comments are lazily loaded when section is expanded.
  All actions emit events - parent handles API calls and state updates.
-->
<template>
  <BaseCard size="lg">
    <!-- HEADER-SLOT (identical for all posts) -->
    <template #header>
      <PostHeader
        :username="post.user.name"
        :user-id="post.userId"
        :avatar-src="avatarSrc"
        :tag="post.tag"
        :time="post.time"
      />
    </template>

    <!-- BODY (default slot) - clickable to open post detail -->
    <div class="space-y-3 cursor-pointer" @click="handlePostClick">
      <!-- Parent deleted banner (for comments on deleted posts) -->
      <div
        v-if="post.parentDeleted"
        class="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-xs"
      >
        The original post was deleted.
      </div>

      <!-- Image with fixed aspect ratio -->
      <figure
        v-if="post.image"
        class="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden rounded-xl"
      >
        <img
          :src="post.image"
          :alt="'Image by ' + post.user.name"
          class="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </figure>

      <!-- Post text/caption -->
      <p v-if="post.text" class="text-slate-800 text-sm leading-relaxed">
        {{ post.text }}
      </p>
    </div>

    <!-- FOOTER-SLOT (actions) -->
    <template #actions>
      <PostFooter
        :likes="post.likes"
        :liked="post.liked"
        :comments="displayCommentCount"
        :streak="post.streak"
        :bookmark-count="post.bookmarkCount"
        :bookmarked="post.bookmarked"
        :is-own-post="isOwnPost"
        :is-admin="userStore.isAdmin"
        @like="emit('like', post.id)"
        @comment="toggleComments"
        @save="emit('save', post.id)"
        @share="emit('share', post.id)"
        @edit="emit('edit', post.id)"
        @delete="emit('delete', post.id)"
      />

      <!-- Expandable Comment Section -->
      <div v-if="showComments" class="border-t border-slate-100 pt-4 mt-4 space-y-4">
        <!-- Comment Input -->
        <div class="flex gap-3">
          <CommentBox
            v-model="newCommentText"
            placeholder="Write a comment..."
            class="flex-1"
            @send="submitComment"
          />
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="flex justify-center py-4">
          <BaseProgressRing :size="24" :progress="0" />
        </div>

        <!-- Comments List -->
        <div v-else-if="comments.length > 0" class="space-y-3">
          <CommentItem
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
            @like="handleCommentLike(comment)"
            @reply="toggleReply(comment)"
          >
            <template #reply-input>
              <div v-if="replyingTo === comment.id" class="mt-2 pl-4 border-l-2 border-slate-200">
                <CommentBox
                  v-model="replyText"
                  placeholder="Write a reply..."
                  @send="submitReply(comment)"
                />
              </div>
            </template>
          </CommentItem>
        </div>

        <!-- Empty state -->
        <div v-else-if="!loading" class="text-center py-4 text-sm text-slate-500">
          No comments yet. Be the first to comment!
        </div>

        <!-- Load more button -->
        <div v-if="hasMoreComments && !loading" class="flex justify-center">
          <BaseButton variant="ghost" size="sm" @click="loadMoreComments">
            Load more comments
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'PostCard' })

import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseProgressRing from '@/components/atoms/BaseProgressRing.vue'
import PostHeader from '@/components/molecules/PostHeader.vue'
import PostFooter from '@/components/molecules/PostFooter.vue'
import CommentBox from '@/components/molecules/CommentBox.vue'
import CommentItem from '@/components/molecules/CommentItem.vue'
import fallbackAvatar from '@/assets/user1.avif'
import type { PostCardData } from '@/utils/postMapper'
import { mapApiPostToCard } from '@/utils/postMapper'
import { useMediaImage } from '@/composables/useMediaImage'
import { postsApi } from '@/services/api/posts'
import { PAGE_CONFIG } from '@/data/constants'
import { useUserStore } from '@/stores/userStore'
import { useToastStore } from '@/stores/toastStore'
import { logger } from '@/services/logger'
import { getErrorMessage } from '@/services/api/client'

const props = defineProps<{
  post: PostCardData
  currentUserId?: string
}>()

const emit = defineEmits<{
  (e: 'like', id: PostCardData['id']): void
  (e: 'comment', id: PostCardData['id']): void
  (e: 'save', id: PostCardData['id']): void
  (e: 'share', id: PostCardData['id']): void
  (e: 'edit', id: PostCardData['id']): void
  (e: 'delete', id: PostCardData['id']): void
  (e: 'commentAdded'): void
}>()

// Load avatar via media API (converts /medias/{uuid} to blob URL)
const { imageUrl: avatarSrc } = useMediaImage(() => props.post.user.avatar, fallbackAvatar)
const userStore = useUserStore()
const toastStore = useToastStore()
const router = useRouter()
const isOwnPost = computed(() => Boolean(props.currentUserId && props.post.userId === props.currentUserId))

// Navigate to post detail view (ignores text selection)
function handlePostClick() {
  const selection = window.getSelection()
  if (selection && selection.toString().length > 0) {
    return
  }
  router.push({ name: 'post', params: { id: String(props.post.id) } })
}

// Comment section state
const showComments = ref(false)
const comments = ref<PostCardData[]>([])
const newCommentText = ref('')
const loading = ref(false)
const commentPage = ref(0)
const hasMoreComments = ref(false)
const totalComments = ref(props.post.comments)

// Reply state
const replyingTo = ref<string | number | null>(null)
const replyText = ref('')

// Display comment count (updates when new comments added)
const displayCommentCount = computed(() => totalComments.value)

// Toggle comments section
async function toggleComments() {
  showComments.value = !showComments.value
  if (showComments.value && comments.value.length === 0) {
    await loadComments()
  }
}

// Load comments from API
async function loadComments() {
  loading.value = true
  try {
    const result = await postsApi.getComments(String(props.post.id), commentPage.value, PAGE_CONFIG.COMMENTS_SIZE)
    const mapped = result.content.map((p) => mapApiPostToCard(p))
    comments.value = [...comments.value, ...mapped]
    hasMoreComments.value = commentPage.value + 1 < result.totalPages
    totalComments.value = result.totalElements
  } catch (error) {
    logger.error('Failed to load comments:', error)
    toastStore.showError(getErrorMessage(error), 'Comments')
  } finally {
    loading.value = false
  }
}

// Load more comments (pagination)
async function loadMoreComments() {
  commentPage.value++
  await loadComments()
}

// Submit a new comment
async function submitComment() {
  if (!newCommentText.value.trim()) return

  try {
    const created = await postsApi.createComment(String(props.post.id), {
      subject: props.post.tag || 'general',
      content: newCommentText.value.trim(),
    })
    const mapped = mapApiPostToCard(created)
    comments.value = [mapped, ...comments.value]
    newCommentText.value = ''
    totalComments.value++
    emit('commentAdded')
  } catch (error) {
    logger.error('Failed to create comment:', error)
    toastStore.showError(getErrorMessage(error), 'Comment')
  }
}

// Toggle reply input for a comment
function toggleReply(comment: PostCardData) {
  if (replyingTo.value === comment.id) {
    replyingTo.value = null
    replyText.value = ''
  } else {
    replyingTo.value = comment.id
    replyText.value = ''
  }
}

// Submit a reply to a comment
async function submitReply(parentComment: PostCardData) {
  if (!replyText.value.trim()) return

  try {
    await postsApi.createComment(String(parentComment.id), {
      subject: props.post.tag || 'general',
      content: replyText.value.trim(),
    })
    // Update the parent comment's reply count (immutable update)
    const index = comments.value.findIndex(c => c.id === parentComment.id)
    const comment = comments.value[index]
    if (index !== -1 && comment) {
      comments.value[index] = {
        ...comment,
        comments: comment.comments + 1
      }
    }
    replyingTo.value = null
    replyText.value = ''
  } catch (error) {
    logger.error('Failed to create reply:', error)
    toastStore.showError(getErrorMessage(error), 'Reply')
  }
}

// Handle like on a comment
async function handleCommentLike(comment: PostCardData) {
  const index = comments.value.findIndex(c => c.id === comment.id)
  const existing = comments.value[index]
  if (index === -1 || !existing) return

  try {
    if (comment.liked) {
      await postsApi.unlikePost(String(comment.id))
      comments.value[index] = {
        ...existing,
        liked: false,
        likes: existing.likes - 1
      }
    } else {
      await postsApi.likePost(String(comment.id))
      comments.value[index] = {
        ...existing,
        liked: true,
        likes: existing.likes + 1
      }
    }
  } catch (error) {
    logger.error('Failed to toggle comment like:', error)
    toastStore.showError(getErrorMessage(error), 'Like')
  }
}

// Reset comments when post changes
watch(() => props.post.id, () => {
  showComments.value = false
  comments.value = []
  commentPage.value = 0
  hasMoreComments.value = false
  totalComments.value = props.post.comments
})
</script>
