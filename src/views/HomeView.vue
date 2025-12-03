<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PostCard from '@/components/organisms/PostCard.vue'
import BaseDivider from '@/components/atoms/BaseDivider.vue'

import avatar1 from '@/assets/user1.avif'
import sampleImg from '@/assets/PostPicture1.png'

// TODO: Replace with real API call when backend Post type includes user info, likes, comments
// Currently using demo data because API Post type doesn't match PostCard expected structure
// API Post has: id, subject, content, imageUrl, createdAt, updatedAt
// PostCard needs: id, user.name, user.avatar, tag, time, text, image, likes, comments, streak

const posts = ref([
  {
    id: 1,
    user: { name: 'mariasantos', avatar: avatar1 },
    tag: 'webengineering',
    time: '2d',
    text: 'Today I finally understood async/await…',
    image: sampleImg,
    likes: 12,
    comments: 3,
    streak: 25,
  },
])

const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // Simulate loading for demo data
    // TODO: Replace with: posts.value = await postsApi.getAllPosts()
    await new Promise((resolve) => setTimeout(resolve, 500))
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load posts'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="flex flex-col items-center gap-3 py-8">
    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4 w-full max-w-2xl">
      <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-lg p-6 animate-pulse">
        <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-gray-300 rounded w-full mb-1"></div>
        <div class="h-3 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl">
      <p class="text-red-600">Failed to load posts: {{ error }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="posts.length === 0" class="text-center py-12">
      <p class="text-gray-600">No posts yet. Be the first to share!</p>
    </div>

    <!-- Posts -->
    <template v-else>
      <template v-for="(p, index) in posts" :key="p.id">
        <PostCard :post="p" />
        <BaseDivider v-if="index < posts.length - 1" class="divider-narrow" />
      </template>
    </template>
  </main>
</template>
