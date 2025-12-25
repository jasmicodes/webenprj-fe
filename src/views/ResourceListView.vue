<script setup lang="ts">
import { ref, computed } from 'vue'
import PostCard from '@/components/organisms/PostCard.vue'
import SearchBar from '@/components/molecules/SearchBar.vue'
import TagSelect from '@/components/molecules/TagSelect.vue'
import { POSTS } from '@/data/posts'
import type { PostCardData } from '@/utils/postMapper'
import { useAppearanceStore } from '@/stores/appearanceStore'
import { useUserStore } from '@/stores/userStore'
import { useMediaQuery } from '@/composables/useMediaQuery'

const userStore = useUserStore()

const q = ref('')
const tag = ref('')

// Create reactive copy of posts data to allow likes
const posts = ref<PostCardData[]>(POSTS.map((p) => ({ ...p })))

// Ambient mode detection
const appearanceStore = useAppearanceStore()
const isMobile = useMediaQuery('(max-width: 768px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)

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

// Handle edit (placeholder - ResourceListView uses static demo data)
function handleEdit(postId: PostCardData['id']) {
  console.log('Edit post:', postId, '(not implemented for demo data)')
}

// Handle delete (placeholder - ResourceListView uses static demo data)
function handleDelete(postId: PostCardData['id']) {
  console.log('Delete post:', postId, '(not implemented for demo data)')
}
</script>

<template>
  <div class="min-h-screen flex items-start justify-center px-8">
    <div
      class="w-full max-w-5xl py-8 content-glass-container"
      :class="{ 'ambient-mode': isAmbientMode }"
    >
      <!-- Page Header -->
      <header class="mb-6 pb-3 border-b border-slate-100">
        <h1 class="text-lg font-medium text-slate-800 tracking-tight">Resources</h1>
        <p class="text-sm text-slate-500 mt-0.5">Browse shared study materials</p>
      </header>

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
        <PostCard
          v-for="p in filtered"
          :key="p.id"
          :post="p"
          :current-user-id="userStore.user?.id"
          @like="toggleLike"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * Resources container
 * Clean mode: minimal styling
 * Ambient mode: premium glass panel
 */
.content-glass-container {
  /* Clean mode: very minimal */
  background: transparent;
  border-radius: 24px;
  margin-top: 16px;
  margin-bottom: 16px;
  padding-left: 24px;
  padding-right: 24px;
}

/* Ambient mode: premium glass panel */
.content-glass-container.ambient-mode {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02);
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(10px)) {
  .content-glass-container.ambient-mode {
    background: rgba(255, 255, 255, 0.85);
  }
}
</style>
