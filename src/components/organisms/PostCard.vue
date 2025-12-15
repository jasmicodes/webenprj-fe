<template>
  <BaseCard size="lg">
    <!-- HEADER-SLOT (identical for all posts) -->
    <template #header>
      <PostHeader
        :username="post.user.name"
        :avatar-src="avatarSrc"
        :tag="post.tag"
        :time="post.time"
      />
    </template>

    <!-- BODY (default slot) -->
    <div class="space-y-4">
      <!-- Image with fixed aspect ratio -->
      <figure
        v-if="post.image"
        class="relative w-full aspect-[4/3] bg-neutral-50 overflow-hidden rounded-xl"
      >
        <img
          :src="post.image"
          :alt="post.imageAlt || 'Image by ' + post.user.name"
          class="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </figure>

      <!-- Post text/caption -->
      <p v-if="post.text" class="text-slate-900 text-sm leading-relaxed line-clamp-4">
        {{ post.text }}
      </p>
    </div>

    <!-- FOOTER-SLOT (actions) -->
    <template #actions>
      <PostFooter
        :likes="post.likes"
        :liked="post.liked"
        :comments="post.comments"
        :streak="post.streak"
        :is-own-post="isOwnPost"
        @like="emit('like', post.id)"
        @comment="emit('comment', post.id)"
        @save="emit('save', post.id)"
        @share="emit('share', post.id)"
        @edit="emit('edit', post.id)"
        @delete="emit('delete', post.id)"
      />
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import PostHeader from '@/components/molecules/PostHeader.vue'
import PostFooter from '@/components/molecules/PostFooter.vue'
import fallbackAvatar from '@/assets/user1.avif'
import type { PostCardData } from '@/utils/postMapper'
import { useMediaImage } from '@/composables/useMediaImage'

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
}>()

// Load avatar via media API (converts /medias/{uuid} to blob URL)
const { imageUrl: avatarSrc } = useMediaImage(() => props.post.user.avatar, fallbackAvatar)
const isOwnPost = computed(() => props.currentUserId && props.post.userId === props.currentUserId)
</script>
