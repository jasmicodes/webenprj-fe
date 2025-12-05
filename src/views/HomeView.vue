<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PostCard from '@/components/organisms/PostCard.vue'
import BaseDivider from '@/components/atoms/BaseDivider.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import type { PostCardData } from '@/utils/postMapper'
import { mapApiPostToCard } from '@/utils/postMapper'
import { postsApi } from '@/services/api'
import { useToastStore } from '@/stores/toastStore'

const posts = ref<PostCardData[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const page = ref(0)
const totalPages = ref(1)
const pageSize = 10
const toastStore = useToastStore()

async function loadPosts(reset = false) {
  if (reset) {
    page.value = 0
    posts.value = []
  }

  const isFirstPage = page.value === 0 && posts.value.length === 0
  if (isFirstPage) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    const result = await postsApi.getAllPosts(undefined, page.value, pageSize)
    const mapped = result.content.map((post) =>
      mapApiPostToCard(post, { user: { name: post.username } }),
    )

    posts.value = reset ? mapped : [...posts.value, ...mapped]
    totalPages.value = result.totalPages
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load posts'
    toastStore.showError(error.value, 'Feed')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  if (page.value + 1 >= totalPages.value) return
  page.value += 1
  void loadPosts()
}

function retry() {
  error.value = null
  void loadPosts(true)
}

onMounted(() => {
  void loadPosts(true)
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
      <BaseButton class="mt-3" @click="retry">Retry</BaseButton>
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
      <div v-if="page + 1 < totalPages" class="mt-6">
        <BaseButton :disabled="loadingMore" @click="loadMore">
          <span v-if="loadingMore">Loading...</span>
          <span v-else>Load more</span>
        </BaseButton>
      </div>
    </template>
  </main>
</template>
