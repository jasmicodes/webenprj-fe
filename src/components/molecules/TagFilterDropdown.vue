<!--
  TagFilterDropdown - Searchable dropdown for filtering posts by tag.
  Supports v-model for selected tag. Empty string means "All tags".
  Filters tag list as user types in search box.
-->
<script setup lang="ts">
defineOptions({ name: 'TagFilterDropdown' })

import { ref, computed, onMounted, onUnmounted } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'

const props = withDefaults(
  defineProps<{
    tags: string[]
    modelValue: string
    loading?: boolean
  }>(),
  {
    modelValue: '',
    loading: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Dropdown state
const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref<HTMLElement | null>(null)

// Filtered tags based on search
const filteredTags = computed(() => {
  if (!searchQuery.value) return props.tags
  const query = searchQuery.value.toLowerCase()
  return props.tags.filter(tag => tag.toLowerCase().includes(query))
})

// Display text for the button
const displayText = computed(() => {
  if (!props.modelValue) return 'All tags'
  return props.modelValue
})

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

function selectTag(tag: string) {
  emit('update:modelValue', tag)
  isOpen.value = false
  searchQuery.value = ''
}

function clearFilter() {
  emit('update:modelValue', '')
  isOpen.value = false
  searchQuery.value = ''
}

// Close on click outside
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block">
    <!-- Trigger button -->
    <button
      type="button"
      class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors min-w-[140px]"
      :class="[
        isOpen
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : modelValue
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      ]"
      @click="toggle"
    >
      <BaseIcon name="TagIcon" class="w-4 h-4 flex-shrink-0" />
      <span class="flex-1 text-left truncate">{{ displayText }}</span>
      <BaseIcon
        name="ChevronDownIcon"
        class="w-4 h-4 flex-shrink-0 transition-transform"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown panel -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 w-56 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden"
      >
        <!-- Search input -->
        <div class="p-2 border-b border-slate-100">
          <div class="relative">
            <BaseIcon
              name="MagnifyingGlassIcon"
              class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search tags..."
              class="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Options list -->
        <div class="max-h-48 overflow-y-auto">
          <!-- Loading state -->
          <div v-if="loading" class="px-3 py-4 text-center text-sm text-slate-500">
            Loading tags...
          </div>

          <!-- All option -->
          <button
            v-else
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors"
            :class="!modelValue ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'"
            @click="clearFilter"
          >
            <span class="w-4 h-4 flex items-center justify-center">
              <span
                v-if="!modelValue"
                class="w-2 h-2 rounded-full bg-blue-500"
              />
            </span>
            <span>All tags</span>
          </button>

          <!-- Tag options -->
          <button
            v-for="tag in filteredTags"
            :key="tag"
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors"
            :class="modelValue === tag ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'"
            @click="selectTag(tag)"
          >
            <span class="w-4 h-4 flex items-center justify-center">
              <span
                v-if="modelValue === tag"
                class="w-2 h-2 rounded-full bg-blue-500"
              />
            </span>
            <span class="truncate">{{ tag }}</span>
          </button>

          <!-- No results -->
          <div
            v-if="!loading && filteredTags.length === 0 && searchQuery"
            class="px-3 py-4 text-center text-sm text-slate-500"
          >
            No tags found
          </div>

          <!-- Empty state -->
          <div
            v-if="!loading && tags.length === 0 && !searchQuery"
            class="px-3 py-4 text-center text-sm text-slate-500"
          >
            No tags available
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
