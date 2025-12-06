<template>
  <BaseCard size="lg" class="space-y-4">
    <!-- HEADER-SLOT -->
    <template #header>
      <PostHeader
        :username="post.user.name"
        :avatar-src="avatarSrc"
        :tag="post.tag"
        :time="post.time"
      />
    </template>

    <!-- BODY (default slot) -->
    <figure
      v-if="post.image"
      class="mt-2 relative w-full aspect-[4/5] bg-neutral-50 overflow-hidden"
    >
      <img
        :src="post.image"
        :alt="post.imageAlt || 'Image by ' + post.user.name"
        class="absolute inset-0 w-full h-full object-contain"
        loading="lazy"
      />
    </figure>

    <p v-if="post.text" class="text-neutral-900 text-base leading-relaxed">
      {{ post.text }}
    </p>

    <!-- FOOTER-SLOT (actions) -->
    <template #actions>
      <PostFooter
        :likes="post.likes"
        :liked="post.liked"
        :comments="post.comments"
        :streak="post.streak"
        @like="$emit('like', post.id)"
        @comment="$emit('comment', post.id)"
        @save="$emit('save', post.id)"
        @share="$emit('share', post.id)"
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

const props = defineProps<{
  post: PostCardData
}>()
const avatarSrc = computed(() => props.post.user.avatar || fallbackAvatar)

defineEmits<{
  (e: 'like', id: PostCardData['id']): void
  (e: 'comment', id: PostCardData['id']): void
  (e: 'save', id: PostCardData['id']): void
  (e: 'share', id: PostCardData['id']): void
}>()
</script>
