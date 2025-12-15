<script setup lang="ts">
import { ref, computed } from 'vue'
import PostCard from '@/components/organisms/PostCard.vue'
import SearchBar from '@/components/molecules/SearchBar.vue'
import TagSelect from '@/components/molecules/TagSelect.vue'
import { POSTS } from '@/data/posts'
import type { PostCardData } from '@/utils/postMapper'

const q = ref('')
const tag = ref('')

// Create reactive copy of posts data to allow likes
const posts = ref<PostCardData[]>(POSTS.map((p) => ({ ...p })))

const tagOptions = computed(() => {
  const uniqueTags = Array.from(new Set(posts.value.map((p) => p.tag))).sort()
  return [{ label: 'All tags', value: '' }, ...uniqueTags.map((t) => ({ label: t, value: t }))]
})

function onSearch(value: string) {
  q.value = value
}

const filtered = computed<PostCardData[]>(() => {
  const term = q.value.trim().toLowerCase()

  return posts.value.filter((p) => {
    const byTagFilter = tag.value ? p.tag === tag.value : true

    const byText = term
      ? p.text.toLowerCase().includes(term) ||
        p.user.name.toLowerCase().includes(term) ||
        p.tag.toLowerCase().includes(term)
      : true
    return byTagFilter && byText
  })
})

// Handle like toggle
function toggleLike(postId: PostCardData['id']) {
  const idx = posts.value.findIndex((p) => p.id === postId)
  if (idx === -1) return

  const post = posts.value[idx]
  const newLiked = !post.liked
  const newLikes = post.likes + (newLiked ? 1 : -1)

  posts.value[idx] = { ...post, liked: newLiked, likes: Math.max(0, newLikes) }
}
</script>

<template>
  <div class="bg-slate-50 min-h-screen">
    <div class="max-w-5xl mx-auto p-6">
      <!-- Page Title -->
      <h1 class="text-2xl font-semibold text-slate-900 mb-6">Resources</h1>

      <!-- Filters -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 space-y-4">
        <SearchBar @search="onSearch" />

        <TagSelect
          v-model="tag"
          :options="tagOptions"
          placeholder="Filter by tag…"
          class="w-full md:w-72"
        />
      </div>

      <!-- Empty State -->
      <div
        v-if="filtered.length === 0"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center"
      >
        <p class="text-sm text-slate-500">No posts found. Try another tag or search term.</p>
      </div>

      <!-- Posts Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PostCard v-for="p in filtered" :key="p.id" :post="p" @like="toggleLike" />
      </div>
    </div>
  </div>
</template>
