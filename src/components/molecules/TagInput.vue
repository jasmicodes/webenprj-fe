<!-- TagInput - Free-form tag input with suggestions -->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import { normalizeTagName, formatTagDisplay, isValidTag } from '@/utils/tagUtils'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    suggestions?: string[]
    maxLength?: number
  }>(),
  {
    placeholder: 'Add a tag (optional)',
    suggestions: () => [
      'webengineering',
      'statistics',
      'bwl',
      'design',
      'programming',
      'algorithms',
      'databases',
      'networking',
    ],
    maxLength: 30,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputValue = ref('')
const showSuggestions = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const dropdownRef = ref<HTMLDivElement | null>(null)

// Filter suggestions based on input
const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim()) {
    return props.suggestions.slice(0, 6) // Show top 6 when empty
  }

  const query = normalizeTagName(inputValue.value).toLowerCase()
  return props.suggestions
    .filter((tag) => normalizeTagName(tag).toLowerCase().includes(query))
    .slice(0, 6)
})

// Check if input is valid per backend pattern
const isValidTagInput = computed(() => {
  if (!inputValue.value.trim()) return true // Empty is valid (optional)
  const normalized = normalizeTagName(inputValue.value)
  return isValidTag(normalized)
})

const errorMessage = computed(() => {
  if (!inputValue.value.trim() || isValidTagInput.value) return ''

  const normalized = normalizeTagName(inputValue.value)
  if (normalized.length < 2) return 'Tag must be at least 2 characters'
  if (normalized.length > 30) return 'Tag must be 30 characters or less'
  return 'Tag can only contain letters, numbers, spaces, dashes, and underscores'
})

function onFocus() {
  showSuggestions.value = true
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
}

function selectTag(tag: string) {
  // Normalize and store the raw tag name (without '#')
  const normalized = normalizeTagName(tag)
  inputValue.value = formatTagDisplay(normalized) // Display with '#'
  emit('update:modelValue', normalized) // Emit normalized value
  showSuggestions.value = false
  inputRef.value?.blur()
}

function onEnter() {
  if (isValidTagInput.value && inputValue.value.trim()) {
    const normalized = normalizeTagName(inputValue.value)
    inputValue.value = formatTagDisplay(normalized) // Display with '#'
    emit('update:modelValue', normalized) // Emit normalized value
    showSuggestions.value = false
    inputRef.value?.blur()
  }
}

function clearTag() {
  inputValue.value = ''
  emit('update:modelValue', '')
  inputRef.value?.focus()
}

function handleClickOutside(event: MouseEvent) {
  if (
    inputRef.value &&
    dropdownRef.value &&
    !inputRef.value.contains(event.target as Node) &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    showSuggestions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  if (props.modelValue) {
    // Display with '#' prefix
    inputValue.value = formatTagDisplay(props.modelValue)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for external changes
const hasTag = computed(() => props.modelValue && props.modelValue.trim().length > 0)
</script>

<template>
  <div class="relative">
    <!-- Input with chip preview -->
    <div class="relative">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        :maxlength="maxLength"
        class="w-full px-3 py-2 rounded-xl border bg-white text-sm transition-colors outline-none"
        :class="[
          errorMessage ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-200',
          hasTag && 'pr-8'
        ]"
        @focus="onFocus"
        @input="onInput"
        @keydown.enter.prevent="onEnter"
        @keydown.esc="showSuggestions = false"
      />

      <!-- Clear button (when tag selected) -->
      <button
        v-if="hasTag"
        type="button"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
        @click="clearTag"
      >
        <BaseIcon name="XMarkIcon" class="w-4 h-4" />
      </button>
    </div>

    <!-- Error message -->
    <p v-if="errorMessage" class="mt-1 text-xs text-red-600">{{ errorMessage }}</p>

    <!-- Suggestions dropdown -->
    <div
      v-if="showSuggestions && filteredSuggestions.length > 0"
      ref="dropdownRef"
      class="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
    >
      <button
        v-for="tag in filteredSuggestions"
        :key="tag"
        type="button"
        class="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
        @click="selectTag(tag)"
      >
        <span class="text-slate-900">{{ formatTagDisplay(tag) }}</span>
      </button>
    </div>

    <!-- Help text -->
    <p class="mt-1 text-xs text-slate-500">
      Type a tag or select from suggestions. Press Enter to confirm.
    </p>
  </div>
</template>
