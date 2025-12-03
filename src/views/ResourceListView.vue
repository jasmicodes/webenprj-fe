<script setup lang="ts">
import { ref, computed } from 'vue'
import PostCard from '@/components/organisms/PostCard.vue'
import SearchBar from '@/components/molecules/SearchBar.vue'
import TagSelect from '@/components/molecules/TagSelect.vue'
import BaseDivider from '@/components/atoms/BaseDivider.vue'
import { POSTS } from '@/data/posts'
import type { PostCardData } from '@/utils/postMapper'

const q = ref('')
const tag = ref('')

const tagOptions = computed(() => {
  const uniqueTags = Array.from(new Set(POSTS.map((p) => p.tag))).sort()
  return [{ label: 'All tags', value: '' }, ...uniqueTags.map((t) => ({ label: t, value: t }))]
})

function onSearch(value: string) {
  q.value = value
}

const filtered = computed<PostCardData[]>(() => {
  const term = q.value.trim().toLowerCase()

  return POSTS.filter((p) => {
    const byTagFilter = tag.value ? p.tag === tag.value : true

    const byText = term
      ? p.text.toLowerCase().includes(term) ||
        p.user.name.toLowerCase().includes(term) ||
        p.tag.toLowerCase().includes(term)
      : true
    return byTagFilter && byText
  })
})
</script>

<template>
  <section class="section">
    <header class="mb-8">
      <div class="max-w-3xl mx-auto flex flex-col items-stretch gap-4">
        <h1 class="self-start md:self-center">Resources</h1>

        <div class="w-full md:w-[520px] mx-auto">
          <SearchBar class="w-full" @search="onSearch" />
        </div>

        <div class="flex flex-col items-stretch md:flex-row md:justify-center gap-3">
          <TagSelect
            v-model="tag"
            :options="tagOptions"
            placeholder="Filter by tag…"
            class="w-full md:w-72"
          />
        </div>
      </div>
    </header>

    <div v-if="filtered.length === 0" class="card card-pad text-neutral-600">
      No posts found. Try another tag or search term.
    </div>

    <div v-else class="flex flex-col items-center gap-3 py-8">
      <template v-for="(p, index) in filtered" :key="p.id">
        <PostCard :post="p" />

        <BaseDivider v-if="index < filtered.length - 1" class="divider-narrow" />
      </template>
    </div>
  </section>
</template>
